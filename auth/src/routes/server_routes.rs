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

use generated::DiceType;

#[derive(Serialize, Deserialize, Clone)]
pub struct Achievement {
    pub id: String,
    pub name: String,
    pub image_url: Option<String>,
    pub description: String,
    pub max_progress: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    pub unlocks: Option<DiceType>,
}
lazy_static! {
    static ref PRE_SHARED_KEY: String = fs::read_to_string("./secrets/.pre-shared-key")
        .expect("Should have been able to read the file")
        .trim()
        .to_string();
    pub static ref ACHIEVEMENTS: HashMap<String, Achievement> =
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

async fn find_user_id(s: &RouterState, user: generated::UserId) -> Result<Uuid, RouteError> {
    let mut client = s.pool.get().await?;
    match user {
        generated::UserId::User(id) => Ok(id),
        generated::UserId::Anonymous(id) => {
            // Find the anonymous user
            let rows = client
                .query(
                    "
SELECT user_id FROM anon_identity WHERE anon_id = $1::TEXT
",
                    &[&id],
                )
                .await?;
            if rows.is_empty() {
                // Create a new user
                let new_id = Uuid::new_v4();

                let transaction = client.transaction().await?;
                transaction
                    .execute("INSERT INTO users (id) VALUES ($1::UUID)", &[&new_id])
                    .await
                    .unwrap();
                transaction
                    .execute(
                        "INSERT INTO anon_identity (anon_id, user_id) VALUES ($1::TEXT, $2::UUID)",
                        &[&id, &new_id],
                    )
                    .await
                    .unwrap();

                transaction.commit().await?;
                Ok(new_id)
            } else {
                Ok(rows[0].get::<'_, _, Uuid>("user_id"))
            }
        }
    }
}
#[axum::debug_handler]
pub async fn add_stats(
    State(s): State<RouterState>,
    Json(mut body): Json<generated::ReportStats>,
) -> Result<(), RouteError> {
    let client = s.pool.get().await?;
    let user_id = find_user_id(&s, body.user_id).await?;
    if body.win_hist.len() != 6 {
        return Err(RouteError::UserError(
            "wrong number of args to win_hist".into(),
        ));
    }
    if body.dice_hist.len() != 6 {
        return Err(RouteError::UserError(
            "wrong number of args to dice_hist".into(),
        ));
    }
    if body.sum_hist.len() != 12 {
        return Err(RouteError::UserError(
            "wrong number of args to sum_hist".into(),
        ));
    }
    let rows = client
        .query(
            "
SELECT rolls, doubles, games, wins, dice_values, roll_totals, winning_scores FROM player_stats
WHERE user_id = $1::UUID
",
            &[&user_id],
        )
        .await?;
    if rows.len() > 0 {
        let row = &rows[0];
        body.rolls += row.get::<_, i64>("rolls");
        body.doubles += row.get::<_, i64>("doubles");
        body.games += row.get::<_, i64>("games");
        body.wins += row.get::<_, i64>("wins");
        let sum_hist = row.get::<_, Vec<i64>>("roll_totals");
        let dice_hist = row.get::<_, Vec<i64>>("dice_values");
        let win_hist = row.get::<_, Vec<i64>>("winning_scores");
        body.sum_hist
            .iter_mut()
            .enumerate()
            .for_each(|(i, sum)| *sum += sum_hist[i as usize]);
        body.dice_hist
            .iter_mut()
            .enumerate()
            .for_each(|(i, sum)| *sum += dice_hist[i as usize]);
        body.win_hist
            .iter_mut()
            .enumerate()
            .for_each(|(i, sum)| *sum += win_hist[i as usize]);
    }
    client
        .execute(
            "
INSERT INTO player_stats (rolls, doubles, games, wins, user_id, dice_values, roll_totals, winning_scores)
VALUES ($1, $2, $3, $4, $5::UUID, $6, $7, $8)
ON CONFLICT(user_id) DO UPDATE SET
    rolls = $1,
    doubles = $2,
    games = $3,
    wins = $4,
    dice_values = $6,
    roll_totals = $7,
    winning_scores = $8
",
            &[
                &body.rolls,
                &body.doubles,
                &body.games,
                &body.wins,
                &user_id,
                &body.dice_hist,
                &body.sum_hist,
                &body.win_hist,
            ],
        )
        .await?;
    Ok(())
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
    user_id: generated::UserId,
    user_index: i32,
    achievement_id: String,
    progress: i32,
}

#[axum::debug_handler]
pub async fn achievement_progress(
    State(s): State<RouterState>,
    Json(body): Json<AchievementProgressPayload>,
) -> Result<Json<AchievementUnlock>, RouteError> {
    if body.progress <= 0 {
        // nothing to do
        return Err(RouteError::UserError(
            "progress needs to be a positive int".to_string(),
        ));
    }
    let Some(a) = ACHIEVEMENTS.get(&body.achievement_id) else {
        return Err(RouteError::UserError(
            "invalid achievement id".to_string(),
        ));
    };
    let client = s.pool.get().await?;
    let current_time = SystemTime::now();
    let mut unlocked: Option<SystemTime> = None;
    if let Some(max_progress) = a.max_progress {
        if body.progress >= max_progress {
            unlocked = Some(current_time);
        }
    } else {
        unlocked = Some(current_time);
    }

    let user_id = find_user_id(&s, body.user_id).await?;
    let row = client
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
        .await?;
    match row.try_get::<'_, _, SystemTime>("unlocked") {
        Ok(..) => Ok(Json(AchievementUnlock {
            unlock_type: "achievement_unlock".to_string(),
            achievement: a.clone(),
            user_id,
            user_index: body.user_index,
        })),
        Err(..) => Err(RouteError::OK),
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
