import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

function hashSeed(seed) {
  let value = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function seededRandom(seed) {
  let state = hashSeed(seed) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(values, random) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function plan(mission, scenarios, seed) {
  const random = seededRandom(`${mission.id}:${seed}`);
  const randomizedScenarios = scenarios.map((scenario) => {
    const originalCorrect = scenario.options[scenario.correctIndex];
    const pairs = shuffled(
      scenario.options.map((option, index) => ({ option, rationale: scenario.optionRationales[index] })),
      random,
    );
    return {
      id: scenario.id,
      options: pairs.map(({ option }) => option),
      rationales: pairs.map(({ rationale }) => rationale),
      correctIndex: pairs.findIndex(({ option }) => option === originalCorrect),
      originalCorrect,
      originalPairs: new Map(scenario.options.map((option, index) => [option, scenario.optionRationales[index]])),
    };
  });
  const active = shuffled(randomizedScenarios.map(({ id }) => id), random).slice(0, mission.target);
  const condition = mission.operatingConditions[Math.floor(random() * mission.operatingConditions.length)].id;
  const initialAlternateIndex = Math.floor(random() * mission.assets.length);
  const assetPlans = mission.assets.map((asset, index) => ({
    assetId: asset.id,
    startProgress: random(),
    speedMultiplier: 0.82 + random() * 0.36,
    reverseDirection: random() >= 0.5,
    initialRoute: index === initialAlternateIndex ? "alternate" : "planned",
  }));
  const affectedAssetIds = shuffled(mission.assets.map(({ id }) => id), random)
    .slice(0, Math.min(mission.assets.length, 2 + Math.floor(random() * 2)));
  const weatherMovesEast = random() >= 0.5;
  const weatherPlan = {
    startX: weatherMovesEast ? -145 : 1105,
    endX: weatherMovesEast ? 1105 : -145,
    trackY: 205 + Math.floor(random() * 210),
    cycleOffsetSeconds: random() * mission.weather.cycleSeconds,
    affectedAssetIds,
  };
  const ambientEvents = shuffled(mission.ambientEvents, random)
    .slice(0, Math.min(2, mission.ambientEvents.length))
    .map((event, index) => ({
      ...event,
      triggerSeconds: Math.round((index === 0 ? 9 : 27) + random() * (index === 0 ? 8 : 14)),
    }))
    .sort((a, b) => a.triggerSeconds - b.triggerSeconds);
  return { randomizedScenarios, active, condition, assetPlans, weatherPlan, ambientEvents };
}

const packs = [
  ["../src/data/missions/pacific-northwest.json", "../src/data/scenarios.json"],
  ["../src/data/missions/gulf-coast.json", "../src/data/gulf-coast-scenarios.json"],
];

for (const [missionFile, scenariosFile] of packs) {
  const mission = JSON.parse(await readFile(fileURLToPath(new URL(missionFile, import.meta.url)), "utf8"));
  const scenarios = JSON.parse(await readFile(fileURLToPath(new URL(scenariosFile, import.meta.url)), "utf8"));
  const baseline = plan(mission, scenarios, "REPEATABLE-42");
  assert.deepEqual(plan(mission, scenarios, "REPEATABLE-42"), baseline, `${mission.id}: identical seeds must reproduce a run`);
  assert.equal(baseline.active.length, mission.target, `${mission.id}: run must select exactly the mission target`);
  assert.equal(new Set(baseline.active).size, mission.target, `${mission.id}: active disruption IDs must be unique`);
  assert.equal(baseline.assetPlans.length, mission.assets.length, `${mission.id}: every logistics asset needs a seeded plan`);
  assert.equal(baseline.assetPlans.filter(({ initialRoute }) => initialRoute === "alternate").length, 1, `${mission.id}: one asset should begin on a seeded alternate route`);
  assert.equal(baseline.ambientEvents.length, 2, `${mission.id}: two temporary injects should be scheduled`);
  assert.ok(baseline.ambientEvents[0].triggerSeconds < baseline.ambientEvents[1].triggerSeconds, `${mission.id}: temporary injects should have ordered trigger times`);
  assert.ok(baseline.weatherPlan.affectedAssetIds.length >= 2, `${mission.id}: localized weather should affect at least two assets`);

  baseline.randomizedScenarios.forEach((scenario) => {
    assert.equal(scenario.options[scenario.correctIndex], scenario.originalCorrect, `${mission.id}/${scenario.id}: correct answer must survive shuffling`);
    scenario.options.forEach((option, index) => {
      assert.equal(scenario.rationales[index], scenario.originalPairs.get(option), `${mission.id}/${scenario.id}: rationale must remain paired to its option`);
    });
  });

  const distinctRuns = new Set(
    Array.from({ length: 24 }, (_, index) => {
      const candidate = plan(mission, scenarios, `VARIATION-${index}`);
      return `${candidate.active.join("|")}:${candidate.condition}:${candidate.randomizedScenarios[0].options.join("|")}:${candidate.assetPlans.map((asset) => `${asset.assetId}-${asset.startProgress.toFixed(2)}-${asset.reverseDirection}-${asset.initialRoute}`).join("|")}:${candidate.weatherPlan.startX}-${candidate.weatherPlan.trackY}:${candidate.ambientEvents.map(({ id }) => id).join("|")}`;
    }),
  );
  assert.ok(distinctRuns.size >= 12, `${mission.id}: seed variation should produce meaningfully different runs`);
}

console.log(`Verified deterministic replay and varied mission generation for ${packs.length} mission packs.`);
