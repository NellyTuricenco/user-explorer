import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../../types/user.types';
import { useAuth } from '../../auth/AuthContext';
import { useBookmarks } from '../../bookmarks/BookmarksContext';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { usersService } from '../../../services/users.service';

interface UserCardProps {
  user: User;
  onDelete: (id: number) => void;
  onBookmarkLoginPrompt?: () => void;
}

export function UserCard({ user, onDelete, onBookmarkLoginPrompt }: UserCardProps) {
  const { isAuthenticated } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const bookmarked = isBookmarked(user.id);

  const handleBookmarkClick = () => {
    if (!isAuthenticated) {
      onBookmarkLoginPrompt?.();
      return;
    }
    toggleBookmark(user.id);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await usersService.deleteUser(user.id);
      onDelete(user.id);
    } catch {
      // Optimistically handle - DummyJSON delete always succeeds
      onDelete(user.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        {/* Bookmark button */}
        <button
          onClick={handleBookmarkClick}
          className={`absolute right-4 top-4 rounded-full p-1.5 transition-all ${
            bookmarked
              ? 'text-violet-500 hover:text-violet-700'
              : 'text-gray-300 hover:text-violet-500'
          }`}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          title={isAuthenticated ? undefined : 'Sign in to bookmark'}
        >
          <svg
            className="h-5 w-5"
            fill={bookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </button>

        {/* Avatar */}
        <div className="mb-4 flex items-center gap-3">
          <img
            src={user.image}
            alt={`${user.firstName} ${user.lastName}`}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
            loading="lazy"
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="truncate text-xs text-gray-500">@{user.username}</p>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-1.5 text-xs text-gray-600">
          <p className="truncate">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Age:</span> {user.age}
          </p>
          {user.company?.name && (
            <p className="truncate">
              <span className="font-medium">Company:</span> {user.company.name}
            </p>
          )}
        </div>

        <div className="mt-2 mb-3">
          <Badge variant={user.gender === 'male' ? 'info' : 'default'}>
            {user.gender}
          </Badge>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 border-t border-gray-100 pt-4">
          <Link
            to={`/users/${user.id}/edit`}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete user"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          ? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
