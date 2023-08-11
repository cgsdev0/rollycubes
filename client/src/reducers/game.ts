import { createReducer } from '@reduxjs/toolkit';
import {
  DisconnectMsg,
  JoinMsg,
  KickMsg,
  ReconnectMsg,
  RestartMsg,
  RollAgainMsg,
  RollMsg,
  SpectatorsMsg,
  UpdateMsg,
  UpdateNameMsg,
  UpdateTurnMsg,
  WelcomeMsg,
  WinMsg,
  DieRoll,
  Player,
} from '../types/api';

export interface GameState {
  players: Player[];
  rolls: DieRoll[];
  rolled: boolean;
  rolled3d: boolean;
  turn_index: number;
  self_index?: number;
  victory: boolean;
  spectators: number;
}
const initialGameState: GameState = {
  players: [],
  rolls: [],
  rolled: false,
  // TODO: why does this exist?
  rolled3d: false,
  turn_index: 0,
  self_index: undefined,
  victory: false,
  spectators: 0,
};

export const gameReducer = createReducer<GameState>(
  initialGameState,
  (builder) => {
    builder
      .addCase('welcome', (state, action: WelcomeMsg) => {
        state.rolls = action.rolls.map((value, i) => ({
          used: action.used[i],
          value,
        }));
        state.players = action.players;
        state.victory = action.victory;
        state.spectators = action.spectators;
        state.rolled = action.rolled;
        state.turn_index = action.turn_index;

        // server returns -1 if we are a spectator (coalesce to undefined)
        state.self_index = action.id >= 0 ? action.id : undefined;
      })
      .addCase('spectators', (state, action: SpectatorsMsg) => {
        state.spectators = action.count;
      })
      .addCase('restart', (state, action: RestartMsg) => {
        state.players = state.players.map((player) => {
          player.score = 0;
          return player;
        });
        state.victory = false;
        state.rolled = false;
        state.turn_index = action.id;
      })
      .addCase('win', (state, action: WinMsg) => {
        state.players[action.id].win_count++;
        state.players = state.players.map((player) => {
          player.crowned = false;
          return player;
        });
        state.players[action.id].crowned = true;
        state.victory = true;
      })
      .addCase('update_turn', (state, action: UpdateTurnMsg) => {
        if (action.skip) {
          state.players[state.turn_index].skip_count += 1;
        }
        if (action.skip === false) {
          state.players[state.turn_index].skip_count = 0;
        }
        state.turn_index = action.id;
        state.rolled = false;
        state.rolled3d = false;
      })
      .addCase('update_name', (state, action: UpdateNameMsg) => {
        state.players[action.id].name = action.name;
      })
      .addCase('update', (state, action: UpdateMsg) => {
        state.players[action.id].score = action.score;
        if (action.used) {
          for (let i = 0; i < action.used.length; ++i) {
            state.rolls[i].used = action.used[i];
          }
        }
      })
      .addCase('roll_again', (state, action: RollAgainMsg) => {
        state.rolled = false;
        state.rolled3d = false;
      })
      .addCase('join', (state, action: JoinMsg) => {
        if (!state.players.length || action.id === state.self_index) {
          return;
        }
        state.players.push({
          connected: true,
          name: action.name || '',
          score: 0,
          win_count: 0,
          skip_count: 0,
          user_id: action.user_id,
        });
      })
      .addCase('disconnect', (state, action: DisconnectMsg) => {
        state.players[action.id].connected = false;
      })
      .addCase('reconnect', (state, action: ReconnectMsg) => {
        state.players[action.id].connected = true;
        // Promotion flow
        if (action.user_id) {
          state.players[action.id].user_id = action.user_id;
          state.players[action.id].name = action.name;
        }
      })
      .addCase('kick', (state, action: KickMsg) => {
        state.players.splice(action.id, 1);
        if (state.self_index !== undefined) {
          if (action.id < state.self_index) {
            state.self_index--;
          }
        }
        if (action.id < state.turn_index) {
          state.turn_index--;
        }
      })
      .addCase('FINISH_3D_ROLL', (state, action) => {
        state.rolled3d = true;
      })
      .addCase('roll', (state, action: RollMsg) => {
        state.rolled = true;
        state.rolled3d = false;
        state.rolls = action.rolls.map((value) => ({
          used: false,
          value,
        }));
      });
  }
);
