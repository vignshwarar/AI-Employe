use anyhow::Result;
use chrono::NaiveDateTime;
use diesel::{prelude::*, ExpressionMethods, QueryDsl, RunQueryDsl, Selectable};
use serde::{Deserialize, Serialize};

use crate::{
    schema::User::dsl::*,
    utils::config::{DatabaseConnection, OPEN_SOURCE_USER_ID},
};

#[derive(Queryable, Selectable, Debug, Clone, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::User)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[allow(non_snake_case)]
pub struct UserInfo {
    pub id: String,
    pub email: String,
    pub name: Option<String>,
    pub createdAt: NaiveDateTime,
}

pub async fn get_user_info_by_email(
    user_email: &str,
    conn: &DatabaseConnection,
) -> Result<UserInfo> {
    User.filter(email.eq(user_email))
        .first::<UserInfo>(&mut conn.get()?)
        .map_err(|e| e.into())
}

pub async fn create_open_source_user_record(conn: &DatabaseConnection) -> Result<()> {
    let user_id = OPEN_SOURCE_USER_ID.to_string();
    let created_at = chrono::Utc::now().naive_utc();
    diesel::insert_into(User)
        .values((
            id.eq(&user_id),
            email.eq("dummy_user@open_source"),
            name.eq("Open Source User"),
            createdAt.eq(created_at),
        ))
        .execute(&mut conn.get()?)?;
    Ok(())
}
