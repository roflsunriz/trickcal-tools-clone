# Contributing

Thanks for helping improve Trickcal Tools Clone.

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

## Pull Requests

- Keep changes focused and avoid unrelated refactors.
- Include tests when planner logic, storage behavior, data mapping, or user-facing behavior changes.
- Update `CHANGELOG.md` for user-visible changes.
