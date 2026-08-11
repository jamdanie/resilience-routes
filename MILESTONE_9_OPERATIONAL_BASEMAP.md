# Milestone 9 — Operational basemap realism

This milestone makes the exercise map read as a real operating environment instead of an abstract network diagram.

## What changed

- Added a self-contained cartographic basemap for both the Pacific Northwest and Gulf Coast mission packs.
- Added recognizable water, shoreline, river or ship-channel, wetlands, terrain, highway, local-road, rail, port, runway, cargo-apron, warehouse, digital-hub, and energy-facility features.
- Added region-specific infrastructure names and corridor labels so learners can connect each decision node to its physical setting.
- Added a north arrow, approximate scale bar, road shields, and an explicit fictional / not-for-navigation label.
- Replaced the previous on/off terrain control with three modes:
  - **Infrastructure** — full operational context
  - **Terrain** — emphasizes landform and exposure while reducing facility detail
  - **Minimal** — reduces the basemap when decision clarity is more important than context

## Why the project does not embed Google Maps

The current missions use fictional locations and screen coordinates rather than real latitude and longitude. A commercial tile layer would add API-key, billing, attribution, connectivity, privacy, and deployment requirements without making the fictional incidents more accurate.

The new layer provides the visual cues learners need while remaining deterministic, offline-friendly, forkable, and compatible with static GitHub Pages hosting. A later real-geography mission can use MapLibre and properly licensed vector tiles once mission nodes have real coordinates and the project has a documented tile provider.

## Verification

```powershell
npm run build
```

The build validates every mission and scenario, tests deterministic replay and run variation, performs a TypeScript check, and creates the production bundle.
