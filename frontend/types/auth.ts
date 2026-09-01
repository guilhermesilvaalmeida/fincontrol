export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}
