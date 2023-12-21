use actix_web::web::Data;
use diesel::r2d2::{self, ConnectionManager};
use diesel::PgConnection;
use firebase_auth::FirebaseAuth;
use meilisearch_sdk::client::Client as MeilisearchClient;
use std::env;

use crate::utils::load_env::load_environment_variables;

pub type DatabaseConnection = r2d2::Pool<ConnectionManager<PgConnection>>;

pub struct Config {
    pub db: Data<DatabaseConnection>,
    pub meilisearch_client: Data<MeilisearchClient>,
    pub firebase_data: Data<FirebaseAuth>,
    pub bind_address: String,
}

pub fn setup_database() -> DatabaseConnection {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let manager = ConnectionManager::new(database_url);
    r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create DB connection pool.")
}

pub fn setup_meilisearch_client() -> MeilisearchClient {
    let meilisearch_url = env::var("MEILISEARCH_URL").expect("MEILISEARCH_URL must be set");
    let meilisearch_api_key =
        env::var("MEILISEARCH_API_KEY").expect("MEILISEARCH_API_KEY must be set");
    MeilisearchClient::new(meilisearch_url, Some(meilisearch_api_key))
}

pub async fn setup_firebase_auth() -> FirebaseAuth {
    let firebase_app_id = env::var("FIREBASE_APP_ID").expect("FIREBASE_APP_ID must be set");
    FirebaseAuth::new(&firebase_app_id).await
}

pub async fn init_env() {
    simple_logger::init_with_env().expect("Failed to initialize logger");
    load_environment_variables()
        .await
        .expect("Failed to load environment variables");
}

pub fn is_production() -> bool {
    env::var("RUST_ENV")
        .expect("RUST_ENV must be set")
        .eq("production")
}

pub fn get_bind_address() -> String {
    if is_production() {
        format!(
            "0.0.0.0:{}",
            env::var("BACKEND_PORT").expect("BACKEND_PORT must be set")
        )
    } else {
        format!(
            "localhost:{}",
            env::var("BACKEND_PORT").expect("BACKEND_PORT must be set")
        )
    }
}

pub async fn setup_initial_config() -> Config {
    init_env().await;
    let firebase_data = Data::new(setup_firebase_auth().await);
    let database = Data::new(setup_database());
    let meilisearch_client = Data::new(setup_meilisearch_client());
    let bind_address = get_bind_address();

    let config = Config {
        db: database.clone(),
        meilisearch_client: meilisearch_client.clone(),
        firebase_data: firebase_data.clone(),
        bind_address: bind_address.clone(),
    };

    config
}
