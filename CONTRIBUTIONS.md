# Contributions

This file records project-level contribution guidance and attribution expectations.

## How Contributions Are Handled

- Contributions should be submitted through GitHub pull requests.
- Code, data, documentation, and asset changes are reviewed for correctness and maintainability.
- By contributing original code or documentation, you agree that it may be distributed under this repository's MIT License.

## Attribution

When adding third-party-derived data or assets, include enough context in the pull request to identify the source and what changed. Keep runtime assets local when the app depends on them. Third-party-derived game data, names, and image assets may remain subject to their respective rights holders and are not relicensed by this repository.

Equipment blueprint and fragment drops for worlds 3 onward are imported from the [Trickcal community wiki's equipment blueprint table](https://wikiwiki.jp/thetrickal/装備設計図). The captured table and its source modification time are stored in `scripts/fixtures/wiki-equipment-drops.html`. See [更新手順](how-to-update.md) for the reproducible import process. Rank 1 materials and worlds 1–2 retain the existing repository data because that table does not cover them.

## Maintainer Notes

- Keep the app deployable as a static Vite site.
- Keep Bun as the only package manager.
- Keep CI checks aligned with `AGENTS.md` and `CONTRIBUTING.md`.
