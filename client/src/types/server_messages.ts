import { Player, ServerPlayer } from './store_types';

type integer = number;

export interface GameError {
  type: 'error';
  error: string;
}

export interface Redirect {
  type: 'redirect';
  room: string;
}

export interface RefetchPlayer {
  type: 'refetch_player';
  user_id: string;
}

export interface Room {
  code: string;
  host_name: string;
  last_updated: string;
  player_count: integer;
}

export interface RoomList {
  rooms: Room[];
}

export interface IGameState {
  players: Player[];
  chatLog: string[];
  turn_index: integer;
  rolls: integer[];
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
  id: integer; // self_id; -1 means spectator
}

export interface RestartMsg {
  type: 'restart';
  id: integer; // starting turn index
}

export interface WinMsg {
  type: 'win';
  id: integer; // winner turn index
}

export interface RollMsg {
  type: 'roll';
  rolls: integer[];
}

export interface RollAgainMsg {
  type: 'roll_again';
}

export interface JoinMsg {
  type: 'join';
  id: integer;
  /* only if the user is signed in */
  name?: string;
  user_id?: string;
}

export interface DisconnectMsg {
  type: 'disconnect';
  id: integer;
}

export interface ReconnectMsg {
  type: 'reconnect';
  id: integer;
  /* only if the user is signed in */
  name?: string;
  user_id?: string;
}

export interface KickMsg {
  type: 'kick';
  id: integer;
}

export interface ChatMsg {
  type: 'chat';
  msg: string;
}

export interface UpdateTurnMsg {
  type: 'update_turn';
  id: integer; // new turn index
}

export interface UpdateNameMsg {
  type: 'update_name';
  name: string;
  id: integer; // new turn index
}

export interface UpdateMsg {
  type: 'update';
  id: integer; // new turn index
  score: integer;
  used?: boolean[];
  reset?: boolean;
}
