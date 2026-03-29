import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '../features/bookmarks/BookmarksContext';
import { usersService } from '../services/users.service';
import type { User } from '../types/user.types';
import { UserCard } from '../features/users/components/UserCard';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { useToastContext } from '../components/layout/Layout';

export function BookmarksPage() {
  const { bookmarks } = useBookmarks();
  const { showToast } = useToastContext();
  const [users, setUsers] = useState<User[]>([]);
  const usersRef = useRef<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    setUsers((prev) => prev.filter((user) => bookmarks.has(user.id)));
  }, [bookmarks]);

  useEffect(() => {
    const ids = Array.from(bookmarks);
    if (ids.length === 0) {
      setUsers([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const existingIds = new Set(usersRef.current.map((user) => user.id));
    const missingIds = ids.filter((id) => !existingIds.has(id));
    if (missingIds.length === 0) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all(missingIds.map((id) => usersService.getUserById(id)))
      .then((results) => {
        if (cancelled) return;
        const fetchedById = new Map(results.map((user) => [user.id, user]));
        setUsers((prev) => {
          const mergedById = new Map(prev.map((user) => [user.id, user]));
          fetchedById.forEach((user, id) => mergedById.set(id, user));
          return ids
            .map((id) => mergedById.get(id))
            .filter((user): user is User => user !== undefined);
        });
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message ?? 'Failed to load bookmarked users');
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookmarks]);

  const handleDelete = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('User deleted successfully', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your saved users
          {users.length > 0 && ` \u00b7 ${users.length} bookmarked`}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          }
          title="No bookmarks yet"
          description="Browse users and bookmark the ones you want to keep track of."
          action={
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
              Browse users
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
