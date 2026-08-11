# Apply Milestone 17

This patch expects the consequence-lens milestone to already be present.

From the Resilience Routes project root, run each command separately:

```powershell
git status
git switch -c feature/gis-operations-workbench
```

Locate the downloaded archive:

```powershell
$zip = Get-ChildItem "$HOME\Downloads" -Filter "resilience-routes-gis-workbench-m17*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
$zip
```

Extract the patch over the project:

```powershell
Expand-Archive -Path $zip -DestinationPath . -Force
```

Validate and launch:

```powershell
npm run build
npm run dev
```

Test both regions. Open **GIS tools** or press `I`, then verify Navigate, Identify, Measure, coordinate-grid visibility, weather/logistics switches, and GeoJSON export. Return to Navigate before selecting a decision node.

After testing:

```powershell
git add .
git commit -m "Add GIS operations workbench and GeoJSON export"
git push -u origin feature/gis-operations-workbench
```
