use crate::*;
use axum::{
    extract::{Path, State},
    http::{header::HeaderMap, StatusCode},
    Json,
};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use serde::{Deserialize, Serialize};
use time::{Duration, OffsetDateTime, PrimitiveDateTime};
use twitch_oauth2::{AccessToken, UserToken};
use uuid::Uuid;

#[derive(Serialize)]
pub struct LoginResponse {
    access_token: String,
}

#[derive(Serialize)]
pub struct PlayerStats {
    rolls: i32,
    doubles: i32,
    games: i32,
    wins: i32,
}

#[derive(Serialize)]
pub struct AchievementProgress {
    #[serde(rename = "id")]
    achievement_id: String,
    progress: i32,
    #[serde(with = "time::serde::rfc3339::option")]
    unlocked: Option<OffsetDateTime>,
    rn: Option<i64>,
    rd: Option<i64>,
}

#[derive(Serialize)]
pub struct User {
    id: Uuid,
    username: String,
    image_url: Option<String>,
    #[serde(rename = "createdDate", with = "time::serde::rfc3339")]
    created_date: OffsetDateTime,
    achievements: Option<Vec<AchievementProgress>>,
    stats: Option<PlayerStats>,
}

#[derive(Deserialize)]
pub struct LoginPayload {
    twitch_access_token: String,
    anon_id: Option<String>,
}

