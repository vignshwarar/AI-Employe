use anyhow::{Context, Result};
use reqwest::Client;
use serde_json::json;
use serde_json::Value as JsonValue;
use std::env;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

use crate::{
    common::{
        db::{
            action::retrieve_actions_by_workflow_id_and_host,
            task::{get_all_tasks_by_execution_id, TaskInfo},
        },
        gpt::prompts::{get_action_prompt, get_general_action_prompt},
        types::{AIActions, BrowserAction, OpenAIResponse, UserMessage},
    },
    utils::config::{is_production, DatabaseConnection},
};

pub async fn get_browser_actions(
    workflow_id: &str,
    host: &Option<String>,
    db: &DatabaseConnection,
) -> Option<Vec<BrowserAction>> {
    match host {
        Some(host) => match retrieve_actions_by_workflow_id_and_host(workflow_id, host, db).await {
            Ok(actions) => Some(actions),
            Err(_) => None,
        },
        None => None,
    }
}

async fn create_workflow_messages(
    prompt: String,
    screenshot: &Option<String>,
    all_tasks_by_execution_id: &[TaskInfo],
) -> Result<Vec<JsonValue>> {
    let mut messages = Vec::with_capacity(all_tasks_by_execution_id.len() * 2 + 2);
    messages.push(json!({"role": "system", "content": prompt}));

    for task in all_tasks_by_execution_id {
        let content = &task.taskDescription;
        let status = &task.status;

        messages.push(json!({
            "role": "user",
            "content": content.to_string()
        }));

        if status == "pending" {
            break;
        }

        if let Some(action_by_ai) = &task.actionByAI {
            messages.push(json!({
                "role": "assistant",
                "content": action_by_ai.to_string()
            }));
        } else {
            break;
        }
    }

    if let Some(screenshot_url) = screenshot {
        messages.push(json!({
            "role": "user",
            "content": [{
                "type": "image_url",
                "image_url": screenshot_url
            }]
        }));
    }

    if !is_production() {
        let messages_json = serde_json::to_string(&messages)?;
        let mut file = File::create("../log_messages.json").await?;
        file.write_all(messages_json.as_bytes()).await?;
    }

    Ok(messages)
}

pub async fn get_search_term_and_action_with_workflow_id(
    workflow_id: &str,
    workflow_execution_id: &str,
    objective: &str,
    task: &TaskInfo,
    screenshot: &Option<String>,
    url: &Option<String>,
    host: &Option<String>,
    user_provided_openai_key: &Option<String>,
    db: &DatabaseConnection,
) -> Result<(Option<Vec<BrowserAction>>, AIActions)> {
    let default_open_ai_key = env::var("OPEN_AI_API_KEY").expect("OPEN_AI_API_KEY must be set");
    let open_ai_key = user_provided_openai_key
        .as_deref()
        .unwrap_or_else(|| &default_open_ai_key);

    let open_ai_chat_completion_url =
        env::var("OPEN_AI_CHAT_COMPLETION_API").expect("OPEN_AI_CHAT_COMPLETION_URL must be set");

    let user_browser_actions = get_browser_actions(workflow_id, host, db).await;

    let prompt = get_action_prompt(
        objective,
        Some(&task.taskDescription),
        url,
        &user_browser_actions,
    );

    if !is_production() {
        let mut file = File::create("../log_prompt.txt").await?;
        file.write_all(prompt.as_bytes()).await?;
    }

    let all_tasks_by_execution_id =
        get_all_tasks_by_execution_id(workflow_execution_id, db).await?;
    let messages = create_workflow_messages(prompt, screenshot, &all_tasks_by_execution_id).await?;

    let client = Client::new();
    let response = client
        .post(&open_ai_chat_completion_url)
        .bearer_auth(open_ai_key)
        .json(&json!({
            "model": "gpt-4-vision-preview",
            "messages": messages,
            "max_tokens": 1000,
            "temperature": 0,
        }))
        .send()
        .await?;

    let response_text = response
        .text()
        .await
        .context("Failed to read response text")?;

    log::info!("Got response from GPT: {:?}", response_text);

    let parsed_response = serde_json::from_str::<OpenAIResponse>(&response_text)
        .context("Failed to parse OpenAI response")?;

    let actions = parsed_response
        .choices
        .as_ref()
        .context("Error in OpenAI response")?
        .get(0)
        .and_then(|choice| choice.message.content.as_deref())
        .context("No actions found in OpenAI response")?;

    log::info!("Actions response from OpenAI: {:?}", actions);

    let parsed_actions = serde_json::from_str::<AIActions>(actions)
        .context("Failed to parse AIActions from OpenAI response")?;

    Ok((user_browser_actions, parsed_actions))
}

