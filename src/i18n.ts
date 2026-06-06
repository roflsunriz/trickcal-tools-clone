import { createContext, useContext } from "react";

export type Locale = "ja" | "en";

export const localeStorageKey = "trickcal_locale";

export const messages = {
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
    "sweep.quickSelect.title": "装備セット",
    "sweep.weaponType": "武器種",
    "sweep.physicalWeapon": "物理",
    "sweep.magicWeapon": "魔法",
    "sweep.requiredRanks": "必要Rank",
    "sweep.quickRank": "Rank {rank}",
    "sweep.quickRankTitle": "Rank {rank} の装備セットを選択",
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
    "sweep.quickSelect.title": "Equipment Set",
    "sweep.weaponType": "Weapon",
    "sweep.physicalWeapon": "Physical",
    "sweep.magicWeapon": "Magic",
    "sweep.requiredRanks": "Required Rank",
    "sweep.quickRank": "Rank {rank}",
    "sweep.quickRankTitle": "Select Rank {rank} equipment set",
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

export type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function readLocale(): Locale {
  return localStorage.getItem(localeStorageKey) === "en" ? "en" : "ja";
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}
