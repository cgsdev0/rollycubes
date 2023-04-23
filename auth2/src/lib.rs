use anyhow::Error;
use bb8_postgres::PostgresConnectionManager;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use time::{Duration, OffsetDateTime};
use tokio_postgres::NoTls;
use uuid::Uuid;

pub mod migrations;
pub mod routes {
    pub mod server_routes;
    pub mod user_routes;
}

pub struct Jwt {
    pub private_key: String,
    pub public_key: String,
}

impl Jwt {
    pub fn sign_jwt(&self, claims: Claims) -> Result<String, Error> {
        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::new(jsonwebtoken::Algorithm::RS256),
            &claims,
            &jsonwebtoken::EncodingKey::from_rsa_pem(self.private_key.as_bytes())?,
        )?;
        return Ok(token);
    }
    pub fn verify(&self, token: &str) -> Result<jsonwebtoken::TokenData<Claims>, Error> {
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
