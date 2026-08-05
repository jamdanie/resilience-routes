import pacificNorthwestDefinition from "./missions/pacific-northwest.json";
import gulfCoastDefinition from "./missions/gulf-coast.json";
import pacificNorthwestScenarios from "./scenarios.json";
import gulfCoastScenarios from "./gulf-coast-scenarios.json";
import type { MissionDefinition, MissionPack, Scenario } from "../game/types";

const pacificNorthwest: MissionPack = {
  ...(pacificNorthwestDefinition as MissionDefinition),
  scenarios: pacificNorthwestScenarios as Scenario[]
};

const gulfCoast: MissionPack = {
  ...(gulfCoastDefinition as MissionDefinition),
  scenarios: gulfCoastScenarios as Scenario[]
};

export const missionPacks: MissionPack[] = [pacificNorthwest, gulfCoast];

export const defaultMission = pacificNorthwest;

export function getMissionPack(id: string): MissionPack {
  return missionPacks.find((mission) => mission.id === id) ?? defaultMission;
}
