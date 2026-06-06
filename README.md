# Trickcal Tools Clone

Trickcal tools clone for maintaining sweep data and adding more tools over time.

## Structure

- `src/app`: app shell and tool registry
- `src/tools/sweep`: sweep UI, data, planner logic, and tests
- Future tools should be added under `src/tools/<tool-name>` and registered in `src/app/tools.ts`.

## Commands

```sh
npm install
npm run dev
npm test
npm run build
```

The sweep data was imported from `https://trickcal.nossite.com/sweep/data.json`.
