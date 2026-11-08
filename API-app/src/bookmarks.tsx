import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Article } from './articles';

const key = 'article-explorer:bookmarks';
type Bookmarks = {
  saved: Article[];
  ready: boolean;
  busy: boolean;
  error: string | null;
  feedback: string | null;
  toggle: (article: Article) => Promise<void>;
  reload: () => void;
};

const Context = createContext<Bookmarks | null>(null);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Article[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const locked = useRef(false);

  async function reload() {
    if (locked.current) return;
    locked.current = true;
    setError(null);
    try {
      const data = await AsyncStorage.getItem(key);
      const articles = data ? JSON.parse(data) : [];
      if (!Array.isArray(articles)) throw new Error('Invalid bookmark data');
      setSaved(articles);
      setReady(true);
    } catch {
      setError('Could not load bookmarks. Try again.');
    } finally {
      locked.current = false;
    }
  }

  useEffect(() => { void reload(); }, []);

  async function toggle(article: Article) {
    if (!ready || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    setFeedback(null);
    const exists = saved.some(item => item.id === article.id);
    const next = exists ? saved.filter(item => item.id !== article.id) : [article, ...saved];
    try {
      await AsyncStorage.setItem(key, JSON.stringify(next));
      setSaved(next);
      setFeedback(exists ? 'Bookmark removed.' : 'Article bookmarked.');
    } catch {
      setError('Could not update bookmarks. Try again.');
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return <Context.Provider value={{ saved, ready, busy, error, feedback, toggle, reload }}>{children}</Context.Provider>;
}

export function useBookmarks() {
  const bookmarks = useContext(Context);
  if (!bookmarks) throw new Error('BookmarkProvider is missing');
  return bookmarks;
}
