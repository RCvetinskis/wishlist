"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = "wishlist-theme";
const THEME_CHANGE_EVENT = "wishlist-theme-change";

function getTheme(): Theme {
  const cookieTheme = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${THEME_STORAGE_KEY}=`))
    ?.split("=")[1];
  if (cookieTheme === "dark" || cookieTheme === "light") return cookieTheme;

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

function setStoredTheme(theme: Theme, cookieDomain?: string) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.cookie = [
    `${THEME_STORAGE_KEY}=${theme}`,
    "Path=/",
    "Max-Age=31536000",
    "SameSite=Lax",
    ...(cookieDomain ? [`Domain=${cookieDomain}`] : []),
  ].join("; ");
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeProvider({
  children,
  initialTheme,
  cookieDomain,
}: {
  children: ReactNode;
  initialTheme: Theme;
  cookieDomain?: string;
}) {
  const theme = useSyncExternalStore<Theme>(
    subscribeToTheme,
    getTheme,
    () => initialTheme,
  );

  const toggleTheme = () => {
    setStoredTheme(theme === "dark" ? "light" : "dark", cookieDomain);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return context;
}
