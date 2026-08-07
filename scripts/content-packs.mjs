import { readFile, readdir } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const packsRoot = join(projectRoot, "src", "content", "packs");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export function projectPath(path) {
  return relative(projectRoot, path).replaceAll("\\", "/");
}

export async function discoverContentPacks() {
  const entries = await readdir(packsRoot, { withFileTypes: true });
  const packDirectories = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((left, right) => left.name.localeCompare(right.name));

  return Promise.all(packDirectories.map(async ({ name: directoryId }) => {
    const directory = join(packsRoot, directoryId);
    const manifestPath = join(directory, "manifest.json");
    const missionPath = join(directory, "mission.json");
    const scenariosDirectory = join(directory, "scenarios");
    const scenarioEntries = await readdir(scenariosDirectory, { withFileTypes: true });
    const scenarioPaths = scenarioEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => join(scenariosDirectory, entry.name))
      .sort((left, right) => left.localeCompare(right));

    const [manifest, mission, scenarios] = await Promise.all([
      readJson(manifestPath),
      readJson(missionPath),
      Promise.all(scenarioPaths.map(async (path) => ({ path, data: await readJson(path) }))),
    ]);

    return {
      directoryId,
      directory,
      manifestPath,
      missionPath,
      scenarioPaths,
      manifest,
      mission,
      scenarios,
    };
  }));
}

export function scenarioFilename(path) {
  return basename(path, ".json");
}
