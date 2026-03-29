import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UserForm } from '../features/users/components/UserForm';
import { useUser } from '../features/users/useUser';
import { usersService } from '../services/users.service';
import { useToastContext } from '../components/layout/Layout';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import type { UserFormData } from '../types/user.types';

export function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id, 10) : null;
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isLoading, error, refetch } = useUser(
    Number.isFinite(userId) ? userId : null
  );

  const handleSubmit = async (data: UserFormData) => {
    if (!userId) return;
    setIsSubmitting(true);
    try {
      await usersService.updateUser(userId, data);
      showToast('User updated successfully', 'success');
      navigate('/');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update user';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!Number.isFinite(userId)) {
    return (
      <ErrorState
        title="Invalid user"
        message="The user ID in the URL is not valid."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to users
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          {isLoading ? 'Loading...' : user ? `Edit ${user.firstName} ${user.lastName}` : 'Edit user'}
        </h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : user ? (
          <UserForm
            initialValues={{
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              username: user.username,
              age: String(user.age),
              phone: user.phone ?? '',
              gender: user.gender ?? '',
              image: user.image ?? '',
            }}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            isLoading={isSubmitting}
          />
        ) : null}
      </div>
    </div>
  );
}
