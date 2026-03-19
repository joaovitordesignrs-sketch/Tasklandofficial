import { createContext, useContext, useState, useEffect } from "react";
import { getPreferences, type Theme } from "../data/preferences";
import { DARK_THEME, LIGHT_THEME, type ThemeTokens } from "../data/tokens";
import { en, type TranslationKey } from "../i18n/strings";

interface PreferencesCtx {
  theme: Theme;
  tokens: ThemeTokens;
  t: (key: TranslationKey) => string;
}

const PreferencesContext = createContext<PreferencesCtx>({
  theme: "dark",
  tokens: DARK_THEME,
  t: (k) => k,
});

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState(getPreferences);

  useEffect(() => {
    const handler = () => setPrefs(getPreferences());
    window.addEventListener("rpg-prefs-changed", handler);
    return () => window.removeEventListener("rpg-prefs-changed", handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", prefs.theme);
  }, [prefs.theme]);

  const tokens = prefs.theme === "light" ? LIGHT_THEME : DARK_THEME;
  const t = (key: TranslationKey) => en[key] ?? key;

  return (
    <PreferencesContext.Provider value={{ theme: prefs.theme, tokens, t }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function useTheme(): ThemeTokens {
  return useContext(PreferencesContext).tokens;
}

export function useLanguage(): (key: TranslationKey) => string {
  return useContext(PreferencesContext).t;
}
