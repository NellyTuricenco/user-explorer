import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../../services/users.service';
import type { User } from '../../types/user.types';

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUser(id: number | null): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (id === null) return;
    setIsLoading(true);
    setError(null);
    usersService
      .getUserById(id)
      .then((data) => {
        setUser(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? 'Failed to load user');
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { user, isLoading, error, refetch: fetch };
}
