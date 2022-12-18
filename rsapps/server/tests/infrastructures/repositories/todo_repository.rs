use crate::fixtures::get_db;
use todo_server::domains::repositories::todo_repository::TodoRepository;
use todo_server::infrastructures::repositories::todo_repository::PostgreSQLTodoRepository;
use sqlx::Postgres;

#[sqlx_macros::test]
async fn test_get_all_todos() {
    let db = get_db::<Postgres>().await.unwrap();
    let repository = PostgreSQLTodoRepository { db };
    assert_eq!(0, repository.get_all_todos(1).await.unwrap().len());
}
