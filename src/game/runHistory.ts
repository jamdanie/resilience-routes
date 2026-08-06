import type { GameReport, StoredRunSummary } from "./types";

const STORAGE_KEY = "resilience-routes:run-history:v1";
const MAX_RUNS = 12;

export function summarizeReport(report: GameReport): StoredRunSummary {
  const correct = report.decisions.filter((decision) => decision.correct).length;
  const accuracy = report.decisions.length
    ? Math.round((correct / report.decisions.length) * 100)
    : 0;
  const resourceKeys = Object.keys(report.initialResources) as Array<keyof typeof report.initialResources>;
  const initialResourceTotal = resourceKeys.reduce((total, key) => total + report.initialResources[key], 0);
  const remainingResourceTotal = resourceKeys.reduce((total, key) => total + report.remainingResources[key], 0);

  return {
    id: `${report.missionId}:${report.seed}:${Date.now()}`,
    completedAt: new Date().toISOString(),
    missionId: report.missionId,
    missionName: report.missionName,
    region: report.region,
    seed: report.seed,
    conditionTitle: report.condition.title,
    difficulty: report.difficulty,
    outcome: report.outcome,
    resilience: report.resilience,
    completed: report.completed,
    target: report.target,
    accuracy,
    elapsedSeconds: report.elapsedSeconds,
    ambientEventCount: report.ambientEvents.length,
    resourceReservePercent: initialResourceTotal
      ? Math.round((remainingResourceTotal / initialResourceTotal) * 100)
      : 0
  };
}

export function loadRunHistory(): StoredRunSummary[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StoredRunSummary[]) : [];
  } catch {
    return [];
  }
}

export function saveRunReport(report: GameReport): StoredRunSummary[] {
  const history = [summarizeReport(report), ...loadRunHistory()].slice(0, MAX_RUNS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // The report still renders when storage is unavailable or blocked.
  }
  return history;
}

export function clearRunHistory(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
}
