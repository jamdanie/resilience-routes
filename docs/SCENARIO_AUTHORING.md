# Scenario Authoring Guide

A strong inject teaches a clear operational concept while giving the player three credible choices with real tradeoffs. Start from `docs/examples/pnw-scenario-example.json`; do not invent a smaller schema.

## Regional scope

The playable map is currently a fictional Pacific Northwest network. New Pacific Northwest incidents can join the existing mission after review. Gulf Coast, Texas, and other regional ideas should be submitted as separate proposed mission sets because they need their own map, routes, transportation assets, hazards, and mission framing.

## Scenario fields

| Field | Purpose |
| --- | --- |
| `id` | Unique lowercase identifier used by the game and report |
| `title`, `nodeType`, `x`, `y`, `color` | Map-node label, category, position, and six-digit hex color |
| `event` | Concise description of what happened |
| `why`, `how`, `when`, `where` | Learning explanation of importance, propagation, timing, and consequences |
| `keyTerms` | At least two terms with a definition, example, and reason each matters |
| `cascadeSteps` | Exactly four ordered steps from incident to downstream consequence |
| `question` | Decision prompt shown to the player |
| `options` | Exactly three credible responses |
| `optionRationales` | Exactly three explanations in the same order as `options` |
| `correctIndex` | Position of the recommended option: `0`, `1`, or `2` |
| `takeaway` | Lesson shown after the decision |
| `responsePrinciple` | Reusable operational principle behind the recommended response |
| `basePenalty` | Whole-number disruption severity from 1 through 30 |
| `logisticsEffects` | Visible effects on current-region transportation assets |

## Logistics effects

Each `logisticsEffects` entry names an existing asset and defines its state when the disruption starts, after the recommended choice, and after another choice.

Current asset IDs:

- `vessel-cascade`
- `airlift-27`
- `freight-6`
- `roadlink-14`

Allowed statuses:

- `In transit`
- `Delayed`
- `Holding`
- `Rerouted`

Every state needs a short operational reason. The status describes what the player sees; the reason teaches why it happened.

## Writing principles

- Avoid one obviously correct moral answer.
- Make every credible option carry a cost or constraint.
- Keep on-screen text short enough to read during play.
- Separate facts from assumptions.
- Explain consequences without shaming the player.
- Use reviewed sources when scenarios make real-world factual claims.
- Do not include sensitive facility details, security weaknesses, credentials, or personal data.

## Test before submitting

```powershell
npm run validate:scenarios
npm run build
```

The first command checks the scenario structure. The second repeats that validation, type-checks the application, and creates the production build. GitHub runs the same build automatically on pull requests.
