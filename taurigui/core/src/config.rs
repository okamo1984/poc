use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Clone)]
pub struct Config {
    pub network: String,
    pub task: String,
    pub resize: Size,
    pub crop: Size,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Clone)]
pub struct Size {
    pub x: u32,
    pub y: u32,
}

pub fn get_config_from_yaml(yaml_path: String) -> anyhow::Result<Config> {
    Ok(serde_yaml::from_str(
        std::fs::read_to_string(yaml_path)?.as_str(),
    )?)
}
