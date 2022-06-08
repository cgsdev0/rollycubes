import { createReducer } from "@reduxjs/toolkit";
import decode from "jwt-decode";
import { UserData } from "../types/store_types";

export interface AuthState {
  authToken?: string | null;
  userData?: UserData;
  otherUsers: Record<string, UserData>;
}
export interface GotSelfUserDataAction {
  type: "GOT_SELF_USER_DATA";
  userData: UserData;
}
export interface GotUserDataAction {
  type: "GOT_USER_DATA";
  data: UserData;
}

export interface AuthenticateAction {
  type: "AUTHENTICATE";
  access_token: string;
}

export const authReducer = createReducer<AuthState>(
  {
    otherUsers: {},
  },
  (builder) => {
    builder
      .addCase("GOT_SELF_USER_DATA", (state, action: GotSelfUserDataAction) => {
        state.userData = action.userData;
      })
      .addCase("GOT_USER_DATA", (state, action: GotUserDataAction) => {
        state.otherUsers[action.data.id] = action.data;
      })
      .addCase("AUTHENTICATE", (state, action: AuthenticateAction) => {
        try {
          const decoded = decode<UserData>(action.access_token);
          state.authToken = action.access_token;
          state.userData = decoded;
        } catch (e) {
          state.authToken = null;
          state.userData = undefined;
        }
      })
      .addCase("LOGOUT", (state, action) => {
        state.authToken = null;
        state.userData = undefined;
      });
  }
);
