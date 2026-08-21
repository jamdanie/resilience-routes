import assert from "node:assert/strict";
import { discoverContentPacks } from "./content-packs.mjs";

const resourceKeys = ["funds", "crews", "transport", "fuel", "intelligence", "inventory"];
const hardInitialPool = { funds: 4, crews: 3, transport: 3, fuel: 4, intelligence: 3, inventory: 3 };
const packs = await discoverContentPacks();

function canAfford(remaining, cost) {
  return resourceKeys.every((key) => (cost[key] ?? 0) <= remaining[key]);
}

function spend(remaining, cost) {
  resourceKeys.forEach((key) => {
    remaining[key] -= cost[key] ?? 0;
  });
}

function requestContinuitySupport(remaining, costs) {
  const received = {};
  resourceKeys.forEach((key) => {
    const target = costs.reduce((highest, cost) => Math.max(highest, cost[key] ?? 0), 0);
    const shortage = Math.max(0, target - remaining[key]);
    const amount = Math.min(shortage, hardInitialPool[key] - remaining[key]);
    if (amount > 0) {
      received[key] = amount;
      remaining[key] += amount;
    }
  });
  return received;
}

function orderedSelections(values, length, selected = []) {
  if (selected.length === length) return [selected];
  return values.flatMap((value) => selected.includes(value)
    ? []
    : orderedSelections(values, length, [...selected, value]));
}

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

    const exhaustedPool = Object.fromEntries(resourceKeys.map((key) => [key, 0]));
    requestContinuitySupport(exhaustedPool, [...scenario.resourceCosts, { intelligence: 1 }]);
    scenario.resourceCosts.forEach((cost, index) => {
      assert.ok(
        canAfford(exhaustedPool, cost),
        `${scenario.id}/${index}: mutual aid must restore every listed response without revealing the recommended choice`,
      );
    });
    assert.ok(exhaustedPool.intelligence >= 1, `${scenario.id}: mutual aid must also restore signal verification capacity`);
  });

  const missionSequences = orderedSelections(scenarios, pack.mission.target);
  let supportCalls = 0;
  missionSequences.forEach((sequence) => {
    const remaining = { ...hardInitialPool };
    sequence.forEach((scenario) => {
      const supportPlans = [...scenario.resourceCosts, { intelligence: 1 }];
      if (remaining.intelligence < 1) {
        requestContinuitySupport(remaining, supportPlans);
        supportCalls += 1;
      }
      assert.ok(remaining.intelligence >= 1, `${pack.mission.id}/${scenario.id}: verification must remain recoverable`);
      spend(remaining, { intelligence: 1 });

      const recommendedCost = scenario.resourceCosts[scenario.correctIndex];
      if (!canAfford(remaining, recommendedCost)) {
        requestContinuitySupport(remaining, supportPlans);
        supportCalls += 1;
      }
      assert.ok(
        canAfford(remaining, recommendedCost),
        `${pack.mission.id}/${scenario.id}: cumulative spending must never force an ineffective response`,
      );
      spend(remaining, recommendedCost);
    });
  });
  assert.ok(supportCalls > 0, `${pack.mission.id}: ordered run coverage must exercise the mutual-aid path`);
}

assert.ok(scenarioCount >= packs.length, "every mission pack must include a scenario covered by the resource test");
console.log(`Verified resource costs, fallbacks, mutual-aid recovery, and cumulative affordability for ${scenarioCount} auto-discovered scenarios.`);
