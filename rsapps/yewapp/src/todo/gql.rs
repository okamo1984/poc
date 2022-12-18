use crate::utils::{request, FetchError};
use graphql_client::GraphQLQuery;
use wasm_bindgen::prelude::*;

type DateTimeUtc = String;

#[derive(GraphQLQuery)]
#[graphql(schema_path = "gql/schema.json", query_path = "gql/all_todos.graphql")]
pub struct AllTodos;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "gql/schema.json",
    query_path = "gql/create_new_todo.graphql"
)]
pub struct CreateNewTodo;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "gql/schema.json",
    query_path = "gql/complete_todo.graphql"
)]
pub struct ToggleComplete;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "gql/schema.json",
    query_path = "gql/complete_all_todos.graphql"
)]
pub struct ToggleAllComplete;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "gql/schema.json",
    query_path = "gql/delete_todo.graphql"
)]
pub struct DeleteTodo;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "gql/schema.json",
    query_path = "gql/clear_completed_todo.graphql"
)]
pub struct ClearCompletedTodo;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "gql/schema.json",
    query_path = "gql/update_todo.graphql"
)]
pub struct UpdateTodoQuery;

pub async fn fetch_all_todos() -> Result<Vec<all_todos::AllTodosTodos>, FetchError> {
    let request_body = AllTodos::build_query(all_todos::Variables {});
    let resp = request::<all_todos::Variables>(request_body).await?;

    match resp.into_serde::<graphql_client::Response<all_todos::ResponseData>>() {
        Ok(data) => match data.data {
            Some(data) => Ok(data.todos),
            None => Ok(vec![]),
        },
        Err(_) => Err(FetchError {
            err: JsValue::from_str("failed to fecth all todos"),
        }),
    }
}

pub async fn create_todo(
    body: String,
) -> Result<create_new_todo::CreateNewTodoCreateTodo, FetchError> {
    let request_body = CreateNewTodo::build_query(create_new_todo::Variables {
        todo: create_new_todo::NewTodo { body },
    });
    let resp = request::<create_new_todo::Variables>(request_body).await?;

    match resp.into_serde::<graphql_client::Response<create_new_todo::ResponseData>>() {
        Ok(data) => match data.data {
            Some(data) => Ok(data.create_todo),
            None => Err(FetchError {
                err: JsValue::from_str("failed to create new todo"),
            }),
        },
        Err(_) => Err(FetchError {
            err: JsValue::from_str("failed to create new todo"),
        }),
    }
}

pub async fn update_todo(
    id: i64,
    body: String,
    complete: bool,
) -> Result<update_todo_query::UpdateTodoQueryUpdateTodo, FetchError> {
    let request_body = UpdateTodoQuery::build_query(update_todo_query::Variables {
        todo: update_todo_query::UpdatedTodo { id, body, complete },
    });
    let resp = request::<update_todo_query::Variables>(request_body).await?;

    match resp.into_serde::<graphql_client::Response<update_todo_query::ResponseData>>() {
        Ok(data) => match data.data {
            Some(data) => Ok(data.update_todo),
            None => Err(FetchError {
                err: JsValue::from_str("failed to update todo"),
            }),
        },
        Err(_) => Err(FetchError {
            err: JsValue::from_str("failed to update todo"),
        }),
    }
}

pub async fn toggle_complete_todo(id: i64) -> Result<bool, FetchError> {
    let request_body = ToggleComplete::build_query(toggle_complete::Variables { id });
    let resp = request::<toggle_complete::Variables>(request_body).await?;

    match resp.into_serde::<graphql_client::Response<toggle_complete::ResponseData>>() {
        Ok(data) => match data.data {
            Some(data) => Ok(data.toggle_complete),
            None => Err(FetchError {
                err: JsValue::from_str(format!("failed to complete todo, id: {}", id).as_str()),
            }),
        },
        Err(_) => Err(FetchError {
            err: JsValue::from_str(format!("failed to complete todo, id: {}", id).as_str()),
        }),
    }
}

pub async fn toggle_complete_all_todos() -> Result<bool, FetchError> {
    let request_body = ToggleAllComplete::build_query(toggle_all_complete::Variables {});
    let resp = request::<toggle_all_complete::Variables>(request_body).await?;

    match resp.into_serde::<graphql_client::Response<toggle_all_complete::ResponseData>>() {
        Ok(data) => match data.data {
            Some(data) => Ok(data.toggle_all_complete),
            None => Err(FetchError {
                err: JsValue::from_str("failed to complete all todos"),
            }),
        },
        Err(_) => Err(FetchError {
            err: JsValue::from_str("failed to complete all todos"),
        }),
    }
}

pub async fn remove_todo(id: i64) -> Result<bool, FetchError> {
    let request_body = DeleteTodo::build_query(delete_todo::Variables { id });
    let resp = request::<delete_todo::Variables>(request_body).await?;

    match resp.into_serde::<graphql_client::Response<delete_todo::ResponseData>>() {
        Ok(data) => match data.data {
            Some(data) => Ok(data.delete_todo),
            None => Err(FetchError {
                err: JsValue::from_str(format!("failed to delete todo, id: {}", id).as_str()),
            }),
        },
        Err(_) => Err(FetchError {
            err: JsValue::from_str(format!("failed to delete todo, id: {}", id).as_str()),
        }),
    }
}

pub async fn remove_completed_todo() -> Result<bool, FetchError> {
    let request_body = ClearCompletedTodo::build_query(clear_completed_todo::Variables {});
    let resp = request::<clear_completed_todo::Variables>(request_body).await?;

    match resp.into_serde::<graphql_client::Response<clear_completed_todo::ResponseData>>() {
        Ok(data) => match data.data {
            Some(data) => Ok(data.clear_completed_todo),
            None => Err(FetchError {
                err: JsValue::from_str("failed to delete completed todos"),
            }),
        },
        Err(_) => Err(FetchError {
            err: JsValue::from_str("failed to delete completed todos"),
        }),
    }
}
