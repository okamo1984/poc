use crate::domains::entities::user::User;
use crate::domains::errors::{ApplicationError, ErrorCode};
use crate::domains::repositories::user_repository::UserRepository;
use crate::domains::ApplicationResult;
use crate::infrastructures::di_container::DIContainer;
use std::sync::Arc;

#[derive(Clone)]
pub struct UserService {
    user_repository: Box<dyn UserRepository + Send + Sync>,
}

impl UserService {
    pub fn new(di_container: Arc<dyn DIContainer>) -> Self {
        Self {
            user_repository: di_container.user_repository(),
        }
    }

    pub async fn sign_up(self, username: String, password: String) -> ApplicationResult<User> {
        match self
            .user_repository
            .get_user_by_username(username.to_owned())
            .await
        {
            Ok(user) => {
                if let Some(user) = user {
                    if user.username == username {
                        return Err(ApplicationError {
                            code: ErrorCode::Conflict,
                            message: "failed to create user, because of duplicated username"
                                .to_owned(),
                        });
                    }
                }
            }
            Err(err) => {
                return Err(ApplicationError {
                    code: ErrorCode::SystemError,
                    message: format!("failed to fetch user, error: {:}", err),
                })
            }
        };

        let now = chrono::Utc::now();
        let hash = bcrypt::hash(password, 10).unwrap();
        let new_user = User {
            id: 0,
            email: None,
            username,
            password_hash: Some(hash),
            created_at: now,
            updated_at: now,
        };
        match self.user_repository.create_user(new_user).await {
            Ok(created) => Ok(created),
            Err(err) => Err(ApplicationError {
                code: ErrorCode::SystemError,
                message: format!("failed to create user, error: {:}", err),
            }),
        }
    }

    pub async fn get_all_users(self) -> ApplicationResult<Vec<User>> {
        match self.user_repository.get_all_users().await {
            Ok(users) => Ok(users),
            Err(err) => Err(ApplicationError {
                code: ErrorCode::SystemError,
                message: format!("failed to fetch users, error: {:}", err),
            }),
        }
    }

    pub async fn get_user_by_id(self, id: i32, password: String) -> ApplicationResult<User> {
        let user = self.user_repository.get_user_by_id(id).await;
        self.handle_user(user, password)
    }

    pub async fn get_user_by_email(
        self,
        email: String,
        password: String,
    ) -> ApplicationResult<User> {
        let user = self.user_repository.get_user_by_email(email).await;
        self.handle_user(user, password)
    }

    pub async fn get_user_by_username(
        self,
        username: String,
        password: String,
    ) -> ApplicationResult<User> {
        let user = self.user_repository.get_user_by_username(username).await;
        self.handle_user(user, password)
    }

    fn handle_user(
        self,
        result: anyhow::Result<Option<User>>,
        password: String,
    ) -> ApplicationResult<User> {
        match result {
            Ok(user) => match user {
                Some(user) => {
                    if !user.valid_password(password) {
                        return Err(ApplicationError {
                            code: ErrorCode::UnAuthenticated,
                            message: "user is not authenticated".to_owned(),
                        });
                    }
                    Ok(user)
                }
                None => Err(ApplicationError {
                    code: ErrorCode::NotFound,
                    message: "user is not registered".to_owned(),
                }),
            },
            Err(err) => Err(ApplicationError {
                code: ErrorCode::SystemError,
                message: format!("failed to fetch user, error: {:}", err),
            }),
        }
    }
}
