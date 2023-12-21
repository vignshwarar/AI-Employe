use actix_web::{get, web, HttpResponse, Responder};
use firebase_auth::FirebaseUser;

use crate::{
    common::{
        db::user::get_user_info_by_email,
        types::{ApiStatus, Response},
    },
    utils::config::DatabaseConnection,
};

#[get("/user")]
async fn get_user(user: FirebaseUser, db: web::Data<DatabaseConnection>) -> impl Responder {
    match user.email {
        Some(email) => match get_user_info_by_email(&email, &db).await {
            Ok(user_info) => HttpResponse::Ok().json(user_info),
            Err(e) => {
                log::error!("Error getting user info from db: {}", e);
                HttpResponse::Unauthorized().json(Response {
                    status: ApiStatus::Error(e.to_string()),
                })
            }
        },
        None => HttpResponse::Unauthorized().json(Response {
            status: ApiStatus::Error("No email found in Firebase user".to_string()),
        }),
    }
}

pub fn config_user_api(cfg: &mut web::ServiceConfig) {
    cfg.service(get_user);
}
