# Content SDK: add a level or inject without engine changes

The content SDK is the stable boundary between community content and the TypeScript game engine.

## Mental model

| Contribution | Location | Shared-file edit required? |
| --- | --- | --- |
| One decision inject | `src/content/packs/<pack-id>/scenarios/<inject-id>.json` | No |
| One regional level | `src/content/packs/<pack-id>/` | No |
| Validation rules | `scripts/validate-scenarios.mjs` and `schemas/` | Maintainers only |
| Runtime discovery | `src/data/missions.ts` | No |

## Five-minute inject workflow

```powershell
git switch main
git pull --ff-only
git switch -c content/pnw-bridge-closure
npm ci
npm run create:scenario -- --pack pacific-northwest --id bridge-closure
```

Open the new JSON file, replace every `TODO`, and run:

```powershell
npm run validate:content
npm run content:report
npm run build
```

Commit only the new inject and any directly related source note:

```powershell
git add src/content/packs/pacific-northwest/scenarios/bridge-closure.json
git commit -m "Add Pacific Northwest bridge closure inject"
git push -u origin content/pnw-bridge-closure
```

## Pack contract

Every folder directly under `src/content/packs/` contains:

- `manifest.json`: identity, version, publication status, and short description
- `mission.json`: region, map, routes, assets, weather, temporary events, operating conditions, and objectives
- `scenarios/*.json`: one complete decision inject per file

The folder name, manifest `id`, and mission `id` must be identical lowercase kebab-case. An inject filename must match its internal `id`.

New injects also include a `contribution` block for authors, sources, and license. This metadata stays with the content even after a pull request is merged or files are reused in another mission.

## Draft and playable status

`draft` packs are validated but excluded from the in-game mission menu. This lets contributors submit work-in-progress structure without accidentally publishing it as a finished level. A maintainer changes the manifest to `playable` after content, accessibility, map, and gameplay review.

## Contributor-friendly errors

Run `npm run validate:content` before pushing. Errors name the exact file and field. GitHub Actions runs the same command and writes a mission-pack inventory into the workflow summary for reviewers.

## Review boundary

Inject pull requests should normally touch one new JSON file. Level pull requests should normally touch one new pack folder. Changes to TypeScript, shared CSS, deployment workflows, or validators need a separate engineering review.
