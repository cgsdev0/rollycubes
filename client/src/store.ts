import { configureStore, getDefaultMiddleware, Store } from "@reduxjs/toolkit";
import { authReducer } from "./reducers/auth";
import { chatReducer } from "./reducers/chat";
import { connectionReducer } from "./reducers/connection";
import { gameReducer } from "./reducers/game";
import { popTextReducer } from "./reducers/pop_text";
import { settingsReducer } from "./reducers/settings";

export const TARGET_SCORES = [33, 66, 67, 98, 99, 100];

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false,
});

export const store = configureStore({
  reducer: {
    game: gameReducer,
    chat: chatReducer,
    connection: connectionReducer,
    auth: authReducer,
    settings: settingsReducer,
    popText: popTextReducer,
  },
  middleware: customizedMiddleware,
});

type StateFromStore<A> = A extends Store<infer U, any> ? U : never;
export type ReduxState = StateFromStore<typeof store>;

export const selectState = (state: ReduxState) => state;

// Provide a hook for 1337 hackers
(window as any).REDUX_STORE = store;
