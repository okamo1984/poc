use crate::domains::entities::todo::Todo;
use crate::domains::errors::{ApplicationError, ErrorCode};
use crate::domains::repositories::todo_repository::TodoRepository;
use crate::domains::ApplicationResult;
use crate::infrastructures::di_container::DIContainer;
use std::sync::Arc;

#[derive(Clone)]
pub struct TodoService {
    pub todo_repository: Box<dyn TodoRepository + Send + Sync>,
}

impl TodoService {
    pub fn new(di_container: Arc<dyn DIContainer>) -> Self {
        Self {
            todo_repository: di_container.todo_repository(),
        }
    }
    pub async fn get_all_todos(&self, user_id: i32) -> ApplicationResult<Vec<Todo>> {
        match self.todo_repository.get_all_todos(user_id).await {
            Ok(todos) => Ok(todos),
            Err(err) => Err(ApplicationError {
                code: ErrorCode::SystemError,
                message: format!("failed to fetch todos, error: {:}", err),
            }),
        }
    }

    pub async fn create_todo(&self, body: String, user_id: i32) -> ApplicationResult<Todo> {
        let now = chrono::Utc::now();
        let todo = Todo {
            id: 0,
            body,
            complete: false,
            created_at: now,
            updated_at: now,
            user_id,
        };
        match self.todo_repository.create_todo(todo).await {
            Ok(created) => Ok(created),
            Err(err) => Err(ApplicationError {
                code: ErrorCode::SystemError,
                message: format!("failed to create todo, error: {:}", err),
            }),
        }
    }

    pub async fn update_todo(
        &self,
        id: i32,
        body: String,
        complete: bool,
    ) -> ApplicationResult<Todo> {
        let mut todo = match self.todo_repository.get_todo_by_id(id).await {
            Ok(ret) => match ret {
                Some(t) => t,
                None => {
                    return Err(ApplicationError {
                        code: ErrorCode::NotFound,
                        message: format!("todo is not found, id: {}", id),
                    });
                }
            },
            Err(err) => {
                return Err(ApplicationError {
                    code: ErrorCode::SystemError,
                    message: format!("failed to create todo, error: {:}", err),
                });
            }
        };
        let now = chrono::Utc::now();
        todo.body = body;
        todo.complete = complete;
        todo.updated_at = now;
        match self.todo_repository.update_todo(todo).await {
            Ok(updated) => Ok(updated),
            Err(err) => Err(ApplicationError {
                code: ErrorCode::SystemError,
                message: format!("failed to update todo, error: {:}", err),
            }),
        }
    }

    pub async fn toggle_complete(&self, id: i32) -> ApplicationResult<bool> {
        let now = chrono::Utc::now();
        match self.todo_repository.toggle_complete(id, now).await {
            Ok(ret) => Ok(ret),
            Err(err) => Err(ApplicationError {
                code: ErrorCode::SystemError,
                message: format!("failed to complete todo(id: {}), error: {:}", id, err),
            }),
        }
    }

    pub async fn toggle_all_complete(&self) -> ApplicationResult<bool> {
        let now = chrono::Utc::now();
        match self.todo_repository.toggle_all_complete(now).await {
            Ok(ret) => Ok(ret),
            Err(err) => Err(ApplicationError {
                code: ErrorCode::SystemError,
                message: format!("failed to complete all todos, error: {:}", err),
            }),
        }
    }

    pub async fn delete_todo(&self, id: i32) -> ApplicationResult<bool> {
        match self.todo_repository.delete_todo(id).await {
            Ok(ret) => Ok(ret),
            Err(err) => Err(ApplicationError {
                code: ErrorCode::SystemError,
                message: format!("failed to complete all todos, error: {:}", err),
            }),
        }
    }

    pub async fn clear_completed_todo(&self) -> ApplicationResult<bool> {
        match self.todo_repository.delete_completed_todo().await {
            Ok(ret) => Ok(ret),
            Err(err) => Err(ApplicationError {
                code: ErrorCode::SystemError,
                message: format!("failed to delete all completed todos, error: {:}", err),
            }),
        }
    }
}
