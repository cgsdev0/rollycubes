import { Player, ServerPlayer } from './store_types';

export interface GameError {
  type: 'error';
  error: string;
}

export interface Redirect {
  type: 'redirect';
  room: string;
}

export interface Room {
  code: string;
  host_name: string;
  last_updated: string;
  player_count: number;
}

export interface RoomList {
  rooms: Room[];
}

export interface IGameState {
  players: Player[];
  chatLog: string[];
  turn_index: number;
  rolls: number[];
  used: boolean[];
  rolled: boolean;
  victory: boolean;
  privateSession: boolean;
}

export interface GameState extends IGameState {
  type: 'game_state';
  players: ServerPlayer[];
}

export interface WelcomeMsg extends IGameState {
  type: 'welcome';
  id: number; // self_id; -1 means spectator
}

export interface RestartMsg {
  type: 'restart';
  id: number; // starting turn index
}

export interface WinMsg {
  type: 'win';
  id: number; // winner turn index
}

export interface RollMsg {
  type: 'roll';
  rolls: number[];
}

export interface RollAgainMsg {
  type: 'roll_again';
}

export interface JoinMsg {
  type: 'join';
  id: number;
  /* only if the user is signed in */
  name?: string;
  user_id?: string;
}

export interface DisconnectMsg {
  type: 'disconnect';
  id: number;
}

export interface ReconnectMsg {
  type: 'reconnect';
  id: number;
}

export interface KickMsg {
  type: 'kick';
  id: number;
}

export interface ChatMsg {
  type: 'chat';
  msg: string;
}

export interface UpdateTurnMsg {
  type: 'update_turn';
  id: number; // new turn index
}

export interface UpdateNameMsg {
  type: 'update_name';
  name: string;
  id: number; // new turn index
}

export interface UpdateMsg {
  type: 'update';
  id: number; // new turn index
  score: number;
  used?: boolean[];
  reset?: boolean;
}
