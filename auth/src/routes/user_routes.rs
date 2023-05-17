use crate::*;
use axum::{
    extract::{Path, State},
    http::header::HeaderMap,
    Json,
};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use int_enum::IntEnum;
use serde::{Deserialize, Serialize};
use serde_repr::*;
use std::fs;
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

#[derive(Serialize_repr, Deserialize_repr, PartialEq, PartialOrd, Eq, IntEnum, Clone, Copy)]
#[repr(i32)]
pub enum DiceType {
    D6 = 0,
    D20 = 1,
}

#[derive(Serialize)]
pub struct DiceSettings {
    #[serde(rename = "type")]
    dice_type: DiceType,
}

#[derive(Serialize, Deserialize)]
pub struct ColorSettings {
    hue: f64,
    sat: f64,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "setting")]
pub enum UpdateSettingsPayload {
    DiceType { dice_type: DiceType },
    Color { color: ColorSettings },
}

#[derive(Serialize)]
pub struct User {
    id: Uuid,
    username: String,
    image_url: Option<String>,
    dice: DiceSettings,
    color: ColorSettings,
    #[serde(rename = "createdDate", with = "time::serde::rfc3339")]
    created_date: OffsetDateTime,
    achievements: Option<Vec<AchievementProgress>>,
    stats: Option<PlayerStats>,
    donor: bool,
}

#[derive(Deserialize)]
pub struct LoginPayload {
    twitch_access_token: String,
    anon_id: Option<String>,
}

lazy_static! {
    static ref SQUARE_ACCESS_TOKEN: String = fs::read_to_string("./secrets/.square_access_token")
        .expect("Should have been able to read the file")
        .trim()
        .to_string();
    static ref SQUARE_API_URL: String = fs::read_to_string("./secrets/.square_api_url")
        .expect("Should have been able to read the file")
        .trim()
        .to_string();
}

#[derive(Serialize, Deserialize)]
pub struct SquareCheckoutResponse {
    payment_link: PaymentLink,
}

