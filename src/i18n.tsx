import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Locale = "ja" | "en";

const localeStorageKey = "trickcal_locale";

const messages = {
  ja: {
    "app.tools": "ツール",
    "app.theme.toggle": "テーマ切替",
    "app.locale.toggle": "言語切替",
    "tool.sweep.label": "スイープツール",
    "tool.sweep.description": "素材から必要ステージを計算します。",
    "sweep.heading.title": "スイープツール",
    "sweep.heading.description": "素材を選ぶと、消費スタミナを抑えやすい周回ステージを計算します。",
    "sweep.selectionCount": "{count} selected",
    "sweep.catalog.aria": "素材カタログ",
    "sweep.catalog.title": "素材カタログ",
    "sweep.clear": "クリア",
    "sweep.pages": "ページ",
    "sweep.search.placeholder": "素材名で検索",
    "sweep.rankFilter": "Rank フィルター",
    "sweep.allRanks": "全 Rank",
    "sweep.plan.aria": "周回プラン",
    "sweep.plan.title": "最適プラン",
    "sweep.empty": "素材が選択されていません。",
    "sweep.planSummary": "ステージ / 推定 {stamina} スタミナ",
    "sweep.missing": "{count} 個の素材がステージに一致しません。",
    "sweep.stageStamina": "10 スタミナ",
    "sweep.removeSelection": "選択解除",
    "sweep.alternatives": "副産物を狙う場合",
  },
  en: {
    "app.tools": "Tools",
    "app.theme.toggle": "Toggle theme",
    "app.locale.toggle": "Switch language",
    "tool.sweep.label": "Sweep Tool",
    "tool.sweep.description": "Find the stages needed for selected materials.",
    "sweep.heading.title": "Sweep Tool",
    "sweep.heading.description": "Select materials to calculate a stamina-efficient sweep plan.",
    "sweep.selectionCount": "{count} selected",
    "sweep.catalog.aria": "Material catalog",
    "sweep.catalog.title": "Material Catalog",
    "sweep.clear": "Clear",
    "sweep.pages": "Pages",
    "sweep.search.placeholder": "Search materials",
    "sweep.rankFilter": "Rank Filter",
    "sweep.allRanks": "All Ranks",
    "sweep.plan.aria": "Sweep plan",
    "sweep.plan.title": "Best Plan",
    "sweep.empty": "No materials selected.",
    "sweep.planSummary": "stages / estimated {stamina} stamina",
    "sweep.missing": "{count} materials do not match any stage.",
    "sweep.stageStamina": "10 stamina",
    "sweep.removeSelection": "Remove selection",
    "sweep.alternatives": "Alternative stages for side drops",
  },
} as const;

export type MessageKey = keyof (typeof messages)["ja"];

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readLocale(): Locale {
  return localStorage.getItem(localeStorageKey) === "en" ? "en" : "ja";
}

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

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}
