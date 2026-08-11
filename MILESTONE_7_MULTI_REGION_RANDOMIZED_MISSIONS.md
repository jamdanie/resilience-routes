# Milestone 7 — Multi-region randomized missions

This milestone turns the exercise into a replayable training platform rather than one fixed sequence.

## Player-facing changes

- Choose between Pacific Northwest and Gulf Coast / Texas mission packs.
- Receive three randomly selected active disruptions from a five-scenario regional pool.
- Begin under one of four randomly selected operating conditions.
- See response options in a different order without breaking the correct answer or rationale.
- Leave the seed blank for a new mission or enter a previous seed to reproduce a run.
- Compare completed missions in a browser-local history panel.

## Engineering changes

- Mission definitions now own routes, assets, weather phases, operating conditions, and objectives.
- The game scene receives a complete run plan rather than importing a fixed scenario list.
- Automated validation checks mission packs and regional asset references.
- Automated generation tests verify deterministic replay, correct answer/rationale pairing, unique active incidents, and run variation.

## Verification

```powershell
npm run validate:scenarios
npm run test:missions
npm run build
```

All simulation data is fictional and intended for education only.
