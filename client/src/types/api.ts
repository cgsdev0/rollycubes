export interface AchievementProgress {
    achievement_id: string;
    progress:       number;
    type:           AchievementProgressType;
    user_id:        UserID;
    user_index:     number;
}

export type AchievementProgressType = "achievement_progress";

export interface UserID {
    id:   string;
    type: UserIDType;
}

export type UserIDType = "User" | "Anonymous";

export interface AchievementUnlock {
    description:  string;
    id:           string;
    image_url:    null | string;
    max_progress: number;
    name:         string;
    type:         AchievementUnlockType;
    user_id:      string;
    user_index:   number;
}

export type AchievementUnlockType = "achievement_unlock";

export interface ReportStats {
    doubles: number;
    games:   number;
    rolls:   number;
    user_id: UserID;
    wins:    number;
}

export interface AchievementData {
    description:  string;
    id:           string;
    image_url:    null | string;
    max_progress: number;
    name:         string;
}

export interface UserData {
    achievements?: Achievement[] | null;
    color:         Color;
    createdDate:   string;
    dice:          Dice;
    donor:         boolean;
    id:            string;
    image_url?:    null | string;
    pubkey_text?:  null | string;
    stats?:        UserStats | null;
    username:      string;
}

export interface Achievement {
    id:       string;
    progress: number;
    rd:       number | null;
    rn:       number | null;
    unlocked: string;
}

export interface Color {
    hue: number;
    sat: number;
}

export interface Dice {
    type: DiceType;
}

export type DiceType = "D6" | "D20";

export interface UserStats {
    doubles: number;
    games:   number;
    rolls:   number;
    wins:    number;
}

export interface DieRoll {
    used:  boolean;
    value: number;
}

export interface GameError {
    error: string;
    type:  GameErrorType;
}

export type GameErrorType = "error";

export interface Redirect {
    room: string;
    type: RedirectType;
}

export type RedirectType = "redirect";

export interface RefetchPlayer {
    type:    RefetchPlayerType;
    user_id: string;
}

export type RefetchPlayerType = "refetch_player";

export interface RoomList {
    rooms: Room[];
}

export interface Room {
    code:         string;
    host_name:    string;
    last_updated: string;
    player_count: number;
}

export interface IGameState {
    chatLog:        string[];
    players:        Player[];
    privateSession: boolean;
    rolled:         boolean;
    rolls:          number[];
    spectators:     number;
    turn_index:     number;
    used:           boolean[];
    victory:        boolean;
}

export interface Player {
    connected:  boolean;
    crowned?:   boolean;
    name?:      string;
    score:      number;
    skip_count: number;
    user_id?:   string;
    win_count:  number;
}

export interface GameState {
    chatLog:        string[];
    players:        ServerPlayer[];
    privateSession: boolean;
    rolled:         boolean;
    rolls:          number[];
    spectators:     number;
    turn_index:     number;
    type:           GameStateType;
    used:           boolean[];
    victory:        boolean;
}

export interface ServerPlayer {
    connected:     boolean;
    crowned?:      boolean;
    doubles_count: number;
    name?:         string;
    roll_count:    number;
    score:         number;
    session:       string;
    skip_count:    number;
    turn_count:    number;
    user_id?:      string;
    win_count:     number;
}

export type GameStateType = "game_state";

export interface WelcomeMsg {
    chatLog:        string[];
    id:             number;
    players:        Player[];
    privateSession: boolean;
    rolled:         boolean;
    rolls:          number[];
    spectators:     number;
    turn_index:     number;
    type:           WelcomeMsgType;
    used:           boolean[];
    victory:        boolean;
}

export type WelcomeMsgType = "welcome";

export interface RestartMsg {
    id:   number;
    type: RestartMsgType;
}

export type RestartMsgType = "restart";

export interface SpectatorsMsg {
    count: number;
    type:  SpectatorsMsgType;
}

export type SpectatorsMsgType = "spectators";

export interface WinMsg {
    id:   number;
    type: WinMsgType;
}

export type WinMsgType = "win";

export interface RollMsg {
    rolls: number[];
    type:  RollMsgType;
}

export type RollMsgType = "roll";

export interface RollAgainMsg {
    type: RollAgainMsgType;
}

export type RollAgainMsgType = "roll_again";

export interface JoinMsg {
    id:       number;
    name?:    string;
    type:     JoinMsgType;
    user_id?: string;
}

export type JoinMsgType = "join";

export interface DisconnectMsg {
    id:   number;
    type: DisconnectMsgType;
}

export type DisconnectMsgType = "disconnect";

export interface ReconnectMsg {
    id:       number;
    name?:    string;
    type:     ReconnectMsgType;
    user_id?: string;
}

export type ReconnectMsgType = "reconnect";

export interface KickMsg {
    id:   number;
    type: KickMsgType;
}

export type KickMsgType = "kick";

export interface ChatMsg {
    msg:  string;
    type: ChatMsgType;
}

export type ChatMsgType = "chat";

export interface UpdateTurnMsg {
    id:    number;
    skip?: boolean;
    type:  UpdateTurnMsgType;
}

export type UpdateTurnMsgType = "update_turn";

export interface UpdateNameMsg {
    id:   number;
    name: string;
    type: UpdateNameMsgType;
}

export type UpdateNameMsgType = "update_name";

export interface UpdateMsg {
    id:     number;
    reset?: boolean;
    score:  number;
    type:   UpdateMsgType;
    used?:  boolean[];
}

export type UpdateMsgType = "update";
