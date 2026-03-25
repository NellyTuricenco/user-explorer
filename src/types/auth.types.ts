export interface AuthUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  image: string;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