pub async fn get_search_term_and_for_common_action(
    messages: &[UserMessage],
    screenshot: &Option<String>,
    url: &Option<String>,
    _host: &Option<String>,
    user_provided_openai_key: &Option<String>,
) -> Result<AIActions> {
    let default_open_ai_key = env::var("OPEN_AI_API_KEY").expect("OPEN_AI_API_KEY must be set");
    let open_ai_key = user_provided_openai_key
        .as_deref()
        .unwrap_or_else(|| &default_open_ai_key);

    let prompt = get_general_action_prompt(url.clone());

    if !is_production() {
        let mut file = File::create("../log_common_action_prompt.txt").await?;
        file.write_all(prompt.as_bytes()).await?;
    }

    let messages = create_common_messages(prompt, screenshot, Some(messages)).await?;
    let ai_actions = get_response_from_gpt(open_ai_key, &messages).await?;

    Ok(ai_actions)
}

pub async fn get_response_from_gpt(open_ai_key: &str, messages: &[JsonValue]) -> Result<AIActions> {
    let open_ai_chat_completion_url = env::var("OPEN_AI_CHAT_COMPLETION_API")
        .context("OPEN_AI_CHAT_COMPLETION_URL must be set")?;

    let client = Client::new();

    if !is_production() {
        let mut file = File::create("../log_messages.json").await?;
        let messages_str = serde_json::to_string(messages)?;
        file.write_all(messages_str.as_bytes()).await?;
    }

    log::info!("Getting response from GPT...");
    let response = client
        .post(&open_ai_chat_completion_url)
        .bearer_auth(open_ai_key)
        .json(&json!({
            "model": "gpt-4-vision-preview",
            "messages": messages,
            "max_tokens": 1000,
            "temperature": 0,
        }))
        .send()
        .await
        .context("Failed to send request to OpenAI")?;

    let response_body = response
        .json::<OpenAIResponse>()
        .await
        .context("Failed to parse response from OpenAI")?;

    let choice = response_body
        .choices
        .as_ref()
        .and_then(|choices| choices.get(0))
        .and_then(|choice| choice.message.content.as_ref())
        .context("No content found in OpenAI response")?;

    let ai_actions = serde_json::from_str::<AIActions>(choice)
        .context("Failed to convert OpenAI response content to AIActions")?;

    log::debug!("Converted: {:?}", ai_actions);
    Ok(ai_actions)
}

async fn create_common_messages(
    prompt: String,
    screenshot: &Option<String>,
    user_messages: Option<&[UserMessage]>,
) -> Result<Vec<JsonValue>> {
    let mut messages = Vec::with_capacity(user_messages.map_or(1, |msgs| msgs.len() + 1));

    messages.push(json!({ "role": "system", "content": prompt }));

    if let Some(screenshot_url) = screenshot {
        messages.push(json!({
            "role": "user",
            "content": [{
                "type": "image_url",
                "image_url": screenshot_url
            }]
        }));
    }

    if let Some(user_messages) = user_messages {
        messages.extend(user_messages.iter().map(|message| {
            json!({
                "role": message.role,
                "content": message.content
            })
        }));
    }

    Ok(messages)
}
