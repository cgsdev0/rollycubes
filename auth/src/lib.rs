#[macro_use]
extern crate lazy_static;

use axum::http::StatusCode;
use axum::response::IntoResponse;
use bb8_postgres::PostgresConnectionManager;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use thiserror::Error;
use time::{Duration, OffsetDateTime};
use tokio_postgres::NoTls;
use twitch_api::helix::ClientRequestError;
use twitch_oauth2::tokens::errors::ValidationError;
use uuid::Uuid;

pub mod migrations;
pub mod routes {
    pub mod server_routes;
    pub mod user_routes;
}

#[derive(Error, Debug)]
pub enum RouteError {
    #[error("jwt error")]
    JwtError(#[from] jsonwebtoken::errors::Error),
    #[error("bb8 problem")]
    Bb8Error(bb8::RunError<tokio_postgres::Error>),
    #[error("database error")]
    PostgresError(#[from] tokio_postgres::Error),
    #[error("there was an error with your request: {0}")]
    UserError(String),
    #[error("twitch validation error")]
    TwitchValidationError(#[from] ValidationError<reqwest::Error>),
    #[error("twitch client error")]
    TwitchError(#[from] ClientRequestError<reqwest::Error>),
    #[error("")]
    OK,
    #[error("you can't do that")]
    Forbidden,
}

impl IntoResponse for RouteError {
    fn into_response(self) -> axum::response::Response {
        let status = match self {
            RouteError::UserError(..) => StatusCode::BAD_REQUEST,
            RouteError::OK => StatusCode::OK,
            RouteError::Forbidden => StatusCode::FORBIDDEN,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        };
        (status, self.to_string()).into_response()
    }
}

impl From<bb8::RunError<tokio_postgres::Error>> for RouteError {
    fn from(err: bb8::RunError<tokio_postgres::Error>) -> Self {
        RouteError::Bb8Error(err)
    }
}

pub struct Jwt {
    pub private_key: String,
    pub public_key: String,
}

impl Jwt {
    pub fn sign_jwt(&self, claims: Claims) -> Result<String, RouteError> {
        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::new(jsonwebtoken::Algorithm::RS256),
            &claims,
            &jsonwebtoken::EncodingKey::from_rsa_pem(self.private_key.as_bytes())?,
        )?;
        return Ok(token);
    }
    pub fn verify(&self, token: &str) -> Result<jsonwebtoken::TokenData<Claims>, RouteError> {
        Ok(jsonwebtoken::decode::<Claims>(
            &token,
            &jsonwebtoken::DecodingKey::from_rsa_pem(self.public_key.as_bytes())?,
            &jsonwebtoken::Validation::new(jsonwebtoken::Algorithm::RS256),
        )?)
    }
}

#[derive(Clone)]
pub struct RouterState {
    pub jwt: Arc<Jwt>,
    pub pool: bb8::Pool<PostgresConnectionManager<NoTls>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    exp: i64,
    user_id: Uuid,
    display_name: String,
}

impl Claims {
    pub fn new(user_id: Uuid, display_name: &str) -> Claims {
        let exp = OffsetDateTime::now_utc()
            .checked_add(Duration::hours(2))
            .unwrap()
            .unix_timestamp();
        Claims {
            exp,
            user_id,
            display_name: display_name.to_string(),
        }
    }
}
