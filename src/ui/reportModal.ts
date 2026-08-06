import type { GameReport } from "../game/types";
import {
  formatResourceCost,
  STRATEGIC_RESOURCE_KEYS,
  STRATEGIC_RESOURCE_LABELS
} from "../game/StrategicResourceSystem";
import { formatSeconds, requiredElement } from "./dom";

export interface ReportModalController {
  show: (report: GameReport) => void;
  hide: () => void;
}

function outcomeLabel(report: GameReport): string {
  if (report.outcome === "completed") return "Mission objective achieved";
  if (report.outcome === "time-expired") return "Mission clock expired";
  return "Network resilience failed";
}

function performanceSummary(report: GameReport, accuracy: number): string {
  if (report.decisions.length === 0) return "No performance band — no decisions recorded";
  if (report.outcome !== "completed" || report.completed < report.target) {
    return "Incomplete mission";
  }
  if (report.resilience >= 80 && accuracy >= 80) return "Strong performance band";
  if (report.resilience >= 60 && accuracy >= 60) return "Effective performance band";
  if (report.resilience >= 40 && accuracy >= 40) return "Strained performance band";
  return "Critical performance band";
}

export function createReportModalController(
  onRestart: () => void,
  onReportSaved?: (report: GameReport) => void
): ReportModalController {
  const backdrop = requiredElement<HTMLElement>("#report-backdrop");
  const summary = requiredElement<HTMLElement>("#report-summary");
  const decisions = requiredElement<HTMLElement>("#report-decisions");
  const restartButton = requiredElement<HTMLButtonElement>("#restart-button");
  const closeButton = requiredElement<HTMLButtonElement>("#close-report");
  const printButton = requiredElement<HTMLButtonElement>("#print-report");
  const reportTitle = requiredElement<HTMLElement>("#report-title");

  const hide = (): void => {
    backdrop.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };

  restartButton.addEventListener("click", () => {
    hide();
    onRestart();
  });
  closeButton.addEventListener("click", hide);
  printButton.addEventListener("click", () => window.print());

  const show = (report: GameReport): void => {
    onReportSaved?.(report);
    const correctCount = report.decisions.filter((decision) => decision.correct).length;
    const accuracy = report.decisions.length
      ? Math.round((correctCount / report.decisions.length) * 100)
      : 0;
    const initialResourceTotal = STRATEGIC_RESOURCE_KEYS.reduce((total, key) => total + report.initialResources[key], 0);
    const remainingResourceTotal = STRATEGIC_RESOURCE_KEYS.reduce((total, key) => total + report.remainingResources[key], 0);

    reportTitle.textContent = `${report.missionName} results`;
    summary.innerHTML = `
      <article><span>Outcome</span><strong>${outcomeLabel(report)}</strong><small>${performanceSummary(report, accuracy)}</small></article>
      <article><span>Final resilience</span><strong>${report.resilience}</strong><small>0–100 network score</small></article>
      <article><span>Disruptions addressed</span><strong>${report.completed}</strong><small>Mission target: ${report.target}</small></article>
      <article><span>Decision accuracy</span><strong>${accuracy}%</strong><small>${correctCount} effective response${correctCount === 1 ? "" : "s"}</small></article>
      <article><span>Elapsed time</span><strong>${formatSeconds(report.elapsedSeconds)}</strong><small>${report.difficulty} difficulty</small></article>
      <article><span>Run identity</span><strong>${report.seed}</strong><small>${report.condition.title} · ${report.region}</small></article>
      <article><span>Resources remaining</span><strong>${remainingResourceTotal} / ${initialResourceTotal}</strong><small>Across six strategic reserves</small></article>
    `;

    const resourceReview = `
      <section class="report-resource-summary">
        <div><span>Resource stewardship</span><h3>What remained after the mission</h3><p>Resources committed to one disruption were unavailable for later decisions.</p></div>
        <div class="report-resource-grid">
          ${STRATEGIC_RESOURCE_KEYS.map((key) => `<article><span>${STRATEGIC_RESOURCE_LABELS[key]}</span><strong>${report.remainingResources[key]} / ${report.initialResources[key]}</strong></article>`).join("")}
        </div>
      </section>
    `;

    const ambientReview = report.ambientEvents.length
      ? `<section class="report-ambient-events"><div><span>Temporary injects encountered</span><h3>${report.ambientEvents.length} changing conditions occurred during this run</h3></div>${report.ambientEvents.map((event) => `<article><b>${event.title}</b><span>${event.kind} · began at ${formatSeconds(event.triggerSeconds)} · ${event.durationSeconds}s duration</span><p>${event.summary}</p></article>`).join("")}</section>`
      : "";

    decisions.innerHTML = resourceReview + ambientReview + (report.decisions.length
      ? report.decisions
          .map(
            (decision, index) => `
              <article class="report-decision ${decision.correct ? "success" : "warning"}">
                <div class="decision-number">${String(index + 1).padStart(2, "0")}</div>
                <div>
                  <span>${decision.title}</span>
                  <h3>${decision.selectedOption}</h3>
                  <p><b>Result:</b> ${decision.correct ? "Effective response" : "Response increased risk"} · Resilience ${decision.resilienceChange >= 0 ? "+" : ""}${decision.resilienceChange}</p>
                  <p><b>Reason:</b> ${decision.rationale}</p>
                  <p><b>Resources committed:</b> ${formatResourceCost(decision.resourcesSpent)}</p>
                  <p><b>Operational consequence:</b> ${decision.operationalConsequence}</p>
                  <div class="report-calculation">
                    <span>Score calculation</span>
                    <code>${decision.calculation}</code>
                    <small>Started at ${decision.resilienceBefore}; ended at ${decision.resilienceAfter}. Disruption loss: ${decision.disruptionLoss}.${decision.responseRecovery ? ` Response recovery: ${decision.responseRecovery}.` : ""}${decision.wrongAnswerPenalty ? ` Added decision penalty: ${decision.wrongAnswerPenalty}.` : ""}</small>
                  </div>
                  <p><b>Lesson:</b> ${decision.takeaway}</p>
                </div>
              </article>
            `
          )
          .join("")
      : `<div class="empty-report"><p>No decisions were completed before the mission ended.</p></div>`);

    backdrop.classList.remove("hidden");
    document.body.classList.add("modal-open");
    restartButton.focus();
  };

  return { show, hide };
}
