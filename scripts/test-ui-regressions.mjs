import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [appShell, bootstrap, challengeModal, missionBriefing, layoutCss] = await Promise.all([
  readFile(new URL("../src/ui/appShell.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/app/bootstrapApplication.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/ui/challengeModal.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/ui/missionBriefing.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/styles/layout.css", import.meta.url), "utf8"),
]);

assert.match(appShell, /id="mission-target-list"/, "the shell must expose every selected decision node outside the map");
assert.match(bootstrap, /runPlan\.activeScenarioIds/, "the target queue must be populated from the seeded active scenario set");
assert.match(bootstrap, /events\.emit\("investigate-node", scenarioId\)/, "target queue buttons must open their linked decision node");
assert.match(bootstrap, /scenarioId: string;/, "decision results must identify the addressed target");

assert.match(appShell, /id="continuity-support"/, "the decision brief must include a mutual-aid control");
assert.match(challengeModal, /requestContinuitySupport/, "the decision controller must expose continuity support");
assert.match(challengeModal, /without identifying the recommended choice/, "mutual aid must not leak the recommended response");

const openStart = missionBriefing.indexOf("const open =");
const openEnd = missionBriefing.indexOf("const close =", openStart);
const openBody = missionBriefing.slice(openStart, openEnd);
assert.ok(openStart >= 0 && openEnd > openStart, "the briefing controller must define open and close handlers");
assert.ok(
  openBody.indexOf('backdrop.classList.remove("hidden")') < openBody.indexOf("updateStep(0)"),
  "the briefing must become measurable before its scroll position is reset",
);
assert.match(missionBriefing, /modal\.scrollTop = 0;/, "each briefing step must reset the modal scroll position synchronously");
assert.doesNotMatch(missionBriefing, /scrollTo\(\{ top: 0, behavior: "smooth" \}\)/, "briefing reset must not leave a delayed smooth-scroll transition");

assert.match(layoutCss, /body\.map-focus-active::before/, "focus mode must cover the underlying page with one dedicated backdrop");
assert.match(layoutCss, /body\.map-focus-active \.topbar/, "focus mode must isolate the map from mission-exit controls");
assert.match(layoutCss, /\.platform-shell\.map-focus-mode \.map-column[\s\S]*?inset: 12px;/, "focus mode must use one full-viewport map surface");
assert.match(bootstrap, /event\.stopPropagation\(\);[\s\S]*?setMapFocus\(!mapFocusActive\)/, "the focus toggle must not propagate into unrelated mission controls");

console.log("Verified target access, continuity support, briefing reset, and map-focus isolation regressions.");
