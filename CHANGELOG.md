# Changelog

All notable changes to this project will be documented in this file.

This project follows a lightweight Keep a Changelog style. Versions are not tied to releases yet.

## [Unreleased]

### Added

- GitHub Actions CI for formatting, linting, type checking, tests, and production builds.
- GitHub Pages deployment workflow for the `main` branch and manual dispatch.
- Local equipment image assets for the sweep planner.
- Rank 9 equipment support and high-rank side-product stage data.
- Bun-based package management and quality scripts.

### Changed

- Material catalog now renders all filtered materials without pagination.
- Rank filters are always visible.
- Best-plan material cards use larger local images and localized material-name tooltips.

### Fixed

- Sweep planner storage now repairs invalid persisted state.
