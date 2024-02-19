import { Dispatch } from '@reduxjs/toolkit';
import { ReduxState } from 'store';

export function cheatsAction() {
  return Object.assign(
    (dispatch: Dispatch, getState: () => ReduxState) => {
      const cheats = getState().settings.cheats;

      const action = { type: 'CHEATS' as 'CHEATS', newState: !cheats };
      dispatch(action);
      return action;
    },
    { type: 'CHEATS_THUNK' }
  );
}

export type CheatsAction = ReturnType<ReturnType<typeof cheatsAction>>;
