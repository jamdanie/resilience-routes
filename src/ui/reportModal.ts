import type { GameReport } from "../game/types";
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

function performanceBand(resilience: number): string {
  if (resilience >= 80) return "Strong";
  if (resilience >= 60) return "Effective";
  if (resilience >= 40) return "Strained";
  return "Critical";
}

export function createReportModalController(
  onRestart: () => void
): ReportModalController {
  const backdrop = requiredElement<HTMLElement>("#report-backdrop");
  const summary = requiredElement<HTMLElement>("#report-summary");
  const decisions = requiredElement<HTMLElement>("#report-decisions");
  const restartButton = requiredElement<HTMLButtonElement>("#restart-button");
  const closeButton = requiredElement<HTMLButtonElement>("#close-report");
  const printButton = requiredElement<HTMLButtonElement>("#print-report");

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
    const correctCount = report.decisions.filter((decision) => decision.correct).length;
    const accuracy = report.decisions.length
      ? Math.round((correctCount / report.decisions.length) * 100)
      : 0;

    summary.innerHTML = `
      <article><span>Outcome</span><strong>${outcomeLabel(report)}</strong><small>${performanceBand(report.resilience)} performance band</small></article>
      <article><span>Final resilience</span><strong>${report.resilience}</strong><small>0–100 network score</small></article>
      <article><span>Nodes stabilized</span><strong>${report.completed}</strong><small>Mission target: 3</small></article>
      <article><span>Decision accuracy</span><strong>${accuracy}%</strong><small>${correctCount} effective response${correctCount === 1 ? "" : "s"}</small></article>
      <article><span>Elapsed time</span><strong>${formatSeconds(report.elapsedSeconds)}</strong><small>${report.difficulty} difficulty</small></article>
    `;

    decisions.innerHTML = report.decisions.length
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
                  <p><b>Lesson:</b> ${decision.takeaway}</p>
                </div>
              </article>
            `
          )
          .join("")
      : `<div class="empty-report"><p>No decisions were completed before the mission ended.</p></div>`;

    backdrop.classList.remove("hidden");
    document.body.classList.add("modal-open");
    restartButton.focus();
  };

  return { show, hide };
}
