# UserExplorer

A professional React + TypeScript single-page application for browsing, searching, filtering, and managing users via the [DummyJSON API](https://dummyjson.com/docs/users).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| State | React Context + custom hooks |
| HTTP | Fetch API (native) |
| Persistence | localStorage |

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher (comes with Node.js)

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/NellyTuricenco/user-explorer.git
cd user-explorer

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The dev server runs at `http://localhost:5173` by default.

### Other available commands

```bash
# Type-check and build for production (output goes to ./dist)
npm run build

# Preview the production build locally
npm run preview

# Run the linter
npm run lint
```

## Features

- **Users listing** — responsive card grid with avatar, contact info, and gender badge
- **Debounced search** — 300 ms debounce, filtered client-side across name, email, and username
- **Sorting** — sort by name (A-Z / Z-A) or age (youngest / oldest first); selection is persisted in the URL
- **Filtering** — filter by gender (male / female / other), role (admin / moderator / user), and age range (18-25 / 26-35 / 36-50 / 51+); active filters are persisted in URL search params
- **Mobile filters drawer** — animated slide-in panel on small screens with draft state (changes are staged before applying)
- **Pagination** — client-side, 12 users per page; resets to page 1 when search or filters change
- **Add user** — form with client-side validation (required fields, regex checks)
- **Edit user** — pre-filled form fetched by ID
- **Delete user** — confirmation modal, optimistic UI update
- **Mock authentication** — DummyJSON `/auth/login`, persisted to `localStorage`
- **Bookmarks / favourites** — auth-gated, persisted to `localStorage`
- **Toast notifications** — success / error feedback for mutations
- **Protected routes** — `/bookmarks` redirects to `/login` when unauthenticated

### Demo credentials

```
Username: emilys
Password: emilyspass
```

## Folder Structure

```
src/
  app/
    App.tsx              # Root component — wraps providers and router
  components/
    ui/                  # Reusable, stateless primitives
      Button.tsx         # Variant-aware button (primary / secondary / danger / ghost)
      Input.tsx          # Labelled input with error and hint slots
      Badge.tsx          # Coloured pill label
      Modal.tsx          # Accessible dialog with Escape-key + backdrop close
      Drawer.tsx         # Animated slide-in panel (used for mobile filters)
      Spinner.tsx        # Animated SVG spinner
      EmptyState.tsx     # Illustrated placeholder for zero-data views
      ErrorState.tsx     # Error feedback with optional retry action
      Toast.tsx          # Toast + ToastContainer components
      ChevronDownIcon.tsx  # SVG chevron for select dropdowns
      FiltersIcon.tsx      # SVG icon for the mobile filters button
    layout/
      Header.tsx         # Sticky nav: logo, links, auth avatar / sign-in button
      Layout.tsx         # Outlet wrapper + ToastContext provider
  features/
    auth/
      AuthContext.tsx    # AuthProvider + useAuth hook
      useAuth.ts         # Re-export for convenience
    bookmarks/
      BookmarksContext.tsx  # BookmarksProvider + useBookmarks hook
      useBookmarks.ts       # Re-export for convenience
    users/
      useUsers.ts        # Paginated listing + search state
      useUser.ts         # Single user fetch by ID
      components/
        UserCard.tsx     # Card with bookmark, edit, delete actions
        UserForm.tsx     # Controlled form with per-field validation
        SearchBar.tsx    # Search input with clear button
        Pagination.tsx   # Previous / next controls with page info
  pages/
    UsersPage.tsx        # Listing + search + sort + filter + pagination
    AddUserPage.tsx      # Create user form page
    EditUserPage.tsx     # Edit user form page (fetches user by :id)
    LoginPage.tsx        # Credential form + demo credentials hint
    BookmarksPage.tsx    # Bookmarked users grid
  services/
    api.ts               # Generic typed fetch wrapper + ApiError class
    users.service.ts     # User CRUD methods
    auth.service.ts      # Login method
  hooks/
    useDebounce.ts       # Generic debounce hook
    useToast.ts          # Toast queue management
  types/
    user.types.ts        # User, UsersResponse, UserFormData, ValidationErrors
    auth.types.ts        # AuthUser, LoginCredentials, AuthState
  utils/
    validation.ts        # Pure validation functions (user form, login form)
  routes/
    index.tsx            # createBrowserRouter definition
    ProtectedRoute.tsx   # Redirects unauthenticated users to /login
  main.tsx               # ReactDOM.createRoot entry point
```

## Routing

| Path | Component | Auth required |
|---|---|---|
| `/` | UsersPage | No |
| `/users/new` | AddUserPage | No |
| `/users/:id/edit` | EditUserPage | No |
| `/login` | LoginPage | No |
| `/bookmarks` | BookmarksPage | Yes (redirects to /login) |

## State Management

No external state management library is used. State is organised in three layers:

1. **Server state** — `useUser` fetches a single user by ID using `useState` + `useEffect` + `AbortController` for request cancellation. The users listing fetches all records once on mount (and again on sort change), then all search, filter, and pagination logic runs client-side against the cached array.
2. **URL state** — active sort order and filter values (gender, role, age) are persisted in URL search params via React Router's `useSearchParams`, making the current view shareable and bookmarkable.
3. **Global client state** — `AuthContext` (current user) and `BookmarksContext` (bookmarked IDs) use `createContext` + `useReducer`-equivalent patterns and persist to `localStorage`.
4. **UI / ephemeral state** — local `useState` inside components (mobile drawer draft filters, delete confirmation) and the `useToast` hook inside `Layout`.

## Performance Considerations

- `useCallback` and `useMemo` are applied to context values and callbacks that would otherwise trigger child re-renders on every render cycle.
- Search uses a 300 ms debounce to reduce the number of client-side filter passes as the user types.
- The mobile filters drawer stages changes in local draft state and only applies them when the user confirms, avoiding redundant re-renders on each toggle.
- The `AbortController` in `useUser` cancels the in-flight request when the component unmounts or the ID changes, preventing race conditions and stale updates.
- User avatar images use `loading="lazy"` to defer off-screen network requests.
- `useMemo` on context values prevents all consumers from re-rendering when unrelated state changes.

## Security Considerations

- Only a safe subset of the API response (no raw password) is persisted to `localStorage`.
- The `localStorage` value is validated on load before trusting it as an `AuthUser`.
- API errors surface a user-facing message without leaking internal details.
- All user-facing string inputs are trimmed and validated before being sent to the API.

## Tradeoffs and Assumptions

- **DummyJSON is a mock API** — mutations (add, edit, delete) return plausible responses but do not actually persist data. The UI updates its local state optimistically to simulate the expected result.
- **All users are fetched at once** — the listing page fetches all users in a single request so that client-side filtering and sorting can operate over the full dataset. This is acceptable for DummyJSON's dataset size but would not scale to large datasets; a production implementation would push filtering and sorting to the API.
- **No access token refresh** — the stored token is used as-is. In production, token refresh logic and secure cookie storage would be required.
- **Single query parameter for search** — DummyJSON's `/users/search?q=` endpoint searches across multiple fields (name, email, username), so no field-specific filtering is implemented.
- **Bookmarks page loads once** — the bookmark list is fetched once on mount. Removing a bookmark on the Bookmarks page updates local state but does not re-sync with `BookmarksContext` because the page renders the already-fetched users. A more robust solution would derive the list reactively from context.
