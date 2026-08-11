# Patch 8.1 — Map interaction and UI cleanup

This patch addresses the first playtest of the dynamic-world release.

## Changes

- Only the three active decision nodes appear on the live map. Other scenarios remain available in the library and can be selected by a different seed.
- A deterministic spacing pass moves active cards when their original positions would overlap.
- Every visible node supports mouse selection. Completed nodes remain selectable for review.
- Vehicle, weather, and temporary-inject mouse targets are larger and show a pointer cursor.
- Temporary inject markers show their label only during hover and send full details to the intelligence panel when clicked.
- The terrain layer is on by default and its control is located in a map toolbar directly above the canvas.
- The header uses two compact rows at tablet widths instead of placing actions on a third row.

## Verification

```powershell
npm run build
```

The build validates 2 mission packs and 16 scenarios, tests seeded replay and variation, type-checks the application, and creates the production bundle.
