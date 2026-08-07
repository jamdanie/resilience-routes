import type { Difficulty } from "./types";

export interface DifficultySettings {
  movementSpeed: number;
  disruptionMultiplier: number;
  wrongAnswerPenalty: number;
  correctAnswerRecovery: number;
  timeLimitSeconds: number | null;
  showHints: boolean;
  startingResilience: number;
}

export const MISSION_TARGET = 3;

export const difficultySettings: Record<Difficulty, DifficultySettings> = {
  easy: {
    movementSpeed: 225,
    disruptionMultiplier: 0.65,
    wrongAnswerPenalty: 3,
    correctAnswerRecovery: 8,
    timeLimitSeconds: null,
    showHints: true,
    startingResilience: 90
  },
  medium: {
    movementSpeed: 205,
    disruptionMultiplier: 1,
    wrongAnswerPenalty: 7,
    correctAnswerRecovery: 5,
    timeLimitSeconds: 240,
    showHints: false,
    startingResilience: 82
  },
  hard: {
    movementSpeed: 190,
    disruptionMultiplier: 1.35,
    wrongAnswerPenalty: 12,
    correctAnswerRecovery: 2,
    timeLimitSeconds: 180,
    showHints: false,
    startingResilience: 74
  }
};
