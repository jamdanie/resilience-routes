# Milestone 16 — Network Consequence Lens

This milestone makes the network's interdependence visible before a player commits a response.

## Added

- Animated route exposure from the selected infrastructure node
- Automatic dimming of unrelated decision nodes to reduce visual overlap
- Connected-infrastructure summary
- Affected-movement count and asset names
- Guarded, elevated, and high exposure bands based on the authored disruption penalty
- Intelligence-confidence display
- Downstream consequence preview from the authored cascade chain
- Impact Lens toolbar control and `C` keyboard shortcut
- Impact Lens command-palette entry
- Clickable and keyboard-selectable movement-board rows
- Standalone `ConsequenceLensLayer` game module

## Contributor compatibility

No new required JSON fields were introduced. The lens uses route geometry from `mission.json` and fields already validated in each scenario file.

## Verification

```powershell
npm run build
```

Then launch both regions and verify:

1. Select each visible decision node and confirm connected routes animate.
2. Confirm unrelated nodes dim but remain selectable.
3. Compare the panel's connected infrastructure and affected movements with the selected node.
4. Toggle the lens with the toolbar, `C`, and the command palette.
5. Select each movement-board row by mouse and by Enter/Space.
