# Apply Version 5 to the existing repository

1. Extract this package.
2. Copy all files and folders inside `resilience-routes-v5-simulator` into the existing local `resilience-routes` folder.
3. Replace files when Windows asks.

Test:

```powershell
npm ci
npm run build
npm run dev
```

Recommended branch:

```powershell
git checkout -b feature/v5-simulator
git add src README.md CHANGELOG.md APPLY-V5.md docs .github
git commit -m "Build Version 5 living operations simulator"
git push -u origin feature/v5-simulator
```

After review, merge the branch into `main`. The existing GitHub Pages workflow will deploy to:

https://jamdanie.github.io/resilience-routes/
