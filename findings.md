# プロジェクト固有の知見

共通指針と [AGENTS.md](AGENTS.md) を読んだ後、作業前にこの文書を全文読む。元の条件・確認日・未検証事項を保ったまま、固有の実現手段と再利用する知見を集約する。

## 共通指針の具体化と適用範囲

- 対象: 共通指針の「設計と実装方針」「検証」「更新手順」「ドキュメント」と、各節に明記した共通ルール。
- 理由・範囲: Bunを使う周回ツールで、型検査のスクリプト名はtypecheck、単体テストはbun test。共通の品質確認に相当するスクリプトと、取得済みwikiの実データによる再現可能な検証を下記に記す。
- 代替手段・検証: 以下の実効コマンド・根拠を用い、[検証記録](verification.md) で成功・未検証を区別する。共通方針の完了条件やユーザーの明示指示は弱めない。

## AGENTS.mdから移した知見

## Package Manager

Use Bun for all package and script operations.

- Install dependencies with `bun install`.
- Run scripts with `bun run <script>`.
- Do not add or regenerate `package-lock.json`; this repository uses `bun.lock`.

## Source Structure

- `src/App.tsx`: application shell, routing between tools, theme and locale controls.
- `src/i18n.ts`: UI message dictionary; `src/I18nProvider.tsx`: locale state.
- `src/app/tools.ts`: registry for available tools.
- `src/tools/sweep/`: sweep planner feature.
  - `SweepTool.tsx`: sweep UI and quick equipment selection.
  - `sweep.ts`: planner and stage-selection logic.
  - `types.ts`: sweep data types.
  - `data.json`: local sweep drop data keyed by stable material IDs.
  - `materialNames.ts`: localized material names and local asset path helpers.
  - `sweep.test.ts`: planner tests.
- `public/assets/gears/`: local material images organized by rank.

## Wiki Data Import

