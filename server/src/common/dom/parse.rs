use anyhow::{anyhow, Result};
use scraper::{selector::Selector, Html};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::str::FromStr;
use uuid::Uuid;

use crate::common::types::BrowserAction;

const IMPORTANT_TAGS: [&str; 28] = [
    "p", "h1", "h2", "h3", "h4", "h5", "h6", "textarea", "a", "button", "select", "option",
    "label", "form", "li", "ul", "ol", "table", "tr", "td", "th", "thead", "tbody", "tfoot",
    "video", "audio", "img", "input",
];

const DIV_WITH_EXCEPTIONS: [&str; 2] = ["div[role=button]", "div[contenteditable=true]"];
const MAX_INNER_TEXT_LENGTH: usize = 1000;

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportantElement {
    pub inner_text: String,
    pub placeholder: Option<String>,
    pub node_id: Option<i32>,
    pub tag: String,
    pub id: String,
    pub document_id: String,
    pub block_ids: Option<String>,
}

pub fn parse_html_extract_imp_elements(
    html: &str,
    user_actions: &Option<Vec<BrowserAction>>,
) -> Result<(String, Vec<ImportantElement>)> {
    let fragment = Html::parse_fragment(html);

    let div_selectors = DIV_WITH_EXCEPTIONS
        .iter()
        .map(|&selector| {
            Selector::parse(selector).map_err(|e| anyhow!("Failed to parse selector: {}", e))
        })
        .collect::<Result<Vec<_>>>()?;

    let document_id = Uuid::new_v4().to_string();

    let mut elements = Vec::new();
    let mut user_actions_set = HashSet::new();

    if let Some(actions) = user_actions {
        for action in actions {
            if let Some(ref tag) = action.tag {
                user_actions_set.insert(tag.as_str());
            }
        }
    }

    let all_selector = Selector::parse("*").unwrap();

    for node in fragment.select(&all_selector) {
        let tag_name = node.value().name();
        let is_important_tag = IMPORTANT_TAGS.contains(&tag_name);
        let mut is_important_element = is_important_tag
            || div_selectors
                .iter()
                .any(|selector| node.select(selector).next().is_some());

        if !is_important_element && user_actions_set.contains(tag_name) {
            let inner_text = node.text().collect::<Vec<_>>().join(" ");
            is_important_element = user_actions
                .as_ref()
                .map(|actions| {
                    actions
                        .iter()
                        .any(|action| action.inner_text.as_deref() == Some(&inner_text))
                })
                .unwrap_or(false);
        }

        if is_important_element {
            let inner_text = node.text().collect::<Vec<_>>().join(" ");
            if inner_text.len() > MAX_INNER_TEXT_LENGTH {
                continue;
            }
            let placeholder = node.value().attr("placeholder").map(String::from);
            let node_id = node
                .value()
                .attr("aie-id")
                .and_then(|id| i32::from_str(id).ok());
            let block_ids = node.value().attr("aie-block-ids").map(String::from);

            elements.push(ImportantElement {
                inner_text,
                placeholder,
                node_id,
                tag: tag_name.to_string(),
                id: Uuid::new_v4().to_string(),
                document_id: document_id.clone(),
                block_ids,
            });
        }
    }

    Ok((document_id, elements))
}
