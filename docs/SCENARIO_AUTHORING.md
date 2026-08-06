# Scenario Authoring Guide

A strong inject teaches a clear operational concept while giving the player three credible choices with real tradeoffs. Generate a complete regional template with `npm run create:scenario -- --pack <pack-id> --id <inject-id>`; do not invent a smaller schema.

## Regional scope

The simulator includes fictional Pacific Northwest and Gulf Coast / Texas mission packs. Add an incident only to the region whose infrastructure, hazards, asset IDs, and mission framing match it. Other regional ideas belong in a separate folder created with `npm run create:level`.

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
| `resourceCosts` | Exactly three cost objects in the same order as `options` |
| `correctIndex` | Position of the recommended option: `0`, `1`, or `2` |
| `takeaway` | Lesson shown after the decision |
| `responsePrinciple` | Reusable operational principle behind the recommended response |
| `basePenalty` | Whole-number disruption severity from 1 through 30 |
| `logisticsEffects` | Visible effects on current-region transportation assets |

## Logistics effects

Each `logisticsEffects` entry names an existing asset and defines its state when the disruption starts, after the recommended choice, and after another choice.

Pacific Northwest asset IDs (`src/content/packs/pacific-northwest/mission.json`):

- `vessel-cascade`
- `airlift-27`
- `freight-6`
- `roadlink-14`

Gulf Coast / Texas asset IDs (`src/content/packs/gulf-coast/mission.json`):

- `gulf-vessel-9`
- `gulf-air-5`
- `gulf-freight-12`
- `gulf-road-22`

Allowed statuses:

- `In transit`
- `Delayed`
- `Holding`
- `Rerouted`

Every state needs a short operational reason. The status describes what the player sees; the reason teaches why it happened.

## Resource costs

Each option needs one matching object in `resourceCosts`. Use only these keys:

- `funds`
- `crews`
- `transport`
- `fuel`
- `intelligence`
- `inventory`

Values must be whole numbers from 0 through 3. An empty object (`{}`) means the option does not commit a limited mission resource. Low-cost responses should still have a credible operational drawback; an empty object should never be used merely to make an option attractive.

Example:

```json
"resourceCosts": [
  { "transport": 2, "fuel": 2 },
  { "crews": 1, "transport": 2, "fuel": 1, "intelligence": 1 },
  { "inventory": 1 }
]
```

The game shuffles options, rationales, and resource costs together, so the values must be written in the same order.

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
npm run validate:content
npm run test:missions
npm run test:resources
npm run build
```

The first command checks both mission packs, their weather and asset references, and all scenario content. The second verifies reproducible seeded runs, option/cost pairing, and meaningful variation. The third checks resource fallbacks and initial affordability. The final command repeats all checks, type-checks the application, and creates the production build. GitHub runs the same build automatically on pull requests.
