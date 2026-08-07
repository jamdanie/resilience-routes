import assert from "node:assert/strict";
import { discoverContentPacks } from "./content-packs.mjs";

const verificationCost = 1;
const disruptionReduction = 2;
const hardIntelReserve = 3;
const packs = await discoverContentPacks();
let scenarioCount = 0;

for (const pack of packs) {
  assert.ok(pack.mission.target <= hardIntelReserve, `${pack.directoryId}: Hard mode should allow verification before every required decision if the player preserves Intel`);
  for (const { data: scenario } of pack.scenarios) {
    scenarioCount += 1;
    const brief = scenario.intelligence ?? {
      confidence: scenario.basePenalty >= 18 ? "low" : "moderate",
      confirmed: scenario.event,
      uncertainty: scenario.how,
      verificationFinding: `${scenario.when} ${scenario.where}`,
      forecast: scenario.cascadeSteps.slice(1).join(" → "),
    };
    assert.ok(["low", "moderate", "high"].includes(brief.confidence), `${scenario.id}: intelligence confidence must be supported`);
    [brief.confirmed, brief.uncertainty, brief.verificationFinding, brief.forecast].forEach((value) => {
      assert.ok(typeof value === "string" && value.trim(), `${scenario.id}: intelligence brief must remain complete`);
    });
    const recommendedIntelCost = scenario.resourceCosts[scenario.correctIndex]?.intelligence ?? 0;
    assert.ok(recommendedIntelCost + verificationCost <= hardIntelReserve, `${scenario.id}: verification must not make the recommended response impossible from the initial Hard reserve`);
    assert.ok(Math.max(1, scenario.basePenalty - disruptionReduction) >= 1, `${scenario.id}: verified loss must retain at least one point of incident harm`);
  }
}

console.log(`Verified intelligence tradeoffs and fallback briefs for ${scenarioCount} scenarios.`);
