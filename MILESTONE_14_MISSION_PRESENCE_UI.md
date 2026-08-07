# Milestone 14 — Mission presence and command workspace

This milestone makes the exercise easier to operate without reducing the simulation depth.

## Player-facing changes

- Pause and resume freezes the mission clock, weather, vehicles, and temporary injects.
- A command strip keeps the player role, mission state, quick reference, and weather-at-cursor telemetry in view.
- The circular cursor gauge estimates localized storm exposure anywhere on the operational map.
- Live movements, weather, and the mission log use collapsible panels to reduce scrolling and visual overload.
- Quick reference opens as a flyout instead of sending the player down the page.
- A live-session indicator is presence-ready and only displays a global count when a real endpoint returns one.

## Verification

```powershell
npm ci
npm run build
npm run dev
```

Launch a timed mission, pause it, and confirm that the timer and moving systems hold. Resume, move the cursor around the storm, collapse each operations panel, and open Quick reference from the command strip.
