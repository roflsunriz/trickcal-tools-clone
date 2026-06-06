# Repository Instructions

## Package Manager

Use Bun for all package and script operations.

- Install dependencies with `bun install`.
- Run scripts with `bun run <script>`.
- Do not add or regenerate `package-lock.json`; this repository uses `bun.lock`.

## Source Structure

- `src/App.tsx`: application shell, routing between tools, theme and locale controls.
- `src/i18n.tsx`: locale state and UI message dictionary.
- `src/app/tools.ts`: registry for available tools.
- `src/tools/sweep/`: sweep planner feature.
  - `SweepTool.tsx`: sweep UI and quick equipment selection.
  - `sweep.ts`: planner and stage-selection logic.
  - `types.ts`: sweep data types.
  - `data.json`: local sweep drop data keyed by stable material IDs.
  - `materialNames.ts`: localized material names and local asset path helpers.
  - `sweep.test.ts`: planner tests.
- `public/assets/gears/`: local material images organized by rank.

## Quality Checks

After significant source edits, run the configured quality checks with Bun before handing off.

- Format: run `bun run format:check`; run `bun run format` when formatting changes are needed.
- Lint: run `bun run lint`.
- Typecheck: run `bun run typecheck`.
- Build: run `bun run build`.
- Tests: run `bun test` when planner logic, data, or user-facing behavior changes.

Do not substitute npm commands for Bun commands.
