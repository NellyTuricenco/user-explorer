import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { UserCard } from '../features/users/components/UserCard';
import { SearchBar } from '../features/users/components/SearchBar';
import { Pagination } from '../features/users/components/Pagination';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Button } from '../components/ui/Button';
import { ChevronDownIcon } from '../components/ui/ChevronDownIcon';
import { Modal } from '../components/ui/Modal';
import { useToastContext } from '../components/layout/Layout';
import { usersService } from '../services/users.service';
import type { User } from '../types/user.types';

const PAGE_SIZE = 12;
type SortOption =
  | 'default'
  | 'name-asc'
  | 'name-desc'
  | 'age-asc'
  | 'age-desc';

function isSortOption(value: string | null): value is Exclude<SortOption, 'default'> {
  return (
    value === 'name-asc' ||
    value === 'name-desc' ||
    value === 'age-asc' ||
    value === 'age-desc'
  );
}

function toSortParams(
  sort: SortOption
): { sortBy: string; order: 'asc' | 'desc' } | undefined {
  if (sort === 'name-asc') return { sortBy: 'firstName', order: 'asc' };
  if (sort === 'name-desc') return { sortBy: 'firstName', order: 'desc' };
  if (sort === 'age-asc') return { sortBy: 'age', order: 'asc' };
  if (sort === 'age-desc') return { sortBy: 'age', order: 'desc' };
  return undefined;
}

type AgeFilter = 'all' | '18-25' | '26-35' | '36-50' | '51+';

function matchesAgeFilter(age: number, filter: AgeFilter): boolean {
  if (filter === '18-25') return age >= 18 && age <= 25;
  if (filter === '26-35') return age >= 26 && age <= 35;
  if (filter === '36-50') return age >= 36 && age <= 50;
  if (filter === '51+') return age >= 51;
  return true;
}

export function UsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const { showToast } = useToastContext();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get('sort');
  const sortBy: SortOption = isSortOption(sortParam) ? sortParam : 'default';
  const genderFilter = (searchParams.get('gender') ?? 'all').toLowerCase();
  const roleFilter = (searchParams.get('role') ?? 'all').toLowerCase();
  const ageFilter = (searchParams.get('age') as AgeFilter | null) ?? 'all';
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 300);
  const hasActiveFilters =
    genderFilter !== 'all' || roleFilter !== 'all' || ageFilter !== 'all';

  const loadUsers = useCallback(() => {
    setIsLoading(true);
    setError(null);
    usersService
      .getUsers(0, 0, toSortParams(sortBy))
      .then((data) => {
        setAllUsers(data.users);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? 'Failed to load users');
        setIsLoading(false);
      });
  }, [sortBy]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return allUsers.filter((user) => {
      const matchesSearch =
        q.length === 0 ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q);

      const matchesGender =
        genderFilter === 'all' || user.gender.toLowerCase() === genderFilter;

      const userRole = (user.role ?? '').toLowerCase();
      const matchesRole = roleFilter === 'all' || userRole === roleFilter;

      const matchesAge = matchesAgeFilter(user.age, ageFilter);

      return matchesSearch && matchesGender && matchesRole && matchesAge;
    });
  }, [allUsers, debouncedQuery, genderFilter, roleFilter, ageFilter]);

  const total = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, genderFilter, roleFilter, ageFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    []
  );

  const handleDelete = useCallback(
    (id: number) => {
      setAllUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User deleted successfully', 'success');
    },
    [showToast]
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total > 0 ? `${total} users found` : 'Manage your user directory'}
          </p>
        </div>
        <Link to="/users/new">
          <Button size="md">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add user
          </Button>
        </Link>
      </div>

      {/* Search */}
      <SearchBar
        value={query}
        onChange={setQuery}
        isLoading={isLoading && query.length > 0}
        placeholder="Search by name, email, username..."
      />
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <label htmlFor="users-sort" className="text-sm text-gray-600">
            Sort by
          </label>
          <div className="relative">
            <select
              id="users-sort"
              value={sortBy}
              onChange={(e) => {
                const nextSort = e.target.value as SortOption;
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (nextSort === 'default') {
                    next.delete('sort');
                  } else {
                    next.set('sort', nextSort);
                  }
                  return next;
                });
              }}
              className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="default">Default</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
              <option value="name-desc">Alphabetical (Z-A)</option>
              <option value="age-asc">Age (Youngest to oldest)</option>
              <option value="age-desc">Age (Oldest to youngest)</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="relative">
          <select
            value={genderFilter}
            onChange={(e) => {
              const nextValue = e.target.value;
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (nextValue === 'all') next.delete('gender');
                else next.set('gender', nextValue);
                return next;
              });
            }}
            className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => {
              const nextValue = e.target.value;
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (nextValue === 'all') next.delete('role');
                else next.set('role', nextValue);
                return next;
              });
            }}
            className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
        <div className="relative">
          <select
            value={ageFilter}
            onChange={(e) => {
              const nextValue = e.target.value as AgeFilter;
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (nextValue === 'all') next.delete('age');
                else next.set('age', nextValue);
                return next;
              });
            }}
            className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All ages</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-50">36-50</option>
            <option value="51+">51+</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
        <Button
          variant="secondary"
          disabled={!hasActiveFilters}
          onClick={() => {
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.delete('gender');
              next.delete('role');
              next.delete('age');
              return next;
            });
          }}
        >
          Reset filters
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={loadUsers}
        />
      ) : pagedUsers.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
          title={query || hasActiveFilters ? 'No users found' : 'No users yet'}
          description={
            query
              ? `No results for "${query}". Try a different search.`
              : hasActiveFilters
                ? 'No users match the selected filters. Try resetting filters.'
                : 'Get started by adding your first user.'
          }
          action={
            query ? (
              <Button variant="secondary" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Link to="/users/new">
                <Button>Add user</Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pagedUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onDelete={handleDelete}
                onBookmarkLoginPrompt={() => setShowLoginModal(true)}
              />
            ))}
          </div>
          <Pagination
            page={safePage}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={handlePageChange}
          />
        </>
      )}

      {/* Login prompt modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Sign in required"
      >
        <p className="text-sm text-gray-600">
          You need to be signed in to bookmark users. Sign in to save your
          favorites.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowLoginModal(false);
              navigate('/login');
            }}
          >
            Sign in
          </Button>
        </div>
      </Modal>
    </div>
  );
}
