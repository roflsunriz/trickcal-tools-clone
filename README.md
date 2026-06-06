# Trickcal Tools Clone

Trickcal tools clone for maintaining sweep data and adding more tools over time.

# Website

[Trickcal Tools](https://roflsunriz.github.io/trickcal-tools-clone/sweep)

## Structure

- `src/app`: app shell and tool registry
- `src/tools/sweep`: sweep UI, localized material names, local data, planner logic, and tests
- `public/assets/gears`: local material images used by the sweep tool
- Future tools should be added under `src/tools/<tool-name>` and registered in `src/app/tools.ts`.

## Commands

```sh
bun install
bun run dev
bun run format:check
bun run lint
bun run typecheck
bun test
bun run build
```

Sweep data and material images are kept in the repository so the app does not depend on upstream assets at runtime.

## CI and Deployment

- CI runs on pushes to `main` and pull requests.
- GitHub Pages deploys from `main` and can also be triggered manually.
- The sweep tool is deployed under `https://roflsunriz.github.io/trickcal-tools-clone/sweep/`.
- `bun run build` always produces the GitHub Pages artifact shape, including `dist/sweep/index.html`.

In GitHub repository settings, set Pages source to GitHub Actions.

## Project Documents

- [CHANGELOG.md](CHANGELOG.md): user-visible changes.
- [CONTRIBUTING.md](CONTRIBUTING.md): development and pull request workflow.
- [CONTRIBUTIONS.md](CONTRIBUTIONS.md): contribution handling and attribution notes.
- [LICENSE](LICENSE): MIT License.

The MIT License applies to this repository's original code and documentation. Game data, names, and image assets may be subject to their respective rights holders.
