## Contribution type

- [ ] One inject in an existing mission pack
- [ ] One new regional mission pack / level
- [ ] Game-engine or interface change
- [ ] Documentation, test, or maintenance change

## Summary

Describe the operational or player-facing change and link the related issue.

## Content location

- Pack ID:
- New inject file or level folder:
- Contributor / author credit:
- Sources or “Fictional exercise content” note:

## Merge-friendly scope

- [ ] An inject contribution adds one new file under `src/content/packs/<pack>/scenarios/`.
- [ ] I did not edit `src/data/missions.ts` or a legacy shared scenario array.
- [ ] A level contribution is isolated in one new `src/content/packs/<pack-id>/` folder.
- [ ] The folder name, filename, and JSON IDs match.
- [ ] No unrelated formatting or generated files are included.

## Verification

- [ ] `npm ci`
- [ ] `npm run validate:content`
- [ ] `npm run content:report`
- [ ] `npm run build`
- [ ] Desktop browser check
- [ ] Mobile-width check
- [ ] Mouse and keyboard check
- [ ] Screenshot attached for visual or new-level changes

## Content and safety review

- [ ] Three choices have credible tradeoffs and matching rationales/costs.
- [ ] At least one zero-cost fallback prevents resource deadlock.
- [ ] Claims are sourced or clearly fictional.
- [ ] Text is concise, accessible, and understandable without prior expertise.
- [ ] No credentials, personal data, sensitive operational details, proprietary material, or unlicensed assets were added.
