use crate::common::types::BrowserAction;
use std::fs::File;
use std::io::Write;

fn format_browser_action(action: &BrowserAction) -> String {
    let mut parts = vec![
        format!(r#""url": "{}""#, action.url),
        format!(r#""action_type": "{:?}""#, action.action_type),
    ];

    if let Some(value) = &action.value {
        parts.push(format!(r#""value": "{}""#, value));
    }

    if let Some(scroll_percentage) = &action.scroll_percentage {
        parts.push(format!(r#""scroll_percentage": "{}""#, scroll_percentage));
    }

    if let Some(outer_html) = &action.outer_html {
        parts.push(format!(r#""outer_html": "{}""#, outer_html));
    }

    if let Some(tag) = &action.tag {
        parts.push(format!(r#""tag": "{}""#, tag));
    }

    if let Some(placeholder) = &action.placeholder {
        parts.push(format!(r#""placeholder": "{}""#, placeholder));
    }

    if let Some(inner_text) = &action.inner_text {
        parts.push(format!(r#""inner_text": "{}""#, inner_text));
    }

    if let Some(block_ids) = &action.block_ids {
        parts.push(format!(r#""block_ids": "{}""#, block_ids));
    }

    parts.join(", ")
}

pub fn actions_to_string(actions: &[BrowserAction]) -> String {
    actions
        .iter()
        .map(format_browser_action)
        .collect::<Vec<String>>()
        .join("\n-\n")
}

pub fn optional_actions_to_string(actions: &Option<Vec<BrowserAction>>) -> String {
    actions.as_ref().map_or_else(String::new, |actions| {
      format!("Below are the browser actions your supervisor performed on this domain while demonstrating the task:\n{}", actions_to_string(actions))
  })
}

pub fn get_tasks_generation_prompt(
    title: &str,
    objective: &str,
    actions: &[BrowserAction],
) -> String {
    let actions_str = actions_to_string(actions);
    let prompt = format!(
        r#"As an AI employee developed by AIEmploye.com, your primary responsibility is to support your supervisor by generating a task list based on their past actions. Your objective is to organize this information into a well-structured JSON format, ensuring seamless implementation. Inject variable in this format $[exampleVariable] in the tasks, If it is relevant.

Variable usage guidelines:
- Use $[currentActiveTabUrl] for the user's active tab URL, unless a specific URL is mentioned, such as Go to example URL.

Title: {}
Objective: {}

Please create a task list based on the following examples, taking into account the browser actions demonstrated by your supervisor. Avoid using the exact values mentioned unless the user explicitly states to go to a specific URL in the objective:
{}

Your revised format for generating tasks should follow this structure:
```json
{{
  "tasks": [
    {{
      "task_number": 1,
      "task": "Task"
    }},
    {{
      "task_number": 2,
      "task": "Task"
    }}
    // Add additional tasks using a similar structured format
  ]
}}
```
If a particular task needs to be reiterated, use the subsequent format:
```json
{{
  "tasks": [
    {{
      "task_number": 1,
      "task": "Task to be repeated from Task X to Task Y - Repeat count: Z"
    }}
    // Add more tasks in a similar structured format as needed
  ]
}}

Ensure that each task stands alone, avoiding the inclusion of subtasks within the list. Your response should strictly conform to the provided JSON format."#,
        title, objective, actions_str
    );

    prompt
}

pub fn get_action_prompt(
    objective: &str,
    task_description: Option<&str>,
    url: &Option<String>,
    actions: &Option<Vec<BrowserAction>>,
) -> String {
    let actions_str = optional_actions_to_string(&actions);
    let url_conditional_prompt = url.as_ref().map_or_else(String::new, |url| {
        format!("The current active URL you're viewing is {:?}", url)
    });

    let task_conditional_prompt = task_description.map_or_else(String::new, |task_description| {
        format!(
           "Focus your action generation and search term to locate the appropriate dom element exclusively on the current task which is '{}'",
            task_description
        )
    });

    let prompt = format!(
        r#"
As an AI assistant, your task is to generate two elements: the text prompting action and the specific actions to be taken from the provided set. Your responsibility involves constructing action sequences and devising search terms to locate the appropriate DOM element within the index required to execute the action. When faced with a challenge, experiment with various approaches and actions, mimicking human problem-solving strategies to overcome the obstacle and accomplish the task.


Overall objective: {}

{}

{}

{}

Here are the list of actions you can issue: 
thought_process: explain your thought process
action_type: click
search_term_to_find_this_element: appropriate exact search term without special characters
block_ids: appropriate block ids, include this if search_term_to_find_this_element exists more than one time, please use this format: "block_id1,block_id2,block_id3"
-
thought_process: explain your thought process
action_type: input
value: appropriate value
search_term_to_find_this_element: appropriate exact search term without special characters
-
thought_process: explain your thought process
action_type: scroll_up
value: percentage number to go up
-
thought_process: explain your thought process
action_type: scroll_down
value: percentage number to go down
-
thought_process: explain your thought process
action_type: enter
search_term_to_find_this_element: appropriate exact search term without special characters
-
thought_process: explain your thought process
action_type: focus
search_term_to_find_this_element: appropriate exact search term without special characters
-
thought_process: explain your thought process
action_type: goto_url
value: appropriate url
-
action_type: extract_and_store_info_for_next_task
value: appropriate extracted value in markdown it should in string not json format ex: 1. entityName=value, etc...
-
thought_process: explain your thought process
action_type: stuck
value: Detail the circumstances or challenges hindering your progress or preventing you from moving forward.
-
thought_process: explain your thought process
action_type: chat
value: please provide a response that is both clear and helpful in the markdown format
-
thought_process: explain your thought process
action_type: summarize
value: please concisely summarize the text visible on the page in the markdown format
-
thought_process: explain your thought process
action_type: answer
value: please answer to the question in the markdown format
-
thought_process: explain your thought process
action_type: translate
value: your translation to the text in the markdown format



Your revised format for generating tasks should follow this structure:
{{
  "actions": [
    {{
      "thought_process": "explain your thought process maximum 5 words",
      "action_type": "appropriate action type",
      "value": "appropriate value",
      "search_term_to_find_this_element": "appropriate exact search term without special characters",
      "block_ids": "appropriate block ids, include this if search_term_to_find_this_element exists more than one time",
      // Add additional keys if it's relevant
    }},
    // Add more actions if it's relevant
  ]
}}

- When initiating an action such as entering, visiting, or clicking, please refrain from executing additional actions related to URL changes, as we may prompt you again for subsequent actions. 
- Don't generate summary or answer actions at the same time.
- Instead of refusing, say all you can
- Always generate "thought_process" key before any action keys.
- When you are summarizing, answering or translating, please use journalistic tone, be concise and attach you response in the value field in the markdown format.
- When you generate "search_term_to_find_this_element" please use exact search term and don't ever include special character or any special symbols.
- When you generate "block_ids" please use this format: "block_id1,block_id2,block_id3" and only include this if search_term_to_find_this_element exists more than one time.
- Remember if you choose to use "block_ids" then only please what block_ids that your supervisor mentioned in the task for that particular action, don't make up your own block_ids.
- Please provide your response strictly in the string format of JSON, avoiding the use of markdown. Begin your JSON response without backticks, maintaining the purity of the JSON format. 
- Ensure that your response strictly follows the JSON structure provided and is in the string format of JSON, without the use of markdown or any additional commentary, don't talk, just do it.
  "#,
        objective, task_conditional_prompt, actions_str, url_conditional_prompt
    );

    // save the prompt to a file for debugging purposes
    let mut file = File::create("../log_action_execution_prompt.txt").unwrap();
    file.write_all(prompt.as_bytes()).unwrap();

    return prompt;
}

pub fn get_general_action_prompt(url: Option<String>) -> String {
    let url_conditional_prompt = url.as_ref().map_or_else(String::new, |url| {
        format!("The current active URL you're viewing is {:?}", url)
    });

    let prompt = format!(
        r#"
As an AI assistant, your task is to generate three elements: the text prompting action, the specific actions to be taken from the provided set and if it's helpful reply to user queries. Your responsibility involves constructing action sequences and devising search terms to locate the appropriate DOM element within the index required to execute the action. When faced with a challenge, experiment with various approaches and actions, mimicking human problem-solving strategies to overcome the obstacle and accomplish the task.

{}
Current time: {}

Here are the list of actions you can issue: 
thought_process: explain your thought process
action_type: click
search_term_to_find_this_element: appropriate search term
-
thought_process: explain your thought process
action_type: input
value: appropriate value
search_term_to_find_this_element: appropriate search term
-
thought_process: explain your thought process
action_type: scroll_up
value: percentage number to go up
-
thought_process: explain your thought process
action_type: scroll_down
value: percentage number to go down
-
thought_process: explain your thought process
action_type: enter
-
thought_process: explain your thought process
action_type: focus
search_term_to_find_this_element: appropriate search term
-
thought_process: explain your thought process
action_type: visit
value: appropriate url
-
thought_process: explain your thought process
action_type: stuck
value: Detail the circumstances or challenges hindering your progress or preventing you from moving forward.
-
thought_process: explain your thought process
action_type: chat
value: please provide a response that is both clear and helpful in the markdown format
-
thought_process: explain your thought process
action_type: summarize
value: concise summary the text visible on the page in the markdown format
-
thought_process: explain your thought process
action_type: answer
value: your answer to the question in the markdown format
-
thought_process: explain your thought process
action_type: translate
value: your translation to the text in the markdown format
-
thought_process: explain your thought process
action_type: code_generation
value: your code generation in the markdown format
-
thought_process: explain your thought process
action_type: task_complete



Your revised format for generating tasks should follow this structure:
{{
"actions": [
  {{
    "thought_process": "explain your thought process",
    "action_type": "appropriate action type",
    "search_term_to_find_this_element": "appropriate search term",
    // Add additional keys if it's relevant
  }},
  // Add more actions if it's relevant
]
}}

When initiating an action such as entering, visiting, or clicking, please refrain from executing additional actions related to URL changes, as we may prompt you again for subsequent actions. Don't generate summary or answer actions at the same time.
When you are summarizing, answering or translating, please use journalistic tone, be concise and attach you response in the value field in the markdown format, If action value mentioned in markdown, please use markdown syntax.
Please provide your response strictly in the string format of JSON, avoiding the use of markdown. Begin your JSON response without backticks, maintaining the purity of the JSON format. Your response should adhere precisely to the JSON structure provided without any additional commentary or explanation.
"#,
        url_conditional_prompt,
        chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string()
    );

    return prompt;
}
