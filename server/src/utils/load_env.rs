use anyhow::{Context, Result};
use std::env;

pub async fn load_environment_variables() -> Result<()> {
    let environment = env::var("RUST_ENV").unwrap_or_default();
    let filename = format!("../.env.{}", environment);

    dotenvy::from_filename_override(&filename)
        .with_context(|| format!("Failed to load environment variables from {}", filename))?;

    Ok(())
}
