use crate::{
    config::{get_config_from_yaml, Config},
    lap::LapTime,
};
use opencv::core::{set_use_opencl, AccessFlag, Size, UMat, UMatUsageFlags, Vec3b};
use opencv::imgcodecs::{self, IMREAD_COLOR};
use opencv::imgproc::{self, COLOR_BGR2RGB, INTER_AREA};
use opencv::prelude::*;
use std::sync::Arc;
use tract_onnx::prelude::*;

type RunnableOnnxModel =
    SimplePlan<TypedFact, Box<dyn TypedOp>, Graph<TypedFact, Box<dyn TypedOp>>>;

#[derive(Clone)]
pub struct InferenceExecutor {
    config: Option<Config>,
    model: Option<RunnableOnnxModel>,
}

impl Default for InferenceExecutor {
    fn default() -> Self {
        InferenceExecutor {
            config: None,
            model: None,
        }
    }
}

pub enum ImageType {
    Path(String),
}

const DEFAULT_MEAN: [f32; 3] = [0.485, 0.456, 0.406];
const DEFAULT_STD: [f32; 3] = [0.229, 0.224, 0.225];

#[derive(Clone)]
pub struct InferredResult {
    result: Arc<Tensor>,
    lap: Option<String>,
}

impl InferredResult {
    pub fn result(self) -> Arc<Tensor> {
        self.result
    }
    pub fn lap(self) -> Option<String> {
        self.lap
    }
}

impl InferenceExecutor {
    pub fn new(config: Config, model: RunnableOnnxModel) -> Self {
        InferenceExecutor {
            config: Some(config),
            model: Some(model),
        }
    }

    fn check_requisites(&self) -> anyhow::Result<()> {
        if self.config.is_none() {
            return Err(anyhow::anyhow!("Config is none"));
        }
        if self.model.is_none() {
            return Err(anyhow::anyhow!("Model is none"));
        }
        Ok(())
    }

    pub unsafe fn infer(&self, image: ImageType, use_lap: bool) -> TractResult<InferredResult> {
        set_use_opencl(true)?;
        self.check_requisites()?;
        let mut lap_time = LapTime::new();
        let config = self.config.to_owned().unwrap();
        let x = config.resize.x;
        let y = config.resize.y;
        lap_time.start();
        let image = match image {
            ImageType::Path(path) => imgcodecs::imread(&path, IMREAD_COLOR)?,
        };
        let image = image.get_umat(AccessFlag::ACCESS_READ, UMatUsageFlags::USAGE_DEFAULT)?;
        lap_time.lap("Get image");
        let mut resized_image = UMat::new(UMatUsageFlags::USAGE_DEFAULT);
        imgproc::resize(
            &image,
            &mut resized_image,
            Size {
                width: x as i32,
                height: y as i32,
            },
            0.0,
            0.0,
            INTER_AREA,
        )?;
        let mut rgb_image = UMat::new(UMatUsageFlags::USAGE_DEFAULT);
        imgproc::cvt_color(&resized_image, &mut rgb_image, COLOR_BGR2RGB, 0)?;
        lap_time.lap("Resize");
        let rgb_image = rgb_image.get_mat(AccessFlag::ACCESS_FAST)?;
        let image: Tensor = tract_ndarray::Array4::from_shape_fn(
            (1, 3, x as usize, y as usize),
            move |(_, c, y, x)| {
                let mean = DEFAULT_MEAN[c];
                let std = DEFAULT_STD[c];
                let pixel = rgb_image
                    .at_2d_unchecked::<Vec3b>(x as i32, y as i32)
                    .unwrap()
                    .to_owned()[c];
                (pixel as f32 / 255.0 - mean) / std
            },
        )
        .into();
        lap_time.lap("To tensor");

        let result = self.model.to_owned().unwrap().run(tvec!(image))?;
        lap_time.lap("Infernece");
        if use_lap {
            info!("{}", lap_time);
        }
        Ok(InferredResult {
            result: result[0].clone(),
            lap: if use_lap {
                Some(format!("{}", lap_time))
            } else {
                None
            },
        })
    }

    pub fn load_new_model(&mut self, model_path: String) -> anyhow::Result<()> {
        let model = tract_onnx::onnx()
            .model_for_path(model_path.to_string())?
            .with_input_fact(
                0,
                InferenceFact::dt_shape(f32::datum_type(), tvec!(1, 3, 224, 224)),
            )?
            .into_optimized()?
            .into_runnable()?;
        self.model = Some(model);
        info!("Load new model from {}", model_path);
        Ok(())
    }

    pub fn load_new_config(&mut self, config_path: String) -> anyhow::Result<()> {
        let config = get_config_from_yaml(config_path.to_string())?;
        self.config = Some(config);
        info!("Load new config from {}", config_path);
        Ok(())
    }
}

pub fn get_inference_executor(
    yaml_path: String,
    model_path: String,
) -> anyhow::Result<InferenceExecutor> {
    let mut executor = InferenceExecutor::default();
    executor.load_new_model(model_path)?;
    executor.load_new_config(yaml_path)?;
    Ok(executor)
}
