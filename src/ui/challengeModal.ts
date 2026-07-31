import type { Scenario } from "../game/types";
import { requiredElement } from "./dom";

export interface ChallengeScoringContext {
  currentResilience: number;
  basePenalty: number;
  disruptionLoss: number;
  disruptionMultiplier: number;
  responseRecovery: number;
  wrongAnswerPenalty: number;
}

export interface ChallengeRequest {
  scenario: Scenario;
  showHint: boolean;
  scoring: ChallengeScoringContext;
  resolve: (selectedIndex: number) => void;
}

export interface ChallengeModalController {
  show: (request: ChallengeRequest) => void;
}

function signed(value: number): string {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function calculateDecision(
  correct: boolean,
  scoring: ChallengeScoringContext
): { rawChange: number; appliedChange: number; newResilience: number } {
  const rawChange = correct
    ? scoring.responseRecovery - scoring.disruptionLoss
    : -(scoring.disruptionLoss + scoring.wrongAnswerPenalty);

  // An effective decision is allowed to lose at most two points. This learning
  // safeguard rewards correct reasoning without pretending the incident caused no harm.
  const appliedChange = correct ? Math.max(-2, rawChange) : rawChange;
  const newResilience = Math.max(0, Math.min(100, scoring.currentResilience + appliedChange));

  return { rawChange, appliedChange, newResilience };
}

function renderCalculation(
  correct: boolean,
  scoring: ChallengeScoringContext
): string {
  const result = calculateDecision(correct, scoring);
  const multiplier = scoring.disruptionMultiplier.toFixed(2);

  const responseLine = correct
    ? `Raw response change = response recovery − disruption loss = ${scoring.responseRecovery} − ${scoring.disruptionLoss} = ${result.rawChange}`
    : `Response change = −(disruption loss + added decision penalty) = −(${scoring.disruptionLoss} + ${scoring.wrongAnswerPenalty}) = ${result.appliedChange}`;

  const safeguard = correct && result.rawChange < -2
    ? `<p><b>Learning safeguard:</b> An effective response is limited to a maximum two-point loss, so the applied change is −2 instead of ${result.rawChange}. This represents stabilizing the incident even though some damage still occurred.</p>`
    : "";

  const fasterMethod = correct
    ? `${scoring.currentResilience} + ${scoring.responseRecovery} − ${scoring.disruptionLoss}${result.rawChange < -2 ? " → apply the −2 safeguard" : ""} = ${result.newResilience}`
    : `${scoring.currentResilience} − ${scoring.disruptionLoss} − ${scoring.wrongAnswerPenalty} = ${result.newResilience}`;

  return `
    <section class="worked-score" aria-label="Worked resilience calculation">
      <div class="worked-score-heading">
        <div><span>Worked calculation</span><h4>Why the resilience score changes</h4></div>
        <strong>${signed(result.appliedChange)} points</strong>
      </div>
      <p><b>Resilience:</b> the network’s ability to continue essential work, adapt, and recover. We subtract disruption harm because the incident affects the network even when the response is effective.</p>
      <div class="math-steps">
        <div class="math-step"><span>1</span><p><b>Disruption loss</b> is the harm caused by the event. <b>Base penalty</b> means the event’s starting severity value. A <b>difficulty multiplier</b> is a number that makes that harm smaller or larger. We round to the nearest whole point: <code>round(${scoring.basePenalty} × ${multiplier}) = ${scoring.disruptionLoss}</code>.</p></div>
        <div class="math-step"><span>2</span><p>${correct ? `<b>Response recovery</b> means points returned for an effective action. ${responseLine}.` : `<b>Added decision penalty</b> means extra points removed because the option creates or ignores another risk. ${responseLine}.`}</p></div>
        <div class="math-step"><span>3</span><p><b>Applied change</b> is the number actually added to or removed from the current score. <code>${scoring.currentResilience} + (${result.appliedChange}) = ${result.newResilience}</code>.</p></div>
      </div>
      ${safeguard}
      <p class="fast-score"><b>Once you are comfortable:</b> use the shorter form: <code>${fasterMethod}</code></p>
    </section>
  `;
}

export function createChallengeModalController(): ChallengeModalController {
  const backdrop = requiredElement<HTMLElement>("#modal-backdrop");
  const modal = requiredElement<HTMLElement>("#challenge-modal");
  const nodeType = requiredElement("#modal-node-type");
  const title = requiredElement("#modal-title");
  const eventText = requiredElement("#modal-event");
  const why = requiredElement("#modal-why");
  const how = requiredElement("#modal-how");
  const when = requiredElement("#modal-when");
  const where = requiredElement("#modal-where");
  const cascade = requiredElement<HTMLElement>("#modal-cascade");
  const terms = requiredElement<HTMLElement>("#modal-terms");
  const question = requiredElement("#modal-question");
  const options = requiredElement<HTMLElement>("#modal-options");
  const feedback = requiredElement<HTMLElement>("#decision-feedback");

  const hide = (): void => {
    backdrop.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };

  const show = (request: ChallengeRequest): void => {
    const { scenario, showHint, scoring, resolve } = request;

    nodeType.textContent = scenario.nodeType;
    title.textContent = scenario.title;
    eventText.textContent = scenario.event;
    why.textContent = scenario.why;
    how.textContent = scenario.how;
    when.textContent = scenario.when;
    where.textContent = scenario.where;
    question.textContent = scenario.question;

    cascade.innerHTML = scenario.cascadeSteps
      .map(
        (step, index) => `
          <article class="cascade-step">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <p>${step}</p>
          </article>
        `
      )
      .join("");

    terms.innerHTML = scenario.keyTerms
      .map(
        (entry, index) => `
          <details class="term-card" ${index === 0 ? "open" : ""}>
            <summary>${entry.term}<span>Definition</span></summary>
            <p><b>Meaning:</b> ${entry.definition}</p>
            <p><b>Example:</b> ${entry.example}</p>
            <p><b>Why it matters:</b> ${entry.whyItMatters}</p>
          </details>
        `
      )
      .join("");

    feedback.className = "decision-feedback hidden";
    feedback.replaceChildren();

    options.innerHTML = scenario.options
      .map(
        (option, index) => `
          <button class="option-button" type="button" data-option="${index}">
            <span><i>${String.fromCharCode(65 + index)}</i>${option}</span>
            ${showHint && index === scenario.correctIndex ? "<small>Recommended</small>" : ""}
          </button>
        `
      )
      .join("");

    options.querySelectorAll<HTMLButtonElement>("[data-option]").forEach((button) => {
      button.addEventListener("click", () => {
        const selectedIndex = Number(button.dataset.option);
        const correct = selectedIndex === scenario.correctIndex;
        const recommendedOption = scenario.options[scenario.correctIndex];
        const recommendedReason = scenario.optionRationales[scenario.correctIndex];

        options.querySelectorAll<HTMLButtonElement>("[data-option]").forEach((item) => {
          item.disabled = true;
          const itemIndex = Number(item.dataset.option);
          if (itemIndex === scenario.correctIndex) item.classList.add("correct");
          if (itemIndex === selectedIndex && !correct) item.classList.add("incorrect");
        });

        feedback.className = `decision-feedback ${correct ? "success" : "warning"}`;
        feedback.innerHTML = `
          <div class="feedback-heading">
            <span>${correct ? "Effective response" : "Response increases risk"}</span>
            <strong>${correct ? "The decision addresses the immediate problem and the connected system." : "The option misses an important dependency or creates a second problem."}</strong>
          </div>
          <p><b>Why your option has this result:</b> ${scenario.optionRationales[selectedIndex]}</p>
          ${
            correct
              ? ""
              : `<div class="recommended-explanation"><span>Recommended response</span><b>${recommendedOption}</b><p>${recommendedReason}</p></div>`
          }
          <p><b>Decision rule:</b> ${scenario.responsePrinciple}</p>
          <p><b>Remember:</b> ${scenario.takeaway}</p>
          ${renderCalculation(correct, scoring)}
          <button id="confirm-decision" class="primary-button" type="button">Apply Decision and Continue</button>
        `;

        requiredElement<HTMLButtonElement>("#confirm-decision", feedback).addEventListener("click", () => {
          hide();
          resolve(selectedIndex);
        });
      });
    });

    backdrop.classList.remove("hidden");
    document.body.classList.add("modal-open");
    modal.scrollTop = 0;
    options.querySelector<HTMLButtonElement>("button")?.focus();
  };

  return { show };
}
