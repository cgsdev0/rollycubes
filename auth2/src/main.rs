use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use bb8_postgres::PostgresConnectionManager;
use serde::{Deserialize, Serialize};
use std::fs;
use std::net::SocketAddr;
use std::sync::Arc;
use time::{Duration, OffsetDateTime, PrimitiveDateTime};
use tokio_postgres::{tls::NoTlsStream, Client, Connection, NoTls, Socket};
use twitch_oauth2::{AccessToken, TwitchToken, UserToken};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    exp: i64,
    user_id: Uuid,
    display_name: String,
}

impl Claims {
    fn new(user_id: Uuid, display_name: String) -> Claims {
        let exp = OffsetDateTime::now_utc()
            .checked_add(Duration::hours(2))
            .unwrap()
            .unix_timestamp();
        Claims {
            exp,
            user_id,
            display_name,
        }
    }
}

mod embedded {
    use refinery::embed_migrations;
    embed_migrations!("migrations");
}

#[derive(Clone)]
struct RouterState {
    jwt_signer: Arc<JWTSigner>,
    pool: bb8::Pool<PostgresConnectionManager<NoTls>>,
}

struct JWTSigner {
    private_key: String,
}
impl JWTSigner {
    fn sign_jwt(&self, claims: Claims) -> Result<String, Error> {
        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::new(jsonwebtoken::Algorithm::RS256),
            &claims,
            &jsonwebtoken::EncodingKey::from_rsa_pem(self.private_key.as_bytes())?,
        )?;
        return Ok(token);
    }
}

#[tokio::main]
async fn main() {
    let manager = bb8_postgres::PostgresConnectionManager::new_from_stringlike(
        "host=localhost user=test password=test",
        NoTls,
    )
    .unwrap();
    let pool = bb8::Pool::builder().build(manager).await.unwrap();

    run_migrations(&mut pool.get().await.unwrap())
        .await
        .expect("can run DB migrations: {}");

    let public_key_text = Arc::new(
        fs::read_to_string("./secrets/.id.pub").expect("Should have been able to read the file"),
    );

    let router_state = RouterState {
        jwt_signer: Arc::new(JWTSigner {
            private_key: fs::read_to_string("./secrets/.id")
                .expect("Should have been able to read the file"),
        }),
        pool,
    };

    tracing_subscriber::fmt::init();

    // build our application with a route
    let user_routes = Router::new()
        .route("/twitch_login_or_register", post(login))
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
        .with_state(router_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3031));
    tracing::debug!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

#[derive(Serialize)]
struct PlayerStats {
    rolls: i32,
    doubles: i32,
    games: i32,
    wins: i32,
}

#[derive(Serialize)]
struct AchievementProgress {
    #[serde(rename = "achievementId")]
    achievement_id: String,
    progress: i32,
    #[serde(with = "time::serde::rfc3339::option")]
    unlocked: Option<OffsetDateTime>,
}

#[derive(Serialize)]
struct User {
    id: Uuid,
    username: String,
    image_url: String,
    #[serde(rename = "createdDate", with = "time::serde::rfc3339")]
    created_date: OffsetDateTime,
    achievements: Option<Vec<AchievementProgress>>,
    stats: Option<PlayerStats>,
}

#[derive(Serialize)]
struct LoginResponse {
    access_token: String,
}

#[derive(Deserialize)]
struct LoginPayload {
    twitch_access_token: String,
}

