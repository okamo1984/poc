use serde::{Deserialize, Serialize};
use std::env;
use std::fs::{create_dir, read_dir, write, File};
use std::io::BufReader;
use std::path::Path;
use tokio::task::{self, JoinHandle};

#[derive(Debug, Serialize, Deserialize)]
struct Image {
    alt: String,
    src: String,
}

async fn get_image(url: String) -> anyhow::Result<Vec<u8>> {
    let resp = reqwest::get(url).await?.bytes().await?;
    Ok(resp.to_vec())
}

fn create_async_task(dir: String, filename: String) -> JoinHandle<anyhow::Result<()>> {
    task::spawn(async move {
        let file = File::open(Path::new(dir.as_str()).join(filename.to_owned()))?;
        let reader = BufReader::new(file);
        let saved_image = Path::new(filename.as_str());
        let dir =  Path::new(saved_image.file_stem().unwrap());
        if !dir.exists() {
            create_dir(dir)?;
        }
        let images: Vec<Image> = serde_json::from_reader(reader)?;
        for (i, image) in images.iter().enumerate() {
            let image_data = get_image(image.src.to_owned()).await?;
            let image_extension = Path::new(image.src.as_str())
                .extension()
                .unwrap()
                .to_str()
                .unwrap();
            write(
                dir.join(format!("{}.{}", i, image_extension)),
                image_data,
            )?;
        }
        Ok(())
    })
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        eprintln!("argument length must be 2")
    }
    let dir = args.get(1).unwrap();
    let files = read_dir(dir)?;
    let join_handles: Vec<JoinHandle<anyhow::Result<()>>> = files
        .map(|file| {
            create_async_task(
                dir.to_string(),
                file.unwrap().file_name().to_str().unwrap().to_string(),
            )
        })
        .collect();

    for join_handle in join_handles {
        let _ = join_handle.await?;
    }

    Ok(())
}
