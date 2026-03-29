import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { validateLoginForm } from '../utils/validation';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { ValidationErrors } from '../types/user.types';

export function LoginPage() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({ username: false, password: false });

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    const validationErrors = validateLoginForm(username, password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await login({ username: username.trim(), password });
    } catch {}
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to access bookmarks and more
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError();
              }}
              onBlur={() => setTouched((p) => ({ ...p, username: true }))}
              error={touched.username ? errors.username : undefined}
              required
              autoComplete="username"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              error={touched.password ? errors.password : undefined}
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Sign in
            </Button>
          </form>

          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            <p className="font-medium text-gray-700">Demo credentials</p>
            <p className="mt-0.5">Username: <code className="font-mono">emilys</code></p>
            <p>Password: <code className="font-mono">emilyspass</code></p>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/users/new" className="font-medium text-violet-600 hover:text-violet-700">
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/" className="text-violet-600 hover:text-violet-700 font-medium">
            &larr; Back to users
          </Link>
        </p>
      </div>
    </div>
  );
}
