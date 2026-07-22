export type Difficulty = "easy" | "medium" | "hard";

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
  question: string;
  options: string[];
  correctIndex: number;
  takeaway: string;
  basePenalty: number;
}

export interface DecisionRecord {
  scenarioId: string;
  title: string;
  selectedOption: string;
  correct: boolean;
  resilienceChange: number;
  takeaway: string;
}

export interface GameReport {
  difficulty: Difficulty;
  completed: number;
  resilience: number;
  outcome: "completed" | "network-failed" | "time-expired";
  decisions: DecisionRecord[];
}
