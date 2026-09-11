# 装備データの更新手順

## 前提

- リポジトリ直下で作業し、`COMMON-AGENTS.md` と `AGENTS.md` を読む。
- `git status --short` で既存の変更を確認し、他の作業による差分を保護する。
- `package.json` とCIで指定するBunを使用する。依存関係は `bun install --frozen-lockfile` で準備する。
- 更新時は [トリッカルwiki「装備設計図」](https://wikiwiki.jp/thetrickal/装備設計図) に接続できること。通常のアプリ利用とテストには接続不要。

## 取り込み

```sh
bun run data:update --check
bun run data:update
git diff -- src/tools/sweep/data.json scripts/fixtures/wiki-equipment-drops.html
```

`--check` は書き込みを行わず、差分があれば終了コード1、一致すれば0を返します。取得や検証に失敗した場合も1となるため、出力を確認してください。

更新コマンドは「素材ドロップ場所一覧」を取得し、主な設計図と副産物の両方を既存の素材IDに対応させます。ワールド3以降にあるランク2以上の収録情報を置き換え、ランク1素材とワールド1・2は保持します。取得した表と出典ページの更新日時は `scripts/fixtures/wiki-equipment-drops.html` に保存します。画像や素材IDの変更は発生しません。

通常のページHTMLでは表が遅延読み込みされるため、現在のページ属性から部分取得URLを解決します。wikiの変更で行番号やハッシュが変わっても、固定値を手で更新する必要はありません。

未知の装備コード、ランクや種別の不一致、矛盾する重複行、途中のステージ・ワールドの欠落、既存ステージの欠落はエラーになります。ワールド9以降は副産物の未記入もエラーとします。検証が終わるまでデータを書き換えません。同じ装備の組み合わせを逆順に記載した重複行は1件として扱います。

## 差分の確認

1. 新ワールドが各10ステージ揃い、設計図と副産物の対応がwikiと一致することを確認する。
2. 既存ステージの削除・変更も確認する。wiki内に別の逆引き表があれば照合する。
3. 新ランクが追加された場合は `quickEquipment.ts` の対応表・必要個数、`materialNames.ts` の日英名称、画像、`SweepTool.tsx` のランク選択も確認して追加する。未知の素材IDや数量を推測で作らない。
4. 収録範囲が変わった場合はREADME、CHANGELOG、対応するデータ回帰テストも更新する。

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

依存関係を変更した場合やpushする前は `bun audit` も実行します。画面上の確認内容は [verification.md](verification.md) を参照してください。全体が一致したら生成データ、出典表、テスト、関連文書を同じコミットに含めます。

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

取得・形式検証のエラー時はwikiの本文、表の見出し、エラーが指す行を確認します。欠落を空配列で埋めたり、不明なドロップを推測したりせず、確認できたデータから再実行します。書き込みは一時ファイルからの置き換えで行い、途中で失敗した場合は変更済みファイルの元の内容へ復元を試みます。復旧エラーが出た場合はGit差分を確認してください。

未コミットの誤更新は他の作業差分を退避し、今回のデータと出典表の差分だけを戻します。コミット済みの更新は `git revert <対象コミット>` で打ち消し、同じ品質確認を実施します。公開後の復旧は、正しいデータへ戻したコミットを承認済みの公開手順で反映します。
