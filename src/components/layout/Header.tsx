import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useBookmarks } from '../../features/bookmarks/BookmarksContext';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { bookmarks } = useBookmarks();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-violet-600' : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="hidden lg:block text-base font-semibold text-gray-900">UserExplorer</span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Users
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/bookmarks" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                Bookmarks
                {bookmarks.size > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-100 px-1.5 text-xs font-semibold text-violet-700">
                    {bookmarks.size}
                  </span>
                )}
              </span>
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user?.image && (
                  <img
                    src={user.image}
                    alt={user.firstName}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-100"
                  />
                )}
                <span className="hidden text-sm font-medium text-gray-700 sm:block">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
