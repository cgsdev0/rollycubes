import { createReducer } from '@reduxjs/toolkit';
import { UpdateMsg, UpdateTurnMsg } from '../types/api';

export interface PopTextState {
  rollCount: number;
  reset: boolean;
  popText: Array<{ text: string; color: string; id: number }>;
  has69: boolean;
  popTextId: number;
}

export const popTextReducer = createReducer<PopTextState>(
  {
    rollCount: 0,
    reset: false,
    has69: false,
    popText: [],
    popTextId: 0,
  },
  (builder) => {
    builder
      .addCase('DOUBLES', (state, action) => {
        state.popText.push({
          text: 'Doubles!',
          color: 'cyan',
          id: state.popTextId++,
        });
      })
      .addCase('win', (state, action) => {
        state.popText.push({
          text: '{winner} wins!',
          color: 'lime',
          id: state.popTextId++,
        });
      })
      .addCase('POP_NEXT', (state, action) => {
        state.popText.shift();
      })
      .addCase('update', (state, action: UpdateMsg) => {
        if (action.reset) {
          state.popText.push({
            text: 'Reset!',
            color: 'red',
            id: state.popTextId++,
          });
        } else {
          // ignore reset packets; they're irrelevant
          state.has69 = action.score === 69;
        }
      })
      .addCase('update_turn', (state, action: UpdateTurnMsg) => {
        if (state.has69) {
          state.popText.push({
            text: 'Nice.',
            color: 'yellow',
            id: state.popTextId++,
          });
          state.has69 = false;
        }
      })
      .addCase('roll', (state, action) => {
        state.rollCount++;
      });
  }
);
