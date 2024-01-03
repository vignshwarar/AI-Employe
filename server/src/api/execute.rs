use actix_web::{post, web, HttpResponse, Responder};
use firebase_auth::FirebaseUser;
use meilisearch_sdk::client::Client as MeilisearchClient;

use crate::{
    common::{
        db::{
            execute::{create_workflow_execution_record, update_workflow_execution_status},
            stats::{is_new_action_execution_allowed, update_actions_stats_by_user_id},
            task::{
                create_tasks_record, get_first_pending_task, update_task_status_and_ai_action,
                Status,
            },
            user::get_user_info_from_db,
            workflow::get_workflow_by_id,
        },
        dom::search::build_index_and_attach_node_id,
        gpt::action::{
            get_search_term_and_action_with_workflow_id, get_search_term_and_for_common_action,
        },
        types::{
            ApiStatus, ExecuteRequestPayload, ExecuteWorkflowRequestPayload,
            ExecuteWorkflowResponsePayload, Response, Task,
        },
    },
    utils::config::DatabaseConnection,
};

#[post("/execute_workflow")]
async fn execute_workflow(
    user: FirebaseUser,
    payload: web::Json<ExecuteWorkflowRequestPayload>,
    db: web::Data<DatabaseConnection>,
    meilisearch_client: web::Data<MeilisearchClient>,
) -> impl Responder {
    let user_info = match get_user_info_from_db(user.email, &db).await {
        Ok(info) => info,
        Err(e) => {
            log::error!("Error getting user info from db: {}", e);
            return HttpResponse::Unauthorized().json(Response {
                status: ApiStatus::Error(e.to_string()),
            });
        }
    };
    if payload.openai_api_key.is_none() {
        let is_new_action_execution_allowed =
            match is_new_action_execution_allowed(&user_info.id, &db).await {
                Ok(info) => info,
                Err(e) => {
                    log::error!("is_new_action_execution_allowed: {}", e);
                    return HttpResponse::InternalServerError().json(Response {
                        status: ApiStatus::Error(e.to_string()),
                    });
                }
            };

        if !is_new_action_execution_allowed {
            return HttpResponse::Unauthorized().json(Response {
                status: ApiStatus::Error(
                    "User has reached the maximum number of actions allowed".to_string(),
                ),
            });
        }
    }

    let workflow_info = match get_workflow_by_id(&payload.workflow_id, &db).await {
        Ok(info) => info,
        Err(e) => {
            log::error!("Error getting workflow info: {}", e);
            return HttpResponse::InternalServerError().json(Response {
                status: ApiStatus::Error(e.to_string()),
            });
        }
    };

    let workflow_execution_id = match payload.workflow_execution_id.as_ref() {
        Some(id) => id.clone(),
        None => match create_workflow_execution_record(&payload.workflow_id, &db).await {
            Ok(id) => id,
            Err(e) => {
                log::error!("Error creating execution record: {}", e);
                return HttpResponse::InternalServerError().json(Response {
                    status: ApiStatus::Error(e.to_string()),
                });
            }
        },
    };

    if payload.workflow_execution_id.is_none() {
        if let Some(tasks) = &workflow_info.tasks {
            let tasks: Vec<Task> = serde_json::from_value(tasks.clone()).unwrap();
            if create_tasks_record(&workflow_execution_id, &tasks, &db)
                .await
                .is_err()
            {
                return HttpResponse::InternalServerError().json(Response {
                    status: ApiStatus::Error("Error creating tasks record".to_string()),
                });
            }
        }
    }

    let first_pending_task = match get_first_pending_task(&workflow_execution_id, &db).await {
        Ok(task) => task,
        Err(e) => {
            if e.to_string().contains("Record not found") {
                let _ = update_workflow_execution_status(
                    &workflow_execution_id,
                    &Status::Completed,
                    &db,
                )
                .await;

                return HttpResponse::Ok().json(ExecuteWorkflowResponsePayload {
                    workflow_execution_id: Some(workflow_execution_id.clone()),
                    task: None,
                    action: None,
                    message: "All tasks completed".to_string().into(),
                    all_tasks_completed: Some(true),
                });
            }

            log::error!("Error getting first pending task: {}", e);
            return HttpResponse::InternalServerError().json(Response {
                status: ApiStatus::Error(e.to_string()),
            });
        }
    };

    let (user_actions, mut ai_actions) = match get_search_term_and_action_with_workflow_id(
        &workflow_info.id,
        &workflow_execution_id,
        &workflow_info.objective,
        &first_pending_task,
        &payload.screenshot,
        &payload.url,
        &payload.host,
        &payload.openai_api_key,
        &db,
    )
    .await
    {
        Ok(actions) => actions,
        Err(e) => {
            log::error!("Error getting search term and action: {}", e);
            return HttpResponse::InternalServerError().json(Response {
                status: ApiStatus::Error(e.to_string()),
            });
        }
    };

    if let Some(html) = payload.html.clone() {
        if build_index_and_attach_node_id(
            &html,
            &user_actions,
            &mut ai_actions,
            &meilisearch_client,
        )
        .await
        .is_err()
        {
            return HttpResponse::InternalServerError().json(Response {
                status: ApiStatus::Error("Error indexing HTML".to_string()),
            });
        }
    }

    if update_task_status_and_ai_action(
        &first_pending_task.id,
        &Status::Completed,
        &serde_json::to_value(&ai_actions).unwrap(),
        &db,
    )
    .await
    .is_err()
    {
        return HttpResponse::InternalServerError().json(Response {
            status: ApiStatus::Error("Error updating task status".to_string()),
        });
    }

    if update_actions_stats_by_user_id(&user_info.id, &db)
        .await
        .is_err()
    {
        return HttpResponse::InternalServerError().json(Response {
            status: ApiStatus::Error("Error updating actions stats".to_string()),
        });
    }

    HttpResponse::Ok().json(ExecuteWorkflowResponsePayload {
        workflow_execution_id: Some(workflow_execution_id.clone()),
        task: Some(first_pending_task),
        action: Some(ai_actions),
        message: None,
        all_tasks_completed: None,
    })
}

