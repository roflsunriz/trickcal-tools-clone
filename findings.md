# 調査知見

- 装備ドロップ表は通常HTMLに含まれず、`lazy-accordion-container` の属性から公開部分取得URLを組み立てる。2026-10-23時点の属性とqueryは `document-stack`→`documentStack`、`parent-part-path`→`parentPartPath`、`source-hash`→`sourceHash`、`html-hash`→`htmlHash` であり、行番号やhashを固定しない。取得HTMLは出典・wiki更新日時付きfixtureとして保存し、CIからwikiへ接続しない。
- wikiコードは「rank + 装備種別」を表す。`equipmentByRank` と保存済み選択が使う `material-NNN` を表示名変更に合わせて振り直さない。
- 出典表はworld 3以降・rank 2以上だけ。rank 1とworld 1/2の既存dataを表から再生成しない。
- 2026-09-11の表は10-5で設計図と副産物を逆にして重複する。同一素材集合だけ統合し、異なる集合の重複や既存stage欠落はエラーにする。
- Pages公開ではアプリのBunとは別にActions自体のNode警告も確認する。公開成功はCI、deploy、公開asset反映を分けて判定する。
- 周回ツールの保存形式v3は素材数量・ランク絞り込みに加え、装備セットの武器種と必要ランクを保存する。v2からは既存選択を保持して強制移行し、手動で素材を変えた場合は内容と食い違う必要ランクの強調を解除する。
- 最適プランはデスクトップでステージを2列、560px以下で1列にする。素材は短い行で示し、副産物候補は初期状態で閉じる。高さが画面を超える場合だけデスクトップのプラン本文を内部スクロールさせる。
- 最適プランの素材ボタンは共通のテーマ対応ボタン配色へ含め、素材名に `--text` を使う。表示用classを変更する場合は共通selectorも同時に更新し、ブラウザ既定の白背景へ戻さない。
- クレヨン補完元のボードマネージャーは、各 `.char-card` に使徒属性と2・3・4個の特殊マスを持つ。2026-10-23時点で82使徒。種類は攻撃・会心・HP・抵抗・防御へ限定して検証し、欠落や未知値では生成しない。
- wiki「宴会場」の好物早見表は使徒列、特別料理1列、区切り列、好物4列、区切り列、苦手4列の計12セル。背景色は料理レアリティを表す。半角・全角括弧を正規化してボード名と照合し、2026-10-23時点で76使徒・60料理を生成する。情報がないボード使徒は削除せず未確認として表示する。
- 元サイト `trickcal.nossite.com` の公開JSONは2026-10-23確認時にクレヨン65使徒・好み58使徒。追加使徒を含む正本は生成済み `src/tools/community/data.json` とし、縮約fixtureのSHA-256と出典URLを同ファイルへ記録する。
- 補完元の `assets/icons/<使徒名>.png` は82使徒すべて存在する。料理画像はwiki好物表の `::icon/48:0`〜`48:4` の5枚の200px WebPスプライトと、50px刻みの `left`・`top` から再現できる。更新時は87画像のContent-Type、PNG／WebP signature、SHA-256を検証し、`public/assets/community/manifest.json` を正本にする。
- 静的GitHub PagesのGoogle同期はGIS token modelとDrive `appDataFolder` を使う。ブラウザtoken modelのaccess tokenは短命で、期限切れ後の取得はユーザー操作が必要なため、有効期限内だけlocalStorageから復元し、期限切れ時は再ログインを案内する。Client Secret・refresh tokenは静的クライアントで扱わない。
- Google同期の対象は周回v3、クレヨンv1、言語、テーマの4キーに限定する。Drive復元値はschema、時刻、全キー、各1MB上限を検証し、新しい更新時刻だけを自動適用する。Drive APIの401は保存済み認証を破棄し、その他の失敗では端末内データを維持する。
- 本番OAuthにはDrive APIを有効化したWeb Client IDと、`https://roflsunriz.github.io` の承認済みJavaScript生成元が必要。PagesはGitHub変数 `GOOGLE_CLIENT_ID` を `VITE_GOOGLE_CLIENT_ID` へ渡し、未設定時はログインを無効化して設定不足を表示する。
- 2026-10-23にWeb Client IDのJSONをローカルで検証し、本番生成元 `https://roflsunriz.github.io`、開発生成元 `http://127.0.0.1:5173`、空のリダイレクトURIを確認した。Client IDだけをGitHub変数 `GOOGLE_CLIENT_ID` へ登録し、Client Secretは読込出力・repository・GitHub変数へ保存しない。
- OAuth同意画面のアプリ名は個別Client ID名ではなく、Google Auth Platformの同一CloudプロジェクトにあるBranding設定から表示される。既存アプリ「Mylist Backup Service」と同じプロジェクトではその名称になるため、既存アプリを維持するなら本ツール用プロジェクトを分ける。既存プロジェクトを本ツール専用へ転用する場合だけBranding名・ホーム・プライバシーポリシー等を変更する。根拠はGoogle公式のBrand Verification資料（2026-10-23確認）。
- OAuthクライアントを別プロジェクトへ切り替える場合、localStorageの認証形式にClient IDを保存して一致を検証する。旧Client IDのtokenと同意記録は破棄し、端末内の周回・クレヨン等のデータだけを新しい `appDataFolder` へ初回同期する。
