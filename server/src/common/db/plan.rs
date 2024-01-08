use anyhow::Result;
use chrono::NaiveDateTime;
use diesel::{prelude::*, ExpressionMethods, QueryDsl, RunQueryDsl, Selectable};
use serde::{Deserialize, Serialize};

use crate::{schema::Plan::dsl::*, utils::config::DatabaseConnection};

#[derive(Queryable, Selectable, Debug, Clone, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::Plan)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[allow(non_snake_case)]
pub struct PlanInfo {
    pub id: String,
    pub userId: String,
    pub planName: String,
    pub stripeCustomerId: Option<String>,
    pub planDuration: Option<String>,
    pub actionPerMonthAllowed: i32,
    pub workflowCreationAllowed: i32,
    pub createdAt: NaiveDateTime,
    pub workflowCreated: i32,
}

pub async fn update_workflow_usage_by_user_id(
    user_id: &str,
    conn: &DatabaseConnection,
) -> Result<()> {
    diesel::update(Plan)
        .filter(userId.eq(user_id))
        .set(workflowCreated.eq(workflowCreated + 1))
        .execute(&mut conn.get()?)?;
    Ok(())
}

pub async fn get_actions_allowed_per_month_count_by_user_id(
    user_id: &str,
    conn: &DatabaseConnection,
) -> Result<i32> {
    let user_plan_info = Plan
        .filter(userId.eq(user_id))
        .first::<PlanInfo>(&mut conn.get()?)?;
    println!("user_plan_info: {:?}", user_plan_info);
    Ok(user_plan_info.actionPerMonthAllowed)
}
