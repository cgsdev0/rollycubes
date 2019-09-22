import { AnyAction, createStore, Reducer } from "redux";

export interface Player {
    connected: boolean;
    name: string;
    score: number;
    win_count: number;
}

export interface DieRoll {
    used: boolean;
    value: number;
}
export interface ReduxState {
    players: Player[];
    rolls: DieRoll[];
    rolled: false;
    turn_index: number;
    self_index: number;
    victory: boolean;
    socket?: WebSocket;
    rollCount: number;
    doublesCount: number;
    chat: string[];
    reset: boolean;
    cheats?: boolean;
}

const initialState: ReduxState = {
    players: [],
    rolls: [],
    rolled: false,
    turn_index: 0,
    self_index: 0,
    victory: false,
    rollCount: 0,
    doublesCount: 0,
    chat: [],
    reset: false,
}

export const TARGET_SCORES = [ 33, 66, 67, 98, 99, 100 ];

const CHAT_BUFFER_LENGTH = 200;

const rootReducer: Reducer<ReduxState> = (state: ReduxState = initialState, action: AnyAction) => {
    switch (action.type) {
        case "WEBSOCKET":
            return {
                ...state,
                socket: action.socket
            }
        case "CHEATS":
            const newCheatState = {
                ...state,
                chat: [`Hints ${state.cheats ? "disabled" : "enabled"}.`, ...state.chat],
                cheats: !state.cheats,
            }
            newCheatState.chat.length = Math.min(newCheatState.chat.length, CHAT_BUFFER_LENGTH);
            return newCheatState;
        case "welcome":
            const { game } = action;
            const rolls = [];
            for (let i = 0; i < game.rolls.length; ++i) {
                rolls.push({ used: game.used[i], value: game.rolls[i] })
            }
            return Object.assign({}, state, initialState, game, { players: game.players }, { self_index: action.id }, { rolls })
        case "join":
            if (!state.players.length) {
                return state;
            }
            if (action.id === state.self_index) {
                return state;
            }
            return {
                ...state,
                players: state.players.concat({ connected: true, name: "", score: 0, win_count: 0 })
            }

        case "disconnect":
        case "reconnect":
            return {
                ...state,
                players: state.players.map((p: Player, i: number) => (i !== action.id) ? p : { ...p, connected: action.type === "reconnect" }),
            }
        case "update":
            return {
                ...state,
                players: state.players.map((p: Player, i: number) => (i !== action.id) ? p : { ...p, score: action.score }),
                rolls: "used" in action ? action.used.map((used: boolean, i: number) => ({ used, value: state.rolls[i].value })) : state.rolls,
                reset: action.reset,
            }
        case "update_name":
            return {
                ...state,
                players: state.players.map((p: Player, i: number) => (i !== action.id) ? p : { ...p, name: action.name }),
            }
        case "update_turn":
            return {
                ...state,
                turn_index: action.id,
                rolled: false,
            }
        case "roll_again":
            return {
                ...state,
                rolled: false,
            }
        case "leave":
        case "kick":
            if(state.self_index === action.id) {
                // We've been kicked, uh oh
                window.history.replaceState({}, "", "/home");
                return {
                    ...initialState,
                }
            }
            return {
                ...state,
                players: [...state.players.slice(0, action.id), ...state.players.slice(action.id + 1)],
                self_index: action.id < state.self_index ? state.self_index - 1 : state.self_index,
            }
        case "roll":
            return {
                ...state,
                rolls: action.rolls.map((roll: number) => ({ value: roll, used: false })),
                rolled: true,
                rollCount: state.rollCount + 1,
            }
        case "win":
            return {
                ...state,
                victory: true,
            }
        case "restart":
            return {
                ...initialState,
                rolls: state.rolls,
                players: state.players.map(p => ({ ...p, score: 0 })),
                turn_index: action.id,
                self_index: state.self_index,
                chat: state.chat,
                cheats: state.cheats,
                socket: state.socket,
            }
        case "chat":
            const newState = {
                ...state,
                chat: [action.msg, ...state.chat]
            }
            newState.chat.length = Math.min(newState.chat.length, CHAT_BUFFER_LENGTH);
            return newState;
        case "DOUBLES":
            return {
                ...state,
                doublesCount: state.doublesCount + 1,
            }
        default:
            if(!action.type.includes("@@"))
                console.error("RECEIVED UNKNOWN ACTION", action);
    }
    return state;
};

export const selectState = (state: ReduxState) => state;

export const store = createStore(rootReducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    );
