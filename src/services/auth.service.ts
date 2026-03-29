import { api } from './api';
import type { LoginCredentials, LoginResponse } from '../types/auth.types';

export const authService = {
  login: (credentials: LoginCredentials): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: 60,
    }),
};
