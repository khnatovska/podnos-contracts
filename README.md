# @podnos/contracts

Shared [Zod](https://zod.dev) schemas and inferred TypeScript types for the Podnos meal-planning app — the single source of truth for the data shapes exchanged between its backend and frontend (ingredients, labels, recipes, and the nested plate / daily-meal / weekly-schedule itinerary model, each with write-input, persisted-record, and read-view variants, plus the shopping list a weekly schedule implies). It ships compiled `.js` plus `.d.ts` from `dist/`, has no runtime dependencies, and takes `zod` as a peer dependency.

## Install

```sh
npm i zod github:khnatovska/podnos-contracts#v0.1.0
```

## Develop

```sh
npm run build      # emit dist/ (excludes *.test.ts)
npm run typecheck  # tsc --noEmit over src, tests included
npm run lint
npm test           # vitest run
```
