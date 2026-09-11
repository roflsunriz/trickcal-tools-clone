# AGENTS.md

## 作業開始前の必須手順（最優先・例外なし）

1. エージェントは、調査、計画、コマンド実行、スキル利用、ファイル編集、コミット、プッシュを始める前に、必ずリポジトリ直下の `.\COMMON-AGENTS.md` を開き、先頭から末尾まで全文を読む。
2. `COMMON-AGENTS.md` はGit管理外のシンボリックリンクである。`git`や既定のignore設定が有効な`rg --files`の検索結果だけで、ファイルが存在しないと判断してはならない。PowerShellでは最初に次を実行する。

```powershell
Get-Content -Raw -LiteralPath .\COMMON-AGENTS.md
```

3. 読み取りに失敗した場合、出力が省略された場合、または末尾まで読めたことを確認できない場合は、一切の作業を開始せず、パスとシンボリックリンク先を確認して全文を再取得する。必要なら分割して末尾まで読む。
4. 全文を読了するまで、ローカル `AGENTS.md` だけを根拠に作業を続けてはならない。読了後は `COMMON-AGENTS.md` を最優先の指針とし、読了直後の最初の進捗報告で全文を読了したことを明示する。
   このファイルでは `trickcal-tools-clone` 固有の補足だけを記載する。

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

Configured checks for this repository:

- Format: run `bun run format:check`; run `bun run format` when formatting changes are needed.
- Lint: run `bun run lint`.
- Typecheck: run `bun run typecheck` (includes `tsconfig.scripts.json` for the wiki import scripts).
- Build: run `bun run build`.
- Tests: run `bun test` when planner logic, data, or user-facing behavior changes.

Do not substitute npm commands for Bun commands.
