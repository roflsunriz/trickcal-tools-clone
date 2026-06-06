import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { I18nContext, localeStorageKey, messages, readLocale } from "./i18n";
import type { I18nContextValue, Locale, MessageKey } from "./i18n";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);

  const value = useMemo<I18nContextValue>(() => {
    function setLocale(nextLocale: Locale) {
      setLocaleState(nextLocale);
      localStorage.setItem(localeStorageKey, nextLocale);
    }

    function t(key: MessageKey, values: Record<string, string | number> = {}) {
      let message: string = messages[locale][key];
      for (const [name, replacement] of Object.entries(values)) {
        message = message.replace(`{${name}}`, String(replacement));
      }
      return message;
    }

    return { locale, setLocale, t };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
