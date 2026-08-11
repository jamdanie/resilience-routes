# Milestone 17 — GIS Operations Workbench

This milestone adds a practical spatial-analysis layer to the fictional supply-chain exercise without introducing paid map services, API keys, or real operational tracking.

## Player capabilities

- Live WGS84 latitude/longitude and alphanumeric grid reference under the cursor
- North reference and approximate scale
- Optional coordinate grid
- Identify tool for nearest active infrastructure node
- Two-point great-circle distance measurement
- Independent weather and logistics layer visibility
- GeoJSON export of routes, active nodes, scheduled injects, and live asset positions
- `I` shortcut and command-palette entry for the GIS flyout

## Contributor contract

Mission packs now provide a validated `geography` block with `EPSG:4326`, a reference name, and west/south/east/north bounds. The level scaffold preserves this shape and the content validator catches missing, reversed, or out-of-range extents.

## Safety and portability

The geographic overlay remains explicitly fictional and approximate. It does not load external map tiles, use live tracking, collect browser location, or require a vendor account. Exported GeoJSON includes a fictional-exercise marker.

## Verification

Run:

```powershell
npm run build
```

Then launch both regions and verify Identify, Measure, layer toggles, GeoJSON export, and normal node selection after returning to Navigate.
