# Resilience Routes

Resilience Routes is a portfolio-ready educational simulator about supply-chain interdependence, critical infrastructure, disruption, and recovery decisions.

## What this rebuild changes

The project keeps the familiar entry points and names: 

- `src/main.ts`
- `src/style.css`
- `src/game/SupplyChainScene.ts`
- `src/game/types.ts`
- `src/ui/landing.ts` 
- `src/data/scenarios.json`

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
├── data/
│   └── scenarios.json
├── game/
│   ├── config.ts
│   ├── createSupplyChainGame.ts
│   ├── LiveLogisticsLayer.ts
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
