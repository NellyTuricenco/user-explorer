import { useState, useCallback, useEffect, useRef } from 'react';
import { usersService } from '../../services/users.service';
import type { User, UsersResponse } from '../../types/user.types';

interface UseUsersState {
  users: User[];
  total: number;
  isLoading: boolean;
  error: string | null;
  page: number;
}

interface UseUsersReturn extends UseUsersState {
  fetchUsers: (page?: number) => void;
  searchUsers: (query: string, page?: number) => void;
  setPage: (page: number) => void;
  deleteUser: (id: number) => void;
  query: string;
  setQuery: (q: string) => void;
}

const PAGE_SIZE = 12;

export function useUsers(): UseUsersReturn {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    total: 0,
    isLoading: true,
    error: null,
    page: 1,
  });
  const [query, setQuery] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const fetchUsers = useCallback((page = 1) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const skip = (page - 1) * PAGE_SIZE;

    usersService
      .getUsers(skip, PAGE_SIZE)
      .then((data: UsersResponse) => {
        if (!controller.signal.aborted) {
          setState({ users: data.users, total: data.total, isLoading: false, error: null, page });
        }
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err.message ?? 'Failed to load users',
          }));
        }
      });
  }, []);

  const searchUsers = useCallback((q: string, page = 1) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const skip = (page - 1) * PAGE_SIZE;

    usersService
      .searchUsers(q, skip, PAGE_SIZE)
      .then((data: UsersResponse) => {
        if (!controller.signal.aborted) {
          setState({ users: data.users, total: data.total, isLoading: false, error: null, page });
        }
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err.message ?? 'Failed to search users',
          }));
        }
      });
  }, []);

  const deleteUser = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
      total: prev.total - 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  useEffect(() => {
    fetchUsers(1);
    return () => abortRef.current?.abort();
  }, [fetchUsers]);

  return {
    ...state,
    fetchUsers,
    searchUsers,
    deleteUser,
    setPage,
    query,
    setQuery,
  };
}
