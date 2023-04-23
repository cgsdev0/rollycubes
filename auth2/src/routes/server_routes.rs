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
use time::OffsetDateTime;
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
        serde_json::from_str(include_str!("../../../achievements.json")).unwrap();
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

#[derive(Deserialize)]
pub struct AddStatsPayload {
    id: Uuid,
    rolls: f32,
    doubles: f32,
    games: f32,
    wins: f32,
}

pub struct AddStatsPayloadSomeday {
    id: Uuid,
    rolls: i32,
    doubles: i32,
    games: i32,
    wins: i32,
}

#[axum::debug_handler]
pub async fn add_stats(
    State(s): State<RouterState>,
    Json(body_input): Json<AddStatsPayload>,
) -> StatusCode {
    let Ok(client) = s.pool.get().await else {
        return StatusCode::INTERNAL_SERVER_ERROR;
    };
    let mut body = AddStatsPayloadSomeday {
        rolls: body_input.rolls.round() as i32,
        doubles: body_input.doubles.round() as i32,
        games: body_input.games.round() as i32,
        wins: body_input.wins.round() as i32,
        id: body_input.id,
    };
    let result = client
        .query(
            "
SELECT rolls, doubles, games, wins FROM player_stats
WHERE \"userId\" = $1::UUID
",
            &[&body.id],
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
INSERT INTO player_stats (rolls, doubles, games, wins, \"userId\")
VALUES ($1::INTEGER, $2::INTEGER, $3::INTEGER, $4::INTEGER, $5::UUID)
ON CONFLICT(\"userId\") DO UPDATE SET
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
                        &body.id,
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
}

#[derive(Deserialize)]
pub struct AchievementProgressPayload {
    user_id: Uuid,
    achievement_id: String,
    progress: f32,
}

#[axum::debug_handler]
pub async fn achievement_progress(
    State(s): State<RouterState>,
    Json(body): Json<AchievementProgressPayload>,
) -> Result<Json<AchievementUnlock>, StatusCode> {
    if body.progress <= 0.0 {
        // nothing to do
        return Err(StatusCode::OK);
    }
    let Some(a) = ACHIEVEMENTS.get(&body.achievement_id) else {
        return Err(StatusCode::BAD_REQUEST);
    };
    let Ok(client) = s.pool.get().await else {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    };
    let progress = body.progress.round() as i32;
    let current_time = SystemTime::now();
    let mut unlocked: Option<SystemTime> = None;
    if let Some(max_progress) = a.max_progress {
        if progress >= max_progress {
            unlocked = Some(current_time);
        }
    }
    let result = client
        .query_one(
            "
INSERT INTO user_to_achievement
    (
        unlocked,
        progress,
        \"userId\",
        \"achievementId\"
    )
VALUES
    (
        $1::TIMESTAMP,
        $2::INTEGER,
        $3::UUID,
        $4::TEXT
    )
ON CONFLICT(\"userId\", \"achievementId\") DO UPDATE SET
    progress = user_to_achievement.progress + $2::INTEGER,
    unlocked = (CASE WHEN user_to_achievement.progress + $2::INTEGER >= $5::INTEGER THEN $6::TIMESTAMP
        ELSE user_to_achievement.unlocked
        END)
    WHERE user_to_achievement.unlocked IS NULL
    RETURNING user_to_achievement.unlocked
",
            &[
                &unlocked,
                &progress,
                &body.user_id,
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
