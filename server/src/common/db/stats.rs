use anyhow::Result;
use chrono::NaiveDateTime;
use diesel::{prelude::*, ExpressionMethods, QueryDsl, RunQueryDsl, Selectable};
use serde::{Deserialize, Serialize};
use std::env;

use crate::{
    common::db::plan::get_actions_allowed_per_month_count_by_user_id, schema::Stats::dsl::*,
    utils::config::DatabaseConnection,
};

#[derive(Queryable, Selectable, Debug, Clone, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::Stats)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[allow(non_snake_case)]
pub struct StatsInfo {
    pub id: String,
    pub userId: String,
    pub actionsExecuted: i32,
    pub monthYear: String, // format: "YYYY-MM"
    pub createdAt: NaiveDateTime,
}

pub async fn update_actions_stats_by_user_id(
    user_id: &str,
    conn: &DatabaseConnection,
) -> Result<()> {
    let current_month_year = chrono::Utc::now().format("%Y-%m").to_string();
    let stats_info = Stats
        .filter(userId.eq(user_id))
        .filter(monthYear.eq(&current_month_year))
        .first::<StatsInfo>(&mut conn.get()?)?;

    if stats_info.id.is_empty() {
        diesel::insert_into(Stats)
            .values((
                id.eq(&uuid::Uuid::new_v4().to_string()),
                userId.eq(user_id),
                actionsExecuted.eq(1),
                monthYear.eq(&current_month_year),
                createdAt.eq(chrono::Utc::now().naive_utc()),
            ))
            .execute(&mut conn.get()?)?;
    } else {
        diesel::update(Stats)
            .filter(id.eq(stats_info.id))
            .set(actionsExecuted.eq(actionsExecuted + 1))
            .execute(&mut conn.get()?)?;
    }

    Ok(())
}

pub async fn get_actions_executed_count_current_month(
    user_id: &str,
    conn: &DatabaseConnection,
) -> Result<i32> {
    let current_month_year = chrono::Utc::now().format("%Y-%m").to_string();

    match Stats
        .filter(userId.eq(user_id))
        .filter(monthYear.eq(&current_month_year))
        .first::<StatsInfo>(&mut conn.get()?)
    {
        Ok(stats_info) => Ok(stats_info.actionsExecuted),
        Err(_) => {
            let new_stats_uuid = uuid::Uuid::new_v4().to_string();
            diesel::insert_into(Stats)
                .values((
                    id.eq(&new_stats_uuid),
                    userId.eq(user_id),
                    actionsExecuted.eq(0),
                    monthYear.eq(&current_month_year),
                    createdAt.eq(chrono::Utc::now().naive_utc()),
                ))
                .execute(&mut conn.get()?)?;
            Ok(0)
        }
    }
}

pub async fn is_new_action_execution_allowed(
    user_id: &str,
    db_conn: &DatabaseConnection,
) -> Result<bool> {
    let deployment_type = env::var("DEPLOYMENT_TYPE").unwrap_or_default();

    let is_open_source_deployment = deployment_type == "open-source";

    if is_open_source_deployment {
        return Ok(true);
    }

    let executed_actions_count = get_actions_executed_count_current_month(user_id, db_conn).await?;

    let allowed_actions_per_month =
        get_actions_allowed_per_month_count_by_user_id(user_id, db_conn).await?;

    let is_execution_allowed = executed_actions_count < allowed_actions_per_month;

    Ok(is_execution_allowed)
}
