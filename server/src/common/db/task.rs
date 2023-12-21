use anyhow::Result;
use chrono::Utc;
use diesel::{prelude::*, ExpressionMethods, QueryDsl, RunQueryDsl, Selectable};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    common::types::Task as GeneratedTask, schema::Task::dsl::*, utils::config::DatabaseConnection,
};

#[allow(dead_code)]
pub enum Status {
    SentToClient,
    Pending,
    Completed,
}

impl ToString for Status {
    fn to_string(&self) -> String {
        match self {
            Status::SentToClient => "sent_to_client".to_string(),
            Status::Pending => "pending".to_string(),
            Status::Completed => "completed".to_string(),
        }
    }
}

#[derive(Queryable, Selectable, Deserialize, Serialize, Debug)]
#[diesel(table_name = crate::schema::Task)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[allow(non_snake_case)]
pub struct TaskInfo {
    pub id: String,
    pub workflowExecutionId: String,
    pub taskOrder: i32,
    pub createdAt: chrono::NaiveDateTime,
    pub actionByAI: Option<serde_json::Value>,
    pub taskDescription: String,
    pub status: String,
}

pub async fn create_tasks_record(
    workflow_execution_id: &str,
    tasks_data: &Vec<GeneratedTask>,
    conn: &DatabaseConnection,
) -> Result<()> {
    let new_tasks: Vec<_> = tasks_data
        .iter()
        .enumerate()
        .map(|(_, task_data)| {
            let task_id = Uuid::new_v4().to_string();
            let created_at = Utc::now().naive_utc();
            (
                id.eq(task_id),
                workflowExecutionId.eq(workflow_execution_id),
                taskOrder.eq(task_data.task_number),
                createdAt.eq(created_at),
                taskDescription.eq(&task_data.task),
            )
        })
        .collect();

    diesel::insert_into(Task)
        .values(&new_tasks)
        .execute(&mut conn.get()?)?;

    Ok(())
}

pub async fn get_first_pending_task(
    workflow_execution_id: &str,
    conn: &DatabaseConnection,
) -> Result<TaskInfo> {
    Task.filter(workflowExecutionId.eq(workflow_execution_id))
        .filter(status.eq(Status::Pending.to_string()))
        .order(taskOrder.asc())
        .first::<TaskInfo>(&mut conn.get()?)
        .map_err(|e| e.into())
}

pub async fn update_task_status_and_ai_action(
    task_id: &str,
    status_info: &Status,
    ai_action: &serde_json::Value,
    conn: &DatabaseConnection,
) -> Result<()> {
    diesel::update(Task.filter(id.eq(task_id)))
        .set((status.eq(status_info.to_string()), actionByAI.eq(ai_action)))
        .execute(&mut conn.get()?)?;

    Ok(())
}

pub async fn get_all_tasks_by_execution_id(
    workflow_execution_id: &str,
    conn: &DatabaseConnection,
) -> Result<Vec<TaskInfo>> {
    Task.filter(workflowExecutionId.eq(workflow_execution_id))
        .order(taskOrder.asc())
        .load::<TaskInfo>(&mut conn.get()?)
        .map_err(|e| e.into())
}
