# Changelog

All notable changes to this project will be documented in this file.

This project follows a lightweight Keep a Changelog style. Versions are not tied to releases yet.

## [Unreleased]

### Security

- push前監査で検出された既知の依存脆弱性を解消するため、安全版へ依存関係とロックファイルを更新した。

### Added

- GitHub Actions CI for formatting, linting, type checking, tests, and production builds.
- GitHub Pages deployment workflow for the `main` branch and manual dispatch.
- Local equipment image assets for the sweep planner.
- Rank 9 equipment support and high-rank side-product stage data.
- Bun-based package management and quality scripts.

### Changed

- 作業開始時の共通指針見落としを防ぐため、調査やコマンド実行より前に `COMMON-AGENTS.md` を先頭から末尾まで読み、EOFを確認する必須ゲートを追加した。

- `bun run build` now produces the GitHub Pages artifact shape by default.
- Material catalog now renders all filtered materials without pagination.
- Rank filters are always visible.
- Best-plan material cards use larger local images and localized material-name tooltips.

### Fixed

- GitHub Pages asset URLs now resolve under the configured Pages base path.
- Sweep planner storage now repairs invalid persisted state.
