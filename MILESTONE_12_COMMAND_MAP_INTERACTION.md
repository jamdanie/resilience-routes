# Milestone 12 — Command-map clarity and interaction

This milestone reduces map clutter and gives mouse, touch, and keyboard players the same direct path into an inject.

## Changes

- Decision-node cards use a smaller compact layout by default.
- Hovering or focusing a node expands only that node above the map.
- Compact placement uses smaller collision boundaries to reduce label overlap.
- A **Labels: Compact / Detailed** control lets the player choose the amount of on-map text.
- The Node Intelligence panel includes an **Investigate selected node** button.
- Hover, canvas click, sidebar click, WASD/arrow movement, and `E` all open the same challenge workflow.
- Addressed nodes disable the sidebar investigation action.
- Mobile toolbar controls stack at narrow widths.

## Verify

```powershell
npm run build
npm run dev
```

Test a mission with both label modes. Hover each active node, use the Node Intelligence button, click a node directly, and complete one inject using WASD plus `E`.
