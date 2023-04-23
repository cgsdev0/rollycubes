use crate::*;
use axum::{extract::State, http::StatusCode, Json};
use axum::{
    http::Request,
    middleware::Next,
    response::{IntoResponse, Response},
};
use serde::Deserialize;
use std::fs;
use uuid::Uuid;

lazy_static! {
    static ref PRE_SHARED_KEY: String = fs::read_to_string("./secrets/.pre-shared-key")
        .expect("Should have been able to read the file")
        .trim()
        .to_string();
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
pub struct PublicKeyResp {
    #[serde(rename = "publicKey")]
    public_key: String,
}

pub async fn public_key(State(s): State<RouterState>) -> Json<PublicKeyResp> {
    Json(PublicKeyResp {
        public_key: s.jwt.public_key.clone(),
    })
}
