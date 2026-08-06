# Resilience Routes

Resilience Routes is a portfolio-ready educational simulator about supply-chain interdependence, critical infrastructure, disruption, and recovery decisions. It includes two regional mission packs, seeded procedural runs, limited strategic resources, changing operating conditions, randomized logistics and localized weather, temporary injects, a layered operational basemap, and browser-local performance history.

## What this rebuild changes

The project keeps the familiar entry points and names:

- `src/main.ts`
- `src/style.css`
- `src/game/SupplyChainScene.ts`
- `src/game/types.ts`
- `src/ui/landing.ts`
- `src/content/packs/`

The difference is that each file now has one clear job. `main.ts` is intentionally only four lines and starts the application. The interface, game engine, scenario data, glossary, decision workflow, report, and styling live in separate modules.

## Learning approach

Every disruption follows the same sequence:
 
1. **Define** unfamiliar terms in everyday language.
2. **Explain** why the infrastructure matters.
3. **Trace** how, when, and where the disruption spreads.
4. **Decide** between realistic response options.
5. **Review** why the selected option helped or increased risk.

No previous supply-chain or emergency-management experience is assumed.

## Run locally

```powershell
npm ci
npm run build
npm run dev
```

Vite will display a local address similar to:

```text
http://localhost:5173/resilience-routes/
```

## Project structure

```text
src/
├── main.ts
├── style.css
├── app/
│   └── bootstrapApplication.ts
├── content/
│   └── packs/
│       ├── pacific-northwest/
│       │   ├── manifest.json
│       │   ├── mission.json
│       │   └── scenarios/ (one inject per JSON file)
│       └── gulf-coast/
│           ├── manifest.json
│           ├── mission.json
│           └── scenarios/ (one inject per JSON file)
├── data/
│   └── missions.ts (automatic content discovery)
├── game/
│   ├── config.ts
│   ├── createSupplyChainGame.ts
│   ├── LiveLogisticsLayer.ts
│   ├── AmbientEventSystem.ts
│   ├── MapSurfaceLayer.ts
│   ├── randomization.ts
│   ├── runHistory.ts
│   ├── StrategicResourceSystem.ts
│   ├── SupplyChainScene.ts
│   ├── WeatherSystemLayer.ts
│   └── types.ts
├── ui/
│   ├── appShell.ts
│   ├── challengeModal.ts
│   ├── dom.ts
│   ├── drawer.ts
│   ├── glossary.ts
│   ├── glossaryPanel.ts
│   ├── guidePanel.ts
│   ├── hud.ts
│   ├── landing.ts
│   └── reportModal.ts
└── styles/
    ├── tokens.css
    ├── base.css
    ├── layout.css
    ├── components.css
    ├── game.css
    └── responsive.css
```

## Deployment

The included Vite configuration uses:

```ts
base: "/resilience-routes/"
```

This matches a GitHub Pages repository named `resilience-routes`. The included workflow builds and deploys the `dist` folder.

## Educational-use statement

All locations, disruptions, scores, and network conditions are fictional. The project does not use live flight, maritime, logistics, cybersecurity, weather, or emergency data and should not be used for operational decisions.

## Dynamic disruption behavior

The map does more than label a response as delayed, holding, or rerouted. Scenario decisions now change asset speed, stop unsafe movement, draw alternate paths, and update the network movement board. Weather remains a separate temporary effect, so a scenario restriction is still active after the storm clears.

## Strategic resources

Every mission begins with a limited pool of funds, field crews, transportation capacity, fuel, intelligence, and emergency inventory. Each response option has a cost stored alongside the scenario in JSON. Committing resources removes them from the rest of the run, so a response that is available during the first disruption may be unavailable later. Every scenario retains a zero-cost fallback to prevent a deadlock, but that fallback can carry a larger operational consequence.

The after-action report records each commitment, what remained after every decision, downstream effects, and the final reserve percentage. Easy provides larger reserves, Medium uses balanced reserves, and Hard requires stronger prioritization.

## Intelligence and uncertainty

Injects begin with a preliminary operating picture. Before choosing a response, the player can spend one Intel to verify the signal, reveal a downstream consequence forecast, and reduce the immediate disruption loss by two points. The tradeoff is persistent: Intel used now is unavailable during later injects. The after-action report records which decisions were verified and which were made from preliminary information.

Scenario authors can provide a custom intelligence brief in JSON. Existing injects remain compatible because the game can build a fallback brief from their event, timing, location, and cascade fields.

## Replayable mission generation

Each run combines a regional mission pack with a seed. The seed determines which three disruptions are active, the answer order, operating condition, vehicle starting positions and direction, initial alternate route, weather path and timing, locally affected assets, and temporary inject schedule. Leaving the seed blank creates a new run. Reusing a seed with the same region reproduces the same setup for fair comparison, classroom discussion, and regression testing.

The current content library contains 16 complete decision injects and 10 temporary injects. Temporary events can create localized inclement weather, cost pressure, tariff reviews, labor unrest, human errors, and cyber-enabled fraud while the main exercise continues.

The map remains fictional and does not load commercial map tiles. Players can cycle among Infrastructure, Terrain, and Minimal modes. The Infrastructure mode adds recognizable coastlines, ports and berths, roads, rail corridors, runways, cargo aprons, distribution buildings, rivers, wetlands, and labeled operating zones without an API key or external tracking.

Completed runs are stored only in the current browser. The history panel compares region, difficulty, score, accuracy, operating condition, elapsed time, and seed without collecting personal information or using a server.

## Community content SDK

Contributors do not need to edit TypeScript or a shared scenario array. One regional level is one folder, and one inject is one JSON file. Create correctly shaped content with:

```powershell
npm run create:scenario -- --pack pacific-northwest --id bridge-closure
npm run create:level -- --id great-lakes --name "Great Lakes Continuity Exercise"
```

The application discovers playable packs automatically. Local validation, VS Code JSON schemas, and GitHub Actions catch filename/ID mismatches, missing fields, invalid asset references, unsafe values, and unfinished scaffold markers before merge. See [the content SDK](docs/CONTENT_SDK.md) and [contribution guide](CONTRIBUTING.md).