#[axum::debug_handler]
async fn login(
    State(s): State<RouterState>,
    jar: CookieJar,
    Json(payload): Json<LoginPayload>,
) -> Result<(CookieJar, Json<LoginResponse>), StatusCode> {
    let token = AccessToken::new(payload.twitch_access_token);
    let http_client = reqwest::Client::new();
    let twitch_client = twitch_api::HelixClient::with_client(http_client.clone());
    let Ok(mut client) = s.pool.get().await else {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    };

    match UserToken::from_existing(&http_client, token, None, None).await {
        Ok(t) => {
            // TODO: check this for a match t.client_id().as_str();
            let twitch_user = twitch_client.get_user_from_id(&t.user_id, &t).await;
            let Ok(Some(user)) = twitch_user else {
                return Err(StatusCode::IM_A_TEAPOT);
            };
            let result = client
                .query_one(
                    "
SELECT twitch_id, \"userId\" FROM twitch_identity
WHERE twitch_id = $1::TEXT",
                    &[&t.user_id.as_str()],
                )
                .await;
            let x = if let Ok(row) = result {
                let id: Uuid = row.get("userId");
                // Update the existing user
                client
                    .execute(
                        "
UPDATE public.\"user\"
SET
    username = $1::TEXT,
    image_url = $2::TEXT
WHERE
    id = $3::UUID
",
                        &[&user.display_name.as_str(), &user.profile_image_url, &id],
                    )
                    .await
                    .unwrap();
                id
            } else {
                // Create the user
                let id = Uuid::new_v4();

                let Ok(transaction) = client.transaction().await else {
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                };
                transaction
                    .execute(
                        "
INSERT INTO public.\"user\" (username, image_url, id)
VALUES ($1::TEXT, $2::TEXT, $3::UUID)",
                        &[&user.display_name.as_str(), &user.profile_image_url, &id],
                    )
                    .await
                    .unwrap();
                transaction
                    .execute(
                        "
INSERT INTO twitch_identity (twitch_id, twitch_login, \"userId\")
VALUES ($1::TEXT, $2::TEXT, $3::UUID)",
                        &[&t.user_id.as_str(), &t.login.as_str(), &id],
                    )
                    .await
                    .unwrap();
                let Ok(_) = transaction.commit().await else {
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                };
                id
            };
            // Do the login
            match s
                .jwt_signer
                .sign_jwt(Claims::new(x, user.display_name.to_string()))
            {
                Ok(access_token) => {
                    // Create a refresh token
                    let token_id = Uuid::new_v4();
                    let exp = OffsetDateTime::now_utc()
                        .checked_add(Duration::days(30))
                        .unwrap();
                    client
                        .execute(
                            "
INSERT INTO refresh_token (id, \"userId\")
VALUES ($1::UUID, $2::UUID)",
                            &[&token_id, &x],
                        )
                        .await
                        .unwrap();
                    Ok((
                        jar.add(
                            Cookie::build("refresh_token", token_id.to_string())
                                .secure(true)
                                .http_only(true)
                                .same_site(axum_extra::extract::cookie::SameSite::None)
                                .path("/refresh_token")
                                .expires(exp)
                                .finish(),
                        ),
                        Json(LoginResponse { access_token }),
                    ))
                }
                Err(_e) => Err(StatusCode::FORBIDDEN),
            }
        }
        Err(..) => Err(StatusCode::IM_A_TEAPOT),
    }
}

#[axum::debug_handler]
async fn user_by_id(
    Path(user_id): Path<Uuid>,
    State(s): State<RouterState>,
) -> Result<Json<User>, StatusCode> {
    let Ok(client) = s.pool.get().await else {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    };
    let result = client
        .query(
            "
SELECT
    id,
    username,
    image_url,
    \"user\".\"createdDate\" as created_date,
    user_to_achievement.\"achievementId\" as achievement_id,
    unlocked,
    progress,
    rolls,
    doubles,
    games,
    wins
FROM public.\"user\"
LEFT JOIN user_to_achievement ON id=user_to_achievement.\"userId\"
LEFT JOIN player_stats ON id=player_stats.\"userId\"
WHERE id=$1::UUID",
            &[&user_id],
        )
        .await;
    match result {
        Ok(rows) if !rows.is_empty() => {
            let row = &rows[0];
            let rolls: Option<i32> = row.get("rolls");
            let user = User {
                id: row.get("id"),
                username: row.get("username"),
                image_url: row.get("image_url"),
                created_date: row
                    .get::<'_, _, PrimitiveDateTime>("created_date")
                    .assume_utc(),
                stats: rolls.map(|_| PlayerStats {
                    rolls: row.get("rolls"),
                    games: row.get("games"),
                    wins: row.get("wins"),
                    doubles: row.get("doubles"),
                }),
                achievements: Some(
                    rows.iter()
                        .map(|r| AchievementProgress {
                            achievement_id: r.get("achievement_id"),
                            unlocked: r
                                .get::<'_, _, Option<PrimitiveDateTime>>("unlocked")
                                .map(PrimitiveDateTime::assume_utc),
                            progress: r.get("progress"),
                        })
                        .collect(),
                ),
            };
            Ok(Json(user))
        }
        _ => Err(StatusCode::IM_A_TEAPOT),
    }
}

async fn logout(jar: CookieJar, State(s): State<RouterState>) -> Result<CookieJar, StatusCode> {
    let Ok(client) = s.pool.get().await else {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    };
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
        return Ok(jar.remove(Cookie::named("refresh_token")));
    }
    Ok(jar)
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
