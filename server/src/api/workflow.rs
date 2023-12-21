use actix_web::{get, post, web, HttpResponse, Responder, Result as ActixResult};
use firebase_auth::FirebaseUser;

use crate::{
    common::{
        db::{
            action::create_action_records,
            plan::{is_new_workflow_creation_allowed, update_workflow_usage_by_user_id},
            user::get_user_info_from_db,
            workflow::{
                create_workflow_record, get_all_workflows_by_user_id, is_workflow_owned_by_user,
                update_workflow_by_id, update_workflow_with_tasks,
            },
        },
        gpt::tasks::generate_tasks,
        types::{ApiStatus, CreateWorkflowRequestPayload, Response, UpdateWorkflowRequestPayload},
    },
    utils::config::DatabaseConnection,
};

#[post("/workflow")]
async fn create_workflow(
    user: FirebaseUser,
    payload: web::Json<CreateWorkflowRequestPayload>,
    db: web::Data<DatabaseConnection>,
) -> ActixResult<impl Responder> {
    let user_info = match get_user_info_from_db(user.email, &db).await {
        Ok(info) => info,
        Err(e) => {
            log::error!("Error getting user info from db: {}", e);
            return Ok(HttpResponse::Unauthorized().json(Response {
                status: ApiStatus::Error(e.to_string()),
            }));
        }
    };

    let is_new_workflow_creation_allowed =
        match is_new_workflow_creation_allowed(&user_info.id, &db).await {
            Ok(info) => info,
            Err(e) => {
                log::error!("Error getting user info from db: {}", e);
                return Ok(HttpResponse::Unauthorized().json(Response {
                    status: ApiStatus::Error(e.to_string()),
                }));
            }
        };

    if !is_new_workflow_creation_allowed {
        return Ok(HttpResponse::Unauthorized().json(Response {
            status: ApiStatus::Error(
                "User has reached the maximum number of workflows allowed".to_string(),
            ),
        }));
    }

    let workflow_id = match create_workflow_record(
        &user_info.id,
        &payload.objective,
        &payload.title,
        &db,
    )
    .await
    {
        Ok(id) => id,
        Err(e) => {
            log::error!("Error creating workflow record: {}", e);
            return Ok(HttpResponse::InternalServerError().json(Response {
                status: ApiStatus::Error(e.to_string()),
            }));
        }
    };

    if let Err(e) = create_action_records(&workflow_id, &payload.actions, &db).await {
        log::error!("Error creating action records: {}", e);
        return Ok(HttpResponse::InternalServerError().json(Response {
            status: ApiStatus::Error(e.to_string()),
        }));
    }

    let tasks = match generate_tasks(
        &payload.title,
        &payload.objective,
        &payload.actions,
        &payload.openai_api_key,
    )
    .await
    {
        Ok(tasks) => tasks,
        Err(e) => {
            log::error!("Error generating tasks: {}", e);
            return Ok(HttpResponse::InternalServerError().json(Response {
                status: ApiStatus::Error(e.to_string()),
            }));
        }
    };

    if let Err(e) = update_workflow_with_tasks(&workflow_id, &tasks, &db).await {
        log::error!("Error updating workflow with tasks: {}", e);
        return Ok(HttpResponse::InternalServerError().json(Response {
            status: ApiStatus::Error(e.to_string()),
        }));
    }

    if let Err(e) = update_workflow_usage_by_user_id(&user_info.id, &db).await {
        log::error!("Error updating workflow usage by user id: {}", e);
        return Ok(HttpResponse::InternalServerError().json(Response {
            status: ApiStatus::Error(e.to_string()),
        }));
    }

    log::info!("Created workflow with id: {}", workflow_id);
    Ok(HttpResponse::Ok().json(Response {
        status: ApiStatus::Ok,
    }))
}

#[get("/workflows")]
async fn get_workflow(
    user: FirebaseUser,
    db: web::Data<DatabaseConnection>,
) -> ActixResult<impl Responder> {
    let user_info = match get_user_info_from_db(user.email, &db).await {
        Ok(info) => info,
        Err(e) => {
            log::error!("Error getting user info from db: {}", e);
            return Ok(HttpResponse::Unauthorized().json(Response {
                status: ApiStatus::Error(e.to_string()),
            }));
        }
    };

    let workflows = match get_all_workflows_by_user_id(&user_info.id, &db).await {
        Ok(workflows) => workflows,
        Err(e) => {
            log::error!("Error getting workflows: {}", e);
            return Ok(HttpResponse::InternalServerError().json(Response {
                status: ApiStatus::Error(e.to_string()),
            }));
        }
    };

    Ok(HttpResponse::Ok().json(workflows))
}

#[post("/update_workflow")]
async fn update_workflow(
    user: FirebaseUser,
    payload: web::Json<UpdateWorkflowRequestPayload>,
    db: web::Data<DatabaseConnection>,
) -> ActixResult<impl Responder> {
    let user_info = match get_user_info_from_db(user.email, &db).await {
        Ok(info) => info,
        Err(e) => {
            log::error!("Error getting user info from db: {}", e);
            return Ok(HttpResponse::Unauthorized().json(Response {
                status: ApiStatus::Error(e.to_string()),
            }));
        }
    };

    let is_workflow_owned_by_user =
        match is_workflow_owned_by_user(&payload.id, &user_info.id, &db).await {
            Ok(is_owned) => is_owned,
            Err(e) => {
                log::error!("Error checking if workflow is owned by user: {}", e);
                return Ok(HttpResponse::InternalServerError().json(Response {
                    status: ApiStatus::Error(e.to_string()),
                }));
            }
        };

    if !is_workflow_owned_by_user {
        return Ok(HttpResponse::Unauthorized().json(Response {
            status: ApiStatus::Error(
                "You don't have permission to update this workflow".to_string(),
            ),
        }));
    }

    match update_workflow_by_id(
        &payload.id,
        &payload.title,
        &payload.objective,
        &payload.tasks,
        &db,
    )
    .await
    {
        Ok(_) => Ok(HttpResponse::Ok().json(Response {
            status: ApiStatus::Ok,
        })),
        Err(e) => {
            log::error!("Error updating workflow by id: {}", e);
            return Ok(HttpResponse::InternalServerError().json(Response {
                status: ApiStatus::Error(e.to_string()),
            }));
        }
    }
}

pub fn config_workflow_api(cfg: &mut web::ServiceConfig) {
    cfg.service(create_workflow)
        .service(get_workflow)
        .service(update_workflow);
}
