# Contributions

This file records project-level contribution guidance and attribution expectations.

## How Contributions Are Handled

- Contributions should be submitted through GitHub pull requests.
- Code, data, documentation, and asset changes are reviewed for correctness and maintainability.
- By contributing original code or documentation, you agree that it may be distributed under this repository's MIT License.

## Attribution

When adding third-party-derived data or assets, include enough context in the pull request to identify the source and what changed. Keep runtime assets local when the app depends on them. Third-party-derived game data, names, and image assets may remain subject to their respective rights holders and are not relicensed by this repository.

Equipment blueprint and fragment drops for worlds 3 onward are imported from the [Trickcal community wiki's equipment blueprint table](https://wikiwiki.jp/thetrickal/装備設計図). The captured table and its source modification time are stored in `scripts/fixtures/wiki-equipment-drops.html`. See [更新手順](how-to-update.md) for the reproducible import process. Rank 1 materials and worlds 1–2 retain the existing repository data because that table does not cover them.

Crayon board cells and Japanese apostle metadata are imported from the [Trickcal strategy portal's board manager](https://trickcal-strategy.pages.dev/board/manager.html). Food preferences and rarity metadata are imported from the [Trickcal community wiki's banquet hall table](https://wikiwiki.jp/thetrickal/宴会場). Reduced source snapshots are stored in `scripts/fixtures/community-board.html` and `scripts/fixtures/community-food.html`; generated app data records their SHA-256 hashes.

Apostle images come from the strategy portal's corresponding icon files. Food art uses the community wiki's source sprite sheets and recorded crop coordinates. The downloaded files, source URLs, media types, sizes, and SHA-256 values are recorded in `public/assets/community/manifest.json`. These game images are not relicensed by this repository's MIT License.

## Maintainer Notes

- Keep the app deployable as a static Vite site.
- Keep Bun as the only package manager.
- Keep CI checks aligned with `AGENTS.md` and `CONTRIBUTING.md`.
