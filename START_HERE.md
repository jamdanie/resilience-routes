# Start Here

Do not delete your current working repository before testing this rebuild.

## Safest test

1. Extract this ZIP into a new desktop folder.
2. Open PowerShell inside the extracted folder.
3. Run each command separately:

```powershell
npm ci
```

```powershell
npm run build
```

```powershell
npm run dev
```

4. Open the local Vite address.
5. Confirm that you can:
   - enter Mission Control;
   - select a difficulty;
   - launch the Phaser network;
   - open a node;
   - read the definitions;
   - select a response;
   - stabilize three nodes;
   - open the after-action report.

## About `main.ts`

Do not remove `src/main.ts` completely. Vite needs an application entry point. In this rebuild it is intentionally tiny:

```ts
import "./style.css";
import { bootstrapApplication } from "./app/bootstrapApplication";

bootstrapApplication();
```

That is the clean architecture we wanted: `main.ts` starts the application but does not contain the application.

## Moving it into the GitHub repository

After the rebuild works locally, create a branch in the existing repository before replacing files:

```powershell
git switch -c modular-rebuild
```

Then copy the tested rebuild contents into the repository, run `npm ci` and `npm run build` again, and commit only after the build succeeds.
