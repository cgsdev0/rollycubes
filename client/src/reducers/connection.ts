import { createReducer } from '@reduxjs/toolkit';

export interface ConnectionState {
  socket?: WebSocket;
  connected: boolean;
}

export interface WebsocketAction {
  type: 'WEBSOCKET';
  socket?: WebSocket;
}

export const connectionReducer = createReducer<ConnectionState>(
  { connected: false },
  (builder) => {
    builder
      .addCase('WEBSOCKET', (state, action: WebsocketAction) => {
        state.socket = action.socket;
      })
      .addCase('socket_open', (state, action) => {
        state.connected = true;
      })
      .addCase('socket_close', (state, action) => {
        state.connected = false;
      });
  }
);
