import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const examplesDirectory = fileURLToPath(new URL("../docs/examples/", import.meta.url));
const allowedStatuses = new Set(["In transit", "Delayed", "Holding", "Rerouted"]);
const allowedModes = new Set(["Vessel", "Aircraft", "Freight train", "Truck"]);
const requiredTextFields = [
  "id", "title", "nodeType", "color", "event", "why", "how", "when", "where",
  "question", "takeaway", "responsePrinciple",
];
const effectTextFields = [
  "assetId", "activeStatus", "activeReason", "correctStatus", "correctReason",
  "incorrectStatus", "incorrectReason",
];
const missionFiles = [
  {
    definition: "../src/data/missions/pacific-northwest.json",
    scenarios: "../src/data/scenarios.json",
  },
  {
    definition: "../src/data/missions/gulf-coast.json",
    scenarios: "../src/data/gulf-coast-scenarios.json",
  },
];

const errors = [];

function fail(location, message) {
  errors.push(`${location}: ${message}`);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPoint(value) {
  return Array.isArray(value) && value.length === 2 && value.every(Number.isFinite);
}

function validateStringArray(value, expectedLength, location) {
  if (!Array.isArray(value) || value.length !== expectedLength) {
    fail(location, `must contain exactly ${expectedLength} items`);
    return;
  }
  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) fail(`${location}[${index}]`, "must be a non-empty string");
  });
}

function validateMission(mission, scenarioCount, location) {
  ["id", "name", "region", "mapTitle", "mapSubtitle", "description", "commandIntent"].forEach((field) => {
    if (!isNonEmptyString(mission?.[field])) fail(`${location}.${field}`, "must be a non-empty string");
  });

  if (!Number.isInteger(mission?.target) || mission.target < 1 || mission.target > scenarioCount) {
    fail(`${location}.target`, `must be an integer from 1 through ${scenarioCount}`);
  }
  if (!isPoint(mission?.playerStart)) fail(`${location}.playerStart`, "must be an [x, y] point");

  const assetIds = new Set();
  if (!Array.isArray(mission?.assets) || mission.assets.length === 0) {
    fail(`${location}.assets`, "must contain at least one logistics asset");
  } else {
    mission.assets.forEach((asset, index) => {
      const assetLocation = `${location}.assets[${index}]`;
      ["id", "name", "route", "cargo", "meaning", "color"].forEach((field) => {
        if (!isNonEmptyString(asset?.[field])) fail(`${assetLocation}.${field}`, "must be a non-empty string");
      });
      if (assetIds.has(asset?.id)) fail(`${assetLocation}.id`, `duplicates the id "${asset.id}"`);
      assetIds.add(asset?.id);
      if (!allowedModes.has(asset?.mode)) fail(`${assetLocation}.mode`, `must be one of: ${[...allowedModes].join(", ")}`);
      if (!Array.isArray(asset?.path) || asset.path.length < 2 || !asset.path.every(isPoint)) {
        fail(`${assetLocation}.path`, "must contain at least two [x, y] points");
      }
      if (!Number.isFinite(asset?.speed) || asset.speed <= 0) fail(`${assetLocation}.speed`, "must be greater than zero");
    });
  }

  if (!Array.isArray(mission?.routes) || mission.routes.length === 0) {
    fail(`${location}.routes`, "must contain at least one route");
  } else {
    mission.routes.forEach((route, index) => {
      if (!isPoint(route?.from) || !isPoint(route?.to)) fail(`${location}.routes[${index}]`, "must include valid from/to points");
    });
  }

  const weatherPhases = ["approaching", "warning", "clearing"];
  if (!Number.isFinite(mission?.weather?.cycleSeconds) || mission.weather.cycleSeconds < 15) {
    fail(`${location}.weather.cycleSeconds`, "must be at least 15 seconds");
  }
  weatherPhases.forEach((phase) => {
    const phaseData = mission?.weather?.phases?.[phase];
    ["title", "severity", "summary", "wind", "affectedArea", "timing"].forEach((field) => {
      if (!isNonEmptyString(phaseData?.[field])) fail(`${location}.weather.phases.${phase}.${field}`, "must be a non-empty string");
    });
    if (!Array.isArray(phaseData?.assetEffects)) {
      fail(`${location}.weather.phases.${phase}.assetEffects`, "must be an array");
    } else {
      phaseData.assetEffects.forEach((effect, index) => {
        if (!assetIds.has(effect?.assetId)) fail(`${location}.weather.phases.${phase}.assetEffects[${index}].assetId`, "must reference a mission asset");
        if (!allowedStatuses.has(effect?.status)) fail(`${location}.weather.phases.${phase}.assetEffects[${index}].status`, "must be a supported status");
      });
    }
  });

  if (!Array.isArray(mission?.operatingConditions) || mission.operatingConditions.length < 2) {
    fail(`${location}.operatingConditions`, "must contain at least two random operating conditions");
  } else {
    mission.operatingConditions.forEach((condition, index) => {
      const conditionLocation = `${location}.operatingConditions[${index}]`;
      ["id", "title", "summary"].forEach((field) => {
        if (!isNonEmptyString(condition?.[field])) fail(`${conditionLocation}.${field}`, "must be a non-empty string");
      });
      ["startingResilienceAdjustment", "disruptionMultiplier", "recoveryAdjustment", "wrongAnswerAdjustment"].forEach((field) => {
        if (!Number.isFinite(condition?.[field])) fail(`${conditionLocation}.${field}`, "must be a number");
      });
    });
  }

  return assetIds;
}

