import {
  AnyAction,
  configureStore,
  Dispatch,
  getDefaultMiddleware,
  Middleware,
  Store,
} from '@reduxjs/toolkit';
import { authApi } from 'api/auth';
import { themesReducer } from 'reducers/themes';
import { authReducer } from './reducers/auth';
import { chatReducer } from './reducers/chat';
import { connectionReducer } from './reducers/connection';
import { gameReducer } from './reducers/game';
import { popTextReducer } from './reducers/pop_text';
import { settingsReducer } from './reducers/settings';
import { createReduxHistoryContext } from 'redux-first-history';
import { createBrowserHistory } from 'history';

const { createReduxHistory, routerMiddleware, routerReducer } =
  createReduxHistoryContext({ history: createBrowserHistory() });

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false,
});

const userIdMiddleware: Middleware<{}, any, Dispatch<AnyAction>> =
  (api) => (next) => (action) => {
    const user_id = api.getState()?.auth?.userData?.user_id;
    return next({ ...action, ...{ MIDDLEWARE_INJECTED_USER_ID: user_id } });
  };

export const store = configureStore({
  reducer: {
    router: routerReducer,
    game: gameReducer,
    chat: chatReducer,
    connection: connectionReducer,
    auth: authReducer,
    settings: settingsReducer,
    popText: popTextReducer,
    themes: themesReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: customizedMiddleware.concat(
    authApi.middleware,
    routerMiddleware,
    userIdMiddleware
  ),
});

export const history = createReduxHistory(store);

type StateFromStore<A> = A extends Store<infer U, any> ? U : never;
export type ReduxState = StateFromStore<typeof store>;

export const selectState = (state: ReduxState) => state;

// Provide a hook for 1337 hackers
(window as any).REDUX_STORE = store;
