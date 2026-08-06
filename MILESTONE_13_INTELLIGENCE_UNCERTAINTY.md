# Milestone 13 — Intelligence and uncertainty

This milestone adds a pre-decision intelligence tradeoff to every inject.

## Player experience

- Every inject opens with confirmed information, uncertainty, and a locked consequence forecast.
- The player can act immediately or spend one Intel to verify the signal.
- Verification reveals a finding and downstream forecast.
- Verified intelligence reduces immediate disruption loss by two points, with a one-point minimum so the event still causes harm.
- Spending Intel can make an Intel-heavy response option unavailable, so verification is a real resource decision.
- The worked score explanation shows the unverified loss and verification reduction separately.
- The after-action report records the intelligence posture for every decision.

## Contributor support

Inject JSON can include an optional `intelligence` object with:

- `confidence`
- `confirmed`
- `uncertainty`
- `verificationFinding`
- `forecast`

The scenario scaffold creates these fields. Existing injects use a backward-compatible brief generated from their current content.

## Verify

```powershell
npm run validate:content
npm run test:intelligence
npm run build
npm run dev
```

Test one decision without verification and another after spending Intel. Confirm that resources, scoring, option availability, and the after-action report differ.
