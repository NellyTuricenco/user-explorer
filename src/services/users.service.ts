import { api } from './api';
import type { User, UsersResponse, UserFormData } from '../types/user.types';

const LIMIT = 12;

interface UsersQuerySort {
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const usersService = {
  getUsers: (
    skip = 0,
    limit = LIMIT,
    sort?: UsersQuerySort
  ): Promise<UsersResponse> => {
    const params = new URLSearchParams({
      limit: String(limit),
      skip: String(skip),
    });
    if (sort?.sortBy && sort?.order) {
      params.set('sortBy', sort.sortBy);
      params.set('order', sort.order);
    }
    return api.get<UsersResponse>(`/users?${params.toString()}`);
  },

  searchUsers: (
    query: string,
    skip = 0,
    limit = LIMIT,
    sort?: UsersQuerySort
  ): Promise<UsersResponse> => {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      skip: String(skip),
    });
    if (sort?.sortBy && sort?.order) {
      params.set('sortBy', sort.sortBy);
      params.set('order', sort.order);
    }
    return api.get<UsersResponse>(`/users/search?${params.toString()}`);
  },

  getUserById: (id: number): Promise<User> =>
    api.get<User>(`/users/${id}`),

  createUser: (data: UserFormData): Promise<User> =>
    api.post<User>('/users/add', {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      username: data.username.trim().toLowerCase(),
      age: parseInt(data.age, 10),
      phone: data.phone.trim(),
      password: data.password,
    }),

  updateUser: (id: number, data: Partial<UserFormData>): Promise<User> =>
    api.put<User>(`/users/${id}`, {
      ...(data.firstName !== undefined && { firstName: data.firstName.trim() }),
      ...(data.lastName !== undefined && { lastName: data.lastName.trim() }),
      ...(data.email !== undefined && { email: data.email.trim().toLowerCase() }),
      ...(data.phone !== undefined && { phone: data.phone.trim() }),
      ...(data.gender !== undefined && { gender: data.gender.trim().toLowerCase() }),
      ...(data.image !== undefined && { image: data.image.trim() }),
      ...(data.password !== undefined &&
        data.password.trim() !== '' && { password: data.password }),
    }),

  deleteUser: (id: number): Promise<User & { isDeleted: boolean; deletedOn: string }> =>
    api.delete(`/users/${id}`),
};
