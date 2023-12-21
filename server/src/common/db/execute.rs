use anyhow::Result;
use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use crate::{
    common::db::task::Status, schema::WorkflowExecution::dsl::*, utils::config::DatabaseConnection,
};

pub async fn create_workflow_execution_record(
    workflow_id: &str,
    db: &DatabaseConnection,
) -> Result<String> {
    let execution_id = Uuid::new_v4().to_string();
    let created_at = Utc::now().naive_utc();
    diesel::insert_into(WorkflowExecution)
        .values((
            id.eq(&execution_id),
            workflowId.eq(&workflow_id),
            createdAt.eq(&created_at),
        ))
        .execute(&mut db.get()?)?;
    Ok(execution_id)
}

pub async fn update_workflow_execution_status(
    workflow_execution_id: &str,
    status_info: &Status,
    db: &DatabaseConnection,
) -> Result<()> {
    diesel::update(WorkflowExecution.filter(id.eq(workflow_execution_id)))
        .set(status.eq(status_info.to_string()))
        .execute(&mut db.get()?)?;
    Ok(())
}
