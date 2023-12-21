use anyhow::Result;
use chrono::{NaiveDateTime, Utc};
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
use serde_json::{self, Value as JsonValue};
use uuid::Uuid;

use crate::{
    common::types::BrowserAction, schema::RecordedActionByUser::dsl::*,
    utils::config::DatabaseConnection,
};

pub async fn create_action_records(
    workflow_id: &str,
    actions: &[BrowserAction],
    conn: &DatabaseConnection,
) -> Result<()> {
    let records_to_insert: Vec<_> = actions
        .iter()
        .map(|action_data| {
            let action_id = Uuid::new_v4().to_string();
            let event_time =
                NaiveDateTime::parse_from_str(&action_data.timestamp, "%Y-%m-%dT%H:%M:%S%.fZ")?;
            let action_json = serde_json::to_value(action_data)?;

            Ok((
                id.eq(action_id),
                workflowId.eq(workflow_id),
                url.eq(&action_data.url),
                normalizedUrl.eq(&action_data.normalized_url),
                host.eq(&action_data.host),
                normalizedHost.eq(&action_data.normalized_host),
                action.eq(action_json),
                createdAt.eq(Utc::now().naive_utc()),
                eventTime.eq(event_time),
            ))
        })
        .collect::<Result<_>>()?;

    diesel::insert_into(RecordedActionByUser)
        .values(&records_to_insert)
        .execute(&mut conn.get()?)?;

    Ok(())
}

pub async fn retrieve_actions_by_workflow_id_and_host(
    workflow_id: &str,
    action_host: &str,
    conn: &DatabaseConnection,
) -> Result<Vec<BrowserAction>> {
    let actions_json = RecordedActionByUser
        .select(action)
        .filter(workflowId.eq(workflow_id))
        .filter(normalizedHost.eq(action_host))
        .order_by(eventTime.asc())
        .load::<JsonValue>(&mut conn.get()?)?;

    let browser_actions = actions_json
        .into_iter()
        .filter_map(|action_json| serde_json::from_value::<BrowserAction>(action_json).ok())
        .collect::<Vec<BrowserAction>>();

    Ok(browser_actions)
}
