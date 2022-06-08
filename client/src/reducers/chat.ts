import { createReducer } from "@reduxjs/toolkit";
import { ChatMsg, WelcomeMsg } from "../types/server_messages";

export interface ChatState {
  chat: string[];
}
const CHAT_BUFFER_LENGTH = 200;

export const chatReducer = createReducer<ChatState>({ chat: [] }, (builder) => {
  builder
    .addCase("welcome", (state, action: WelcomeMsg) => {
      state.chat = action.chatLog;
    })
    .addCase("chat", (state, action: ChatMsg) => {
      state.chat.unshift(action.msg);
      state.chat.length = Math.max(state.chat.length, CHAT_BUFFER_LENGTH);
    });
});
