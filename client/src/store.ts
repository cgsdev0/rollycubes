import { AnyAction, createStore, Reducer } from "redux";
import { Theme, themes } from "./themes";

import { initScene, destroyScene } from "./3d/main";
import decode from "jwt-decode";

export interface Player {
  connected: boolean;
  name: string;
  score: number;
  win_count: number;
  user_id?: string;
  crowned?: boolean;
  userData?: UserData;
}

export interface UserStats {
  rolls: number;
  doubles: number;
  games: number;
  wins: number;
}

export interface UserData {
  id: string;
  username: string;
  image_url?: string | null;
  stats?: UserStats;
}

export interface DieRoll {
  used: boolean;
  value: number;
}

export interface ReduxState {
  players: Player[];
  rolls: DieRoll[];
  rolled: false;
  rolled3d: false;
  turn_index: number;
  self_index?: number;
  victory: boolean;
  socket?: WebSocket;
  connected: boolean;
  rollCount: number;
  doublesCount: number;
  chat: string[];
  reset: boolean;
  settings: {
    cheats: boolean;
    sick3dmode: boolean;
    authServiceOrigin: string;
    theme: Theme;
  };
  authToken?: string | null;
  userData?: UserData;
  otherUsers: Record<string, UserData>;
}

const PROD_AUTH_SERVICE = "https://auth.rollycubes.com/";
const LOCAL_AUTH_SERVICE = "http://localhost:3031/";

const initialState: ReduxState = {
  players: [],
  rolls: [],
  rolled: false,
  rolled3d: false,
  turn_index: 0,
  self_index: 0,
  victory: false,
  rollCount: 0,
  doublesCount: 0,
  connected: false,
  chat: [],
  reset: false,
  settings: {
    cheats: (localStorage.getItem("cheats") || "false") === "true",
    sick3dmode: (localStorage.getItem("sick3dmode") || "false") === "true",
    authServiceOrigin:
      localStorage.getItem("authServiceOrigin") || PROD_AUTH_SERVICE,
    theme:
      themes[
        (localStorage.getItem("theme") || "light") as keyof typeof themes
      ] || themes.light
  },
  authToken: undefined,
  otherUsers: {}
};

export const TARGET_SCORES = [33, 66, 67, 98, 99, 100];

const CHAT_BUFFER_LENGTH = 200;

