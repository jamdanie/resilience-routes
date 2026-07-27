# Apply the Release 4 upgrade

Copy everything inside this package into the root of the existing `resilience-routes` project and allow Windows to replace matching files.

Then run each command separately:

```powershell
npm ci
npm run build
npm run dev
```

Test Mission, Network, Guide, Learn, Team, Review, settings, autosave, export, and external-resource links.

After testing:

```powershell
git status
git add src README.md CHANGELOG.md APPLY-UPGRADE.md docs .github CODE_OF_CONDUCT.md LICENSE
git commit -m "Add learning library contributor documentation and release 4 polish"
git pull --rebase origin main
git push origin main
```

Do not manually add `dist`, `node_modules`, or `backup`.

Live URL:

https://jamdanie.github.io/resilience-routes/
