use actix_web::{get, web, HttpResponse, Responder};

#[get("/ping")]
async fn ping() -> impl Responder {
    HttpResponse::Ok().json("pong")
}

pub fn config_health_api(cfg: &mut web::ServiceConfig) {
    cfg.service(ping);
}
