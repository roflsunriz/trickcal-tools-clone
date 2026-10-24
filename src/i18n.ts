import { createContext, useContext } from "react";

export type Locale = "ja" | "en";

export const localeStorageKey = "trickcal_locale";

export const messages = {
  ja: {
    "app.tools": "ツール",
    "app.theme.toggle": "テーマ切替",
    "app.locale.toggle": "言語切替",
    "footer.description": "トリッカルの非公式ツール集",
    "footer.legal": "ポリシーとお問い合わせ",
    "footer.privacy": "プライバシーポリシー",
    "footer.terms": "利用規約",
    "footer.contact": "お問い合わせ",
    "cloud.login": "Googleでログイン",
    "cloud.logout": "Googleからログアウト",
    "cloud.sync": "Google Driveへ同期",
    "cloud.syncing": "同期中",
    "cloud.syncedAt": "同期済み {time}",
    "cloud.unconfigured": "GoogleログインにはClient IDの設定が必要です。",
    "cloud.error.loginFailed": "Googleログインに失敗しました。ポップアップとOAuth設定を確認してください。",
    "cloud.error.syncFailed": "Google Driveとの同期に失敗しました。再度同期してください。",
    "cloud.error.sessionExpired": "認証期限が切れました。もう一度Googleでログインしてください。",
    "cloud.error.invalidBackup": "Google Driveの保存データが不正なため、自動適用しませんでした。",
    "tool.sweep.label": "スイープツール",
    "tool.sweep.description": "素材から必要ステージを計算します。",
    "tool.board.label": "クレヨンボード",
    "tool.board.description": "使徒の所持状況とボード開放を管理します。",
    "tool.food.label": "食べ物の好み",
    "tool.food.description": "使徒と料理から好みを相互検索します。",
    "sweep.heading.title": "スイープツール",
    "sweep.heading.description": "素材を選ぶと、消費スタミナを抑えやすい周回ステージを計算します。",
    "sweep.selectionCount": "{count} selected",
    "sweep.catalog.aria": "素材カタログ",
    "sweep.catalog.title": "素材カタログ",
    "sweep.clear": "クリア",
    "sweep.search.placeholder": "素材名で検索",
    "sweep.quickSelect.title": "装備セット",
    "sweep.weaponType": "武器種",
    "sweep.physicalWeapon": "物理",
    "sweep.magicWeapon": "魔法",
    "sweep.requiredRanks": "必要Rank",
    "sweep.quickRank": "Rank {rank}",
    "sweep.quickRankTitle": "Rank {rank} の装備セットを選択",
    "sweep.allRanks": "全 Rank",
    "sweep.plan.aria": "周回プラン",
    "sweep.plan.title": "最適プラン",
    "sweep.empty": "素材が選択されていません。",
    "sweep.planSummary": "ステージ / 推定 {stamina} スタミナ",
    "sweep.missing": "{count} 個の素材がステージに一致しません。",
    "sweep.stageStamina": "10 スタミナ",
    "sweep.removeSelection": "選択解除",
    "sweep.alternatives": "副産物を狙う場合",
    "board.heading.title": "クレヨンボード",
    "board.heading.description":
      "使徒の所持状況と特殊マスの開放を記録し、必要な金クレヨンと全体ボーナスを確認できます。",
    "board.reset": "記録をリセット",
    "board.resetConfirm": "クレヨンボードの所持・開放記録をすべて消去しますか？",
    "board.layers": "ボード層",
    "board.layer": "第{layer}層",
    "board.activated": "開放済み",
    "board.layerBonus": "層の合計ボーナス",
    "board.cell.attack": "攻撃力",
    "board.cell.crit": "会心",
    "board.cell.hp": "HP",
    "board.cell.critResist": "会心抵抗",
    "board.cell.defense": "防御力",
    "board.characterCount": "{count}使徒を収録",
    "board.cellCost": "1マス {count}本",
    "board.owned": "所持",
    "board.notOwned": "未所持",
    "board.overview": "全体状況",
    "board.ownedCharacters": "所持使徒",
    "board.allActivated": "全層の開放マス",
    "board.allBonus": "全層の合計ボーナス",
    "board.resources": "必要資源",
    "board.currentNeeded": "現在層の残り金クレヨン",
    "board.allNeeded": "全層の残り金クレヨン",
    "food.heading.title": "食べ物の好み",
    "food.heading.description": "使徒を選ぶと好物を、料理を選ぶと好む使徒を絞り込めます。",
    "food.clear": "選択を解除",
    "food.characters": "使徒",
    "food.foods": "料理",
    "food.searchCharacter": "使徒名で検索",
    "food.searchFood": "料理名で検索",
    "food.preference.veryLike": "大好物",
    "food.preference.like": "好物",
    "food.preference.dislike": "苦手",
    "food.rarity.common": "普通",
    "food.rarity.uncommon": "高級",
    "food.rarity.rare": "希少",
    "food.rarity.legendary": "伝説",
    "food.unconfirmed": "未確認",
    "food.noData": "この使徒の好みは情報源で未確認です。",
    "legal.updated": "制定・最終更新: 2026年10月24日",
    "legal.resources": "関連情報",
    "legal.googlePolicy": "Google APIサービスのユーザーデータに関するポリシー",
    "legal.googlePrivacy": "Googleプライバシーポリシー",
    "legal.contact.title": "お問い合わせ",
    "legal.contact.body":
      "本サービス、データの取扱い、または本規約に関するお問い合わせは、公開されているGitHub Issuesで受け付けます。個人情報やアクセストークンは投稿しないでください。",
    "legal.contact.issues": "GitHub Issuesを開く",
    "legal.privacy.title": "プライバシーポリシー",
    "legal.privacy.summary": "Trickcal Toolsにおける端末内データとGoogle Drive同期データの取扱いを説明します。",
    "legal.privacy.scope.title": "適用範囲",
    "legal.privacy.scope.body":
      "本ポリシーは、Trickcal Tools（以下「本サービス」）のWebサイトと、任意で利用できるGoogle Drive同期機能に適用されます。本サービスはゲーム運営会社およびGoogleが提供・運営するサービスではありません。",
    "legal.privacy.data.title": "取り扱うデータ",
    "legal.privacy.data.local":
      "端末内の設定: 選択した素材・装備ランク、クレヨンボードの記録、食べ物の検索・選択、表示言語、テーマ、更新時刻をブラウザのlocalStorageへ保存します。",
    "legal.privacy.data.googleAccount":
      "Googleログイン情報: 利用者が同期を有効にした場合、表示名、メールアドレス、プロフィール画像URL、短期間有効なOAuthアクセストークンと有効期限を端末内に保存します。",
    "legal.privacy.data.drive":
      "同期データ: 端末内設定のコピーを、利用者自身のGoogle Driveにある非表示のアプリ専用領域appDataFolderへ保存します。",
    "legal.privacy.purpose.title": "利用目的",
    "legal.privacy.purpose.account": "ログイン中のGoogleアカウントを画面上で識別するため。",
    "legal.privacy.purpose.sync": "複数端末間で設定を保存・復元し、新しい更新を同期するため。",
    "legal.privacy.purpose.support": "障害の調査、安全性の確保、お問い合わせへ対応するため。",
    "legal.privacy.storage.title": "保存場所と通信",
    "legal.privacy.storage.body":
      "端末内データと認証情報は利用者のブラウザに保存されます。同期時は利用者のブラウザからGoogle Identity ServicesおよびGoogle Drive APIへ直接通信します。",
    "legal.privacy.storage.noServer":
      "本サービスは静的なGitHub Pagesとして配信され、運営者独自のサーバーやデータベースへGoogleユーザーデータを送信・保存しません。",
    "legal.privacy.google.title": "Googleユーザーデータへのアクセス",
    "legal.privacy.google.scope":
      "本サービスが要求する権限はdrive.appdataのみです。本サービスは通常のマイドライブにあるファイルの一覧表示、読取り、変更、共有を行えません。",
    "legal.privacy.google.limitedUse":
      "Google APIから受け取った情報の利用および他サービスへの転送は、Google API Services User Data Policy（Limited Use要件を含む）に従います。",
    "legal.privacy.sharing.title": "第三者提供と販売",
    "legal.privacy.sharing.body":
      "本サービスはGoogleユーザーデータを販売しません。同期機能の提供に必要なGoogleのサービスを除き、広告、プロファイリング、信用評価などを目的として第三者へ提供しません。法令に基づく要請または本サービスと利用者の安全を守るために必要な場合を除きます。",
    "legal.privacy.retention.title": "保存期間と利用者による管理",
    "legal.privacy.retention.local":
      "端末内データは、利用者が各ツールで記録を消去するか、ブラウザのサイトデータを削除するまで保持されます。",
    "legal.privacy.retention.logout":
      "Googleからログアウトするとアクセストークンを失効させ、端末内の認証情報を削除します。ツールの設定とDrive上のバックアップは、誤消去を防ぐためログアウトだけでは削除しません。",
    "legal.privacy.retention.google":
      "Googleアカウントのサードパーティ接続設定から本サービスのアクセス権を取り消せます。Google側に保存されたデータの保持と削除にはGoogleの管理機能とポリシーが適用されます。",
    "legal.privacy.security.title": "安全管理",
    "legal.privacy.security.body":
      "本サービスはClient Secretとrefresh tokenを扱わず、短期間有効なアクセストークンだけを使用します。入力値、同期データの形式、サイズ、有効期限を検証します。ただし、インターネット上の通信または端末内保存の完全な安全性を保証することはできません。",
    "legal.privacy.services.title": "外部サービス",
    "legal.privacy.services.body":
      "サイト配信にはGitHub Pages、任意のログインと同期にはGoogle Identity ServicesおよびGoogle Drive APIを使用します。それぞれのサービスによる情報の取扱いには、各提供者の規約とプライバシーポリシーが適用されます。本サービス独自の広告・行動分析機能は使用していません。",
    "legal.privacy.changes.title": "ポリシーの変更",
    "legal.privacy.changes.body":
      "機能または法令・ポリシーの変更に応じて本ポリシーを更新する場合があります。重要な変更は、本ページの最終更新日と変更履歴で示します。",
    "legal.terms.title": "利用規約",
    "legal.terms.summary": "Trickcal Toolsを利用する際の条件と責任範囲を説明します。",
    "legal.terms.acceptance.title": "規約への同意",
    "legal.terms.acceptance.body":
      "本サービスを利用することで、本規約とプライバシーポリシーに同意したものとします。同意できない場合は、本サービスとGoogle Drive同期機能を利用しないでください。",
    "legal.terms.service.title": "サービスの内容",
    "legal.terms.service.body":
      "本サービスは、ゲーム内素材の周回計画、クレヨンボードの記録、食べ物の好みの検索、および任意のGoogle Drive同期を提供する非公式ツールです。ゲーム運営会社およびGoogleとの提携、承認、後援を示すものではありません。",
    "legal.terms.google.title": "Google連携",
    "legal.terms.google.body":
      "Google Drive同期の利用には、利用者自身のGoogleアカウントと権限付与が必要です。利用者はいつでもログアウトまたはGoogleアカウント設定からアクセス権を取り消せます。Googleサービスの利用にはGoogleの規約が適用されます。",
    "legal.terms.use.title": "利用者の責任",
    "legal.terms.use.lawful": "法令、本規約、および第三者の権利に反しない範囲で利用すること。",
    "legal.terms.use.security":
      "本サービスの妨害、不正アクセス、脆弱性の悪用、他者のアカウントまたはデータへのアクセスを試みないこと。",
    "legal.terms.use.account": "自身の端末、ブラウザ、Googleアカウントを適切に管理すること。",
    "legal.terms.rights.title": "知的財産権と出典",
    "legal.terms.rights.body":
      "本サービス独自のコードと文書にはリポジトリ記載のMITライセンスが適用されます。ゲームの名称、データ、画像などの権利は各権利者に帰属します。データの出典は公開リポジトリのREADMEに示します。",
    "legal.terms.availability.title": "変更・停止",
    "legal.terms.availability.body":
      "保守、障害、外部サービスや情報源の変更などにより、本サービスの全部または一部を予告なく変更・中断・終了する場合があります。保存が必要な情報は利用者自身でも管理してください。",
    "legal.terms.disclaimer.title": "免責",
    "legal.terms.disclaimer.body":
      "本サービスは現状有姿で提供され、情報の正確性、完全性、継続性、特定目的への適合性を保証しません。法令で認められる範囲で、本サービスの利用または利用不能によって生じた損害について運営者は責任を負いません。",
    "legal.terms.changes.title": "規約の変更",
    "legal.terms.changes.body":
      "機能または運用の変更に応じて本規約を更新する場合があります。重要な変更は、本ページの最終更新日と変更履歴で示します。変更後も本サービスを利用した場合、変更後の規約に同意したものとします。",
  },
  en: {
    "app.tools": "Tools",
    "app.theme.toggle": "Toggle theme",
    "app.locale.toggle": "Switch language",
    "footer.description": "Unofficial tools for Trickcal",
    "footer.legal": "Policies and contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.contact": "Contact",
    "cloud.login": "Sign in with Google",
    "cloud.logout": "Sign out from Google",
    "cloud.sync": "Sync with Google Drive",
    "cloud.syncing": "Syncing",
    "cloud.syncedAt": "Synced {time}",
    "cloud.unconfigured": "A Google OAuth client ID is required to enable sign-in.",
    "cloud.error.loginFailed": "Google sign-in failed. Check the popup and OAuth settings.",
    "cloud.error.syncFailed": "Google Drive sync failed. Try syncing again.",
    "cloud.error.sessionExpired": "Authorization expired. Sign in with Google again.",
    "cloud.error.invalidBackup": "The Google Drive backup is invalid and was not applied.",
    "tool.sweep.label": "Sweep Tool",
    "tool.sweep.description": "Find the stages needed for selected materials.",
    "tool.board.label": "Crayon Board",
    "tool.board.description": "Track owned apostles and unlocked board cells.",
    "tool.food.label": "Food Preferences",
    "tool.food.description": "Look up preferences by apostle or food.",
    "sweep.heading.title": "Sweep Tool",
    "sweep.heading.description": "Select materials to calculate a stamina-efficient sweep plan.",
    "sweep.selectionCount": "{count} selected",
    "sweep.catalog.aria": "Material catalog",
    "sweep.catalog.title": "Material Catalog",
    "sweep.clear": "Clear",
    "sweep.search.placeholder": "Search materials",
    "sweep.quickSelect.title": "Equipment Set",
    "sweep.weaponType": "Weapon",
    "sweep.physicalWeapon": "Physical",
    "sweep.magicWeapon": "Magic",
    "sweep.requiredRanks": "Required Rank",
    "sweep.quickRank": "Rank {rank}",
    "sweep.quickRankTitle": "Select Rank {rank} equipment set",
    "sweep.allRanks": "All Ranks",
    "sweep.plan.aria": "Sweep plan",
    "sweep.plan.title": "Best Plan",
    "sweep.empty": "No materials selected.",
    "sweep.planSummary": "stages / estimated {stamina} stamina",
    "sweep.missing": "{count} materials do not match any stage.",
    "sweep.stageStamina": "10 stamina",
    "sweep.removeSelection": "Remove selection",
    "sweep.alternatives": "Alternative stages for side drops",
    "board.heading.title": "Crayon Board",
    "board.heading.description":
      "Track apostles and special cells, then review remaining golden crayons and account-wide bonuses.",
    "board.reset": "Reset records",
    "board.resetConfirm": "Clear all owned-apostle and board-cell records?",
    "board.layers": "Board layers",
    "board.layer": "Layer {layer}",
    "board.activated": "Unlocked",
    "board.layerBonus": "Layer bonus",
    "board.cell.attack": "Attack",
    "board.cell.crit": "Critical",
    "board.cell.hp": "HP",
    "board.cell.critResist": "Critical resist",
    "board.cell.defense": "Defense",
    "board.characterCount": "{count} apostles",
    "board.cellCost": "{count} per cell",
    "board.owned": "Owned",
    "board.notOwned": "Not owned",
    "board.overview": "Overview",
    "board.ownedCharacters": "Owned apostles",
    "board.allActivated": "All unlocked cells",
    "board.allBonus": "Total bonus",
    "board.resources": "Resources",
    "board.currentNeeded": "Crayons left for this layer",
    "board.allNeeded": "Crayons left for all layers",
    "food.heading.title": "Food Preferences",
    "food.heading.description": "Choose an apostle to see foods, or choose a food to find apostles.",
    "food.clear": "Clear selection",
    "food.characters": "Apostles",
    "food.foods": "Foods",
    "food.searchCharacter": "Search apostles",
    "food.searchFood": "Search foods",
    "food.preference.veryLike": "Favorite",
    "food.preference.like": "Likes",
    "food.preference.dislike": "Dislikes",
    "food.rarity.common": "Common",
    "food.rarity.uncommon": "Uncommon",
    "food.rarity.rare": "Rare",
    "food.rarity.legendary": "Legendary",
    "food.unconfirmed": "Unconfirmed",
    "food.noData": "This apostle's preferences are not confirmed by the source.",
    "legal.updated": "Effective and last updated: October 24, 2026",
    "legal.resources": "Related information",
    "legal.googlePolicy": "Google API Services User Data Policy",
    "legal.googlePrivacy": "Google Privacy Policy",
    "legal.contact.title": "Contact",
    "legal.contact.body":
      "Questions about the Service, its data practices, or these terms may be submitted through the public GitHub Issues page. Do not include personal information or access tokens in an issue.",
    "legal.contact.issues": "Open GitHub Issues",
    "legal.privacy.title": "Privacy Policy",
    "legal.privacy.summary":
      "This policy explains how Trickcal Tools handles local data and optional Google Drive sync data.",
    "legal.privacy.scope.title": "Scope",
    "legal.privacy.scope.body":
      'This policy applies to the Trickcal Tools website (the "Service") and its optional Google Drive sync feature. The Service is not provided or operated by the game publisher or Google.',
    "legal.privacy.data.title": "Data we handle",
    "legal.privacy.data.local":
      "Local settings: selected materials and equipment ranks, Crayon Board records, food searches and selections, language, theme, and update time are stored in your browser's localStorage.",
    "legal.privacy.data.googleAccount":
      "Google sign-in data: if you enable sync, your display name, email address, profile image URL, short-lived OAuth access token, and its expiration time are stored locally on your device.",
    "legal.privacy.data.drive":
      "Sync data: a copy of your local settings is stored in the hidden appDataFolder area of your own Google Drive.",
    "legal.privacy.purpose.title": "How we use data",
    "legal.privacy.purpose.account": "To identify the signed-in Google Account in the interface.",
    "legal.privacy.purpose.sync": "To save, restore, and synchronize newer settings across devices.",
    "legal.privacy.purpose.support": "To investigate failures, maintain security, and respond to support requests.",
    "legal.privacy.storage.title": "Storage and transmission",
    "legal.privacy.storage.body":
      "Local settings and authorization data are stored in your browser. During sync, your browser communicates directly with Google Identity Services and the Google Drive API.",
    "legal.privacy.storage.noServer":
      "The Service is delivered as a static GitHub Pages site. Google user data is not sent to or stored in a server or database operated by us.",
    "legal.privacy.google.title": "Access to Google user data",
    "legal.privacy.google.scope":
      "The Service requests only the drive.appdata scope. It cannot list, read, modify, or share files in your regular My Drive.",
    "legal.privacy.google.limitedUse":
      "The Service's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
    "legal.privacy.sharing.title": "Sharing and sale",
    "legal.privacy.sharing.body":
      "The Service does not sell Google user data. It does not disclose such data for advertising, profiling, or credit assessment, except to Google services required to provide sync, when legally required, or when necessary to protect the Service and its users.",
    "legal.privacy.retention.title": "Retention and your controls",
    "legal.privacy.retention.local":
      "Local data remains until you clear records in a tool or delete this site's data in your browser.",
    "legal.privacy.retention.logout":
      "Signing out revokes the access token and removes local authorization data. Tool settings and the Drive backup are not deleted by sign-out to prevent accidental data loss.",
    "legal.privacy.retention.google":
      "You can revoke the Service's access from your Google Account's third-party connections settings. Google's controls and policies apply to retention and deletion of data stored by Google.",
    "legal.privacy.security.title": "Security",
    "legal.privacy.security.body":
      "The Service does not use a Client Secret or refresh token and uses only a short-lived access token. It validates the format, size, and expiration of sync data and authorization data. No internet transmission or local storage method can be guaranteed completely secure.",
    "legal.privacy.services.title": "Third-party services",
    "legal.privacy.services.body":
      "The Service uses GitHub Pages for hosting and, when you opt in, Google Identity Services and the Google Drive API for sign-in and sync. Each provider's terms and privacy policy apply to its processing. The Service does not include its own advertising or behavioral analytics.",
    "legal.privacy.changes.title": "Changes to this policy",
    "legal.privacy.changes.body":
      "We may update this policy when features, laws, or platform policies change. Material changes will be identified by the last-updated date on this page and in the changelog.",
    "legal.terms.title": "Terms of Service",
    "legal.terms.summary": "These terms explain the conditions and responsibilities for using Trickcal Tools.",
    "legal.terms.acceptance.title": "Acceptance",
    "legal.terms.acceptance.body":
      "By using the Service, you agree to these Terms and the Privacy Policy. If you do not agree, do not use the Service or its Google Drive sync feature.",
    "legal.terms.service.title": "The Service",
    "legal.terms.service.body":
      "The Service is an unofficial tool for planning material sweeps, tracking the Crayon Board, searching food preferences, and optionally syncing settings with Google Drive. It is not affiliated with, endorsed by, or sponsored by the game publisher or Google.",
    "legal.terms.google.title": "Google integration",
    "legal.terms.google.body":
      "Google Drive sync requires your own Google Account and authorization. You may sign out or revoke access in your Google Account settings at any time. Google's terms apply to your use of Google services.",
    "legal.terms.use.title": "Your responsibilities",
    "legal.terms.use.lawful":
      "Use the Service only in compliance with applicable laws, these Terms, and third-party rights.",
    "legal.terms.use.security":
      "Do not disrupt the Service, gain unauthorized access, exploit vulnerabilities, or attempt to access another person's account or data.",
    "legal.terms.use.account": "Keep your device, browser, and Google Account secure.",
    "legal.terms.rights.title": "Intellectual property and sources",
    "legal.terms.rights.body":
      "The repository's MIT License applies to original code and documentation. Rights in game names, data, images, and other third-party materials remain with their respective owners. Data sources are identified in the public repository README.",
    "legal.terms.availability.title": "Changes and availability",
    "legal.terms.availability.body":
      "We may change, interrupt, or discontinue all or part of the Service without notice due to maintenance, failures, or changes to external services and sources. Keep your own copy of any information you need.",
    "legal.terms.disclaimer.title": "Disclaimer",
    "legal.terms.disclaimer.body":
      'The Service is provided "as is" without warranties of accuracy, completeness, availability, or fitness for a particular purpose. To the extent permitted by law, the operator is not liable for losses arising from use of or inability to use the Service.',
    "legal.terms.changes.title": "Changes to these terms",
    "legal.terms.changes.body":
      "We may update these Terms as features or operations change. Material changes will be identified by the last-updated date on this page and in the changelog. Continued use after an update constitutes acceptance of the revised Terms.",
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
