# Architecture

## Current static architecture

```text
Browser
├── Mission interface
├── Seeded mission generator
├── Scenario and decision engine
├── Strategic resource economy
├── Logistics, weather, and ambient-event layers
├── Operational basemap
├── Resilience and consequence engine
├── Browser-local run history
└── After-action exporter

GitHub
├── Source repository
├── Pull requests and reviews
├── GitHub Actions build
└── GitHub Pages static hosting
```

No login, database, API key, server credential, or personal-information collection is required.

## Core state

The mission engine tracks resilience, elapsed time, selected disruptions, logistics states, weather, temporary injects, six strategic resources, decision costs, downstream consequences, and mission settings. Scenario content remains separate from the engine in validated JSON.

`StrategicResourceSystem.ts` owns initial reserves, affordability checks, spending, and snapshots. `SupplyChainScene.ts` applies those transactions to decisions and emits updates. The DOM interface renders the resource bar and decision costs, while the report records the final stewardship result.

## Future backend boundary

Real-time multiplayer and instructor-led sessions should be introduced only through a separate service with session authorization, minimal data collection, retention rules, server-side validation, rate limiting, and audit logging.
