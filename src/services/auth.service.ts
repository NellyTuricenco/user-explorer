import { api } from './api';
import type { AuthUser, LoginCredentials } from '../types/auth.types';

export const authService = {
  login: (credentials: LoginCredentials): Promise<AuthUser> =>
    api.post<AuthUser>('/auth/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: 60,
    }),
};
