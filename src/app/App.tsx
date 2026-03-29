import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthContext';
import { BookmarksProvider } from '../features/bookmarks/BookmarksContext';
import { router } from '../routes';

export function App() {
  return (
    <AuthProvider>
      <BookmarksProvider>
        <RouterProvider router={router} />
      </BookmarksProvider>
    </AuthProvider>
  );
}
