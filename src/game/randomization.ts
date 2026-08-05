import type { MissionPack, MissionRunPlan, Scenario } from "./types";

function hashSeed(seed: string): number {
  let value = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function seededRandom(seed: string): () => number {
  let state = hashSeed(seed) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(values: T[], random: () => number): T[] {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function shuffleScenarioOptions(scenario: Scenario, random: () => number): Scenario {
  const originalCorrectOption = scenario.options[scenario.correctIndex];
  const pairedOptions = scenario.options.map((option, index) => ({
    option,
    rationale: scenario.optionRationales[index]
  }));
  const randomized = shuffled(pairedOptions, random);

  return {
    ...scenario,
    options: randomized.map((entry) => entry.option),
    optionRationales: randomized.map((entry) => entry.rationale),
    correctIndex: randomized.findIndex((entry) => entry.option === originalCorrectOption)
  };
}

export function createMissionSeed(): string {
  const randomPart = Math.floor(Math.random() * 0xffffff)
    .toString(36)
    .padStart(5, "0");
  return `${Date.now().toString(36).slice(-5)}-${randomPart}`.toUpperCase();
}

export function createMissionRunPlan(mission: MissionPack, requestedSeed?: string): MissionRunPlan {
  const seed = requestedSeed?.trim().toUpperCase() || createMissionSeed();
  const random = seededRandom(`${mission.id}:${seed}`);
  const randomizedScenarios = mission.scenarios.map((scenario) =>
    shuffleScenarioOptions(scenario, random)
  );
  const activeScenarioIds = shuffled(
    randomizedScenarios.map((scenario) => scenario.id),
    random
  ).slice(0, mission.target);
  const condition =
    mission.operatingConditions[
      Math.floor(random() * mission.operatingConditions.length)
    ];

  const initialAlternateIndex = Math.floor(random() * mission.assets.length);
  const assetPlans = mission.assets.map((asset, index) => ({
    assetId: asset.id,
    startProgress: random(),
    speedMultiplier: 0.82 + random() * 0.36,
    reverseDirection: random() >= 0.5,
    initialRoute: index === initialAlternateIndex ? "alternate" as const : "planned" as const
  }));

  const affectedAssetIds = shuffled(
    mission.assets.map((asset) => asset.id),
    random
  ).slice(0, Math.min(mission.assets.length, 2 + Math.floor(random() * 2)));
  const weatherMovesEast = random() >= 0.5;
  const weatherPlan = {
    startX: weatherMovesEast ? -145 : 1105,
    endX: weatherMovesEast ? 1105 : -145,
    trackY: 205 + Math.floor(random() * 210),
    cycleOffsetSeconds: random() * mission.weather.cycleSeconds,
    affectedAssetIds
  };

  const ambientEvents = shuffled(mission.ambientEvents, random)
    .slice(0, Math.min(2, mission.ambientEvents.length))
    .map((event, index) => ({
      ...event,
      triggerSeconds: Math.round((index === 0 ? 9 : 27) + random() * (index === 0 ? 8 : 14))
    }))
    .sort((a, b) => a.triggerSeconds - b.triggerSeconds);

  return {
    seed,
    mission,
    condition,
    scenarios: randomizedScenarios,
    activeScenarioIds,
    assetPlans,
    weatherPlan,
    ambientEvents
  };
}
