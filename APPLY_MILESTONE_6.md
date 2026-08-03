# Apply Milestone 6

This patch fixes the replay timer and performance-band findings, then adds two supported scenario-contribution routes.

## Apply on a clean branch

Run each command separately in the Resilience Routes repository:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/qa-contributor-workflow
```

Download the patch ZIP, then locate the newest matching file:

```powershell
$patch = Get-ChildItem "$HOME\Downloads" -Filter "resilience-routes-qa-contributor-workflow-m6*.zip" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName
```

Extract it into the repository:

```powershell
Expand-Archive -Path $patch -DestinationPath . -Force
```

Verify and test:

```powershell
npm ci
npm run build
npm run dev
```

Follow the replay checks in `MILESTONE_6_QA_CONTRIBUTIONS.md`. If they pass, save the work:

```powershell
git add .
git commit -m "Fix replay QA issues and add scenario contribution workflow"
git push -u origin feature/qa-contributor-workflow
```

Open the pull-request link printed by Git. GitHub will automatically run scenario validation and the production build.
