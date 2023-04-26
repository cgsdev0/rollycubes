import { createReducer } from '@reduxjs/toolkit';
import { CheatsAction } from 'actions/settings';
import { ChatMsg, WelcomeMsg } from '../types/server_messages';

export interface ChatState {
  chat: string[];
}
const CHAT_BUFFER_LENGTH = 200;

export const chatReducer = createReducer<ChatState>({ chat: [] }, (builder) => {
  builder
    .addCase('welcome', (state, action: WelcomeMsg) => {
      state.chat = action.chatLog;
    })
    .addCase('CHEATS', (state, action: CheatsAction) => {
      state.chat.unshift(
        'Hints ' + (action.newState ? 'enabled.' : 'disabled.')
      );
      state.chat.length = Math.max(state.chat.length, CHAT_BUFFER_LENGTH);
    })
    .addCase('chat', (state, action: ChatMsg) => {
      state.chat.unshift(action.msg);
      state.chat.length = Math.max(state.chat.length, CHAT_BUFFER_LENGTH);
    });
});