#[derive(Serialize, Deserialize)]
pub struct PaymentLink {
    id: String,
    version: i64,
    description: String,
    order_id: String,
    url: String,
    long_url: String,
    created_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct Order {
    id: String,
    location_id: String,
    source: Source,
    net_amounts: NetAmounts,
    created_at: String,
    updated_at: String,
    state: String,
    version: i64,
    total_money: PriceMoney,
    total_tax_money: PriceMoney,
    total_discount_money: PriceMoney,
    total_tip_money: PriceMoney,
    total_service_charge_money: PriceMoney,
    net_amount_due_money: PriceMoney,
}

#[derive(Serialize, Deserialize)]
pub struct LineItem {
    uid: String,
    name: String,
    quantity: String,
    item_type: String,
    base_price_money: PriceMoney,
    variation_total_price_money: PriceMoney,
    gross_sales_money: PriceMoney,
    total_tax_money: PriceMoney,
    total_discount_money: PriceMoney,
    total_money: PriceMoney,
    total_service_charge_money: PriceMoney,
}

#[derive(Serialize, Deserialize)]
pub struct NetAmounts {
    total_money: PriceMoney,
    tax_money: PriceMoney,
    discount_money: PriceMoney,
    tip_money: PriceMoney,
    service_charge_money: PriceMoney,
}

#[derive(Serialize, Deserialize)]
pub struct Source {
    name: String,
}

async fn login_helper(
    s: &RouterState,
    jar: CookieJar,
    x: &Uuid,
    username: &str,
) -> Result<(CookieJar, Json<LoginResponse>), RouteError> {
    // Do the login
    let client = s.pool.get().await?;

    let access_token = s.jwt.sign_jwt(Claims::new(*x, username))?;
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
        .await?;
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
#[axum::debug_handler]
pub async fn refresh_token(
    State(s): State<RouterState>,
    jar: CookieJar,
) -> Result<(CookieJar, Json<LoginResponse>), RouteError> {
    let r_token = jar.get("refresh_token").ok_or(RouteError::Forbidden)?;
    let parsed_token = Uuid::parse_str(r_token.value()).map_err(|_| RouteError::Forbidden)?;
    let client = s.pool.get().await?;
    let row = client
        .query_one(
            "
SELECT username, user_id, issued_at FROM refresh_token
LEFT JOIN users ON users.id = user_id
WHERE refresh_token.id = $1::UUID
",
            &[&parsed_token],
        )
        .await
        .map_err(|_| RouteError::Forbidden)?;
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
        return Err(RouteError::Forbidden);
    }
    login_helper(
        &s,
        jar,
        &row.get::<_, Uuid>("user_id"),
        row.get::<_, &str>("username"),
    )
    .await
}

#[axum::debug_handler]
pub async fn login(
    State(s): State<RouterState>,
    jar: CookieJar,
    Json(payload): Json<LoginPayload>,
) -> Result<(CookieJar, Json<LoginResponse>), RouteError> {
    let token = AccessToken::new(payload.twitch_access_token);
    let http_client = reqwest::Client::new();
    let twitch_client = twitch_api::HelixClient::with_client(http_client.clone());
    let mut client = s.pool.get().await?;

    let t = UserToken::from_existing(&http_client, token, None, None).await?;
    // TODO: check this for a match t.client_id().as_str();
    let user = twitch_client
        .get_user_from_id(&t.user_id, &t)
        .await?
        .ok_or(RouteError::Forbidden)?;

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
        let transaction = client.transaction().await?;
        let id = if let Some(session) = payload.anon_id {
            println!("GOT SESSION: {}", session);
            let rows = transaction
                .query(
                    "
SELECT user_id FROM anon_identity WHERE anon_id = $1::TEXT",
                    &[&format!("{}{}", "guest:", session)],
                )
                .await?;
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
            .await?;
        transaction
            .execute(
                "
INSERT INTO user_settings (user_id)
VALUES ($1::UUID) ON CONFLICT(user_id) DO NOTHING",
                &[&id],
            )
            .await?;
        transaction
            .execute(
                "
INSERT INTO twitch_identity (twitch_id, twitch_login, user_id)
VALUES ($1::TEXT, $2::TEXT, $3::UUID) ON CONFLICT(twitch_id) DO NOTHING",
                &[&t.user_id.as_str(), &t.login.as_str(), &id],
            )
            .await?;
        transaction.commit().await?;
        id
    };
    login_helper(&s, jar, &x, user.display_name.as_str()).await
}

#[axum::debug_handler]
pub async fn update_user_setting(
    headers: HeaderMap,
    State(s): State<RouterState>,
    Json(body): Json<UpdateSettingsPayload>,
) -> Result<(), RouteError> {
    let access_token = headers.get("x-access-token").ok_or(RouteError::Forbidden)?;
    let verified_token = s.jwt.verify(access_token.to_str().unwrap())?;
    let client = s.pool.get().await?;

    match body {
        UpdateSettingsPayload::Color { color } => {
            if !(0.0..=360.0).contains(&color.hue) {
                return Err(RouteError::UserError(
                    "invalid hue (valid range: 0.0 to 360.0)".to_string(),
                ));
            }
            if !(0.0..=80.0).contains(&color.sat) {
                return Err(RouteError::UserError(
                    "invalid saturation (valid range: 0.0 to 80.0)".to_string(),
                ));
            }
            let rows_updated = client
                .execute(
                    "UPDATE user_settings SET color_hue = $2, color_sat = $3 WHERE user_id = $1::UUID",
                    &[
                        &verified_token.claims.user_id,
                        &color.hue,
                        &color.sat
                    ],
                )
                .await?;
            if rows_updated == 0 {
                return Err(RouteError::UserError(
                    "that user doesn't exist???".to_string(),
                ));
            }
            Ok(())
        }
        UpdateSettingsPayload::DiceType { dice_type } => {
            let unlocked = match dice_type {
                DiceType::D6 => true,
                DiceType::D20 => {
                    let result = client.query_one(
"SELECT COUNT(*) FROM user_to_achievement WHERE user_id = $1::UUID AND unlocked IS NOT NULL AND achievement_id = 'astronaut:1'",
&[&verified_token.claims.user_id]).await?;
                    result.get::<'_, _, i64>(0) > 0
                }
            };
            if !unlocked {
                return Err(RouteError::UserError(
                    "that dice type is not unlocked".to_string(),
                ));
            }
            client
                .execute(
                    "UPDATE user_settings SET dice_type = $2::INTEGER WHERE user_id = $1::UUID",
                    &[
                        &verified_token.claims.user_id,
                        &DiceType::int_value(dice_type),
                    ],
                )
                .await?;
            Ok(())
        }
    }
}

#[axum::debug_handler]
pub async fn user_self(
    headers: HeaderMap,
    State(s): State<RouterState>,
) -> Result<Json<User>, RouteError> {
    let access_token = headers.get("x-access-token").ok_or(RouteError::Forbidden)?;
    let verified_token = s.jwt.verify(access_token.to_str().unwrap())?;
    user_by_id(Path(verified_token.claims.user_id), State(s)).await
}

#[derive(Serialize, Deserialize)]
pub struct DonateResponse {
    link: String,
}

#[derive(Serialize, Deserialize)]
pub struct PriceMoney {
    currency: String,
    amount: i64,
}
#[derive(Serialize, Deserialize)]
pub struct QuickPayOptions {
    location_id: String,
    name: String,
    price_money: PriceMoney,
}
#[derive(Serialize, Deserialize)]
pub struct AcceptedPaymentMethods {
    afterpay_clearpay: Option<bool>,
    apple_pay: Option<bool>,
    cash_app_pay: Option<bool>,
    google_pay: Option<bool>,
}
#[derive(Serialize, Deserialize)]
pub struct CheckoutOptions {
    accepted_payment_methods: AcceptedPaymentMethods,
    allow_tipping: Option<bool>,
}
#[derive(Serialize, Deserialize)]
pub struct SquareCheckoutPayload {
    quick_pay: QuickPayOptions,
    checkout_options: CheckoutOptions,
    description: Option<String>,
}
#[axum::debug_handler]
pub async fn donate(
    headers: HeaderMap,
    State(s): State<RouterState>,
) -> Result<Json<DonateResponse>, RouteError> {
    let db_client = s.pool.get().await?;
    let access_token = headers.get("x-access-token").ok_or(RouteError::Forbidden)?;
    let verified_token = s.jwt.verify(access_token.to_str().unwrap())?;
    let user_id = verified_token.claims.user_id;
    let client = reqwest::Client::new();
    let response = client
        .post(SQUARE_API_URL.to_string() + "/v2/online-checkout/payment-links")
        .header(
            "Authorization".to_string(),
            "Bearer ".to_string() + &SQUARE_ACCESS_TOKEN,
        )
        .body(serde_json::to_string(&SquareCheckoutPayload {
            quick_pay: QuickPayOptions {
                location_id: "LTB6VVK0S2WNP".to_string(),
                name: "Rolly Cubes Premium".to_string(),
                price_money: PriceMoney {
                    amount: 500,
                    currency: "USD".to_string(),
                },
            },
            checkout_options: CheckoutOptions {
                accepted_payment_methods: AcceptedPaymentMethods {
                    afterpay_clearpay: Some(true),
                    apple_pay: Some(true),
                    cash_app_pay: Some(true),
                    google_pay: Some(true),
                },
                allow_tipping: None,
            },
            description: Some(
                "Donation to rolly cubes that provides some additional customization options."
                    .to_string(),
            ),
        })?)
        .send()
        .await?
        .text()
        .await?;
    let r: SquareCheckoutResponse = serde_json::from_str(&response)?;
    // 2. insert user_id + payment_id into payments table
    db_client
        .execute(
            "INSERT INTO payment (user_id, payment_id) VALUES ($1::UUID, $2)",
            &[&user_id, &r.payment_link.order_id],
        )
        .await?;

    // 3. return link
    Ok(Json(DonateResponse {
        link: r.payment_link.long_url,
    }))
}

#[axum::debug_handler]
pub async fn user_by_id(
    Path(user_id): Path<Uuid>,
    State(s): State<RouterState>,
) -> Result<Json<User>, RouteError> {
    let client = s.pool.get().await?;
    let rows = client
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
    user_settings.dice_type as dice_type,
    user_settings.color_hue as color_hue,
    user_settings.color_sat as color_sat,
    unlocked,
    progress,
    rolls,
    doubles,
    games,
    wins,
    donor,
    (SELECT user_count FROM total_users) AS rd,
    (SELECT achievement_count FROM users_ach_totals z WHERE z.id=user_to_achievement.achievement_id) AS rn
FROM users
LEFT JOIN user_to_achievement ON id=user_to_achievement.user_id
LEFT JOIN player_stats ON id=player_stats.user_id
LEFT JOIN user_settings ON id=user_settings.user_id
WHERE id=$1::UUID",
            &[&user_id],
        )
        .await?;

    if !rows.is_empty() {
        let row = &rows[0];
        let rolls: Option<i32> = row.get("rolls");
        let achievement_id: Option<String> = row.get("achievement_id");
        let user = User {
            id: row.get("id"),
            username: row.get("username"),
            image_url: row.get("image_url"),
            donor: row.get("donor"),
            dice: DiceSettings {
                dice_type: DiceType::from_int(row.get::<'_, _, i32>("dice_type"))?,
            },
            color: ColorSettings {
                hue: row.get("color_hue"),
                sat: row.get("color_sat"),
            },
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
    } else {
        Err(RouteError::Forbidden)
    }
}

pub async fn logout(jar: CookieJar, State(s): State<RouterState>) -> Result<CookieJar, RouteError> {
    let client = s.pool.get().await?;
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
                .await?;
        }
        // 3. clear the refresh cookie in the response
        return Ok(jar.remove(Cookie::named("refresh_token")));
    }
    Ok(jar)
}
