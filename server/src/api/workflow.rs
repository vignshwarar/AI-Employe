use actix_web::{get, post, web, HttpResponse, Responder, Result as ActixResult};

use crate::{
    common::{
        db::{
            action::create_action_records,
            plan::update_workflow_usage_by_user_id,
            workflow::{
                create_workflow_record, get_all_workflows_without_user_id,
                is_workflow_owned_by_user, update_workflow_by_id, update_workflow_with_tasks,
            },
        },
        gpt::tasks::generate_tasks,
        types::{ApiStatus, CreateWorkflowRequestPayload, Response, UpdateWorkflowRequestPayload},
    },
    utils::config::{DatabaseConnection, OPEN_SOURCE_USER_ID},
};

#[post("/workflow")]
async fn create_workflow(
    payload: web::Json<CreateWorkflowRequestPayload>,
    db: web::Data<DatabaseConnection>,
) -> ActixResult<impl Responder> {
    let workflow_id = match create_workflow_record(
        &OPEN_SOURCE_USER_ID,
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

    if let Err(e) = update_workflow_usage_by_user_id(&OPEN_SOURCE_USER_ID, &db).await {
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
async fn get_workflow(db: web::Data<DatabaseConnection>) -> ActixResult<impl Responder> {
    let workflows = match get_all_workflows_without_user_id(&db).await {
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
    payload: web::Json<UpdateWorkflowRequestPayload>,
    db: web::Data<DatabaseConnection>,
) -> ActixResult<impl Responder> {
    let is_workflow_owned_by_user =
        match is_workflow_owned_by_user(&payload.id, &OPEN_SOURCE_USER_ID, &db).await {
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
