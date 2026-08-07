# Milestone 11 — Community Content SDK

This milestone makes levels and injects isolated, auto-discovered contributions instead of shared-array edits.

## What changed

- One folder is one regional level / mission pack.
- One JSON file is one decision inject.
- Vite automatically discovers playable packs and their inject files.
- Scaffold commands create correctly shaped content without engine edits.
- JSON schemas provide VS Code field guidance.
- Validation reports exact file and field errors.
- GitHub issue forms support scenario and mission-pack proposals.
- The pull-request template separates content changes from engine changes.
- GitHub Actions publishes a content inventory in the workflow summary.
- Optional contribution metadata keeps authors, sources, and license with an inject.

## Apply and verify

Extract this patch at the repository root while on a new feature branch, then run:

```powershell
npm run validate:content
npm run content:report
npm run build
```

The legacy regional JSON arrays may remain in the repository for history, but the application no longer imports them. New work belongs only under `src/content/packs/`.

## Try the contributor workflow

```powershell
npm run create:scenario -- --pack pacific-northwest --id contributor-test
```

This deliberately creates `TODO` markers. Validation will reject the file until they are replaced. Remove the test file after inspecting it, or complete it as a real inject.

For a new regional level:

```powershell
npm run create:level -- --id great-lakes --name "Great Lakes Continuity Exercise"
```

Draft packs are excluded from the in-game mission menu until their manifest status changes to `playable`.
