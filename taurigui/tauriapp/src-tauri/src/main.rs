#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use log::{error, info};

use std::{
  cell::RefCell,
  sync::{Arc, Mutex},
};

use gui_core::inference::{ImageType, InferenceExecutor};
use tauri::State;

#[derive(serde::Serialize)]
struct InferredResult {
  message: String,
  lap: Option<String>,
}

#[tauri::command]
fn select_file_command(filepath: String, executor: State<Arc<Mutex<RefCell<InferenceExecutor>>>>) {
  info!("file path is {}", filepath.to_owned());
  let mut select_file_executor = executor.lock().unwrap();
  if filepath.ends_with("yml") {
    match select_file_executor
      .get_mut()
      .load_new_config(filepath.into())
    {
      Ok(()) => {}
      Err(err) => error!("Failed to load config, {:?}", err),
    }
  } else if filepath.ends_with("onnx") {
    match select_file_executor
      .get_mut()
      .load_new_model(filepath.into())
    {
      Ok(()) => {}
      Err(err) => error!("Failed to load onnx, {:?}", err),
    }
  }
}

#[tauri::command]
fn infer_command(
  filepath: String,
  executor: State<Arc<Mutex<RefCell<InferenceExecutor>>>>,
) -> InferredResult {
  info!("image path is {}", filepath.to_owned());
  let infer_image_executor = executor.lock().unwrap();
  unsafe {
    let result = match infer_image_executor
      .borrow()
      .infer(ImageType::Path(filepath.into()), true)
    {
      Ok(result) => result,
      Err(err) => {
        return InferredResult {
          message: format!("Failed to infer image, {:?}", err),
          lap: None,
        }
      }
    };
    let best = result
      .clone()
      .result()
      .to_array_view::<f32>()
      .unwrap()
      .iter()
      .cloned()
      .zip(2..)
      .max_by(|a, b| a.0.partial_cmp(&b.0).unwrap());
    InferredResult {
      message: format!("result: {:?}", best),
      lap: result.clone().lap(),
    }
  }
}

fn main() {
  env_logger::init();
  let executor = Arc::new(Mutex::new(RefCell::new(InferenceExecutor::default())));
  let command_executor = Arc::clone(&executor);
  tauri::Builder::default()
    .setup(move |app| Ok(()))
    .manage(command_executor)
    .invoke_handler(tauri::generate_handler![select_file_command, infer_command])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
