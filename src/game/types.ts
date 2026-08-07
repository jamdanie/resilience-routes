export type Difficulty = "easy" | "medium" | "hard";

export type StrategicResourceKey =
  | "funds"
  | "crews"
  | "transport"
  | "fuel"
  | "intelligence"
  | "inventory";

export type StrategicResourcePool = Record<StrategicResourceKey, number>;
export type StrategicResourceCost = Partial<StrategicResourcePool>;

export interface StrategicResourceUpdate {
  initial: StrategicResourcePool;
  remaining: StrategicResourcePool;
  spent: StrategicResourcePool;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  example: string;
  whyItMatters: string;
}

export interface ScenarioLogisticsEffect {
  assetId: string;
  activeStatus: LogisticsStatus;
  activeReason: string;
  correctStatus: LogisticsStatus;
  correctReason: string;
  incorrectStatus: LogisticsStatus;
  incorrectReason: string;
}

export type MapPoint = [number, number];

export interface MissionRoute {
  from: MapPoint;
  to: MapPoint;
  color: string;
}

export interface MissionAssetDefinition {
  id: string;
  name: string;
  mode: LogisticsMode;
  route: string;
  alternateRoute: string;
  cargo: string;
  meaning: string;
  color: string;
  speed: number;
  startProgress: number;
  path: MapPoint[];
  alternatePath: MapPoint[];
}

export interface WeatherAssetEffect {
  assetId: string;
  status: LogisticsStatus;
  reason: string;
}

export interface MissionWeatherPhase {
  title: string;
  severity: string;
  summary: string;
  wind: string;
  affectedArea: string;
  timing: string;
  assetEffects: WeatherAssetEffect[];
}

export interface MissionWeather {
  cycleSeconds: number;
  phases: Record<WeatherPhase, MissionWeatherPhase>;
}

export type AmbientEventKind = "weather" | "economic" | "security" | "operations";

export interface AmbientEventEffect {
  assetId: string;
  status: LogisticsStatus;
  reason: string;
}

export interface AmbientEventDefinition {
  id: string;
  kind: AmbientEventKind;
  title: string;
  summary: string;
  location: MapPoint;
  radius: number;
  durationSeconds: number;
  effects: AmbientEventEffect[];
}

export interface ScheduledAmbientEvent extends AmbientEventDefinition {
  triggerSeconds: number;
}

export interface AmbientEventRecord {
  id: string;
  kind: AmbientEventKind;
  title: string;
  summary: string;
  triggerSeconds: number;
  durationSeconds: number;
}

export interface AssetRunPlan {
  assetId: string;
  startProgress: number;
  speedMultiplier: number;
  reverseDirection: boolean;
  initialRoute: "planned" | "alternate";
}

export interface WeatherRunPlan {
  startX: number;
  endX: number;
  trackY: number;
  cycleOffsetSeconds: number;
  affectedAssetIds: string[];
}

export interface WeatherCursorUpdate {
  x: number;
  y: number;
  zone: string;
  intensity: number;
  condition: string;
  wind: string;
  proximity: string;
}

export interface OperatingCondition {
  id: string;
  title: string;
  summary: string;
  disruptionMultiplier: number;
  recoveryAdjustment: number;
  wrongAnswerAdjustment: number;
  startingResilienceAdjustment: number;
}

export interface MissionDefinition {
  id: string;
  name: string;
  region: string;
  mapTitle: string;
  mapSubtitle: string;
  description: string;
  commandIntent: string;
  target: number;
  playerStart: MapPoint;
  routes: MissionRoute[];
  assets: MissionAssetDefinition[];
  weather: MissionWeather;
  ambientEvents: AmbientEventDefinition[];
  operatingConditions: OperatingCondition[];
}

export interface ContentPackManifest {
  id: string;
  name: string;
  version: string;
  status: "draft" | "playable";
  description: string;
  contributors?: string[];
  license?: string;
}

export interface ContentAttribution {
  authors: string[];
  sources: string[];
  license: string;
  notes?: string;
}

export interface ScenarioIntelligenceBrief {
  confidence: "low" | "moderate" | "high";
  confirmed: string;
  uncertainty: string;
  verificationFinding: string;
  forecast: string;
}

