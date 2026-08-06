import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { discoverContentPacks, projectPath, scenarioFilename } from "./content-packs.mjs";

const examplesDirectory = fileURLToPath(new URL("../docs/examples/", import.meta.url));
const allowedStatuses = new Set(["In transit", "Delayed", "Holding", "Rerouted"]);
const allowedModes = new Set(["Vessel", "Aircraft", "Freight train", "Truck"]);
const allowedEventKinds = new Set(["weather", "economic", "security", "operations"]);
const allowedResourceKeys = new Set(["funds", "crews", "transport", "fuel", "intelligence", "inventory"]);
const requiredTextFields = [
  "id", "title", "nodeType", "color", "event", "why", "how", "when", "where",
  "question", "takeaway", "responsePrinciple",
];
const effectTextFields = [
  "assetId", "activeStatus", "activeReason", "correctStatus", "correctReason",
  "incorrectStatus", "incorrectReason",
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

function findDraftMarkers(value, location) {
  if (typeof value === "string" && /\b(?:TODO|REPLACE_ME)\b/i.test(value)) {
    fail(location, "still contains a scaffold placeholder");
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findDraftMarkers(item, `${location}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => findDraftMarkers(item, `${location}.${key}`));
  }
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

function validateManifest(manifest, directoryId, location) {
  ["id", "name", "version", "status", "description"].forEach((field) => {
    if (!isNonEmptyString(manifest?.[field])) fail(`${location}.${field}`, "must be a non-empty string");
  });
  if (manifest?.id !== directoryId) fail(`${location}.id`, `must match the pack folder name "${directoryId}"`);
  if (!/^\d+\.\d+\.\d+$/.test(manifest?.version ?? "")) fail(`${location}.version`, "must use semantic version format such as 1.0.0");
  if (!["draft", "playable"].includes(manifest?.status)) fail(`${location}.status`, "must be draft or playable");
  if (manifest?.contributors !== undefined) {
    if (!Array.isArray(manifest.contributors) || manifest.contributors.length === 0) fail(`${location}.contributors`, "must contain at least one contributor name");
    else manifest.contributors.forEach((name, index) => {
      if (!isNonEmptyString(name)) fail(`${location}.contributors[${index}]`, "must be a non-empty string");
    });
  }
  if (manifest?.license !== undefined && !isNonEmptyString(manifest.license)) fail(`${location}.license`, "must be a non-empty string");
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

  if (!Array.isArray(mission?.ambientEvents) || mission.ambientEvents.length < 3) {
    fail(`${location}.ambientEvents`, "must contain at least three temporary injects");
  } else {
    const eventIds = new Set();
    mission.ambientEvents.forEach((event, index) => {
      const eventLocation = `${location}.ambientEvents[${index}]`;
      ["id", "title", "summary"].forEach((field) => {
        if (!isNonEmptyString(event?.[field])) fail(`${eventLocation}.${field}`, "must be a non-empty string");
      });
      if (eventIds.has(event?.id)) fail(`${eventLocation}.id`, `duplicates the id "${event.id}"`);
      eventIds.add(event?.id);
      if (!allowedEventKinds.has(event?.kind)) fail(`${eventLocation}.kind`, `must be one of: ${[...allowedEventKinds].join(", ")}`);
      if (!isPoint(event?.location)) fail(`${eventLocation}.location`, "must be an [x, y] point");
      if (!Number.isFinite(event?.radius) || event.radius < 30 || event.radius > 180) fail(`${eventLocation}.radius`, "must be from 30 through 180");
      if (!Number.isFinite(event?.durationSeconds) || event.durationSeconds < 5 || event.durationSeconds > 60) fail(`${eventLocation}.durationSeconds`, "must be from 5 through 60");
      if (!Array.isArray(event?.effects) || event.effects.length === 0) {
        fail(`${eventLocation}.effects`, "must contain at least one asset effect");
      } else {
        event.effects.forEach((effect, effectIndex) => {
          const effectLocation = `${eventLocation}.effects[${effectIndex}]`;
          if (!assetIds.has(effect?.assetId)) fail(`${effectLocation}.assetId`, "must reference a mission asset");
          if (!allowedStatuses.has(effect?.status)) fail(`${effectLocation}.status`, "must be a supported status");
          if (!isNonEmptyString(effect?.reason)) fail(`${effectLocation}.reason`, "must be a non-empty string");
        });
      }
    });
  }

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
  if (!Array.isArray(scenario.resourceCosts) || scenario.resourceCosts.length !== 3) {
    fail(`${location}.resourceCosts`, "must contain exactly three cost objects in the same order as options");
  } else {
    scenario.resourceCosts.forEach((cost, costIndex) => {
      const costLocation = `${location}.resourceCosts[${costIndex}]`;
      if (!cost || typeof cost !== "object" || Array.isArray(cost)) {
        fail(costLocation, "must be an object");
        return;
      }
      Object.entries(cost).forEach(([key, value]) => {
        if (!allowedResourceKeys.has(key)) {
          fail(`${costLocation}.${key}`, `must use one of: ${[...allowedResourceKeys].join(", ")}`);
        }
        if (!Number.isInteger(value) || value < 0 || value > 3) {
          fail(`${costLocation}.${key}`, "must be a whole number from 0 through 3");
        }
      });
    });
    const hasFallback = scenario.resourceCosts.some((cost) => Object.values(cost).every((value) => value === 0));
    if (!hasFallback) {
      fail(`${location}.resourceCosts`, "must include at least one zero-cost fallback so a mission cannot deadlock");
    }
  }
  if (!Number.isInteger(scenario.correctIndex) || scenario.correctIndex < 0 || scenario.correctIndex > 2) fail(`${location}.correctIndex`, "must be 0, 1, or 2");
  if (!Number.isInteger(scenario.basePenalty) || scenario.basePenalty < 1 || scenario.basePenalty > 30) fail(`${location}.basePenalty`, "must be an integer from 1 through 30");

  if (scenario.contribution !== undefined) {
    const contributionLocation = `${location}.contribution`;
    ["authors", "sources"].forEach((field) => {
      if (!Array.isArray(scenario.contribution?.[field]) || scenario.contribution[field].length === 0) {
        fail(`${contributionLocation}.${field}`, "must contain at least one entry");
      } else {
        scenario.contribution[field].forEach((value, valueIndex) => {
          if (!isNonEmptyString(value)) fail(`${contributionLocation}.${field}[${valueIndex}]`, "must be a non-empty string");
        });
      }
    });
    if (!isNonEmptyString(scenario.contribution?.license)) fail(`${contributionLocation}.license`, "must be a non-empty string");
  }

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

try {
  const packs = await discoverContentPacks();
  if (packs.length === 0) fail("src/content/packs", "must contain at least one mission-pack folder");

  for (const pack of packs) {
    const manifestLocation = projectPath(pack.manifestPath);
    const missionLocation = projectPath(pack.missionPath);
    findDraftMarkers(pack.manifest, manifestLocation);
    findDraftMarkers(pack.mission, missionLocation);
    validateManifest(pack.manifest, pack.directoryId, manifestLocation);
    if (pack.mission?.id !== pack.directoryId) {
      fail(`${missionLocation}.id`, `must match the pack folder name "${pack.directoryId}"`);
    }
    if (pack.scenarios.length === 0) {
      fail(projectPath(`${pack.directory}/scenarios`), "must contain at least one scenario JSON file");
      continue;
    }

    const assetIds = validateMission(pack.mission, pack.scenarios.length, missionLocation);
    const seenIds = new Set();
    pack.scenarios.forEach(({ path, data }) => {
      const fileId = scenarioFilename(path);
      findDraftMarkers(data, projectPath(path));
      if (data?.id !== fileId) fail(`${projectPath(path)}.id`, `must match the filename "${fileId}.json"`);
      validateScenario(data, fileId, seenIds, assetIds, projectPath(path));
    });
    if (pack.mission?.id === "pacific-northwest") exampleAssetIds = assetIds;
    missionCount += 1;
    scenarioCount += pack.scenarios.length;
  }
} catch (error) {
  fail("src/content/packs", `could not discover mission packs: ${error.message}`);
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