#[post("/execute")]
async fn execute(
    user: FirebaseUser,
    payload: web::Json<ExecuteRequestPayload>,
    db: web::Data<DatabaseConnection>,
    meilisearch_client: web::Data<MeilisearchClient>,
) -> impl Responder {
    let user_info = match get_user_info_from_db(user.email, &db).await {
        Ok(info) => info,
        Err(e) => {
            log::error!("Error getting user info from db: {}", e);
            return HttpResponse::Unauthorized().json(Response {
                status: ApiStatus::Error(e.to_string()),
            });
        }
    };

    if payload.openai_api_key.is_none() {
        let is_new_action_execution_allowed =
            match is_new_action_execution_allowed(&user_info.id, &db).await {
                Ok(info) => info,
                Err(e) => {
                    log::error!("Error getting user info from db: {}", e);
                    return HttpResponse::InternalServerError().json(Response {
                        status: ApiStatus::Error(e.to_string()),
                    });
                }
            };

        if !is_new_action_execution_allowed {
            return HttpResponse::Unauthorized().json(Response {
                status: ApiStatus::Error(
                    "User has reached the maximum number of actions allowed".to_string(),
                ),
            });
        }
    }

    let mut ai_action = match get_search_term_and_for_common_action(
        &payload.messages,
        &payload.screenshot,
        &payload.url,
        &payload.host,
        &payload.openai_api_key,
    )
    .await
    {
        Ok(actions) => actions,
        Err(e) => {
            log::error!("Error getting search term and action: {}", e);
            return HttpResponse::InternalServerError().json(Response {
                status: ApiStatus::Error(e.to_string()),
            });
        }
    };

    if let Some(html) = payload.html.clone() {
        if build_index_and_attach_node_id(&html, &None, &mut ai_action, &meilisearch_client)
            .await
            .is_err()
        {
            return HttpResponse::InternalServerError().json(Response {
                status: ApiStatus::Error("Error indexing HTML".to_string()),
            });
        }
    }

    if update_actions_stats_by_user_id(&user_info.id, &db)
        .await
        .is_err()
    {
        return HttpResponse::InternalServerError().json(Response {
            status: ApiStatus::Error("Error updating actions stats".to_string()),
        });
    }

    HttpResponse::Ok().json(ExecuteWorkflowResponsePayload {
        workflow_execution_id: None,
        task: None,
        action: Some(ai_action),
        message: None,
        all_tasks_completed: None,
    })
}

pub fn config_execute_workflow_api(cfg: &mut web::ServiceConfig) {
    cfg.service(execute_workflow).service(execute);
}
