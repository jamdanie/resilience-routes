# Resilience Routes Project Plan

## Current stopping point — Version 8.0.0

Resilience Routes is feature-complete for its course, demonstration, and portfolio purpose. A first-time player can:

- understand the mission without verbal instruction;
- choose a region, difficulty, and reproducible seed;
- use mouse, touch, or keyboard controls;
- investigate connected physical and digital infrastructure;
- interpret animated logistics, weather, operating conditions, and temporary injects;
- compare limited-resource response choices with plain-language definitions and rationales;
- use map layers, consequence tracing, coordinates, identification, measurement, and GeoJSON export;
- stabilize a network and review a printable after-action report;
- compare browser-local run history; and
- run the same static build locally or through GitHub Pages.

## Completed product capabilities

- Pacific Northwest and Gulf Coast / Texas mission packs
- 17 complete decision injects and 10 temporary injects
- Deterministic seeded mission, option, logistics, weather, and inject randomization
- Strategic resource and intelligence economies with tested fallbacks
- Live vessels, aircraft, trains, trucks, reroutes, delays, and holding states
- Operational basemap with infrastructure, terrain, water, and minimal display modes
- GIS workbench with WGS84 exercise extents, identify, measure, layers, and GeoJSON export
- Network consequence lens and downstream dependency explanations
- Mission pause, zoom, focus mode, fly-out references, and searchable command palette
- Browser-local run history, replay, scoring, and after-action reporting
- JSON content SDK, schemas, scaffolding, validation, automated mission tests, and contributor guidance
- GitHub Pages build and deployment workflow

## Maintenance boundary

The supported work after 8.0.0 is:

1. Reproducible bug fixes
2. Dependency and security maintenance
3. Accessibility findings and compatibility fixes
4. Reviewed injects or regional mission packs that pass the content workflow
5. Documentation corrections

New core systems are outside the current release scope. They should begin only after a written product decision that identifies the audience, owner, maintenance cost, privacy model, and acceptance criteria.

## Optional future product phases

These ideas are intentionally deferred and are not required for the completed release:

- Facilitator-controlled, role-based multiplayer with a separately approved backend
- Installable offline/PWA delivery
- A browser-based scenario editor with preview and JSON export
- Moderated cohort analytics with explicit consent and data-retention rules
- Formal accessibility testing with keyboard-only and screen-reader users
- Expanded end-to-end browser automation

## Release acceptance checklist

- `npm run build` passes.
- Content validation reports two playable packs and 17 decision injects.
- Easy, Medium, and Hard missions can complete and replay cleanly.
- A repeated seed reproduces the same run setup.
- Mouse and keyboard investigation both work.
- Pause, references, command palette, consequence lens, and GIS workbench work during a mission.
- The after-action report handles successful, incomplete, and expired missions accurately.
- Public contributor credit matches documented, incorporated work.