function validateScenario(scenario, index, seenIds, allowedAssetIds, prefix = "scenario") {
  const location = `${prefix}[${index}]`;
  if (!scenario || typeof scenario !== "object" || Array.isArray(scenario)) {
    fail(location, "must be an object");
    return;
  }
  requiredTextFields.forEach((field) => {
    if (!isNonEmptyString(scenario[field])) fail(`${location}.${field}`, "must be a non-empty string");
  });
  if (isNonEmptyString(scenario.id)) {
    if (seenIds.has(scenario.id)) fail(`${location}.id`, `duplicates the id "${scenario.id}"`);
    seenIds.add(scenario.id);
  }
  if (!/^#[0-9a-f]{6}$/i.test(scenario.color ?? "")) fail(`${location}.color`, "must be a six-digit hex color");
  if (!Number.isFinite(scenario.x) || scenario.x < 70 || scenario.x > 890) fail(`${location}.x`, "must be a number from 70 through 890");
  if (!Number.isFinite(scenario.y) || scenario.y < 100 || scenario.y > 470) fail(`${location}.y`, "must be a number from 100 through 470");

  if (!Array.isArray(scenario.keyTerms) || scenario.keyTerms.length < 2) {
    fail(`${location}.keyTerms`, "must contain at least two glossary terms");
  } else {
    scenario.keyTerms.forEach((term, termIndex) => {
      ["term", "definition", "example", "whyItMatters"].forEach((field) => {
        if (!isNonEmptyString(term?.[field])) fail(`${location}.keyTerms[${termIndex}].${field}`, "must be a non-empty string");
      });
    });
  }
  validateStringArray(scenario.cascadeSteps, 4, `${location}.cascadeSteps`);
  validateStringArray(scenario.options, 3, `${location}.options`);
  validateStringArray(scenario.optionRationales, 3, `${location}.optionRationales`);
  if (!Number.isInteger(scenario.correctIndex) || scenario.correctIndex < 0 || scenario.correctIndex > 2) fail(`${location}.correctIndex`, "must be 0, 1, or 2");
  if (!Number.isInteger(scenario.basePenalty) || scenario.basePenalty < 1 || scenario.basePenalty > 30) fail(`${location}.basePenalty`, "must be an integer from 1 through 30");

  if (!Array.isArray(scenario.logisticsEffects) || scenario.logisticsEffects.length === 0) {
    fail(`${location}.logisticsEffects`, "must contain at least one current-region asset effect");
  } else {
    scenario.logisticsEffects.forEach((effect, effectIndex) => {
      const effectLocation = `${location}.logisticsEffects[${effectIndex}]`;
      effectTextFields.forEach((field) => {
        if (!isNonEmptyString(effect?.[field])) fail(`${effectLocation}.${field}`, "must be a non-empty string");
      });
      if (!allowedAssetIds.has(effect?.assetId)) fail(`${effectLocation}.assetId`, `must reference a mission asset: ${[...allowedAssetIds].join(", ")}`);
      ["activeStatus", "correctStatus", "incorrectStatus"].forEach((field) => {
        if (!allowedStatuses.has(effect?.[field])) fail(`${effectLocation}.${field}`, `must be one of: ${[...allowedStatuses].join(", ")}`);
      });
    });
  }
}

let missionCount = 0;
let scenarioCount = 0;
let exampleAssetIds = new Set();

for (const files of missionFiles) {
  try {
    const definitionPath = fileURLToPath(new URL(files.definition, import.meta.url));
    const scenariosPath = fileURLToPath(new URL(files.scenarios, import.meta.url));
    const mission = JSON.parse(await readFile(definitionPath, "utf8"));
    const scenarios = JSON.parse(await readFile(scenariosPath, "utf8"));
    if (!Array.isArray(scenarios) || scenarios.length === 0) {
      fail(files.scenarios, "must be a non-empty scenario array");
      continue;
    }
    const assetIds = validateMission(mission, scenarios.length, `mission:${mission?.id ?? files.definition}`);
    const seenIds = new Set();
    scenarios.forEach((scenario, index) => validateScenario(scenario, index, seenIds, assetIds, mission?.id ?? "mission"));
    if (mission?.id === "pacific-northwest") exampleAssetIds = assetIds;
    missionCount += 1;
    scenarioCount += scenarios.length;
  } catch (error) {
    fail(files.definition, `could not validate mission pack: ${error.message}`);
  }
}

let exampleCount = 0;
try {
  const exampleFiles = (await readdir(examplesDirectory)).filter((file) => file.endsWith(".json"));
  for (const file of exampleFiles) {
    const example = JSON.parse(await readFile(`${examplesDirectory}/${file}`, "utf8"));
    validateScenario(example, file, new Set(), exampleAssetIds, "example");
    exampleCount += 1;
  }
} catch (error) {
  fail("docs/examples", `could not validate examples: ${error.message}`);
}

if (errors.length > 0) {
  console.error(`Mission validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validated ${missionCount} mission packs, ${scenarioCount} scenarios, and ${exampleCount} authoring example${exampleCount === 1 ? "" : "s"}.`);
