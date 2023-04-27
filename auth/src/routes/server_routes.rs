use crate::*;
use axum::{extract::State, http::StatusCode, Json};
use axum::{
    http::Request,
    middleware::Next,
    response::{IntoResponse, Response},
};
use serde::Deserialize;
use std::collections::HashMap;
use std::fs;
use std::time::SystemTime;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
pub struct Achievement {
    id: String,
    name: String,
    image_url: Option<String>,
    description: String,
    max_progress: Option<i32>,
}
lazy_static! {
    static ref PRE_SHARED_KEY: String = fs::read_to_string("./secrets/.pre-shared-key")
        .expect("Should have been able to read the file")
        .trim()
        .to_string();
    static ref ACHIEVEMENTS: HashMap<String, Achievement> =
        serde_json::from_str(include_str!("../../achievements.json")).unwrap();
}

pub async fn auth_layer<B>(request: Request<B>, next: Next<B>) -> Response {
    if request.method().is_safe() {
        return next.run(request).await;
    }
    if let Some(auth_header) = request.headers().get("Authorization") {
        if let Ok(auth_header_val) = auth_header.to_str() {
            let split = auth_header_val.split(" ").collect::<Vec<_>>();
            if split.len() == 2 && String::from(split[1]).eq(&*PRE_SHARED_KEY) {
                return next.run(request).await;
            }
        }
    }
    // they failed the vibe check
    (StatusCode::UNAUTHORIZED, "forbidden").into_response()
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "id")]
enum UserId {
    User(Uuid),
    Anonymous(String),
}

#[derive(Deserialize)]
pub struct AddStatsPayload {
    user_id: UserId,
    rolls: i32,
    doubles: i32,
    games: i32,
    wins: i32,
}

