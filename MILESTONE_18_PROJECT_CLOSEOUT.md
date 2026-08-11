# Milestone 18 — Project Closeout

Version 8.0.0 is the feature-complete Resilience Routes course and portfolio baseline.

## Closeout changes

- Reconciled public contributor credit with documented, delivered work.
- Recorded James Daniels as Project Lead across product direction, implementation, integration, documentation, testing, deployment, and releases.
- Recorded Justin Ngo as Co-Lead for game development, functionality, playtesting, and U.S.-scale scenario work.
- Added and attributed Justin's Pacific Northwest port cyber-scheduling inject.
- Kept Sunny Wescott and John P. Farrell in acknowledgments for concept/program direction and mentorship/operational context.
- Defined a maintenance boundary and moved major expansion ideas into optional, separately approved product phases.

## Supported maintenance

The project remains open to reproducible bug fixes, dependency and security maintenance, accessibility improvements, documentation corrections, and reviewed contributor content.

## Release verification

Before tagging the release:

```powershell
npm ci
npm run content:report
npm run build
```

The expected content report is two playable mission packs and 17 decision injects.
