# Resilience Routes Roadmap

## Current release goal

The clean rebuild is complete when a first-time player can:

- understand the purpose from the landing page;
- enter Mission Control without verbal instructions;
- choose Easy, Medium, or Hard difficulty;
- launch the Phaser network;
- investigate a physical or digital infrastructure node;
- read plain-language definitions before choosing a response;
- receive a rationale for the selected option;
- stabilize three nodes;
- review and print an after-action report;
- use the interface on desktop, tablet, or phone;
- deploy the same code through GitHub Pages.

## Completed expansion milestones

- Added Pacific Northwest and Gulf Coast / Texas mission packs.
- Added deterministic seeded randomization for active incidents, response order, and operating conditions.
- Added browser-local run history and reproducible mission loading.
- Added validation for mission definitions, regional asset references, weather, and scenario content.
- Added automated tests for replay consistency and run variation.
- Added seeded vehicle position, direction, speed, and initial route selection.
- Added localized randomized weather tracks and affected-asset selection.
- Expanded the library to 16 decision injects and 10 temporary injects.
- Added an optional fictional terrain and infrastructure context layer.

## Next milestones

1. Add a dependency-inspection mode that explains route and sector relationships.
2. Add an in-browser scenario editor with preview and JSON export.
3. Add optional team roles and shared decision rounds.
4. Add a facilitator mode with selectable seeds and pause/resume controls.
5. Add accessibility testing with keyboard-only and screen-reader users.
6. Add scoring unit tests and a lightweight end-to-end browser test.
7. Add installable offline/PWA support for classrooms with unreliable connectivity.

## Playtest questions

- Could the player begin without verbal help?
- Were unfamiliar words defined before they were used in a decision?
- Did the player understand how one disruption affected connected systems?
- Did the response rationales explain why each choice helped or increased risk?
- Was the movement optional rather than a barrier?
- Was the mission objective clear?
- Was the after-action report useful enough for discussion?
- What felt too slow, too dense, or unnecessary?
