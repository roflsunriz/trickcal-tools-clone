# 収録データの更新手順

作業前に [findings.md](findings.md) を全文読み、固有の環境・ツール・例外条件を確認する。以下は更新と復旧の手順の正本とする。

## 前提

- リポジトリ直下で作業し、`COMMON-AGENTS.md` と `AGENTS.md` を読む。
- `git status --short` で既存の変更を確認し、他の作業による差分を保護する。
- `package.json` とCIで指定するBunを使用する。依存関係は `bun install --frozen-lockfile` で準備する。
- 更新時は [トリッカルwiki「装備設計図」](https://wikiwiki.jp/thetrickal/装備設計図)、[トリッカル攻略ポータルのボードマネージャー](https://trickcal-strategy.pages.dev/board/manager.html)、[トリッカルwiki「宴会場」](https://wikiwiki.jp/thetrickal/宴会場)に接続できること。通常のアプリ利用とテストには接続不要。

## 取り込み

```sh
bun run data:update --check
bun run data:update
git diff -- src/tools/sweep/data.json src/tools/community/data.json scripts/fixtures
```

`--check` は装備、クレヨン、食べ物を順に検査し、書き込みを行いません。いずれかに差分または取得・検証エラーがあれば終了コード1、一致すれば0を返します。対象を限定する場合は `bun run data:update:sweep` または `bun run data:update:community` を使用できます。

### クレヨン・食べ物

クレヨン更新はボードマネージャーの使徒カードから名前・性格・種族・配置と、第1〜3層の特殊マス2・3・4個を読み取ります。食べ物更新はwiki「宴会場」の「好物早見表」から大好物・好物・苦手、料理レアリティ、画像スプライトと切り出し座標を読み取ります。生成結果は `src/tools/community/data.json`、縮約した出典箇所は `scripts/fixtures/community-board.html` と `scripts/fixtures/community-food.html` に保存します。

使徒画像は補完元の個別PNG、料理画像はwikiのWebPスプライトを `public/assets/community/` へ保存します。全画像を取得してContent-TypeとPNG／WebP signatureを検証し、取得元URL、サイズ、SHA-256を `public/assets/community/manifest.json` に記録してからデータと一緒に置き換えます。`--check` でも画像を再取得してmanifest・ローカルファイルと照合します。

使徒名の重複、未知の特殊マス、層ごとのマス数不一致、好物表の列数・件数不足、料理レアリティの矛盾、ボードに存在しない好物表の使徒はエラーです。取得と全件検証が終わるまでファイルを書き換えません。ボードにだけ存在して好物表にない使徒は削除せず、画面で「未確認」と表示します。

2026-10-23の生成結果はクレヨン82使徒、好物76使徒、60料理、画像87ファイルです。元サイトの公開JSONにない追加使徒を含みます。

### 装備ドロップ

更新コマンドは「素材ドロップ場所一覧」を取得し、主な設計図と副産物の両方を既存の素材IDに対応させます。ワールド3以降にあるランク2以上の収録情報を置き換え、ランク1素材とワールド1・2は保持します。取得した表と出典ページの更新日時は `scripts/fixtures/wiki-equipment-drops.html` に保存します。画像や素材IDの変更は発生しません。

通常のページHTMLでは表が遅延読み込みされるため、現在のページ属性から部分取得URLを解決します。wikiの変更で行番号やハッシュが変わっても、固定値を手で更新する必要はありません。2026-10-23にwiki側の属性名が変わったため、現在は `documentStack`、`parentPartPath`、`sourceHash`、`htmlHash` をqueryへ渡します。

未知の装備コード、ランクや種別の不一致、矛盾する重複行、途中のステージ・ワールドの欠落、既存ステージの欠落はエラーになります。ワールド9以降は副産物の未記入もエラーとします。検証が終わるまでデータを書き換えません。同じ装備の組み合わせを逆順に記載した重複行は1件として扱います。

## 差分の確認

1. 新ワールドが各10ステージ揃い、設計図と副産物の対応がwikiと一致することを確認する。
2. 既存ステージの削除・変更も確認する。wiki内に別の逆引き表があれば照合する。
3. 新ランクが追加された場合は `quickEquipment.ts` の対応表・必要個数、`materialNames.ts` の日英名称、画像、`SweepTool.tsx` のランク選択も確認して追加する。未知の素材IDや数量を推測で作らない。
4. 収録範囲が変わった場合はREADME、CHANGELOG、対応するデータ回帰テストも更新する。
5. クレヨン追加使徒の各層が2・3・4マスで、名称・性格・種族・配置が補完元と一致することを確認する。
6. 食べ物追加使徒の大好物・好物・苦手、料理のレアリティをwiki表と照合する。未確認欄を推測で埋めない。
7. 追加・更新画像がカード内で正しい使徒・料理を示し、隣接するスプライト画像が混入していないことを確認する。manifestの取得元・形式・SHA-256も確認する。

2026-09-11の更新ではワールド31・32を追加し、21-1のランク7装飾品を一覧と逆引き表の両方に合わせて修正しました。wikiの表に含まれるワールド3〜32の300ステージを照合しています。

## 検証

```sh
bun run format
bun run format:check
bun run lint
bun run typecheck
bun test
bun run test
bun run build
bun run data:update --check
```

依存関係を変更した場合やpushする前は `bun audit` も実行します。画面上の確認内容は [verification.md](verification.md) を参照してください。全体が一致したら生成データ、出典表、テスト、関連文書を同じコミットに含めます。画面では周回に加え、クレヨン記録の保存・復元と、使徒・料理の双方向絞り込みを確認します。

## GitHub Pagesへの公開

公開が許可された更新は `main` へpushします。

```sh
bun audit
git push origin main
gh run list --branch main --limit 5
gh run watch <対象の実行ID> --exit-status
```

pushしたコミットに対する `CI` と `Deploy GitHub Pages` の両方が成功したことを確認します。その後、[公開ツール](https://roflsunriz.github.io/trickcal-tools-clone/sweep/)で新しい周回候補と画像を確認します。古い内容が配信される場合は、デプロイ対象のコミット、公開されたHTMLが参照するアセット、ローカルのビルド成果物を照合してください。

Actionsの非推奨警告が出た場合は、各Actionの公式リリースと実行環境の要件を確認してワークフローを更新します。2026-09-11にはNode.js 20の警告を確認し、Node.js 24対応版へ移行しました。使用するバージョンは `.github/workflows/` を正本とします。

## 復旧

取得・形式検証のエラー時は各情報源の本文、表の見出し、エラーが指す使徒・行・画像URLを確認します。欠落を空配列で埋めたり、不明なドロップ・好み・ボード種類・画像を推測したりせず、確認できたデータから再実行します。書き込みは一時ファイルからの置き換えで行い、途中で失敗した場合は変更済みファイルの元の内容へ復元を試みます。復旧エラーが出た場合はGit差分を確認してください。

未コミットの誤更新は他の作業差分を退避し、今回のデータと出典表の差分だけを戻します。コミット済みの更新は `git revert <対象コミット>` で打ち消し、同じ品質確認を実施します。公開後の復旧は、正しいデータへ戻したコミットを承認済みの公開手順で反映します。

## Dependabot PR の更新

Dependabot version update は毎月28日00:00、検証済み PR の自動マージは同日18:00（いずれも `Asia/Tokyo`）にまとめます。28日より前に自動マージせず、現在の head SHA と全 PR チェックを月末処理で再確認します。
手動で依存更新を取り込む場合は `bun outdated` と `bun audit` を実行し、`package.json` と `bun.lock` を一緒に確認します。メジャー更新は利用側の `peerDependencies` を照合し、互換性を保てる最大のバージョンまで更新してください。TypeScript 7への移行には、対応する `typescript-eslint` が必要です。

前提は `.github/dependabot.yml` と PR 用 CI（CI）です。更新 PR の head SHA と `gh pr checks <PR番号>` の結果を確認してください。patch／minor は全チェック成功後に自動取り込みされます。初回 CI 失敗は failed jobs のみを 1 回再実行し、再失敗時は `bun.lock` の再生成を試み、修復後の CI を再実行します。変更がない場合や再度失敗した場合は PR を残します。

設定を変えたときは `actionlint .github/workflows/dependabot-automation.yml` と実際の PR の Actions 結果を確認します。問題があれば呼び出し先の共通 workflow SHA を直前の検証済み値へ戻すコミットを push します。取り込まれた依存更新に問題があれば通常の revert コミットで復旧します。

CI 完了より Dependabot の分類が遅れる場合は、`callback_workflow_file` が指す呼び出し側 workflow を `workflow_dispatch` し、同じ PR 番号・head SHA・全チェックを再確認する。呼び出し側のファイル名を変える際はこの入力も一緒に更新する。
