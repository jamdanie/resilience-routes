# Milestone 15 — Adaptive Command Center

This milestone turns the exercise workspace into a faster, more tactical command interface without changing scenario scoring or authored content.

## Added

- Searchable command palette (`Ctrl K` / `Command K`)
- Keyboard commands for pause, focus, layers, labels, zoom, reference, and glossary
- Tactical map zoom from 100% to 160%
- Distraction-free map focus mode with `Esc` to exit
- Live mission pulse showing the active inject or countdown to the next scheduled inject
- Consistent simulation suspension while a decision window is open
- Updated in-product shortcut reference and README documentation

## Verification

Run:

```powershell
npm run build
```

Then verify:

1. Launch a mission and confirm the mission pulse counts down.
2. Open the command palette with `Ctrl K`, filter a command, and run it.
3. Use `+`, `-`, and `0` to change and reset map zoom.
4. Press `F` for map focus and `Esc` to return.
5. Press `P` and confirm the clock, weather, vehicles, and inject countdown all hold.
6. Open a decision and confirm the inject timeline does not advance until the decision is committed.
