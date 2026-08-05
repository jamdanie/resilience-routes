# Milestone 8 — Dynamic world

This milestone extends seed-based replay beyond the decision cards. A seed now controls the wider operating environment while remaining reproducible.

## Seeded movement

- Every asset receives a new starting position and speed variation.
- Route direction can reverse.
- One asset begins on a verified alternate route.
- Scenario, weather, and temporary inject effects can change the route again during play.

## Localized weather and temporary injects

- Weather can cross the map from either direction at different latitudes and cycle positions.
- Only a seeded subset of assets receives the local weather effect.
- Two temporary injects are selected and scheduled during each run.
- Temporary events include weather, economic, security, and operations conditions.
- The after-action report records which temporary events occurred.

## Expanded decisions

The two regional pools now contain 16 complete decision scenarios. New topics include tariffs, landed cost, political unrest, cost of goods, customs holds, warehouse errors, and cyber-enabled cargo theft.

## Map context

The Show Terrain control adds fictional region-informed coastlines, water, terrain, wetlands, rivers, and infrastructure zones. It uses no commercial map service, API key, live location data, or external tracking.

## Verification

```powershell
npm run validate:scenarios
npm run test:missions
npm run build
```
