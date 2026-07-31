# Milestone 4: Weather disruption

This milestone adds a moving high-wind storm without changing the existing scenario decisions or resilience calculations.

## Included

- Animated storm cell, rain, and wind moving across the regional map
- Weather advisory, high-wind warning, and clearing phases
- Live forecast panel with wind, affected area, and timing details
- Temporary holding, delay, and rerouting effects on the vessel, aircraft, freight train, and truck
- Existing scenario status preserved underneath temporary weather effects
- Weather changes added to the mission log

## Apply the patch

Confirm that the project is on `feature/weather-disruption`, extract the ZIP directly into the project root, and allow it to replace the listed files. Then run:

```powershell
npm run build
npm run dev
```

Do not run `git restore` after extraction because it would remove the milestone changes.

## Test path

1. Launch the regional scenario.
2. Watch the storm move from the coastal side of the map toward the inland routes.
3. Confirm that the forecast panel changes from advisory to warning and then clearing.
4. During the warning, confirm that transportation assets show holding or delayed states.
5. Open and resolve a normal infrastructure scenario while the weather system remains active.
6. Confirm that scenario-related asset effects return after temporary weather conditions clear.
