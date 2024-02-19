use crate::*;
use axum::{extract::RawBody, extract::State, http::HeaderMap};
use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::fs;
use uuid::Uuid;

lazy_static! {
    static ref SQUARE_SIGNATURE_KEY: String = fs::read_to_string("./secrets/.square_signature_key")
        .expect("Should have been able to read the file")
        .trim()
        .to_string();
}

#[derive(Serialize, Deserialize)]
pub struct MoneyAmount {
    amount: i64,
    currency: String,
}

#[derive(Serialize, Deserialize)]
pub enum OrderStatus {
    #[serde(rename = "COMPLETED")]
    Completed,
    #[serde(rename = "APPROVED")]
    Approved,
    #[serde(rename = "PENDING")]
    Pending,
    #[serde(rename = "CANCELED")]
    Canceled,
    #[serde(rename = "FAILED")]
    Failed,
}
impl OrderStatus {
    fn is_complete(&self) -> bool {
        match *self {
            OrderStatus::Completed => true,
            _ => false,
        }
    }
}
#[derive(Serialize, Deserialize)]
pub struct PleaseStopNestingThisShitGoddammit {
    amount_money: MoneyAmount,
    status: OrderStatus,
    order_id: String,
}

#[derive(Serialize, Deserialize)]
pub struct SquarePaymentObject {
    payment: PleaseStopNestingThisShitGoddammit,
}

#[derive(Serialize, Deserialize)]
pub struct SquarePaymentData {
    id: String,
    object: SquarePaymentObject,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum SquareWebhookBody {
    #[serde(rename = "payment.updated")]
    PaymentUpdated { data: SquarePaymentData },
}
#[axum::debug_handler]
pub async fn square(
    headers: HeaderMap,
    State(s): State<RouterState>,
    RawBody(body): RawBody,
) -> Result<(), RouteError> {
    let client = s.pool.get().await?;
    let hmac = headers
        .get("x-square-hmacsha256-signature")
        .ok_or(RouteError::Forbidden)?
        .to_str()
        .map_err(|_| RouteError::Forbidden)?;
    let host = headers
        .get("host")
        .ok_or(RouteError::Forbidden)?
        .to_str()
        .map_err(|_| RouteError::Forbidden)?;
    let notif_url = "https://".to_owned() + host + &"/webhooks/square";
    println!("i got the fucking header");
    let body_bytes = &hyper::body::to_bytes(body).await.unwrap();
    println!(
        "i got the fucking bytes {}",
        String::from_utf8(body_bytes.to_vec()).unwrap()
    );
    let decoded_hmac = general_purpose::STANDARD
        .decode(hmac)
        .map_err(|_| RouteError::Forbidden)?;
    println!(
        "i decoded the fucking hmac {}",
        general_purpose::STANDARD.encode(decoded_hmac.as_slice())
    );
    ring::hmac::verify(
        &ring::hmac::Key::new(ring::hmac::HMAC_SHA256, SQUARE_SIGNATURE_KEY.as_bytes()),
        &[notif_url.as_bytes(), &body_bytes].concat(),
        &decoded_hmac.as_slice(),
    )
    .map_err(|_| RouteError::Forbidden)?;

    println!("i verified the hmac");
    let parsed: SquareWebhookBody = serde_json::from_slice(body_bytes)?;
    println!("i parsed the json");
    match parsed {
        SquareWebhookBody::PaymentUpdated { data } => {
            if !data.object.payment.status.is_complete() {
                return Ok(());
            }
            let order_id = data.object.payment.order_id;
            let row = client
                .query_one(
                    "SELECT user_id FROM payment WHERE payment_id = $1",
                    &[&order_id],
                )
                .await?;

            let user_id = row.get::<'_, _, Uuid>("user_id");
            client
                .execute(
                    "UPDATE users SET donor = true WHERE id = $1::UUID",
                    &[&user_id],
                )
                .await?;
            Ok(())
        }
    }
}