const rootReducer: Reducer<ReduxState> = (
  state: ReduxState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case "WEBSOCKET":
      return {
        ...state,
        socket: action.socket
      };
    case "GOT_SELF_USER_DATA":
      return {
        ...state,
        userData: action.userData
      };
    case "GOT_USER_DATA":
      const user_id = action.data.id;
      console.warn("GOT_USER_DATA", action);
      return {
        ...state,
        otherUsers: Object.assign({}, state.otherUsers, {
          [user_id]: action.data
        })
      };
    case "FINISH_3D_ROLL":
      return {
        ...state,
        rolled3d: true
      };
    case "THEME_DARK":
      localStorage.setItem("theme", "dark");
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: themes.dark
        }
      };
    case "TOGGLE_THEME":
      localStorage.setItem(
        "theme",
        state.settings.theme === themes.dark ? "light" : "dark"
      );
      return {
        ...state,
        settings: {
          ...state.settings,
          theme:
            state.settings.theme === themes.dark ? themes.light : themes.dark
        }
      };
    case "THEME_LIGHT":
      localStorage.setItem("theme", "light");
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: themes.light
        }
      };
    case "TOGGLE_3D":
      const new3dmode = !state.settings.sick3dmode;
      if (new3dmode) {
        initScene(state);
      } else {
        destroyScene();
      }
      localStorage.setItem("sick3dmode", JSON.stringify(new3dmode));
      const new3dState = {
        ...state,
        chat: [
          `3D mode ${state.settings.sick3dmode ? "disabled" : "enabled"}.`,
          ...state.chat
        ],
        settings: {
          ...state.settings,
          sick3dmode: new3dmode
        }
      };
      new3dState.chat.length = Math.min(
        new3dState.chat.length,
        CHAT_BUFFER_LENGTH
      );
      return new3dState;
    case "DEV_AUTH_SERVICE_TOGGLE":
      const newOriginState = {
        ...state,
        settings: {
          ...state.settings,
          authServiceOrigin: state.settings.authServiceOrigin.includes(
            "localhost"
          )
            ? PROD_AUTH_SERVICE
            : LOCAL_AUTH_SERVICE
        }
      };
      localStorage.setItem(
        "authServiceOrigin",
        newOriginState.settings.authServiceOrigin
      );
      return newOriginState;
    case "AUTHENTICATE":
      let decoded: UserData | undefined = undefined;
      if (action.access_token) {
        decoded = decode<UserData>(action.access_token);
      }
      return {
        ...state,
        authToken: action.access_token,
        userData: decoded
      };
    case "LOGOUT":
      return {
        ...state,
        authToken: null,
        userData: undefined
      };
    case "CHEATS":
      localStorage.setItem("cheats", JSON.stringify(!state.settings.cheats));
      const newCheatState = {
        ...state,
        chat: [
          `Hints ${state.settings.cheats ? "disabled" : "enabled"}.`,
          ...state.chat
        ],
        settings: {
          ...state.settings,
          cheats: !state.settings.cheats
        }
      };
      newCheatState.chat.length = Math.min(
        newCheatState.chat.length,
        CHAT_BUFFER_LENGTH
      );
      return newCheatState;
    case "welcome":
      const { type, ...game } = action;
      const rolls = [];
      for (let i = 0; i < game.rolls.length; ++i) {
        rolls.push({ used: game.used[i], value: game.rolls[i] });
      }
      const welcomeState = Object.assign(
        {},
        state,
        initialState,
        game,
        { connected: state.connected },
        { players: game.players },
        { self_index: action.id === -1 ? undefined : action.id },
        { rolls },
        { settings: state.settings },
        { rolled3d: state.rolled3d },
        { authToken: state.authToken },
        { userData: state.userData },
        { otherUsers: state.otherUsers }
      );
      if (state.settings.sick3dmode) {
        initScene(welcomeState);
      }
      return welcomeState;
    case "join":
      if (!state.players.length) {
        return state;
      }
      if (action.id === state.self_index) {
        return state;
      }
      return {
        ...state,
        players: state.players.concat({
          connected: true,
          name: action.name || "",
          score: 0,
          win_count: 0
        })
      };

    case "socket_open":
      return {
        ...state,
        connected: true
      };
    case "socket_close":
      return {
        ...state,
        connected: false
      };
    case "disconnect":
    case "reconnect":
      return {
        ...state,
        players: state.players.map((p: Player, i: number) =>
          i !== action.id ? p : { ...p, connected: action.type === "reconnect" }
        )
      };
    case "update":
      return {
        ...state,
        players: state.players.map((p: Player, i: number) =>
          i !== action.id ? p : { ...p, score: action.score }
        ),
        rolls:
          "used" in action
            ? action.used.map((used: boolean, i: number) => ({
                used,
                value: state.rolls[i].value
              }))
            : state.rolls,
        reset: action.reset
      };
    case "update_name":
      return {
        ...state,
        players: state.players.map((p: Player, i: number) =>
          i !== action.id ? p : { ...p, name: action.name }
        )
      };
    case "update_turn":
      return {
        ...state,
        turn_index: action.id,
        rolled: false,
        rolled3d: false
      };
    case "roll_again":
      return {
        ...state,
        rolled: false,
        rolled3d: false
      };
    case "leave":
    case "kick":
      if (state.self_index === action.id) {
        // We've been kicked, uh oh
        window.history.replaceState({}, "", "/home");
        return {
          ...initialState
        };
      }
      return {
        ...state,
        players: [
          ...state.players.slice(0, action.id),
          ...state.players.slice(action.id + 1)
        ],
        self_index:
          state.self_index === undefined
            ? undefined
            : action.id < state.self_index
            ? state.self_index - 1
            : state.self_index
      };
    case "roll":
      document.dispatchEvent(
        new CustomEvent<any>("roll", {
          detail: { rolls: action.rolls, turn_index: state.turn_index }
        })
      );
      return {
        ...state,
        rolls: action.rolls.map((roll: number) => ({
          value: roll,
          used: false
        })),
        rolled: true,
        rolled3d: false,
        rollCount: state.rollCount + 1
      };
    case "win":
      // console.log(action);
      const new_players = state.players.map(a => a);
      new_players[action.id].win_count++;
      return {
        ...state,
        players: new_players,
        victory: true
      };
    case "restart":
      return {
        ...initialState,
        connected: state.connected,
        rolls: state.rolls,
        rollCount: state.rollCount,
        players: state.players.map(p => ({ ...p, score: 0 })),
        turn_index: action.id,
        self_index: state.self_index,
        chat: state.chat,
        settings: state.settings,
        socket: state.socket,
        authToken: state.authToken,
        userData: state.userData
      };
    case "chat":
      const newState = {
        ...state,
        chat: [action.msg, ...state.chat]
      };
      newState.chat.length = Math.min(newState.chat.length, CHAT_BUFFER_LENGTH);
      return newState;
    case "DOUBLES":
      return {
        ...state,
        doublesCount: state.doublesCount + 1
      };
    default:
      if (!action.type.includes("@@"))
        console.error("RECEIVED UNKNOWN ACTION", action);
  }
  return state;
};

export const selectState = (state: ReduxState) => state;

export const store = createStore(
  rootReducer,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

(window as any).REDUX_STORE = store;
