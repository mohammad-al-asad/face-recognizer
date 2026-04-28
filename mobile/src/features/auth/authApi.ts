/**
 * Auth RTK Query API — login and token refresh endpoints.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../services/api";
import type { RootState } from "../../app/store";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL + "/auth",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refreshToken: builder.mutation<LoginResponse, void>({
      query: () => ({
        url: "/refresh",
        method: "POST",
      }),
    }),
    healthCheck: builder.query<{ status: string; service: string }, void>({
      query: () => "/health",
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useHealthCheckQuery,
} = authApi;