async fn find_user_id(s: &RouterState, user: UserId) -> Result<Uuid, StatusCode> {
    let Ok(mut client) = s.pool.get().await else {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    };
    match user {
        UserId::Anonymous(id) => {
            // Find the anonymous user
            match client
                .query(
                    "
SELECT user_id FROM anon_identity WHERE anon_id = $1::TEXT
",
                    &[&id],
                )
                .await
            {
                Ok(rows) => {
                    if rows.is_empty() {
                        // Create a new user
                        let new_id = Uuid::new_v4();

                        let Ok(transaction) = client.transaction().await else {
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                };
                        transaction
                            .execute("INSERT INTO users (id) VALUES ($1::UUID)", &[&new_id])
                            .await
                            .unwrap();
                        transaction
                            .execute("INSERT INTO anon_identity (anon_id, user_id) VALUES ($1::TEXT, $2::UUID)",
                                &[&id, &new_id],
                            )
                            .await
                            .unwrap();

                        let Ok(_) = transaction.commit().await else {
                            return Err(StatusCode::INTERNAL_SERVER_ERROR);
                        };
                        Ok(new_id)
                    } else {
                        Ok(rows[0].get::<'_, _, Uuid>("user_id"))
                    }
                }
                Err(..) => {
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                }
            }
        }
        UserId::User(id) => Ok(id),
    }
}
#[axum::debug_handler]
pub async fn add_stats(
    State(s): State<RouterState>,
    Json(mut body): Json<AddStatsPayload>,
) -> StatusCode {
    let Ok(client) = s.pool.get().await else {
        return StatusCode::INTERNAL_SERVER_ERROR;
    };
    let user_id = match find_user_id(&s, body.user_id).await {
        Ok(uid) => uid,
        Err(code) => {
            return code;
        }
    };
    let result = client
        .query(
            "
SELECT rolls, doubles, games, wins FROM player_stats
WHERE user_id = $1::UUID
",
            &[&user_id],
        )
        .await;
    match result {
        Ok(rows) => {
            if rows.len() > 0 {
                let row = &rows[0];
                body.rolls += row.get::<_, i32>("rolls");
                body.doubles += row.get::<_, i32>("doubles");
                body.games += row.get::<_, i32>("games");
                body.wins += row.get::<_, i32>("wins");
            }
            let insert_result = client
                .execute(
                    "
INSERT INTO player_stats (rolls, doubles, games, wins, user_id)
VALUES ($1::INTEGER, $2::INTEGER, $3::INTEGER, $4::INTEGER, $5::UUID)
ON CONFLICT(user_id) DO UPDATE SET
    rolls = $1::INTEGER,
    doubles = $2::INTEGER,
    games = $3::INTEGER,
    wins = $4::INTEGER

",
                    &[
                        &body.rolls,
                        &body.doubles,
                        &body.games,
                        &body.wins,
                        &user_id,
                    ],
                )
                .await;
            match insert_result {
                Ok(..) => StatusCode::OK,
                Err(..) => StatusCode::INTERNAL_SERVER_ERROR,
            }
        }
        Err(..) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

#[derive(Serialize)]
pub struct AchievementUnlock {
    #[serde(rename = "type")]
    unlock_type: String,
    #[serde(flatten)]
    achievement: Achievement,
    user_id: Uuid,
    user_index: i32,
}

#[derive(Deserialize)]
pub struct AchievementProgressPayload {
    user_id: UserId,
    user_index: i32,
    achievement_id: String,
    progress: i32,
}

#[axum::debug_handler]
pub async fn achievement_progress(
    State(s): State<RouterState>,
    Json(body): Json<AchievementProgressPayload>,
) -> Result<Json<AchievementUnlock>, StatusCode> {
    if body.progress <= 0 {
        // nothing to do
        return Err(StatusCode::OK);
    }
    let Some(a) = ACHIEVEMENTS.get(&body.achievement_id) else {
        return Err(StatusCode::BAD_REQUEST);
    };
    let Ok(client) = s.pool.get().await else {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    };
    let current_time = SystemTime::now();
    let mut unlocked: Option<SystemTime> = None;
    if let Some(max_progress) = a.max_progress {
        if body.progress >= max_progress {
            unlocked = Some(current_time);
        }
    } else {
        unlocked = Some(current_time);
    }

    let user_id = match find_user_id(&s, body.user_id).await {
        Ok(uid) => uid,
        Err(code) => {
            return Err(code);
        }
    };

    let result = client
        .query_one(
            "
INSERT INTO user_to_achievement
    (
        unlocked,
        progress,
        user_id,
        achievement_id
    )
VALUES
    (
        $1::TIMESTAMP,
        $2::INTEGER,
        $3::UUID,
        $4::TEXT
    )
ON CONFLICT(user_id, achievement_id) DO UPDATE SET
    progress = user_to_achievement.progress + $2::INTEGER,
    unlocked = (CASE WHEN user_to_achievement.progress + $2::INTEGER >= $5::INTEGER THEN $6::TIMESTAMP
        ELSE user_to_achievement.unlocked
        END)
    WHERE user_to_achievement.unlocked IS NULL
    RETURNING user_to_achievement.unlocked
",
            &[
                &unlocked,
                &body.progress,
                &user_id,
                &a.id,
                &a.max_progress.unwrap_or(0),
                &current_time,
            ],
        )
        .await;
    match result {
        Ok(row) => match row.try_get::<'_, _, SystemTime>("unlocked") {
            Ok(..) => Ok(Json(AchievementUnlock {
                unlock_type: "achievement_unlock".to_string(),
                achievement: a.clone(),
                user_id,
                user_index: body.user_index,
            })),
            Err(..) => Err(StatusCode::OK),
        },
        Err(..) => Err(StatusCode::OK),
    }
}
#[derive(Serialize)]
pub struct PublicKeyResp {
    #[serde(rename = "publicKey")]
    public_key: String,
}

#[axum::debug_handler]
pub async fn public_key(State(s): State<RouterState>) -> Json<PublicKeyResp> {
    Json(PublicKeyResp {
        public_key: s.jwt.public_key.clone(),
    })
}

#[axum::debug_handler]
pub async fn achievements() -> Json<HashMap<String, Achievement>> {
    Json(ACHIEVEMENTS.clone())
}
