import assert from "node:assert/strict";
import { discoverContentPacks } from "./content-packs.mjs";

const resourceKeys = ["funds", "crews", "transport", "fuel", "intelligence", "inventory"];
const hardInitialPool = { funds: 4, crews: 3, transport: 3, fuel: 4, intelligence: 3, inventory: 3 };
const packs = await discoverContentPacks();

let scenarioCount = 0;
for (const pack of packs) {
  const scenarios = pack.scenarios.map(({ data }) => data);
  scenarios.forEach((scenario) => {
    scenarioCount += 1;
    assert.equal(scenario.resourceCosts.length, scenario.options.length, `${scenario.id}: every option must have one resource cost`);
    assert.ok(
      scenario.resourceCosts.some((cost) => Object.values(cost).every((value) => value === 0)),
      `${scenario.id}: at least one option must remain available when every reserve is exhausted`,
    );
    scenario.resourceCosts.forEach((cost, index) => {
      Object.entries(cost).forEach(([key, value]) => {
        assert.ok(resourceKeys.includes(key), `${scenario.id}/${index}: ${key} must be a supported resource`);
        assert.ok(Number.isInteger(value) && value >= 0 && value <= 3, `${scenario.id}/${index}/${key}: cost must be 0–3`);
      });
    });
    const recommendedCost = scenario.resourceCosts[scenario.correctIndex];
    resourceKeys.forEach((key) => {
      assert.ok(
        (recommendedCost[key] ?? 0) <= hardInitialPool[key],
        `${scenario.id}: the recommended response must be affordable at the beginning of a Hard mission`,
      );
    });
  });
}

assert.ok(scenarioCount >= packs.length, "every mission pack must include a scenario covered by the resource test");
console.log(`Verified resource costs, fallbacks, and initial affordability for ${scenarioCount} auto-discovered scenarios.`);
