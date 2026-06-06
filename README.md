# Trickcal Tools Clone

Trickcal tools clone for maintaining sweep data and adding more tools over time.

## Structure

- `src/app`: app shell and tool registry
- `src/tools/sweep`: sweep UI, localized material names, local data, planner logic, and tests
- `public/assets/gears`: local material images used by the sweep tool
- Future tools should be added under `src/tools/<tool-name>` and registered in `src/app/tools.ts`.

## Commands

```sh
npm install
npm run dev
npm test
npm run build
```

Sweep data and material images are kept in the repository so the app does not depend on upstream assets at runtime.
