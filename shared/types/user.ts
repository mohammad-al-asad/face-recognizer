/**
 * User and authentication related types shared between frontend and backend.
 */

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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  username: string | null;
  loginTime: string | null;
}
