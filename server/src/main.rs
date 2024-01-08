mod api;
mod common;
mod schema;
mod utils;

use actix_web::{error, middleware::Logger, web::JsonConfig, App, HttpResponse, HttpServer};
use common::db::user::create_open_source_user_record;
use std::io;
use utils::config::{is_deployment_open_source, setup_initial_config};

#[tokio::main]
async fn main() -> io::Result<()> {
    let config = setup_initial_config().await;

    log::info!("Starting server at: {}", &config.bind_address);

    let json_cfg = JsonConfig::default()
        .limit(104_857_600) // 100 MiB
        .error_handler(|err, _req| {
            error::InternalError::from_response(err, HttpResponse::Conflict().into()).into()
        });

    if is_deployment_open_source() {
        log::info!("Running in open-source mode");
        log::info!("Creating open-source user record");
        let _ = create_open_source_user_record(&config.db).await;
    }

    HttpServer::new(move || {
        App::new()
            .app_data(json_cfg.clone())
            .wrap(Logger::default())
            .app_data(config.db.clone())
            .app_data(config.meilisearch_client.clone())
            .configure(api::health::config_health_api)
            .configure(api::user::config_user_api)
            .configure(api::workflow::config_workflow_api)
            .configure(api::execute::config_execute_workflow_api)
    })
    .bind(&config.bind_address)?
    .run()
    .await
}
