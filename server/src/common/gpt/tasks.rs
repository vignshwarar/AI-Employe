use anyhow::{anyhow, Context, Result};
use reqwest::Client;
use serde_json::json;
use std::env;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

use crate::{
    common::{
        gpt::prompts::get_tasks_generation_prompt,
        types::{BrowserAction, OpenAIResponse, Task, Tasks},
    },
    utils::config::is_production,
};

pub async fn generate_tasks(
    title: &str,
    objective: &str,
    actions: &[BrowserAction],
    user_provided_openai_key: &Option<String>,
) -> Result<Vec<Task>> {
    let default_open_ai_key = env::var("OPEN_AI_API_KEY").expect("OPEN_AI_API_KEY must be set");
    let open_ai_key = user_provided_openai_key
        .as_deref()
        .unwrap_or_else(|| &default_open_ai_key);
    let open_ai_chat_completion_url =
        env::var("OPEN_AI_CHAT_COMPLETION_API").expect("OPEN_AI_CHAT_COMPLETION_URL must be set");

    let prompt = get_tasks_generation_prompt(title, objective, actions);

    if !is_production() {
        let mut file = File::create("../log_generate_tasks_prompt.txt").await?;
        file.write_all(prompt.as_bytes()).await?;
    }

    let payload = json!({
        "model": "gpt-4-1106-preview",
        "messages": [{"role": "system", "content": prompt}],
        "temperature": 0,
        "max_tokens": 1000,
        "functions": [
            {
                "name": "tasks_generation",
                "description": "Generate tasks from a given objective and actions",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "tasks": {
                            "type": "array",
                            "description": "List of tasks",
                            "items": {
                                "task_number": {
                                    "type": "integer",
                                    "description": "Task number"
                                },
                                "task": {
                                    "type": "string",
                                    "description": "Task"
                                }
                            }
                        }
                    }
                },
            }
        ],
        "response_format":  {
            "type": "json_object",
        },
        "function_call": "auto"
    });

    let response = Client::new()
        .post(&open_ai_chat_completion_url)
        .bearer_auth(&open_ai_key)
        .json(&payload)
        .send()
        .await
        .context("Failed to send request to OpenAI")?;

    let response_text = response
        .text()
        .await
        .context("Failed to read response text")?;

    log::info!("Got response from GPT: {:?}", response_text);

    let parsed_response = serde_json::from_str::<OpenAIResponse>(&response_text)
        .context("Failed to parse OpenAI response")?;

    let args = parsed_response
        .choices
        .ok_or_else(|| anyhow!("Error parsing tasks: choices field is missing"))?
        .first()
        .ok_or_else(|| anyhow!("Error parsing tasks: no choices available"))?
        .message
        .function_call
        .as_ref()
        .ok_or_else(|| anyhow!("Error parsing tasks: function_call field is missing"))?
        .arguments
        .clone();

    if !is_production() {
        let mut file = File::create("../log_generate_tasks_args.txt").await?;
        file.write_all(args.as_bytes()).await?;
    }

    let generated_tasks: Tasks = serde_json::from_str(&args)?;
    Ok(generated_tasks.tasks)
}
