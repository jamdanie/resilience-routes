import type {
  ContentPackManifest,
  MissionDefinition,
  MissionPack,
  Scenario,
} from "../game/types";

type JsonModules<T> = Record<string, T>;

const manifestModules = import.meta.glob("../content/packs/*/manifest.json", {
  eager: true,
  import: "default",
}) as JsonModules<ContentPackManifest>;

const missionModules = import.meta.glob("../content/packs/*/mission.json", {
  eager: true,
  import: "default",
}) as JsonModules<MissionDefinition>;

const scenarioModules = import.meta.glob("../content/packs/*/scenarios/*.json", {
  eager: true,
  import: "default",
}) as JsonModules<Scenario>;

function packIdFromPath(path: string): string {
  const match = path.match(/\/packs\/([^/]+)\//);
  if (!match) throw new Error(`Unable to identify content pack from ${path}`);
  return match[1];
}

export const contentPackManifests: ContentPackManifest[] = Object.entries(manifestModules)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([, manifest]) => manifest);

export const missionPacks: MissionPack[] = Object.entries(missionModules)
  .sort(([left], [right]) => left.localeCompare(right))
  .filter(([missionPath]) => {
    const packId = packIdFromPath(missionPath);
    return contentPackManifests.find(({ id }) => id === packId)?.status === "playable";
  })
  .map(([missionPath, mission]) => {
    const packId = packIdFromPath(missionPath);
    const scenarios = Object.entries(scenarioModules)
      .filter(([scenarioPath]) => packIdFromPath(scenarioPath) === packId)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, scenario]) => scenario);

    return { ...mission, scenarios };
  });

if (missionPacks.length === 0) {
  throw new Error("No mission packs were discovered in src/content/packs.");
}

const preferredDefault = missionPacks.find(({ id }) => id === "pacific-northwest");
export const defaultMission = preferredDefault ?? missionPacks[0];

export function getMissionPack(id: string): MissionPack {
  return missionPacks.find((mission) => mission.id === id) ?? defaultMission;
}
