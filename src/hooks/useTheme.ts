import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "sekaishi-anki:theme";

function resolveTheme(
  saved: Theme | "system" | null,
  prefersDark: boolean,
): Theme {
  if (saved === "light" || saved === "dark") return saved;
  if (saved === "system") return prefersDark ? "dark" : "light";
  return prefersDark ? "dark" : "light";
}

function getInitialTheme(profileTheme?: "light" | "dark" | "system"): Theme {
  if (typeof window === "undefined") return "light";
  const prefersDark =
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

  if (profileTheme) {
    return resolveTheme(profileTheme, prefersDark);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return prefersDark ? "dark" : "light";
}

export function useTheme(profileTheme?: "light" | "dark" | "system") {
  const [theme, setThemeState] = useState<Theme>(() =>
    getInitialTheme(profileTheme),
  );

  useEffect(() => {
    if (profileTheme) {
      setThemeState(getInitialTheme(profileTheme));
    }
  }, [profileTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggle };
}
