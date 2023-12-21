use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::fmt::Debug;

use crate::common::db::task::TaskInfo;

#[derive(Debug, Serialize, Deserialize)]
pub struct Response {
    pub status: ApiStatus,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct BrowserAction {
    pub action_type: String,
    pub timestamp: String,
    pub url: String,
    pub normalized_url: String,
    pub host: String,
    pub normalized_host: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scroll_percentage: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub outer_html: Option<String>,
    pub tag: Option<String>,
    pub placeholder: Option<String>,
    pub inner_text: Option<String>,
    pub block_ids: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateWorkflowRequestPayload {
    pub title: String,
    pub objective: String,
    pub actions: Vec<BrowserAction>,
    pub openai_api_key: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateWorkflowRequestPayload {
    pub title: String,
    pub objective: String,
    pub id: String,
    pub tasks: Vec<Task>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateWorkflowResponsePayload {
    pub workflow_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExecuteWorkflowRequestPayload {
    pub workflow_id: String,
    pub workflow_execution_id: Option<String>,
    pub html: Option<String>,
    pub screenshot: Option<String>,
    pub url: Option<String>,
    pub host: Option<String>,
    pub openai_api_key: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExecuteWorkflowResponsePayload {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workflow_execution_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub task: Option<TaskInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub action: Option<AIActions>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub all_tasks_completed: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExecuteRequestPayload {
    pub messages: Vec<UserMessage>,
    pub html: Option<String>,
    pub screenshot: Option<String>,
    pub url: Option<String>,
    pub host: Option<String>,
    pub openai_api_key: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Tasks {
    pub tasks: Vec<Task>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Task {
    pub task_number: i32,
    pub task: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FunctionCall {
    pub arguments: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Message {
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub function_call: Option<FunctionCall>,
    pub role: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserMessage {
    pub content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub function_call: Option<FunctionCall>,
    pub role: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Choices {
    pub finish_reason: Option<String>,
    pub index: i32,
    pub message: Message,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Usage {
    pub completion_tokens: i32,
    pub prompt_tokens: i32,
    pub total_tokens: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OpenAIResponse {
    pub choices: Option<Vec<Choices>>,
    pub created: i32,
    pub id: String,
    pub model: String,
    pub object: String,
    pub usage: Usage,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Value {
    String(String),
    JsonValue(JsonValue),
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AIAction {
    pub action_type: ActionType,
    pub search_term_to_find_this_element: Option<String>,
    pub value: Option<String>,
    pub node_id: Option<i32>,
    pub thought_process: Option<String>,
    pub block_ids: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AIActions {
    pub actions: Vec<AIAction>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ApiStatus {
    Ok,
    Error(String),
    Accepted,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ActionType {
    Click,
    ScrollUp,
    ScrollDown,
    Input,
    Select,
    Hover,
    Focus,
    Visit,
    Enter,
    KeyDown,
    Summarize,
    TaskComplete,
    Answer,
    Chat,
    Stuck,
    Translate,
    CodeGeneration,
    GotoUrl,
    ExtractAndStoreInfoForNextTask,
}
