# Milestone 6 — QA fixes and contributor workflow

## QA fixes

- Medium and Hard missions now reset their timer when **Run Another Mission** creates a new scene.
- A mission with no completed decisions receives **No performance band — no decisions recorded**.
- An expired, failed, or unfinished mission receives **Incomplete mission** instead of a strong band.
- A strong performance band now requires mission completion, at least 80 resilience, and at least 80% decision accuracy.

## Contribution workflow

- GitHub's **Scenario proposal** issue form supports no-code submissions.
- `docs/examples/pnw-scenario-example.json` provides a complete copyable scenario.
- `npm run validate:scenarios` gives specific errors before a contribution is submitted.
- Pull requests automatically validate scenarios, type-check the code, and build the site.
- Pacific Northwest incidents may join the current mission; other regions are grouped as separate proposed mission sets.

## Manual QA

1. Start a Medium mission, allow the clock to expire, and open the report.
2. Confirm the report says there were no decisions and does not show a strong band.
3. Select **Run Another Mission** and start Medium again.
4. Confirm the timer begins at 4:00 and counts down normally.
5. Repeat on Hard and confirm the new timer begins at 3:00.
6. Complete three disruptions with at least 80 resilience and 80% accuracy; confirm the report shows a strong band.
