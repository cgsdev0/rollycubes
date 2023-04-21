use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use serde::{Deserialize, Serialize};
use std::fs;
use std::net::SocketAddr;
use std::sync::Arc;
use time::{OffsetDateTime, PrimitiveDateTime};
use tokio_postgres::{tls::NoTlsStream, Client, Connection, NoTls, Socket};
use uuid::Uuid;

mod embedded {
    use refinery::embed_migrations;
    embed_migrations!("migrations");
}

#[tokio::main]
async fn main() {
    let (mut client, con) =
        tokio_postgres::connect("host=localhost user=test password=test", NoTls)
            .await
            .unwrap();

    tokio::spawn(async move {
        if let Err(e) = con.await {
            panic!("connection error: {}", e);
        }
    });

    run_migrations(&mut client)
        .await
        .expect("can run DB migrations: {}");

    let public_key_text = Arc::new(
        fs::read_to_string("./secrets/.id.pub").expect("Should have been able to read the file"),
    );

    let shared_client = Arc::new(client);

    tracing_subscriber::fmt::init();

    // build our application with a route
    let user_routes = Router::new()
        // .route("/twitch_login_or_register", post(login))
        .route("/logout", post(logout))
        // .route("/refresh_token", get(refresh_token))
        .route(
            "/public_key",
            get(move || public_key(Arc::clone(&public_key_text))),
        )
        // .route("/me", get(user_self))
        .route("/users/:id", get(user_by_id));

    let server_routes = Router::new();
    // .route("/add_stats", post(add_stats))
    // .route("/achievement_progress", post(achievement_progress));

    let app = Router::new()
        .nest("/", user_routes)
        .nest("/server", server_routes)
        .with_state(Arc::clone(&shared_client));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3031));
    tracing::debug!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

#[derive(Serialize)]
struct User {
    id: Uuid,
    username: String,
    image_url: String,
    #[serde(rename = "createdDate", with = "time::serde::rfc3339")]
    created_date: OffsetDateTime,
}

#[axum::debug_handler]
async fn user_by_id(
    Path(user_id): Path<Uuid>,
    State(client): State<Arc<Client>>,
) -> Result<Json<User>, StatusCode> {
    println!("{}", user_id);
    let result = client.query("SELECT id, username, image_url, \"user\".\"createdDate\" as fuck FROM public.\"user\" LEFT JOIN user_to_achievement ON id=\"userId\" WHERE id=$1::UUID", &[&user_id]).await;
    match result {
        Ok(rows) => match rows.len() {
            0 => Err(StatusCode::IM_A_TEAPOT),
            _ => {
                let row = &rows[0];
                let user = User {
                    id: row.get("id"),
                    username: row.get("username"),
                    image_url: row.get("image_url"),
                    created_date: row.get::<'_, _, PrimitiveDateTime>("fuck").assume_utc(),
                };
                Ok(Json(user))
            }
        },
        Err(e) => {
            println!("{}", e);
            Err(StatusCode::IM_A_TEAPOT)
        }
    }
}

async fn logout(jar: CookieJar, State(client): State<Arc<Client>>) -> CookieJar {
    // 1. check for refresh cookie
    if let Some(token) = jar.get("refresh_token") {
        // DELETE FROM refresh_token WHERE id=token.value()
        let uuid: Result<Uuid, _> = token.value().parse();
        if let Ok(parsed_uuid) = uuid {
            client
                .query(
                    "DELETE FROM refresh_token WHERE id=$1::UUID",
                    &[&parsed_uuid],
                )
                .await
                .ok();
        }
        // 3. clear the refresh cookie in the response
        return jar.remove(Cookie::named("refresh_token"));
    }
    jar
}

async fn public_key(public_key_text: Arc<String>) -> String {
    public_key_text.to_string()
}

type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

async fn run_migrations(client: &mut Client) -> std::result::Result<(), Error> {
    println!("Running DB migrations...");
    let migration_report = embedded::migrations::runner().run_async(client).await?;

    for migration in migration_report.applied_migrations() {
        println!(
            "Migration Applied -  Name: {}, Version: {}",
            migration.name(),
            migration.version()
        );
    }

    println!("DB migrations finished!");

    Ok(())
}
