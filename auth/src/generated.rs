// Example code that deserializes and serializes the model.
// extern crate serde;
// #[macro_use]
// extern crate serde_derive;
// extern crate serde_json;
//
// use generated_module::Player;
//
// fn main() {
//     let json = r#"{"answer": 42}"#;
//     let model: Player = serde_json::from_str(&json).unwrap();
// }

use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct AchievementProgress {
    achievement_id: String,

    progress: i64,

    #[serde(rename = "type")]
    achievement_progress_type: AchievementProgressType,

    user_id: UserId,

    user_index: i64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AchievementProgressType {
    #[serde(rename = "achievement_progress")]
    AchievementProgress,
}

#[derive(Serialize, Deserialize)]
pub struct UserId {
    id: String,

    #[serde(rename = "type")]
    user_id_type: UserIdType,
}

#[derive(Serialize, Deserialize)]
pub enum UserIdType {
    Anonymous,

    User,
}

#[derive(Serialize, Deserialize)]
pub struct AchievementUnlock {
    description: String,

    id: String,

    image_url: Option<String>,

    max_progress: i64,

    name: String,

    #[serde(rename = "type")]
    achievement_unlock_type: AchievementUnlockType,

    user_id: String,

    user_index: i64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AchievementUnlockType {
    #[serde(rename = "achievement_unlock")]
    AchievementUnlock,
}

#[derive(Serialize, Deserialize)]
pub struct ReportStats {
    doubles: i64,

    games: i64,

    rolls: i64,

    user_id: UserId,

    wins: i64,
}

#[derive(Serialize, Deserialize)]
pub struct AchievementData {
    description: String,

    id: String,

    image_url: Option<String>,

    max_progress: i64,

    name: String,
}

#[derive(Serialize, Deserialize)]
pub struct UserData {
    achievements: Option<Vec<Achievement>>,

    color: Color,

    #[serde(rename = "createdDate")]
    created_date: String,

    dice: Dice,

    donor: bool,

    id: String,

    image_url: Option<String>,

    pubkey_text: Option<String>,

    stats: Option<UserStats>,

    username: String,
}

#[derive(Serialize, Deserialize)]
pub struct Achievement {
    id: String,

    progress: i64,

    rd: Option<i64>,

    rn: Option<i64>,

    unlocked: String,
}

#[derive(Serialize, Deserialize)]
pub struct Color {
    hue: f64,

    sat: f64,
}

#[derive(Serialize, Deserialize)]
pub struct Dice {
    #[serde(rename = "type")]
    dice_type: DiceType,
}

#[derive(Serialize, Deserialize)]
pub enum DiceType {
    D20,

    D6,
}

#[derive(Serialize, Deserialize)]
pub struct UserStats {
    doubles: i64,

    games: i64,

    rolls: i64,

    wins: i64,
}

#[derive(Serialize, Deserialize)]
pub struct DieRoll {
    used: bool,

    value: i64,
}

#[derive(Serialize, Deserialize)]
pub struct GameError {
    error: String,

    #[serde(rename = "type")]
    game_error_type: GameErrorType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GameErrorType {
    Error,
}

#[derive(Serialize, Deserialize)]
pub struct Redirect {
    room: String,

    #[serde(rename = "type")]
    redirect_type: RedirectType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RedirectType {
    Redirect,
}

#[derive(Serialize, Deserialize)]
pub struct RefetchPlayerMsg {
    #[serde(rename = "type")]
    refetch_player_msg_type: RefetchPlayerMsgType,

    user_id: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RefetchPlayerMsgType {
    #[serde(rename = "refetch_player")]
    RefetchPlayer,
}

#[derive(Serialize, Deserialize)]
pub struct RoomListMsg {
    rooms: Vec<Room>,

    #[serde(rename = "type")]
    room_list_msg_type: Option<RoomListMsgType>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RoomListMsgType {
    #[serde(rename = "room_list")]
    RoomList,
}

#[derive(Serialize, Deserialize)]
pub struct Room {
    code: String,

    host_name: String,

    last_updated: String,

    player_count: i64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IGameState {
    chat_log: Vec<String>,

    players: Vec<Player>,

    private_session: bool,

    rolled: bool,

    rolls: Vec<i64>,

    spectators: i64,

    #[serde(rename = "turn_index")]
    turn_index: i64,

    used: Vec<bool>,

    victory: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Player {
    connected: bool,

    crowned: Option<bool>,

    name: Option<String>,

    score: i64,

    skip_count: i64,

    user_id: Option<String>,

    win_count: i64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameState {
    chat_log: Vec<String>,

    players: Vec<ServerPlayer>,

    private_session: bool,

    rolled: bool,

    rolls: Vec<i64>,

    spectators: i64,

    #[serde(rename = "turn_index")]
    turn_index: i64,

    #[serde(rename = "type")]
    game_state_type: GameStateType,

    used: Vec<bool>,

    victory: bool,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GameStateType {
    #[serde(rename = "game_state")]
    GameState,
}

#[derive(Serialize, Deserialize)]
pub struct ServerPlayer {
    connected: bool,

    crowned: Option<bool>,

    doubles_count: i64,

    name: Option<String>,

    roll_count: i64,

    score: i64,

    session: String,

    skip_count: i64,

    turn_count: i64,

    user_id: Option<String>,

    win_count: i64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WelcomeMsg {
    chat_log: Vec<String>,

    id: i64,

    players: Vec<Player>,

    private_session: bool,

    rolled: bool,

    rolls: Vec<i64>,

    spectators: i64,

    #[serde(rename = "turn_index")]
    turn_index: i64,

    #[serde(rename = "type")]
    welcome_msg_type: WelcomeMsgType,

    used: Vec<bool>,

    victory: bool,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WelcomeMsgType {
    Welcome,
}

#[derive(Serialize, Deserialize)]
pub struct RestartMsg {
    id: i64,

    #[serde(rename = "type")]
    restart_msg_type: RestartMsgType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RestartMsgType {
    Restart,
}

#[derive(Serialize, Deserialize)]
pub struct SpectatorsMsg {
    count: i64,

    #[serde(rename = "type")]
    spectators_msg_type: SpectatorsMsgType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SpectatorsMsgType {
    Spectators,
}

#[derive(Serialize, Deserialize)]
pub struct WinMsg {
    id: i64,

    #[serde(rename = "type")]
    win_msg_type: WinMsgType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WinMsgType {
    Win,
}

#[derive(Serialize, Deserialize)]
pub struct RollMsg {
    rolls: Vec<i64>,

    #[serde(rename = "type")]
    roll_msg_type: RollMsgType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RollMsgType {
    Roll,
}

#[derive(Serialize, Deserialize)]
pub struct RollAgainMsg {
    #[serde(rename = "type")]
    roll_again_msg_type: RollAgainMsgType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RollAgainMsgType {
    #[serde(rename = "roll_again")]
    RollAgain,
}

#[derive(Serialize, Deserialize)]
pub struct JoinMsg {
    id: i64,

    name: Option<String>,

    #[serde(rename = "type")]
    join_msg_type: JoinMsgType,

    user_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum JoinMsgType {
    Join,
}

#[derive(Serialize, Deserialize)]
pub struct DisconnectMsg {
    id: i64,

    #[serde(rename = "type")]
    disconnect_msg_type: DisconnectMsgType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DisconnectMsgType {
    Disconnect,
}

#[derive(Serialize, Deserialize)]
pub struct ReconnectMsg {
    id: i64,

    name: Option<String>,

    #[serde(rename = "type")]
    reconnect_msg_type: ReconnectMsgType,

    user_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReconnectMsgType {
    Reconnect,
}

#[derive(Serialize, Deserialize)]
pub struct KickMsg {
    id: i64,

    #[serde(rename = "type")]
    kick_msg_type: KickMsgType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum KickMsgType {
    Kick,
}

#[derive(Serialize, Deserialize)]
pub struct ChatMsg {
    msg: String,

    #[serde(rename = "type")]
    chat_msg_type: ChatMsgType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChatMsgType {
    Chat,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateTurnMsg {
    id: i64,

    skip: Option<bool>,

    #[serde(rename = "type")]
    update_turn_msg_type: UpdateTurnMsgType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UpdateTurnMsgType {
    #[serde(rename = "update_turn")]
    UpdateTurn,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateNameMsg {
    id: i64,

    name: String,

    #[serde(rename = "type")]
    update_name_msg_type: UpdateNameMsgType,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UpdateNameMsgType {
    #[serde(rename = "update_name")]
    UpdateName,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateMsg {
    id: i64,

    reset: Option<bool>,

    score: i64,

    #[serde(rename = "type")]
    update_msg_type: UpdateMsgType,

    used: Option<Vec<bool>>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UpdateMsgType {
    Update,
}
