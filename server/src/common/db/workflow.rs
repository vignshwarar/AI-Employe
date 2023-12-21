use anyhow::Result;
use chrono::NaiveDateTime;
use chrono::Utc;
use diesel::{prelude::*, ExpressionMethods, QueryDsl, RunQueryDsl, Selectable};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use uuid::Uuid;

use crate::{common::types::Task, schema::Workflow::dsl::*, utils::config::DatabaseConnection};

#[derive(Queryable, Selectable, Debug, Clone, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::Workflow)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[allow(non_snake_case)]
pub struct WorkflowInfo {
    pub id: String,
    pub userId: String,
    pub objective: String,
    pub createdAt: NaiveDateTime,
    pub tasks: Option<JsonValue>,
    pub title: String,
    pub updatedAt: Option<NaiveDateTime>,
}

pub async fn create_workflow_record(
    user_id: &str,
    objective_data: &str,
    title_data: &str,
    conn: &DatabaseConnection,
) -> Result<String> {
    let workflow_id = Uuid::new_v4().to_string();
    let created_at = Utc::now().naive_utc();
    diesel::insert_into(Workflow)
        .values((
            id.eq(&workflow_id),
            userId.eq(user_id),
            objective.eq(objective_data),
            title.eq(title_data),
            createdAt.eq(created_at),
        ))
        .execute(&mut conn.get()?)?;
    Ok(workflow_id)
}

pub async fn update_workflow_with_tasks(
    workflow_id: &str,
    tasks_data: &Vec<Task>,
    conn: &DatabaseConnection,
) -> Result<()> {
    let tasks_json = serde_json::to_value(tasks_data)?;
    diesel::update(Workflow)
        .filter(id.eq(workflow_id))
        .set(tasks.eq(tasks_json))
        .execute(&mut conn.get()?)?;
    Ok(())
}

pub async fn get_workflow_by_id(
    workflow_id: &str,
    conn: &DatabaseConnection,
) -> Result<WorkflowInfo> {
    Workflow
        .filter(id.eq(workflow_id))
        .first::<WorkflowInfo>(&mut conn.get()?)
        .map_err(|e| e.into())
}

pub async fn get_all_workflows_by_user_id(
    user_id: &str,
    conn: &DatabaseConnection,
) -> Result<Vec<WorkflowInfo>> {
    Workflow
        .filter(userId.eq(user_id))
        .order(createdAt.desc())
        .load::<WorkflowInfo>(&mut conn.get()?)
        .map_err(|e| e.into())
}

pub async fn is_workflow_owned_by_user(
    workflow_id: &str,
    user_id: &str,
    conn: &DatabaseConnection,
) -> Result<bool> {
    let workflow = Workflow
        .filter(id.eq(workflow_id))
        .filter(userId.eq(user_id))
        .first::<WorkflowInfo>(&mut conn.get()?)
        .optional()?;
    Ok(workflow.is_some())
}

pub async fn update_workflow_by_id(
    workflow_id: &str,
    title_data: &str,
    objective_data: &str,
    tasks_data: &Vec<Task>,
    conn: &DatabaseConnection,
) -> Result<()> {
    let tasks_json = serde_json::to_value(tasks_data)?;
    diesel::update(Workflow)
        .filter(id.eq(workflow_id))
        .set((
            title.eq(title_data),
            objective.eq(objective_data),
            tasks.eq(tasks_json),
            updatedAt.eq(Utc::now().naive_utc()),
        ))
        .execute(&mut conn.get()?)?;
    Ok(())
}
