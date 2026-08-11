# Milestone 3: Live logistics

This milestone adds a separate animated logistics layer without changing the existing scenario scoring or decision workflow.

## Apply the patch

Confirm that the project is on `feature/live-logistics`, then extract the ZIP directly into the project root and allow it to replace the listed files. Run:

```powershell
npm run build
npm run dev
```

Do not run `git restore` after extraction because it would remove the milestone changes.

## Included

- Cargo vessel, aircraft, freight train, and truck movement
- Clickable asset information in the operations sidebar
- Route, cargo, transportation definition, and current status details
- In transit, delayed, holding, rerouted, and mission-complete states
- Visible asset reactions when a related infrastructure disruption is opened
- Correct-response rerouting and continued delay after a weak response

## Test path

1. Launch the regional scenario.
2. Select each moving transportation icon.
3. Confirm its name, route, cargo, definition, and status appear under **Live movements**.
4. Open the port, rail, airport, logistics, and fuel scenarios.
5. Confirm the related asset changes to holding, delayed, or rerouted.
6. Complete a correct and an incorrect response and confirm the status changes remain visible.
7. Complete the mission and confirm the assets enter the mission-complete state.
