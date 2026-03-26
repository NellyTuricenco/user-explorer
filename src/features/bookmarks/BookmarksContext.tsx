import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const BOOKMARKS_STORAGE_KEY = 'ue_bookmarks';

interface BookmarksContextValue {
  bookmarks: Set<number>;
  isBookmarked: (userId: number) => boolean;
  toggleBookmark: (userId: number) => void;
  clearBookmarks: () => void;
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

function loadPersistedBookmarks(): Set<number> {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'number')) {
      return new Set(parsed as number[]);
    }
    return new Set();
  } catch {
    return new Set();
  }
}

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Set<number>>(() =>
    loadPersistedBookmarks()
  );

  useEffect(() => {
    localStorage.setItem(
      BOOKMARKS_STORAGE_KEY,
      JSON.stringify(Array.from(bookmarks))
    );
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (userId: number) => bookmarks.has(userId),
    [bookmarks]
  );

  const toggleBookmark = useCallback((userId: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    setBookmarks(new Set());
  }, []);

  const value = useMemo<BookmarksContextValue>(
    () => ({ bookmarks, isBookmarked, toggleBookmark, clearBookmarks }),
    [bookmarks, isBookmarked, toggleBookmark, clearBookmarks]
  );

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used inside BookmarksProvider');
  return ctx;
}
