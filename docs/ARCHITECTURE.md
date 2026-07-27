# Architecture

## Current static architecture

```text
Browser
├── Mission interface
├── Scenario and decision engine
├── Network dependency model
├── Resource and scoring engine
├── Advisor and fog-of-war layer
├── Achievement engine
├── Local autosave
└── After-action exporter

GitHub
├── Source repository
├── Pull requests and reviews
├── GitHub Actions build
└── GitHub Pages static hosting
```

No login, database, API key, server credential, or personal-information collection is required.

## Core state

The mission engine tracks infrastructure health, resilience, preparedness, resources, decisions, cascading effects, achievements, and mission settings.

## Future backend boundary

Real-time multiplayer and instructor-led sessions should be introduced only through a separate service with session authorization, minimal data collection, retention rules, server-side validation, rate limiting, and audit logging.
