import { atom } from 'nanostores';

export type ThemeMode = 'light' | 'dark';

const g = globalThis as any;

const STORAGE_KEY = 'ujg-theme';
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const readStoredTheme = (): ThemeMode | undefined => {
  if (typeof window === 'undefined') return undefined;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Ignore storage failures and fall back to system theme.
  }

  return undefined;
};

const resolveSystemTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia(COLOR_SCHEME_QUERY).matches) {
    return 'dark';
  }
  return 'light';
};

const applyThemeToDocument = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};

const emitThemeChange = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('ujg:theme-change', { detail: theme }));
};

const initialTheme = readStoredTheme() ?? resolveSystemTheme();

export const themeMode = g.__themeModeStore ?? (g.__themeModeStore = atom<ThemeMode>(initialTheme));

export const setThemeMode = (theme: ThemeMode) => {
  themeMode.set(theme);
  applyThemeToDocument(theme);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures.
    }
  }

  emitThemeChange(theme);
};

export const toggleThemeMode = () => setThemeMode(themeMode.get() === 'dark' ? 'light' : 'dark');

export const syncThemeMode = () => {
  const nextTheme = readStoredTheme() ?? resolveSystemTheme();

  if (themeMode.get() !== nextTheme) {
    themeMode.set(nextTheme);
  }

  applyThemeToDocument(nextTheme);
  emitThemeChange(nextTheme);
  return nextTheme;
};

export const watchSystemTheme = () => {
  if (typeof window === 'undefined') return () => {};

  const media = window.matchMedia(COLOR_SCHEME_QUERY);

  const onChange = () => {
    if (readStoredTheme()) return;

    const systemTheme = media.matches ? 'dark' : 'light';
    themeMode.set(systemTheme);
    applyThemeToDocument(systemTheme);
    emitThemeChange(systemTheme);
  };

  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
