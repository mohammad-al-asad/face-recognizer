/**
 * Face recognition RTK Query API — recognize, add-face, and user management.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../services/api";
import type { RootState } from "../../app/store";

export interface RecognitionResult {
  name: string | null;
  status: "authorized" | "unauthorized" | "no_face";
  confidence: number;
  timestamp: string;
}

export interface AddFaceRequest {
  name: string;
  images: string[];
}

export interface AddFaceResponse {
  message: string;
  user_id: string;
  embeddings_stored: number;
  total_images_processed: number;
}

export interface User {
  id: string;
  name: string;
  created_at: string;
  embedding_count: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export const faceApi = createApi({
  reducerPath: "faceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    recognizeFace: builder.mutation<RecognitionResult, { image: string }>({
      query: (body) => ({
        url: "/recognize",
        method: "POST",
        body,
      }),
    }),
    addFace: builder.mutation<AddFaceResponse, AddFaceRequest>({
      query: (body) => ({
        url: "/add-face",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
    getUsers: builder.query<UsersResponse, void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useRecognizeFaceMutation,
  useAddFaceMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
} = faceApi;
