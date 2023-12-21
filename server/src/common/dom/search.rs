use anyhow::Result;
use meilisearch_sdk::{client::Client as MeilisearchClient, Index, SearchResults};

use crate::common::{
    dom::parse::{parse_html_extract_imp_elements, ImportantElement},
    types::{AIActions, BrowserAction},
};

pub async fn build_index(
    html: &str,
    user_actions: &Option<Vec<BrowserAction>>,
    meilisearch_client: &MeilisearchClient,
) -> Result<(String, Index)> {
    let (document_id, important_elements) = parse_html_extract_imp_elements(html, user_actions)?;
    let pages = meilisearch_client.index("pages_new");
    pages
        .set_filterable_attributes(&["id", "document_id", "block_ids"])
        .await?;
    pages.set_ranking_rules(&["exactness"]).await?;

    let index_elements = pages.add_documents(&important_elements, Some("id")).await?;

    index_elements
        .wait_for_completion(meilisearch_client, None, None)
        .await?;

    Ok((document_id, pages))
}

async fn execute_search(
    index: &Index,
    search_term: &str,
    filter_string: &str,
    limit: usize,
) -> Result<SearchResults<ImportantElement>, meilisearch_sdk::Error> {
    index
        .search()
        .with_query(search_term)
        .with_show_ranking_score(true)
        .with_limit(limit)
        .with_filter(filter_string)
        .execute::<ImportantElement>()
        .await
}

pub async fn search(
    index: &Index,
    document_id: &str,
    search_term: &str,
    block_ids: &Option<String>,
    limit: usize,
) -> Result<SearchResults<ImportantElement>> {
    let base_filter_string = format!("document_id = \"{}\"", document_id);
    let filter_string = block_ids
        .as_ref()
        .map(|ids| {
            let base_filter_string = base_filter_string.clone();
            format!("{} AND block_ids = \"{}\"", base_filter_string, ids)
        })
        .unwrap_or_else(|| base_filter_string.clone());

    let mut search_result = execute_search(index, search_term, &filter_string, limit).await?;

    if search_result.hits.is_empty() && block_ids.is_some() {
        search_result = execute_search(index, search_term, &base_filter_string, limit).await?;
    }

    Ok(search_result)
}

pub async fn build_index_and_attach_node_id(
    html: &str,
    user_actions: &Option<Vec<BrowserAction>>,
    ai_actions: &mut AIActions,
    meilisearch_client: &MeilisearchClient,
) -> Result<()> {
    let (document_id, index) = build_index(html, user_actions, meilisearch_client).await?;

    for ai_action in &mut ai_actions.actions {
        if let Some(search_term) = &ai_action.search_term_to_find_this_element {
            let search_results =
                search(&index, &document_id, search_term, &ai_action.block_ids, 5).await?;

            if let Some(first_hit) = search_results.hits.first() {
                ai_action.node_id = first_hit.result.node_id.clone();
                ai_action.block_ids = first_hit.result.block_ids.clone();
            }
        }
    }

    Ok(())
}
