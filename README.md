# Resilience Routes

**Resilience Routes** is a browser-based global supply-chain resilience exercise developed around Sunny Wescott's concept: teach how trade, infrastructure, hazards, resource sharing, and human decisions interact across a connected network.

[Play the live exercise](https://jamdanie.github.io/resilience-routes/)

## What players do

Players act as a regional continuity lead responsible for ports, rail, aviation, warehousing, and digital logistics. They receive disruption injects, work with incomplete information, consult advisors, allocate limited resources, and manage cascading consequences.

## Game-ready features

- Connected infrastructure network with dynamic node health
- Sequential cyber, weather, inventory, information, and humanitarian injects
- Funds, response-team, and intelligence resources
- Timed decisions with an untimed accessibility option
- Fog of war and intelligence verification
- Logistics, cyber, and public-safety advisor perspectives
- Cascading operational effects
- Preparedness and resilience scoring
- Autosave and resume in the local browser
- Achievements and replayable decision tradeoffs
- Interactive dependency-analysis view
- After-action review with JSON export and Print/Save PDF
- Responsive layout and keyboard shortcuts
- Static GitHub Pages deployment with no database or credentials

## Quick start

```powershell
npm ci
npm run dev
```

Production check:

```powershell
npm run build
```

## Keyboard controls

- `Enter`: commit a selected decision
- `R`: spend intelligence to reveal verified information
- `N`: start a new mission
- `Esc`: close settings

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Facilitator Guide](docs/FACILITATOR_GUIDE.md)
- [Scenario Authoring](docs/SCENARIO_AUTHORING.md)
- [Roadmap](docs/ROADMAP.md)
- [Contributors and attribution](docs/CONTRIBUTORS.md)
- [Government and public resources](docs/GOVERNMENT_RESOURCES.md)
- [Research and source policy](docs/RESEARCH_AND_SOURCE_POLICY.md)
- [Accessibility](docs/ACCESSIBILITY.md)
- [Educational disclaimer](docs/CONTENT_DISCLAIMER.md)
- [Project plan](PROJECT_PLAN.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## Project intent

This project can operate as:

1. A self-guided educational game
2. A digital companion to a tabletop exercise
3. A portfolio showing team research, design, software, and emergency-management thinking
4. A future facilitator toolkit for classroom or professional exercises

## Technology

Vite, TypeScript, HTML, CSS, browser local storage, and GitHub Pages.

The current release intentionally remains static. Real-time multiplayer, shared facilitator sessions, authenticated classrooms, and live external feeds require a separately designed backend and privacy model.


## Contributors

The project documents contributor roles and requires accepted work to be credited through issues, commits, pull requests, reviews, and the changelog. See [Contributors and Attribution](docs/CONTRIBUTORS.md).

## Government and learning resources

The in-game learning library and [Government Resources](docs/GOVERNMENT_RESOURCES.md) connect scenarios to FEMA, Ready.gov, U.S. DOT, CISA, NIST, transportation data, trade data, and public-health preparedness material. Linking does not imply sponsorship or endorsement.

## Disclaimer

This project is an educational simulation, not an operational emergency-management, transportation, cybersecurity, medical, or government decision-support system.
