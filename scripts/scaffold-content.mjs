import { access, cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { packsRoot } from "./content-packs.mjs";

function option(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
}

function slug(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function json(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function save(path, data) {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
}

function requireSlug(value, label) {
  const normalized = slug(value);
  if (!normalized) throw new Error(`Provide ${label} with --${label} your-kebab-case-id`);
  if (normalized !== value) throw new Error(`${label} must already be lowercase kebab-case. Try: ${normalized}`);
  return normalized;
}

async function createScenario() {
  const packId = requireSlug(option("pack"), "pack");
  const id = requireSlug(option("id"), "id");
  const packRoot = join(packsRoot, packId);
  const scenarioDirectory = join(packRoot, "scenarios");
  if (!(await exists(join(packRoot, "mission.json")))) throw new Error(`Unknown pack "${packId}".`);
  const files = (await readdir(scenarioDirectory)).filter((file) => file.endsWith(".json")).sort();
  if (files.length === 0) throw new Error(`Pack "${packId}" has no scenario to use as a structural reference.`);
  const output = join(scenarioDirectory, `${id}.json`);
  if (await exists(output)) throw new Error(`${output} already exists; no file was overwritten.`);

  const scenario = await json(join(scenarioDirectory, files[0]));
  scenario.id = id;
  scenario.title = "TODO: concise inject title";
  scenario.event = "TODO: describe the operational disruption.";
  scenario.why = "TODO: explain why this node or capability matters.";
  scenario.how = "TODO: explain how effects propagate through the network.";
  scenario.when = "TODO: explain when the risk becomes most serious.";
  scenario.where = "TODO: explain where consequences appear.";
  scenario.question = "TODO: ask the player for an operational decision.";
  scenario.takeaway = "TODO: state the learning takeaway.";
  scenario.responsePrinciple = "TODO: state the reusable response principle.";
  scenario.cascadeSteps = ["TODO: initial event", "TODO: first dependency", "TODO: downstream effect", "TODO: operational consequence"];
  scenario.options = ["TODO: response option one", "TODO: response option two", "TODO: response option three"];
  scenario.optionRationales = ["TODO: option-one rationale", "TODO: option-two rationale", "TODO: option-three rationale"];
  scenario.keyTerms = scenario.keyTerms.slice(0, 2).map((term, index) => ({
    term: `TODO: term ${index + 1}`,
    definition: "TODO: plain-language definition",
    example: "TODO: concrete example",
    whyItMatters: "TODO: operational importance",
  }));
  scenario.contribution = {
    authors: ["TODO: GitHub username or contributor name"],
    sources: ["Fictional exercise content."],
    license: "Project license",
    notes: "Created with the Resilience Routes content scaffold.",
  };
  await save(output, scenario);
  console.log(`Created ${output}`);
  console.log("Replace every TODO, then run: npm run validate:content");
}

async function createLevel() {
  const id = requireSlug(option("id"), "id");
  const name = option("name");
  if (!name) throw new Error("Provide a display name with --name \"Great Lakes Continuity Exercise\".");
  const sourceId = option("from", "pacific-northwest");
  const sourceRoot = join(packsRoot, sourceId);
  const outputRoot = join(packsRoot, id);
  if (!(await exists(sourceRoot))) throw new Error(`Unknown source pack "${sourceId}".`);
  if (await exists(outputRoot)) throw new Error(`${outputRoot} already exists; no folder was overwritten.`);

  await mkdir(outputRoot, { recursive: true });
  await cp(join(sourceRoot, "mission.json"), join(outputRoot, "mission.json"));
  await mkdir(join(outputRoot, "scenarios"));
  const sourceScenario = (await readdir(join(sourceRoot, "scenarios"))).filter((file) => file.endsWith(".json")).sort()[0];
  await cp(join(sourceRoot, "scenarios", sourceScenario), join(outputRoot, "scenarios", "starter-inject.json"));

  const mission = await json(join(outputRoot, "mission.json"));
  mission.id = id;
  mission.name = name;
  mission.region = `TODO: ${name} region`;
  mission.description = `TODO: describe ${name}.`;
  mission.commandIntent = "TODO: state the command intent for this mission set.";
  await save(join(outputRoot, "mission.json"), mission);
  await save(join(outputRoot, "manifest.json"), {
    id,
    name,
    version: "0.1.0",
    status: "draft",
    description: `TODO: describe the purpose and learning focus of ${name}.`,
    contributors: ["TODO: GitHub username or contributor name"],
    license: "Project license",
  });
  const scenario = await json(join(outputRoot, "scenarios", "starter-inject.json"));
  scenario.id = "starter-inject";
  scenario.title = "TODO: first inject title";
  await save(join(outputRoot, "scenarios", "starter-inject.json"), scenario);
  console.log(`Created draft mission pack ${outputRoot} from ${sourceId}.`);
  console.log("Replace every TODO, adapt the map and assets, then change manifest status to playable.");
}

const command = process.argv[2];
try {
  if (command === "scenario") await createScenario();
  else if (command === "level") await createLevel();
  else throw new Error("Use `scenario` or `level`. See npm run create:scenario and npm run create:level.");
} catch (error) {
  console.error(`Content scaffold failed: ${error.message}`);
  process.exit(1);
}
