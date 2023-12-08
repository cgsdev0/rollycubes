import { createReducer } from '@reduxjs/toolkit';
import { CheatsAction } from 'actions/settings';
import { RichTextMsg, WelcomeMsg } from '../types/api';

export interface ChatState {
  chat: RichTextMsg[];
}
const CHAT_BUFFER_LENGTH = 200;

export const chatReducer = createReducer<ChatState>({ chat: [] }, (builder) => {
  builder
    .addCase('welcome', (state, action: WelcomeMsg) => {
      state.chat = action.richChatLog;
    })
    .addCase('CHEATS', (state, action: CheatsAction) => {
      state.chat.unshift({
        type: 'chat_v2',
        msg: ['Hints ' + (action.newState ? 'enabled.' : 'disabled.')],
      });
      state.chat.length = Math.max(state.chat.length, CHAT_BUFFER_LENGTH);
    })
    .addCase('chat_v2', (state, action: RichTextMsg) => {
      state.chat.unshift(action);
      state.chat.length = Math.max(state.chat.length, CHAT_BUFFER_LENGTH);
    });
});
