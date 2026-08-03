import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const scenarioFile = fileURLToPath(
  new URL("../src/data/scenarios.json", import.meta.url),
);
const examplesDirectory = fileURLToPath(
  new URL("../docs/examples/", import.meta.url),
);

const allowedAssetIds = new Set([
  "vessel-cascade",
  "airlift-27",
  "freight-6",
  "roadlink-14",
]);
const allowedStatuses = new Set(["In transit", "Delayed", "Holding", "Rerouted"]);
const requiredTextFields = [
  "id",
  "title",
  "nodeType",
  "color",
  "event",
  "why",
  "how",
  "when",
  "where",
  "question",
  "takeaway",
  "responsePrinciple",
];
const effectTextFields = [
  "assetId",
  "activeStatus",
  "activeReason",
  "correctStatus",
  "correctReason",
  "incorrectStatus",
  "incorrectReason",
];

const errors = [];

function fail(location, message) {
  errors.push(`${location}: ${message}`);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateStringArray(value, expectedLength, location) {
  if (!Array.isArray(value) || value.length !== expectedLength) {
    fail(location, `must contain exactly ${expectedLength} items`);
    return;
  }

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      fail(`${location}[${index}]`, "must be a non-empty string");
    }
  });
}

function validateScenario(scenario, index, seenIds) {
  const location = `scenario[${index}]`;

  if (!scenario || typeof scenario !== "object" || Array.isArray(scenario)) {
    fail(location, "must be an object");
    return;
  }

  requiredTextFields.forEach((field) => {
    if (!isNonEmptyString(scenario[field])) {
      fail(`${location}.${field}`, "must be a non-empty string");
    }
  });

  if (isNonEmptyString(scenario.id)) {
    if (seenIds.has(scenario.id)) {
      fail(`${location}.id`, `duplicates the id "${scenario.id}"`);
    }
    seenIds.add(scenario.id);
  }

  if (!/^#[0-9a-f]{6}$/i.test(scenario.color ?? "")) {
    fail(`${location}.color`, "must be a six-digit hex color such as #45b7e8");
  }

  if (!Number.isFinite(scenario.x) || scenario.x < 70 || scenario.x > 890) {
    fail(`${location}.x`, "must be a number from 70 through 890");
  }
  if (!Number.isFinite(scenario.y) || scenario.y < 100 || scenario.y > 470) {
    fail(`${location}.y`, "must be a number from 100 through 470");
  }

  if (!Array.isArray(scenario.keyTerms) || scenario.keyTerms.length < 2) {
    fail(`${location}.keyTerms`, "must contain at least two glossary terms");
  } else {
    scenario.keyTerms.forEach((term, termIndex) => {
      ["term", "definition", "example", "whyItMatters"].forEach((field) => {
        if (!isNonEmptyString(term?.[field])) {
          fail(`${location}.keyTerms[${termIndex}].${field}`, "must be a non-empty string");
        }
      });
    });
  }

  validateStringArray(scenario.cascadeSteps, 4, `${location}.cascadeSteps`);
  validateStringArray(scenario.options, 3, `${location}.options`);
  validateStringArray(scenario.optionRationales, 3, `${location}.optionRationales`);

  if (!Number.isInteger(scenario.correctIndex) || scenario.correctIndex < 0 || scenario.correctIndex > 2) {
    fail(`${location}.correctIndex`, "must be 0, 1, or 2");
  }
  if (!Number.isInteger(scenario.basePenalty) || scenario.basePenalty < 1 || scenario.basePenalty > 30) {
    fail(`${location}.basePenalty`, "must be an integer from 1 through 30");
  }

  if (!Array.isArray(scenario.logisticsEffects) || scenario.logisticsEffects.length === 0) {
    fail(`${location}.logisticsEffects`, "must contain at least one current-region asset effect");
  } else {
    scenario.logisticsEffects.forEach((effect, effectIndex) => {
      const effectLocation = `${location}.logisticsEffects[${effectIndex}]`;
      effectTextFields.forEach((field) => {
        if (!isNonEmptyString(effect?.[field])) {
          fail(`${effectLocation}.${field}`, "must be a non-empty string");
        }
      });

      if (!allowedAssetIds.has(effect?.assetId)) {
        fail(
          `${effectLocation}.assetId`,
          `must be one of: ${[...allowedAssetIds].join(", ")}`,
        );
      }

      ["activeStatus", "correctStatus", "incorrectStatus"].forEach((field) => {
        if (!allowedStatuses.has(effect?.[field])) {
          fail(
            `${effectLocation}.${field}`,
            `must be one of: ${[...allowedStatuses].join(", ")}`,
          );
        }
      });
    });
  }
}

let scenarios;

try {
  scenarios = JSON.parse(await readFile(scenarioFile, "utf8"));
} catch (error) {
  console.error(`Scenario validation failed: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(scenarios) || scenarios.length === 0) {
  console.error("Scenario validation failed: src/data/scenarios.json must be a non-empty array.");
  process.exit(1);
}

const seenIds = new Set();
scenarios.forEach((scenario, index) => validateScenario(scenario, index, seenIds));

let exampleCount = 0;
try {
  const exampleFiles = (await readdir(examplesDirectory)).filter((file) => file.endsWith(".json"));
  for (const file of exampleFiles) {
    const example = JSON.parse(await readFile(`${examplesDirectory}/${file}`, "utf8"));
    validateScenario(example, `example:${file}`, new Set());
    exampleCount += 1;
  }
} catch (error) {
  fail("docs/examples", `could not validate examples: ${error.message}`);
}

if (errors.length > 0) {
  console.error(`Scenario validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Validated ${scenarios.length} scenarios and ${exampleCount} authoring example${exampleCount === 1 ? "" : "s"}.`,
);
