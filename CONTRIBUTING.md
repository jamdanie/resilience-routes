# Contributing to Resilience Routes

Thank you for helping improve the exercise. You do not need to be a programmer to propose a disruption.

## Choose a contribution route

### Route 1: Submit a scenario without code

Open a **Scenario proposal** in GitHub Issues and complete the guided form. Include the event, affected infrastructure, four-step consequence chain, three response choices, learning terms, and any sources.

A maintainer will review the learning design, choose safe map coordinates and transportation assets, and convert an accepted proposal into game data. This is the best route for subject-matter experts, instructors, students, and first-time contributors.

### Route 2: Submit validated JSON in a pull request

Use this route when you are comfortable editing JSON and GitHub files.

1. Create a branch from the latest `main`.
2. Copy `docs/examples/pnw-scenario-example.json`.
3. Add the copied object to the matching regional array: `src/data/scenarios.json` for Pacific Northwest or `src/data/gulf-coast-scenarios.json` for Gulf Coast / Texas.
4. Change every field for the new scenario and give it a unique `id`.
5. Run `npm ci` once, then run `npm run validate:scenarios` and `npm run build`.
6. Open a focused pull request and complete the checklist.

The validator reports missing fields, invalid choices, unsupported asset IDs, incorrect status values, duplicate IDs, and unsafe map coordinates. Pull requests also run the same checks automatically.

## What scenario JSON controls

- inject-card text and learning explanations
- glossary terms and cascading-effect steps
- the three response choices and rationales
- the correct response and scoring penalty
- the node label, color, and coordinates on the current map
- how existing transportation assets in the selected region react

## Regional mission packs

The application currently includes two independent packs:

- **Pacific Northwest:** `src/data/scenarios.json`
- **Gulf Coast / Texas:** `src/data/gulf-coast-scenarios.json`

Scenario JSON can add an incident to either existing regional pool. A completely new region also needs a mission definition containing its map, routes, assets, weather phases, operating conditions, and mission framing. That is still a focused data contribution, but it should be proposed as a new mission pack so the region remains internally consistent.

## Current Pacific Northwest transportation assets

Use only these IDs in `logisticsEffects`:

- `vessel-cascade` — cargo vessel
- `airlift-27` — cargo aircraft
- `freight-6` — freight train
- `roadlink-14` — truck

Allowed statuses are `In transit`, `Delayed`, `Holding`, and `Rerouted`.

## Current Gulf Coast / Texas transportation assets

Use only these IDs for Gulf Coast / Texas scenarios:

- `gulf-vessel-9` — cargo vessel
- `gulf-air-5` — cargo aircraft
- `gulf-freight-12` — freight train
- `gulf-road-22` — truck

## Branch names

Use one of these patterns:

- `feature/short-description`
- `content/short-description`
- `fix/short-description`
- `docs/short-description`

## Pull requests

A pull request should:

- address one focused issue
- explain the player or learning impact
- include a screenshot for visual changes
- include sources for real-world claims, or clearly label the content as fictional
- pass `npm run validate:scenarios` and `npm run build`
- avoid unrelated formatting changes
- contain no credentials, personal data, sensitive operational details, or unlicensed media

See `docs/SCENARIO_AUTHORING.md` for the full field guide and review criteria.