export interface MissionPack extends MissionDefinition {
  scenarios: Scenario[];
}

export interface MissionRunPlan {
  seed: string;
  mission: MissionPack;
  condition: OperatingCondition;
  scenarios: Scenario[];
  activeScenarioIds: string[];
  assetPlans: AssetRunPlan[];
  weatherPlan: WeatherRunPlan;
  ambientEvents: ScheduledAmbientEvent[];
}

export interface Scenario {
  id: string;
  title: string;
  nodeType: string;
  x: number;
  y: number;
  color: string;
  event: string;
  why: string;
  how: string;
  when: string;
  where: string;
  keyTerms: GlossaryTerm[];
  cascadeSteps: string[];
  question: string;
  options: string[];
  optionRationales: string[];
  resourceCosts: StrategicResourceCost[];
  correctIndex: number;
  takeaway: string;
  responsePrinciple: string;
  basePenalty: number;
  logisticsEffects: ScenarioLogisticsEffect[];
  intelligence?: ScenarioIntelligenceBrief;
  contribution?: ContentAttribution;
}

export interface DecisionRecord {
  scenarioId: string;
  title: string;
  selectedOption: string;
  correct: boolean;
  resilienceChange: number;
  resilienceBefore: number;
  resilienceAfter: number;
  disruptionLoss: number;
  responseRecovery: number;
  wrongAnswerPenalty: number;
  calculation: string;
  rationale: string;
  takeaway: string;
  resourcesSpent: StrategicResourceCost;
  resourcesRemaining: StrategicResourcePool;
  intelligenceVerified: boolean;
  intelligenceCost: number;
  intelligenceFinding: string;
  operationalConsequence: string;
}

export interface GameReport {
  missionId: string;
  missionName: string;
  region: string;
  seed: string;
  condition: OperatingCondition;
  difficulty: Difficulty;
  target: number;
  completed: number;
  resilience: number;
  outcome: "completed" | "network-failed" | "time-expired";
  elapsedSeconds: number;
  initialResources: StrategicResourcePool;
  remainingResources: StrategicResourcePool;
  ambientEvents: AmbientEventRecord[];
  decisions: DecisionRecord[];
}

export interface StoredRunSummary {
  id: string;
  completedAt: string;
  missionId: string;
  missionName: string;
  region: string;
  seed: string;
  conditionTitle: string;
  difficulty: Difficulty;
  outcome: GameReport["outcome"];
  resilience: number;
  completed: number;
  target: number;
  accuracy: number;
  elapsedSeconds: number;
  ambientEventCount: number;
  resourceReservePercent?: number;
}

export interface HudUpdate {
  difficulty: Difficulty;
  resilience: number;
  completed: number;
  target: number;
  elapsedSeconds: number;
  remainingSeconds: number | null;
}

export interface ConsequenceLensUpdate {
  scenarioId: string;
  title: string;
  exposure: "guarded" | "elevated" | "high";
  routeCount: number;
  connectedNodes: Array<{ title: string; nodeType: string }>;
  affectedAssets: string[];
  consequence: string;
  confidence: "low" | "moderate" | "high";
}

export type LogisticsMode = "Vessel" | "Aircraft" | "Freight train" | "Truck";

export type LogisticsStatus =
  | "In transit"
  | "Delayed"
  | "Holding"
  | "Rerouted"
  | "Mission complete";

export interface LogisticsAssetInfo {
  id: string;
  name: string;
  mode: LogisticsMode;
  status: LogisticsStatus;
  routeState: "Planned route" | "Alternate route";
  route: string;
  cargo: string;
  meaning: string;
  operationalNote: string;
}

export interface LogisticsTransition {
  assetId: string;
  name: string;
  mode: LogisticsMode;
  previousStatus: LogisticsStatus;
  status: LogisticsStatus;
  reason: string;
}

export interface LogisticsSnapshot {
  assets: LogisticsAssetInfo[];
  moving: number;
  delayed: number;
  holding: number;
  rerouted: number;
}

export type WeatherPhase = "approaching" | "warning" | "clearing";

export interface WeatherUpdate {
  phase: WeatherPhase;
  title: string;
  severity: string;
  summary: string;
  wind: string;
  affectedArea: string;
  timing: string;
}
