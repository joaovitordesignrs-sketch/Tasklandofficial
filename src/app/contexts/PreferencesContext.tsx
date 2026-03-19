import { createContext, useContext, useState, useEffect } from "react";
import { getPreferences, type Language, type Theme } from "../data/preferences";
import { DARK_THEME, LIGHT_THEME, type ThemeTokens } from "../data/tokens";
import { en, ptBr, type TranslationKey } from "../i18n/strings";

interface PreferencesCtx {
  theme: Theme;
  language: Language;
  tokens: ThemeTokens;
  t: (key: TranslationKey) => string;
}

const PreferencesContext = createContext<PreferencesCtx>({
  theme: "dark",
  language: "pt-br",
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
  const strings = prefs.language === "en" ? en : ptBr;
  const t = (key: TranslationKey) => strings[key] ?? en[key] ?? key;

  return (
    <PreferencesContext.Provider value={{ theme: prefs.theme, language: prefs.language, tokens, t }}>
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
