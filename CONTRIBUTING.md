# Contributing to Resilience Routes

Resilience Routes is designed so a contributor can add an inject or a complete regional level without editing the game engine or a shared JSON array.

## Choose the smallest contribution route

### Propose content without code

Open a **Scenario proposal** or **Mission-pack proposal** in GitHub Issues. The forms collect the operational event, consequence chain, choices, learning goals, sources, and safety review. Maintainers can turn an accepted proposal into game data.

### Add one inject with a pull request

1. Create a focused branch from the latest `main`.
2. Run the scaffold command:

   ```powershell
   npm run create:scenario -- --pack pacific-northwest --id bridge-closure
   ```

3. Edit only the new file in `src/content/packs/pacific-northwest/scenarios/`.
4. Replace every `TODO`. Keep the filename and `id` identical.
5. Run:

   ```powershell
   npm run validate:content
   npm run build
   ```

6. Open a pull request and complete the content checklist.

One inject is one file, so two contributors can work in the same regional pack without editing the same scenario array.

### Add a complete regional level

Create a draft pack from an existing structural reference:

```powershell
npm run create:level -- --id great-lakes --name "Great Lakes Continuity Exercise"
```

To start from a different regional structure:

```powershell
npm run create:level -- --id caribbean --name "Caribbean Continuity Exercise" --from gulf-coast
```

The command creates:

```text
src/content/packs/great-lakes/
├── manifest.json
├── mission.json
└── scenarios/
    └── starter-inject.json
```

Keep the manifest status as `draft` while adapting the mission framing, map geometry, routes, vehicles, weather, temporary events, operating conditions, and inject. Change it to `playable` only after validation and browser testing.

## Automatic discovery

Do not edit `src/data/missions.ts`. The application discovers every playable pack and every inject file under `src/content/packs/` during the build. Pull requests fail with a path-specific message when:

- a filename and JSON `id` differ
- a pack folder, manifest `id`, and mission `id` differ
- required learning fields are missing
- an inject references an asset outside its own pack
- response costs or statuses are invalid
- scaffold `TODO` markers remain
- a mission target exceeds its number of injects

VS Code also applies the JSON schemas in `schemas/` automatically.

## Content ownership and scope

- One pull request should add one inject, one mission pack, or one focused engine change.
- Put regional content only in its matching pack folder.
- Cite real-world factual claims or label the exercise content fictional.
- Do not include credentials, personal data, sensitive facility details, proprietary information, or unlicensed media.
- Record contributor and source information in the pull request.
- Avoid editing generated output, dependencies, or unrelated content files.

## Branch names

- `content/pnw-bridge-closure`
- `level/great-lakes`
- `feature/short-description`
- `fix/short-description`
- `docs/short-description`

See `docs/CONTENT_SDK.md` for the five-minute workflow and `docs/SCENARIO_AUTHORING.md` for every field and review criterion.
