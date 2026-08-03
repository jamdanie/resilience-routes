export type Difficulty = "easy" | "medium" | "hard";

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
  correctIndex: number;
  takeaway: string;
  responsePrinciple: string;
  basePenalty: number;
  logisticsEffects: ScenarioLogisticsEffect[];
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
}

export interface GameReport {
  difficulty: Difficulty;
  completed: number;
  resilience: number;
  outcome: "completed" | "network-failed" | "time-expired";
  elapsedSeconds: number;
  decisions: DecisionRecord[];
}

export interface HudUpdate {
  difficulty: Difficulty;
  resilience: number;
  completed: number;
  target: number;
  remainingSeconds: number | null;
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
