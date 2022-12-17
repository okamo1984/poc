use gui_core::inference;
use log::info;
use structopt::StructOpt;

#[derive(StructOpt, Debug)]
struct Opt {
    #[structopt(short, long)]
    yaml_path: String,

    #[structopt(short, long)]
    model_path: String,

    #[structopt(short, long)]
    filename: String,
}

fn main() -> anyhow::Result<()> {
    env_logger::init();

    let opt = Opt::from_args();
    let executor = inference::get_inference_executor(opt.yaml_path, opt.model_path)?;
    let result;
    info!("start inference...");
    unsafe {
        result = executor.infer(inference::ImageType::Path(opt.filename), true)?;
    }
    let best = result
        .clone()
        .result()
        .to_array_view::<f32>()?
        .iter()
        .cloned()
        .zip(2..)
        .max_by(|a, b| a.0.partial_cmp(&b.0).unwrap());
    info!("result: {:?}", best);
    Ok(())
}
