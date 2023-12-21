use anyhow::Result;
use chrono::NaiveDateTime;
use diesel::{prelude::*, ExpressionMethods, QueryDsl, RunQueryDsl, Selectable};
use serde::{Deserialize, Serialize};

use crate::{schema::User::dsl::*, utils::config::DatabaseConnection};

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

pub async fn get_user_info_from_db(
    user_email: Option<String>,
    db: &DatabaseConnection,
) -> Result<UserInfo> {
    let result = if let Some(user_email) = user_email {
        get_user_info_by_email(&user_email, db)
            .await
            .map_err(Into::into)
    } else {
        Err(anyhow::anyhow!("No email found"))
    };
    result
}
