import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { UsersPage } from '../pages/UsersPage';
import { AddUserPage } from '../pages/AddUserPage';
import { EditUserPage } from '../pages/EditUserPage';
import { LoginPage } from '../pages/LoginPage';
import { BookmarksPage } from '../pages/BookmarksPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <UsersPage /> },
      { path: 'users/new', element: <AddUserPage /> },
      { path: 'users/:id/edit', element: <EditUserPage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'bookmarks',
        element: (
          <ProtectedRoute>
            <BookmarksPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
