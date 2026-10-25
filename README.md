# Trickcal Tools Clone

トリッカルの周回計画、Rank 1から9までの一括育成、クレヨンボード、食べ物の好みをまとめて確認できる非公式ツール集です。日本語・英語に対応しています。

- [周回ツールを開く](https://roflsunriz.github.io/trickcal-tools-clone/sweep/)
- [ランク一括育成を開く](https://roflsunriz.github.io/trickcal-tools-clone/rank-up/)
- [クレヨンボードを開く](https://roflsunriz.github.io/trickcal-tools-clone/board/)
- [食べ物の好みを開く](https://roflsunriz.github.io/trickcal-tools-clone/food/)
- [攻略資料・文字起こしを開く](https://roflsunriz.github.io/trickcal-data/)
- [プライバシーポリシー](https://roflsunriz.github.io/trickcal-tools-clone/privacy/)・[利用規約](https://roflsunriz.github.io/trickcal-tools-clone/terms/)

## 使い方

1. 集めたい素材をクリックして選びます。検索やランク絞り込みで素材を探せます。
2. 装備一式を集める場合は、物理・魔法武器を選び、クイック選択の目標ランクを押します。
3. 表示された周回ステージと、必要な場合だけ副産物候補を開いて確認します。素材、絞り込み、装備セットの武器種・必要ランクはブラウザに保存され、再読み込み後も選択色とともに復元されます。

ワールド1〜32、ランク1〜9を収録しています。ワールド31・32ではランク9の素材を2種類ずつ集められます。

### ランク一括育成

物理または魔法を選ぶと、1使徒をRank 1からRank 9まで育てるためのステージと周回回数をRank別に表示します。wiki記載の体感ドロップ率70〜80%の中間値である75%を目安にし、各ステージには70〜80%の回数幅と全ドロップ成功時の最小回数も併記します。

Rank 2への昇格に使うRank 1装備は高ランク周回の副産物で集まりやすいため、専用周回から除外します。Rank 3装備に必要なRank 2設計図は計画に含みます。ドロップは確率のため、各Rankを作成した時点で所持数を確認し、不足分だけ追加周回してください。

同じページで、世界樹聖画レベル1〜30、供物量研究0〜12段階、自然回復、定時メール、デイリーショップ、デイリーキャンディの供物、エリーフ購入0〜10回を選び、1日あたりのキャンディ内訳と育成日数を計算できます。4つの日次入手条件は横並びのチェックボックスで切り替えられます。全使徒は収録中の82使徒をwikiの攻撃タイプに従って物理44・魔法38に分けて合算します。

日数は所持素材0、75%ドロップ目安、キャンディを装備周回だけに使用し、自然回復を溢れさせず、供物を蓄積上限前に回収する理論値です。イベントや教主レベルアップなどの不定期入手は含みません。サブスクは即時300、毎日120、31日目200の合計4,220を31日平均へ換算します。

### クレヨンボード

1. 第1〜3層と、攻撃力・会心・HP・会心抵抗・防御力のマスを選びます。
2. 使徒カードを押して特殊マスを開放済みにし、カード下部で所持・未所持を記録します。
3. 層別・全層の開放率、全体ボーナス、残りの金クレヨンを確認します。記録はブラウザへ保存されます。

2026年10月23日時点の補完元にある82使徒を収録し、元サイトの公開データ後に追加されたグウィン、コミー（水着）、レーテーなども含みます。

### 食べ物の好み

使徒を選ぶと大好物・好物・苦手な料理だけに絞り込まれます。料理を選ぶと、その料理に反応する使徒を逆引きできます。76使徒・60料理を収録し、情報源で未確認の使徒は未確認と表示します。

英語表示では、クレヨンボードの使徒名・性格・種族・配置と、食べ物画面の使徒名・性格・料理名も英語へ切り替わります。検索は表示言語にかかわらず日本語名・英語名の両方に対応します。

使徒・料理の検索文字と選択状態はブラウザへ保存されます。Googleログイン中はほかのツール設定と一緒にDriveへ自動同期され、再読み込み後や別ブラウザでも復元されます。

使徒画像82点と料理画像に使うwikiスプライト5点をリポジトリへ同梱しています。通常利用時に画像元サイトへ接続しません。

## Google Driveへの保存

ヘッダーの「Googleでログイン」から、周回ツール、クレヨンボード、食べ物の検索・選択状態、言語、テーマの設定をGoogle Driveの非表示領域 `appDataFolder` へ保存できます。アプリ専用領域だけを扱う `drive.appdata` 権限を使用し、通常のマイドライブ内のファイルは読み書きしません。

Googleが発行したアクセストークンの有効期限内は、ページを再読み込みしてもログイン状態を復元して自動同期します。期限切れ後はGoogleの仕様により、利用者がログインボタンを押して再認証する必要があります。ログアウトするとトークンを失効させますが、端末内とDrive内のツール設定は削除しません。

### Google OAuthの運用設定

1. [Google Identity Servicesの設定手順](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)に従い、Google CloudでDrive APIを有効化し、OAuth同意画面と「ウェブアプリケーション」種類のOAuth Client IDを作成します。保存先には[Driveのアプリデータフォルダー](https://developers.google.com/workspace/drive/api/guides/appdata)を使用します。
2. 承認済みJavaScript生成元へ本番の `https://roflsunriz.github.io` を追加します。ローカル確認には実際に使う生成元（例: `http://127.0.0.1:4173`）も追加します。
3. GitHubリポジトリ変数 `GOOGLE_CLIENT_ID` にClient IDを設定します。Pagesビルドが `VITE_GOOGLE_CLIENT_ID` として取り込みます。

Client IDは公開識別子でありClient Secretではありません。Client Secret、アクセストークン、Cookieはリポジトリ変数やファイルへ保存しないでください。ローカルでは実行プロセスの `VITE_GOOGLE_CLIENT_ID` 環境変数を使用します。

Google OAuthのBrandingには、同一ドメインで公開したホームページ、[プライバシーポリシー](https://roflsunriz.github.io/trickcal-tools-clone/privacy/)、[利用規約](https://roflsunriz.github.io/trickcal-tools-clone/terms/)を登録します。各ページはサイト共通フッターからも開けます。

## データの出典

ワールド3以降の設計図・欠片と必要数・最小キャンディは、[トリッカルwiki「装備設計図」](https://wikiwiki.jp/thetrickal/装備設計図)を使用しています。周回回数の目安とキャンディの自然回復・定時配布・デイリーショップ・エリーフ購入は[「キャラクター育成」](https://wikiwiki.jp/thetrickal/キャラクター育成)、供物は[「教団本部」](https://wikiwiki.jp/thetrickal/教団本部)、サブスクは[「プレミアムショップ」](https://wikiwiki.jp/thetrickal/プレミアムショップ)を使用します。クレヨン情報は[トリッカル攻略ポータルの使徒・ボードマネージャー](https://trickcal-strategy.pages.dev/board/manager.html)、料理の好みは[トリッカルwiki「宴会場」](https://wikiwiki.jp/thetrickal/宴会場)の「好物早見表」、使徒の英語名と攻撃タイプは[トリッカルwiki「使徒一覧」](https://wikiwiki.jp/thetrickal/使徒一覧)を使用しています。取得した該当部分と更新元のハッシュをリポジトリに保存します。

データと画像はローカルに同梱しています。通常利用時に情報源への接続は発生しません。収録情報と画像の一括更新方法は[更新手順](how-to-update.md)を参照してください。

## English

Open the [sweep planner](https://roflsunriz.github.io/trickcal-tools-clone/sweep/), [Rank-up Planner](https://roflsunriz.github.io/trickcal-tools-clone/rank-up/), [Crayon Board](https://roflsunriz.github.io/trickcal-tools-clone/board/), or [Food Preferences](https://roflsunriz.github.io/trickcal-tools-clone/food/), then switch the language to English. Apostle names, personalities, races, rows, and food names are localized; searches accept both Japanese and English names. The generated data and images are bundled locally. Once the deployment is configured with a Google OAuth Web Client ID, the header sign-in button syncs tool settings to the user's private Drive `appDataFolder`.

## 関連文書

- [変更履歴](CHANGELOG.md)
- [更新手順](how-to-update.md)・[検証手順](verification.md)
- [開発への参加](CONTRIBUTING.md)・[出典と貢献の扱い](CONTRIBUTIONS.md)
- [行動規範](CODE_OF_CONDUCT.md)・[サポート](SUPPORT.md)・[セキュリティ](SECURITY.md)
- [MITライセンス](LICENSE)

MITライセンスは本リポジトリ独自のコードと文書に適用されます。ゲームのデータ・名称・画像の権利は、それぞれの権利者に帰属します。

## 開発・運用の知見

開発環境、内部構成、検証コマンドと運用上の注意は [findings.md](findings.md) を参照してください。更新・復旧の手順と検証記録は、同ファイルから案内しています。
