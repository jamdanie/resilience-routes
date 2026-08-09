import type {
  GeoCursorUpdate,
  LogisticsSnapshot,
  MapPoint,
  MissionGeography,
  MissionRunPlan
} from "./types";

export const MAP_BOUNDS = { left: 0, top: 96, right: 960, bottom: 600 } as const;

export interface GeographicPoint {
  longitude: number;
  latitude: number;
}

export function screenToGeographic(x: number, y: number, geography: MissionGeography): GeographicPoint {
  const xRatio = clamp((x - MAP_BOUNDS.left) / (MAP_BOUNDS.right - MAP_BOUNDS.left), 0, 1);
  const yRatio = clamp((y - MAP_BOUNDS.top) / (MAP_BOUNDS.bottom - MAP_BOUNDS.top), 0, 1);
  return {
    longitude: geography.bounds.west + xRatio * (geography.bounds.east - geography.bounds.west),
    latitude: geography.bounds.north - yRatio * (geography.bounds.north - geography.bounds.south)
  };
}

export function formatCoordinate(value: number, positive: string, negative: string): string {
  return `${Math.abs(value).toFixed(4)}°${value >= 0 ? positive : negative}`;
}

export function gridReference(x: number, y: number): string {
  const column = String.fromCharCode(65 + Math.min(9, Math.max(0, Math.floor((x / 960) * 10))));
  const row = String(Math.min(9, Math.max(0, Math.floor(((y - 96) / 504) * 10))) + 1).padStart(2, "0");
  return `${column}${row}`;
}

export function cursorUpdate(x: number, y: number, geography: MissionGeography): GeoCursorUpdate {
  const point = screenToGeographic(x, y, geography);
  return { x: Math.round(x), y: Math.round(y), ...point, gridReference: gridReference(x, y) };
}

export function haversineMiles(a: GeographicPoint, b: GeographicPoint): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadiusMiles = 3958.8;
  const dLatitude = radians(b.latitude - a.latitude);
  const dLongitude = radians(b.longitude - a.longitude);
  const latitudeA = radians(a.latitude);
  const latitudeB = radians(b.latitude);
  const value = Math.sin(dLatitude / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(dLongitude / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

type GeoJsonGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: Array<[number, number]> };

interface GeoJsonFeature {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: Record<string, string | number | boolean | null>;
}

export interface OperatingPictureGeoJson {
  type: "FeatureCollection";
  name: string;
  metadata: Record<string, string | boolean>;
  features: GeoJsonFeature[];
}

export function buildOperatingPictureGeoJson(
  runPlan: MissionRunPlan,
  snapshot: LogisticsSnapshot | null
): OperatingPictureGeoJson {
  const { mission } = runPlan;
  const activeIds = new Set(runPlan.activeScenarioIds);
  const toCoordinates = ([x, y]: MapPoint): [number, number] => {
    const point = screenToGeographic(x, y, mission.geography);
    return [round(point.longitude, 6), round(point.latitude, 6)];
  };
  const features: GeoJsonFeature[] = [];

  mission.routes.forEach((route, index) => features.push({
    type: "Feature",
    geometry: { type: "LineString", coordinates: [toCoordinates(route.from), toCoordinates(route.to)] },
    properties: { layer: "network-route", routeIndex: index + 1, color: route.color }
  }));

  runPlan.scenarios.filter((scenario) => activeIds.has(scenario.id)).forEach((scenario) => features.push({
    type: "Feature",
    geometry: { type: "Point", coordinates: toCoordinates([scenario.x, scenario.y]) },
    properties: { layer: "decision-node", id: scenario.id, title: scenario.title, nodeType: scenario.nodeType, event: scenario.event }
  }));

  snapshot?.assets.forEach((asset) => features.push({
    type: "Feature",
    geometry: { type: "Point", coordinates: toCoordinates([asset.x, asset.y]) },
    properties: { layer: "live-logistics", id: asset.id, name: asset.name, mode: asset.mode, status: asset.status, routeState: asset.routeState, cargo: asset.cargo }
  }));

  runPlan.ambientEvents.forEach((event) => features.push({
    type: "Feature",
    geometry: { type: "Point", coordinates: toCoordinates(event.location) },
    properties: { layer: "scheduled-inject", id: event.id, kind: event.kind, title: event.title, triggerSeconds: event.triggerSeconds, durationSeconds: event.durationSeconds }
  }));

  return {
    type: "FeatureCollection",
    name: `${mission.name} operating picture`,
    metadata: {
      missionId: mission.id,
      missionSeed: runPlan.seed,
      referenceName: mission.geography.referenceName,
      coordinateReferenceSystem: mission.geography.crs,
      fictionalExerciseData: true,
      exportedAt: new Date().toISOString()
    },
    features
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
