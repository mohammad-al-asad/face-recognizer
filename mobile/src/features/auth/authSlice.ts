/**
 * Auth state slice — manages access token, login state, and user info.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  username: string | null;
  loginTime: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  isAuthenticated: false,
  username: null,
  loginTime: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; username: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.username = action.payload.username;
      state.isAuthenticated = true;
      state.loginTime = new Date().toISOString();
    },
    logout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.username = null;
      state.loginTime = null;
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
  },
});

export const { setCredentials, logout, updateToken } = authSlice.actions;
export default authSlice.reducer;
