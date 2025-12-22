export interface User {
  uuid: string;
  discordId: string;
  nickname: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  addBot: () => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}