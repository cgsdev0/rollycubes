use auth::migrations::*;
use auth::routes::{server_routes, user_routes, webhook_routes};
use auth::{Jwt, RouterState};
use axum::http::{HeaderName, HeaderValue, Method};
use axum::{
    routing::{get, post},
    Router,
};
use std::fs;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio_postgres::NoTls;
use tower_http::catch_panic::CatchPanicLayer;
use tower_http::cors::{AllowHeaders, AllowOrigin, CorsLayer};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    tracing_log::LogTracer::init().ok();

    let manager = bb8_postgres::PostgresConnectionManager::new_from_stringlike(
        format!(
            "host={} user=test password=test",
            std::env::var("DB_HOST").unwrap_or("localhost".to_string())
        ),
        NoTls,
    )
    .unwrap();
    let pool = bb8::Pool::builder().build(manager).await.unwrap();

    run_migrations(&mut pool.get().await.unwrap())
        .await
        .expect("can run DB migrations: {}");

    let router_state = RouterState {
        jwt: Arc::new(Jwt {
            private_key: fs::read_to_string("./secrets/.id")
                .expect("Should have been able to read the file"),
            public_key: fs::read_to_string("./secrets/.id.pub")
                .expect("Should have been able to read the file"),
        }),
        pool,
    };

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::HEAD, Method::OPTIONS])
        .allow_credentials(true)
        .allow_headers(AllowHeaders::list([
            HeaderName::from_static("csrf-token"),
            HeaderName::from_static("content-type"),
            HeaderName::from_static("x-access-token"),
        ]))
        .allow_origin(AllowOrigin::list([
            HeaderValue::from_static("https://rollycubes.com"),
            HeaderValue::from_static("https://prod.rollycubes.com"),
            HeaderValue::from_static("https://beta.rollycubes.com"),
            HeaderValue::from_static("https://www.rollycubes.com"),
            HeaderValue::from_static("https://rollycubes.live"),
            HeaderValue::from_static("http://localhost:3000"),
            HeaderValue::from_static("http://localhost:3005"),
        ]));

    // build our application with a route
    let user_routes = Router::new()
        .route("/twitch_login_or_register", post(user_routes::login))
        .route("/logout", post(user_routes::logout))
        .route("/refresh_token", get(user_routes::refresh_token))
        .route("/me", get(user_routes::user_self))
        .route("/donate", post(user_routes::donate))
        .route(
            "/users/update_setting",
            post(user_routes::update_user_setting),
        )
        .route("/users/:id", get(user_routes::user_by_id))
        .route("/pubkey/:id", get(user_routes::user_by_pubkey));

    let server_routes = Router::new()
        .route("/add_stats", post(server_routes::add_stats))
        .route("/public_key", get(server_routes::public_key))
        .route("/achievements", get(server_routes::achievements))
        .route(
            "/achievement_progress",
            post(server_routes::achievement_progress),
        )
        .layer(axum::middleware::from_fn(server_routes::auth_layer));

    let webhook_routes = Router::new().route("/square", post(webhook_routes::square));

    let app = Router::new()
        .nest("/", user_routes)
        .nest("/server", server_routes)
        .layer(cors)
        .nest("/webhooks", webhook_routes)
        .layer(CatchPanicLayer::new())
        .with_state(router_state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3031));
    tracing::debug!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
    tracing::debug!("goodbye");
}
