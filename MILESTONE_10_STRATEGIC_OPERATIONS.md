# Milestone 10 — Strategic operations system

This milestone changes the exercise from a sequence of independent questions into a limited-resource operations simulation.

## Mission resources

Each run begins with six reserves:

- Funds
- Field crews
- Transportation capacity
- Fuel
- Intelligence
- Emergency inventory

Difficulty changes the starting amounts. Easy supports guided learning with larger reserves, Medium provides a balanced pool, and Hard creates resource scarcity.

## Decision costs

All three options in every scenario have a matching `resourceCosts` object in JSON. Option order, rationale, and cost are shuffled together by the seeded mission generator.

Before choosing, the player sees:

- Current and starting reserves
- The cost of each response
- Whether enough resources remain
- A clear reason when an option is unavailable

Committed resources remain unavailable for later disruptions. Every scenario includes at least one zero-cost fallback, preventing resource exhaustion from blocking the exercise.

## Consequences

An effective response stabilizes the immediate dependency but still creates an opportunity cost. A weak response leaves the dependency unstable and applies a downstream two-point resilience loss before the next decision or the final report.

The map displays a resource-deployment pulse, the mission log records the commitment, and the after-action report shows:

- Cost of each decision
- Remaining reserves after each decision
- Operational consequence
- Final reserves by category
- Total reserve percentage saved in local run history

## Contributor checks

Scenario validation now confirms:

- Exactly three cost objects
- Only supported resource names
- Whole-number costs from 0 through 3
- At least one zero-cost fallback
- Costs remain paired with options after seeded shuffling
- Every recommended response is initially affordable on Hard

## Verification

```powershell
npm run build
```

The build validates 2 mission packs, 16 scenarios, and the authoring example; verifies seeded variation and option/cost pairing; runs the resource-economy test; type-checks the application; and creates the production bundle.