async fn login_helper(
    s: &RouterState,
    jar: CookieJar,
    x: &Uuid,
    username: &str,
) -> Result<(CookieJar, Json<LoginResponse>), StatusCode> {
    // Do the login
    let Ok(client) = s.pool.get().await else {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    };
    tracing::debug!("we got a client from the pool again");
    match s.jwt.sign_jwt(Claims::new(*x, username)) {
        Ok(access_token) => {
            tracing::debug!("we signed the thing it was good");
            // Create a refresh token
            let token_id = Uuid::new_v4();
            let exp = OffsetDateTime::now_utc()
                .checked_add(Duration::days(30))
                .unwrap();
            tracing::debug!("we made a date");
            client
                .execute(
                    "
INSERT INTO refresh_token (id, user_id)
VALUES ($1::UUID, $2::UUID)",
                    &[&token_id, &x],
                )
                .await
                .unwrap();
            tracing::debug!("we inserted a refresh token");
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
#[axum::debug_handler]
pub async fn refresh_token(
    State(s): State<RouterState>,
    jar: CookieJar,
) -> Result<(CookieJar, Json<LoginResponse>), StatusCode> {
    let Some(r_token) = jar.get("refresh_token") else {
        return Err(StatusCode::UNAUTHORIZED);
    };
    let Ok(parsed_token) = Uuid::parse_str(r_token.value()) else {
        return Err(StatusCode::UNAUTHORIZED);
    };
    let Ok(client) = s.pool.get().await else {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    };
    let result = client
        .query_one(
            "
SELECT username, user_id, issued_at FROM refresh_token
LEFT JOIN users ON users.id = user_id
WHERE refresh_token.id = $1::UUID
",
            &[&parsed_token],
        )
        .await;
    match result {
        Ok(row) => {
            // delete the token, log them in
            client
                .execute(
                    "
DELETE FROM refresh_token
WHERE id = $1::UUID",
                    &[&parsed_token],
                )
                .await
                .unwrap();
            // check expiration
            let issued_at: PrimitiveDateTime = row.get("issued_at");
            let dur = OffsetDateTime::now_utc() - issued_at.assume_utc();
            if dur > Duration::days(30) {
                return Err(StatusCode::UNAUTHORIZED);
            }
            login_helper(
                &s,
                jar,
                &row.get::<_, Uuid>("user_id"),
                row.get::<_, &str>("username"),
            )
            .await
        }
        Err(..) => Err(StatusCode::UNAUTHORIZED),
    }
}

#[axum::debug_handler]
pub async fn login(
    State(s): State<RouterState>,
    jar: CookieJar,
    Json(payload): Json<LoginPayload>,
) -> Result<(CookieJar, Json<LoginResponse>), StatusCode> {
    tracing::debug!("we are doing the login");
    let token = AccessToken::new(payload.twitch_access_token);
    tracing::debug!("we got the access token");
    let http_client = reqwest::Client::new();
    tracing::debug!("we made an http client");
    let twitch_client = twitch_api::HelixClient::with_client(http_client.clone());
    tracing::debug!("we made the twitch client");
    let Ok(mut client) = s.pool.get().await else {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    };
    tracing::debug!("we got a client from the pool");

    match UserToken::from_existing(&http_client, token, None, None).await {
        Ok(t) => {
            tracing::debug!("the user token was ok");
            // TODO: check this for a match t.client_id().as_str();
            let twitch_user = twitch_client.get_user_from_id(&t.user_id, &t).await;
            let Ok(Some(user)) = twitch_user else {
                return Err(StatusCode::IM_A_TEAPOT);
            };
            let result = client
                .query_one(
                    "
SELECT twitch_id, user_id FROM twitch_identity
WHERE twitch_id = $1::TEXT",
                    &[&t.user_id.as_str()],
                )
                .await;
            tracing::debug!("we found a twitch identity");
            let x = if let Ok(row) = result {
                let id: Uuid = row.get("user_id");
                // Update the existing user
                client
                    .execute(
                        "
UPDATE users
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
                tracing::debug!("we updated the user record");
                id
            } else {
                // Check if we should promote an anonymous user
                let Ok(transaction) = client.transaction().await else {
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                };
                let id = if let Some(session) = payload.anon_id {
                    println!("GOT SESSION: {}", session);
                    match transaction
                        .query(
                            "
SELECT user_id FROM anon_identity WHERE anon_id = $1::TEXT",
                            &[&format!("{}{}", "guest:", session)],
                        )
                        .await
                    {
                        Ok(rows) => {
                            if rows.is_empty() {
                                Uuid::new_v4()
                            } else {
                                let new_id = rows[0].get::<'_, _, Uuid>("user_id");
                                println!("GOT ID: {}", new_id);
                                transaction
                                    .execute(
                                        "
DELETE FROM anon_identity WHERE user_id = $1::UUID",
                                        &[&new_id],
                                    )
                                    .await
                                    .unwrap();
                                new_id
                            }
                        }
                        Err(..) => {
                            return Err(StatusCode::INTERNAL_SERVER_ERROR);
                        }
                    }
                } else {
                    Uuid::new_v4()
                };
                // Create a brand new user
                transaction
                    .execute(
                        "
INSERT INTO users (username, image_url, id)
VALUES ($1::TEXT, $2::TEXT, $3::UUID) ON CONFLICT(id) DO UPDATE
SET username = $1::TEXT, image_url = $2::TEXT",
                        &[&user.display_name.as_str(), &user.profile_image_url, &id],
                    )
                    .await
                    .unwrap();
                tracing::debug!("we inserted a new user");
                transaction
                    .execute(
                        "
INSERT INTO twitch_identity (twitch_id, twitch_login, user_id)
VALUES ($1::TEXT, $2::TEXT, $3::UUID)",
                        &[&t.user_id.as_str(), &t.login.as_str(), &id],
                    )
                    .await
                    .unwrap();
                tracing::debug!("we inserted a new identity");
                let Ok(_) = transaction.commit().await else {
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                };
                tracing::debug!("we committed the transaction");
                id
            };
            login_helper(&s, jar, &x, user.display_name.as_str()).await
        }
        Err(..) => Err(StatusCode::IM_A_TEAPOT),
    }
}

#[axum::debug_handler]
pub async fn user_self(
    headers: HeaderMap,
    State(s): State<RouterState>,
) -> Result<Json<User>, StatusCode> {
    let Some(access_token) = headers.get("x-access-token") else {
        return Err(StatusCode::UNAUTHORIZED);
    };
    let Ok(verified_token) = s.jwt.verify(access_token.to_str().unwrap()) else {
        return Err(StatusCode::UNAUTHORIZED);
    };
    user_by_id(Path(verified_token.claims.user_id), State(s)).await
}
#[axum::debug_handler]
pub async fn user_by_id(
    Path(user_id): Path<Uuid>,
    State(s): State<RouterState>,
) -> Result<Json<User>, StatusCode> {
    let Ok(client) = s.pool.get().await else {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    };
    let result = client
        .query(
            "
WITH total_users AS
(
    SELECT COUNT(*) AS user_count from users
    LEFT JOIN anon_identity ON user_id = id
    WHERE anon_identity.anon_id IS NULL
),
users_ach_totals AS
(
    SELECT COUNT(user_to_achievement.user_id) achievement_count,
    achievement_id as id
    FROM user_to_achievement
    LEFT JOIN anon_identity ON anon_identity.user_id = user_to_achievement.user_id
    WHERE anon_identity.anon_id IS NULL
    AND unlocked IS NOT NULL
    GROUP BY id
)
SELECT
    id,
    username,
    image_url,
    users.created_date as created_date,
    user_to_achievement.achievement_id as achievement_id,
    unlocked,
    progress,
    rolls,
    doubles,
    games,
    wins,
    (SELECT user_count FROM total_users) AS rd,
    (SELECT achievement_count FROM users_ach_totals z WHERE z.id=user_to_achievement.achievement_id) AS rn
FROM users
LEFT JOIN user_to_achievement ON id=user_to_achievement.user_id
LEFT JOIN player_stats ON id=player_stats.user_id
WHERE id=$1::UUID",
            &[&user_id],
        )
        .await;
    match result {
        Ok(rows) if !rows.is_empty() => {
            let row = &rows[0];
            let rolls: Option<i32> = row.get("rolls");
            let achievement_id: Option<String> = row.get("achievement_id");
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
                achievements: achievement_id.map(|_| {
                    rows.iter()
                        .map(|r| AchievementProgress {
                            achievement_id: r.get("achievement_id"),
                            unlocked: r
                                .get::<'_, _, Option<PrimitiveDateTime>>("unlocked")
                                .map(PrimitiveDateTime::assume_utc),
                            rd: r.get("rd"),
                            rn: r.get("rn"),
                            progress: r.get("progress"),
                        })
                        .collect()
                }),
            };
            Ok(Json(user))
        }
        _ => Err(StatusCode::IM_A_TEAPOT),
    }
}

pub async fn logout(jar: CookieJar, State(s): State<RouterState>) -> Result<CookieJar, StatusCode> {
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
