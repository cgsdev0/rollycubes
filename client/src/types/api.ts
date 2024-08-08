/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */


export type ServerMsg =
  | RoomListMsg
  | RefetchPlayerMsg
  | WelcomeMsg
  | RestartMsg
  | SpectatorsMsg
  | WinMsg
  | RollMsg
  | RollAgainMsg
  | JoinMsg
  | DisconnectMsg
  | ReconnectMsg
  | KickMsg
  | ChatMsg
  | RichTextMsg
  | UpdateTurnMsg
  | UpdateNameMsg
  | UpdateMsg;

export type DiceType = "Default" | "D20" | "Golden" | "Hands" | "Jumbo";

export type AuthSettingsRequest =
  | {
      setting: "Color";
      color: Color;
    }
  | {
      setting: "DiceType";
      dice_type: DiceType;
    }
  | {
      setting: "Pubkey";
      text: string;
    };

export type UserId =
  | {
      type: "User";
      id: string;
    }
  | {
      type: "Anonymous";
      id: string;
    };

export interface Schema {
  [k: string]: unknown;
}

export interface RoomListMsg {
  type?: "room_list";
  rooms: Room[];
}

export interface Room {
  code: string;
  host_name: string;
  last_updated: string;
  player_count: number;
}

export interface RefetchPlayerMsg {
  type: "refetch_player";
  user_id: string;
}

export interface WelcomeMsg {
  type: "welcome";
  id: number;
  players: Player[];
  richChatLog: RichTextMsg[];
  chatLog: string[];
  turn_index: number;
  rolls: number[];
  used: boolean[];
  rolled: boolean;
  victory: boolean;
  privateSession: boolean;
  spectators: number;
}

export interface Player {
  connected: boolean;
  name?: string;
  score: number;
  win_count: number;
  user_id?: string;
  crowned?: boolean;
  skip_count: number;
}

export interface RichTextMsg {
  type: "chat_v2";
  msg: (string | RichTextChunk)[];
}

export interface RichTextChunk {
  type: "rt_text" | "rt_username";
  text: string;
  user_id?: string;
  color?: string;
  alignment?: "left" | "right" | "center";
  modifiers?: ("bold" | "italic" | "underline" | "strikethrough")[];
}

export interface RestartMsg {
  type: "restart";
  id: number;
}

export interface SpectatorsMsg {
  type: "spectators";
  count: number;
}

export interface WinMsg {
  type: "win";
  id: number;
}

export interface RollMsg {
  type: "roll";
  rolls: number[];
}

export interface RollAgainMsg {
  type: "roll_again";
}

export interface JoinMsg {
  type: "join";
  id: number;
  name?: string;
  user_id?: string;
}

export interface DisconnectMsg {
  type: "disconnect";
  id: number;
}

export interface ReconnectMsg {
  type: "reconnect";
  id: number;
  name?: string;
  user_id?: string;
}

export interface KickMsg {
  type: "kick";
  id: number;
}

export interface ChatMsg {
  type: "chat";
  msg: string;
}

export interface UpdateTurnMsg {
  type: "update_turn";
  id: number;
  skip?: boolean;
}

export interface UpdateNameMsg {
  type: "update_name";
  name: string;
  id: number;
}
/**
 * TODO: add descriptions to these things
 *
 */
export interface UpdateMsg {
  type: "update";
  id: number;
  score: number;
  used?: boolean[];
  reset?: boolean;
}

export interface Dice {
  type: DiceType;
}

export interface Color {
  hue: number;
  sat: number;
}

export interface UserData {
  achievements?: Achievement[] | null;
  color: Color;
  created_date: string;
  dice: Dice;
  donor: boolean;
  badges: string[];
  id: string;
  image_url?: null | string;
  pubkey_text?: null | string;
  stats?: UserStats | null;
  username: string;
}

export interface Achievement {
  id: string;
  progress: number;
  unlocked: string;
  rn: null | number;
  rd: null | number;
}

export interface UserStats {
  rolls: number;
  doubles: number;
  games: number;
  wins: number;
  dice_hist: number[];
  sum_hist: number[];
  win_hist: number[];
}

export interface AuthRefreshTokenResponse {
  access_token: string;
}

export interface AuthDonateResponse {
  link: string;
}

export interface LoginRequest {
  anon_id?: string;
  redirect_uri: string;
  state: string;
  code: string;
}

export interface AchievementProgress {
  achievement_id: string;
  user_id: UserId;
  user_index: number;
  progress: number;
  type: "achievement_progress";
}

export interface AchievementUnlock {
  id: string;
  image_url: null | string;
  name: string;
  description: string;
  user_index: number;
  max_progress: number;
  user_id: string;
  type: "achievement_unlock";
}

export interface ReportStats {
  user_id: UserId;
  rolls: number;
  wins: number;
  games: number;
  doubles: number;
  dice_hist: number[];
  sum_hist: number[];
  win_hist: number[];
}

export interface ServerPlayer {
  session: string;
  turn_count: number;
  roll_count: number;
  doubles_count: number;
  connected: boolean;
  name?: string;
  score: number;
  win_count: number;
  user_id?: string;
  crowned?: boolean;
  skip_count: number;
  dice_hist: number[];
  sum_hist: number[];
  win_hist: number[];
}

export interface AchievementData {
  description: string;
  image_url: null | string;
  id: string;
  name: string;
  max_progress: number;
  unlocks?: DiceType;
}

export interface DieRoll {
  used: boolean;
  value: number;
}

export interface GameError {
  type: "error";
  error: string;
}

export interface Redirect {
  type: "redirect";
  room: string;
}

export interface IGameState {
  players: Player[];
  richChatLog: RichTextMsg[];
  chatLog: string[];
  turn_index: number;
  rolls: number[];
  used: boolean[];
  rolled: boolean;
  victory: boolean;
  privateSession: boolean;
  spectators: number;
}

export interface GameState {
  type: "game_state";
  players: ServerPlayer[];
  richChatLog: RichTextMsg[];
  chatLog: string[];
  turn_index: number;
  rolls: number[];
  used: boolean[];
  rolled: boolean;
  victory: boolean;
  privateSession: boolean;
  spectators: number;
}
