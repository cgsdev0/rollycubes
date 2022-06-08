import { createReducer } from "@reduxjs/toolkit";
import { UpdateMsg } from "../types/server_messages";

export interface PopTextState {
  rollCount: number;
  doublesCount: number;
  reset: boolean;
}

export const popTextReducer = createReducer<PopTextState>(
  {
    rollCount: 0,
    doublesCount: 0,
    reset: false,
  },
  (builder) => {
    builder
      .addCase("DOUBLES", (state, action) => {
        state.doublesCount++;
      })
      .addCase("update", (state, action: UpdateMsg) => {
        state.reset = Boolean(action.reset);
      })
      .addCase("roll", (state, action) => {
        state.rollCount++;
      });
  }
);