- 更新は `bun run data:update`、外部wikiとの差分確認は `bun run data:update --check`。取得した表は `scripts/fixtures/wiki-equipment-drops.html` に出典・wiki更新日時とともに保存される。詳細は `how-to-update.md`、検証は `verification.md` を参照する。
- 装備ドロップの出典は [トリッカルwiki「装備設計図」](https://wikiwiki.jp/thetrickal/装備設計図) の「素材ドロップ場所一覧」。通常のページHTMLには表が含まれず、`lazy-accordion-container` の属性から公開の部分取得URLを組み立てる必要がある。行番号やハッシュは更新で変わるため固定しない。
- wikiの装備コードは「ランク + 種別番号（鎧・帽子・煌めく装飾品・ブーツ・華麗な装飾品・物理武器・魔法武器）」を表す。`quickEquipment.ts` の `equipmentByRank` に対応させ、表示名や画像パス、保存済み選択に使う `material-NNN` を振り直さない。
- この表の収録はワールド3以降のランク2以上。ランク1素材とワールド1・2の既存データは表から再生成しない。wiki内の他の表と食い違う場合は、根拠を照合してから変更する。
- 2026-09-11の取得表には10-5が設計図・副産物を逆にして重複している。同じ素材集合の重複は統合し、異なる集合の重複や既存ステージの欠落はエラーにする。全表の照合は保存した実データを使うテストで行い、CIから外部wikiへは接続しない。

## Quality Checks

- GitHub Pagesの公開は `.github/workflows/deploy-pages.yml` が `main` のpushで実行する。対象コミットの `CI` とデプロイ結果、公開アセットへの反映を確認する。Actionsの実行環境はアプリのBunとは別であり、Node.jsの非推奨警告はAction自身と内包するActionを更新して解消する（`how-to-update.md` 参照）。

Configured checks for this repository:

- Format: run `bun run format:check`; run `bun run format` when formatting changes are needed.
- Lint: run `bun run lint`.
- Typecheck: run `bun run typecheck` (includes `tsconfig.scripts.json` for the wiki import scripts).
- Build: run `bun run build`.
- Tests: run `bun test` when planner logic, data, or user-facing behavior changes.

Do not substitute npm commands for Bun commands.

## TypeScriptの更新

- 2026-10-15時点の `typescript-eslint@8.71.2` はTypeScript `>=4.8.4 <6.1.0` を要求するため、TypeScriptは6.0.3を使用する。7系へ更新する前に、採用する `typescript-eslint` の `peerDependencies` を確認し、lint・型チェック・テスト・ビルドを再検証する。

## Dependabot の限定修復（2026-09-23）

- CI 再失敗後の自動修復は `bun.lock` だけをパッチとして適用する。修復後は `workflow_dispatch` で `.github/workflows/ci.yml` を再実行するため、この CI の `contents: read` と checkout の `persist-credentials: false` を維持し、PR コードを実行するジョブへ書き込み権限や秘密情報を渡さない。根拠は `.github/workflows/dependabot-automation.yml` と共通ワークフローの権限分離。

## READMEなどから移した開発・運用情報

## 開発

パッケージ管理とスクリプト実行にはBunを使用します。

```sh
bun install
bun run dev
bun run data:update --check
bun run format:check
bun run lint
bun run typecheck
bun test
bun run build
```

`data:update --check` はwikiとの照合のみを行います。差分がある場合は終了コード1を返します。反映する場合は `bun run data:update` を実行します。

- `src/app`: ツールの登録情報
- `src/tools/sweep`: 周回UI、素材名、データ、保存処理、計算処理、テスト
- `scripts/update-sweep-data.ts`: wikiからの更新コマンド
- `scripts/fixtures/wiki-equipment-drops.html`: 取得元・更新日時付きの素材表
- `public/assets/gears`: 素材画像

新しいツールは `src/tools/<tool-name>` に追加し、`src/app/tools.ts` へ登録します。

## CIと公開

`main` へのpushとPull Requestで、整形、lint、型チェック、テスト、ビルドを実行します。GitHub Pagesは `main` からの自動公開と手動実行に対応しています。リポジトリ設定のPages公開元にはGitHub Actionsを指定します。

`bun run build` は公開用の `dist/sweep/index.html` も生成します。公開先は [GitHub Pages](https://roflsunriz.github.io/trickcal-tools-clone/sweep/) です。

## 依存更新の自動処理

Dependabot は対象の依存関係を毎週確認します。patch／minor 更新は PR のチェック（CI）が成功した後に自動で squash merge されます。CI の失敗ジョブは 1 回だけ再実行します。再失敗時は読み取り権限のジョブで `bun.lock` を再生成し、限定した修正コミットで CI を再実行します。修復できない PR は残します。major 更新は手動で確認します。マージ後はデプロイ workflow を明示起動します。

## CONTRIBUTING.mdから移した実現手段

## Development

Use Bun for all package and script operations.

```sh
bun install
bun run dev
```

Do not use npm or regenerate `package-lock.json`.

## Quality Checks

Run the full quality suite before opening a pull request or after significant edits:

```sh
bun run format
bun run format:check
bun run lint
bun run typecheck
bun run build
bun test
```

## Source Layout

- `src/App.tsx`: app shell, theme, locale controls, and active tool rendering.
- `src/i18n.ts`: UI message dictionary; `src/I18nProvider.tsx`: locale state.
- `src/app/tools.ts`: tool registry.
- `src/tools/sweep/`: sweep planner UI, data, storage, planner logic, and tests.
- `public/assets/gears/`: local material image assets organized by rank.

## Data and Assets

- Keep sweep data in `src/tools/sweep/data.json`.
- Keep material names and asset path helpers in `src/tools/sweep/materialNames.ts`.
- Store material images locally under `public/assets/gears/rank-N/`.
- Prefer stable material IDs over display names in planner logic and tests.
- Update equipment drops from the wiki with `bun run data:update`; use `bun run data:update --check` to preview changes without writing files.
- Commit the captured table in `scripts/fixtures/wiki-equipment-drops.html` together with generated data. See [更新手順](how-to-update.md) and [検証手順](verification.md) for coverage, validation, and recovery.
- `bun run typecheck` also checks the import scripts. The `@types/node` development dependency supplies types for their filesystem and process APIs; no runtime package is added.

## 文書の役割

- [README.md](README.md): 利用開始と操作、利用者が知る必要のある制限。
- この文書: 固有の配置・ツール・実行手段・例外・再利用する調査知見。
- [verification.md](verification.md): 検証手順、実測結果、証拠、未検証事項。
- [how-to-update.md](how-to-update.md): 更新と復旧の手順。
