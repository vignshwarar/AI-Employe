// @generated automatically by Diesel CLI.
#![allow(non_snake_case)]
diesel::table! {
    Plan (id) {
        id -> Text,
        userId -> Text,
        planName -> Text,
        stripeCustomerId -> Nullable<Text>,
        planDuration -> Nullable<Text>,
        actionPerMonthAllowed -> Int4,
        workflowCreationAllowed -> Int4,
        createdAt -> Timestamp,
        workflowCreated -> Int4,
    }
}

diesel::table! {
    RecordedActionByUser (id) {
        id -> Text,
        workflowId -> Text,
        url -> Text,
        normalizedUrl -> Text,
        host -> Text,
        normalizedHost -> Text,
        action -> Jsonb,
        createdAt -> Timestamp,
        eventTime -> Timestamp,
    }
}

diesel::table! {
    Stats (id) {
        id -> Text,
        userId -> Text,
        actionsExecuted -> Int4,
        monthYear -> Text,
        createdAt -> Timestamp,
    }
}

diesel::table! {
    Task (id) {
        id -> Text,
        workflowExecutionId -> Text,
        taskOrder -> Int4,
        createdAt -> Timestamp,
        actionByAI -> Nullable<Jsonb>,
        taskDescription -> Text,
        status -> Text,
    }
}

diesel::table! {
    User (id) {
        id -> Text,
        email -> Text,
        name -> Nullable<Text>,
        createdAt -> Timestamp,
    }
}

diesel::table! {
    Workflow (id) {
        id -> Text,
        userId -> Text,
        objective -> Text,
        createdAt -> Timestamp,
        tasks -> Nullable<Jsonb>,
        title -> Text,
        updatedAt -> Nullable<Timestamp>,
    }
}

diesel::table! {
    WorkflowExecution (id) {
        id -> Text,
        workflowId -> Text,
        createdAt -> Timestamp,
        status -> Text,
    }
}

diesel::table! {
    _prisma_migrations (id) {
        id -> Varchar,
        checksum -> Varchar,
        finished_at -> Nullable<Timestamptz>,
        migration_name -> Varchar,
        logs -> Nullable<Text>,
        rolled_back_at -> Nullable<Timestamptz>,
        started_at -> Timestamptz,
        applied_steps_count -> Int4,
    }
}

diesel::joinable!(Plan -> User (userId));
diesel::joinable!(RecordedActionByUser -> Workflow (workflowId));
diesel::joinable!(Stats -> User (userId));
diesel::joinable!(Task -> WorkflowExecution (workflowExecutionId));
diesel::joinable!(Workflow -> User (userId));
diesel::joinable!(WorkflowExecution -> Workflow (workflowId));

diesel::allow_tables_to_appear_in_same_query!(
    Plan,
    RecordedActionByUser,
    Stats,
    Task,
    User,
    Workflow,
    WorkflowExecution,
    _prisma_migrations,
);
