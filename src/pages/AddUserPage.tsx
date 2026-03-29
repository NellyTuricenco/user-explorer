import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserForm } from '../features/users/components/UserForm';
import { usersService } from '../services/users.service';
import { useToastContext } from '../components/layout/Layout';
import type { UserFormData } from '../types/user.types';

export function AddUserPage() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      await usersService.createUser(data);
      showToast('User created successfully', 'success');
      navigate('/');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create user';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Add user</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to create a new user.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <UserForm
          onSubmit={handleSubmit}
          submitLabel="Create user"
          isLoading={isSubmitting}
          includePasswordFields
        />
      </div>
    </div>
  );
}
