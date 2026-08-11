import {
  formatResourceCost,
  STRATEGIC_RESOURCE_KEYS,
  STRATEGIC_RESOURCE_LABELS
} from "../game/StrategicResourceSystem";
import type {
  Scenario,
  StrategicResourceCost,
  StrategicResourcePool,
  StrategicResourceUpdate
} from "../game/types";
import { requiredElement } from "./dom";

export interface ChallengeScoringContext {
  currentResilience: number;
  basePenalty: number;
  disruptionLoss: number;
  disruptionMultiplier: number;
  responseRecovery: number;
  wrongAnswerPenalty: number;
  intelligenceReduction?: number;
}

export interface IntelligenceChallengeContext {
  confidence: "low" | "moderate" | "high";
  confirmed: string;
  uncertainty: string;
  verificationFinding: string;
  forecast: string;
  cost: number;
  disruptionReduction: number;
}

export interface ChallengeRequest {
  scenario: Scenario;
  showHint: boolean;
  scoring: ChallengeScoringContext;
  resources: StrategicResourceUpdate;
  intelligence: IntelligenceChallengeContext;
  verifyIntelligence: () => StrategicResourceUpdate | null;
  resolve: (selectedIndex: number, intelligenceVerified: boolean) => void;
}

export interface ChallengeModalController {
  show: (request: ChallengeRequest) => void;
}

function signed(value: number): string {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function canAfford(remaining: StrategicResourcePool, cost: StrategicResourceCost): boolean {
  return STRATEGIC_RESOURCE_KEYS.every((key) => (cost[key] ?? 0) <= remaining[key]);
}

function unavailableReason(remaining: StrategicResourcePool, cost: StrategicResourceCost): string {
  const missing = STRATEGIC_RESOURCE_KEYS
    .filter((key) => (cost[key] ?? 0) > remaining[key])
    .map((key) => `${(cost[key] ?? 0) - remaining[key]} more ${STRATEGIC_RESOURCE_LABELS[key]}`);
  return missing.length ? `Unavailable: requires ${missing.join(" and ")}.` : "";
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
  const baseDisruptionLoss = Math.round(scoring.basePenalty * scoring.disruptionMultiplier);
  const disruptionExplanation = scoring.intelligenceReduction
    ? `First calculate the unverified loss: <code>round(${scoring.basePenalty} × ${multiplier}) = ${baseDisruptionLoss}</code>. Verified intelligence reduces uncertainty by ${scoring.intelligenceReduction} points: <code>${baseDisruptionLoss} − ${scoring.intelligenceReduction} = ${scoring.disruptionLoss}</code>.`
    : `We round to the nearest whole point: <code>round(${scoring.basePenalty} × ${multiplier}) = ${scoring.disruptionLoss}</code>.`;

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
        <div class="math-step"><span>1</span><p><b>Disruption loss</b> is the harm caused by the event. <b>Base penalty</b> means the event’s starting severity value. A <b>difficulty multiplier</b> makes that harm smaller or larger. ${disruptionExplanation}</p></div>
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
  const intelligencePanel = requiredElement<HTMLElement>("#modal-intelligence-panel");
  const intelligenceConfidence = requiredElement<HTMLElement>("#intel-confidence");
  const intelligenceConfirmed = requiredElement<HTMLElement>("#intel-confirmed");
  const intelligenceUncertainty = requiredElement<HTMLElement>("#intel-uncertainty");
  const intelligenceForecastCard = requiredElement<HTMLElement>("#intel-forecast-card");
  const intelligenceForecast = requiredElement<HTMLElement>("#intel-forecast");
  const verifyIntelligenceButton = requiredElement<HTMLButtonElement>("#verify-intelligence-button");
  const why = requiredElement("#modal-why");
  const how = requiredElement("#modal-how");
  const when = requiredElement("#modal-when");
  const where = requiredElement("#modal-where");
  const cascade = requiredElement<HTMLElement>("#modal-cascade");
  const terms = requiredElement<HTMLElement>("#modal-terms");
  const question = requiredElement("#modal-question");
  const resourceContext = requiredElement<HTMLElement>("#modal-resource-context");
  const options = requiredElement<HTMLElement>("#modal-options");
  const feedback = requiredElement<HTMLElement>("#decision-feedback");

  const hide = (): void => {
    backdrop.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };

  const show = (request: ChallengeRequest): void => {
    const { scenario, showHint, scoring, intelligence, resolve } = request;
    let currentResources = request.resources;
    let currentScoring = { ...scoring };
    let intelligenceVerified = false;

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

    intelligencePanel.dataset.state = "preliminary";
    intelligenceConfidence.textContent = `${intelligence.confidence} confidence`;
    intelligenceConfirmed.textContent = intelligence.confirmed;
    intelligenceUncertainty.textContent = intelligence.uncertainty;
    intelligenceForecast.textContent = "Forecast locked. Verify the signal to expose the most likely downstream consequence.";
    intelligenceForecastCard.classList.add("forecast-locked");
    verifyIntelligenceButton.disabled = currentResources.remaining.intelligence < intelligence.cost;
    verifyIntelligenceButton.textContent = verifyIntelligenceButton.disabled
      ? "Verification unavailable · No Intel remaining"
      : `Verify signal · ${intelligence.cost} Intel`;

    const renderResourceContext = (): void => {
      resourceContext.innerHTML = STRATEGIC_RESOURCE_KEYS
        .map((key) => `<article><span>${STRATEGIC_RESOURCE_LABELS[key]}</span><strong>${currentResources.remaining[key]} / ${currentResources.initial[key]}</strong></article>`)
        .join("");
    };

    const renderOptions = (): void => {
      options.innerHTML = scenario.options
        .map((option, index) => {
          const cost = scenario.resourceCosts[index] ?? {};
          const affordable = canAfford(currentResources.remaining, cost);
          return `
            <button class="option-button${affordable ? "" : " unavailable"}" type="button" data-option="${index}" ${affordable ? "" : "disabled"} title="${unavailableReason(currentResources.remaining, cost)}">
              <span class="option-copy"><i>${String.fromCharCode(65 + index)}</i><b>${option}</b></span>
              <span class="option-meta">
                <small class="option-cost">${affordable ? formatResourceCost(cost) : unavailableReason(currentResources.remaining, cost)}</small>
                ${showHint && index === scenario.correctIndex ? "<small class=\"recommendation-tag\">Recommended</small>" : ""}
              </span>
            </button>
          `;
        })
        .join("");

      options.querySelectorAll<HTMLButtonElement>("[data-option]").forEach((button) => {
        button.addEventListener("click", () => {
          const selectedIndex = Number(button.dataset.option);
          const correct = selectedIndex === scenario.correctIndex;
          const selectedCost = scenario.resourceCosts[selectedIndex] ?? {};
          const recommendedOption = scenario.options[scenario.correctIndex];
          const recommendedReason = scenario.optionRationales[scenario.correctIndex];

          options.querySelectorAll<HTMLButtonElement>("[data-option]").forEach((item) => {
            item.disabled = true;
            const itemIndex = Number(item.dataset.option);
            if (itemIndex === scenario.correctIndex) item.classList.add("correct");
            if (itemIndex === selectedIndex && !correct) item.classList.add("incorrect");
          });
          verifyIntelligenceButton.disabled = true;

          feedback.className = `decision-feedback ${correct ? "success" : "warning"}`;
          feedback.innerHTML = `
            <div class="feedback-heading">
              <span>${correct ? "Effective response" : "Response increases risk"}</span>
              <strong>${correct ? "The decision addresses the immediate problem and the connected system." : "The option misses an important dependency or creates a second problem."}</strong>
            </div>
            <p><b>Intelligence posture:</b> ${intelligenceVerified ? `Signal verified before commitment. ${intelligence.verificationFinding}` : "Decision made from the preliminary operating picture without an additional verification check."}</p>
            <p><b>Why your option has this result:</b> ${scenario.optionRationales[selectedIndex]}</p>
            ${
              correct
                ? ""
                : `<div class="recommended-explanation"><span>Recommended response</span><b>${recommendedOption}</b><p>${recommendedReason}</p></div>`
            }
            <p><b>Decision rule:</b> ${scenario.responsePrinciple}</p>
            <p><b>Remember:</b> ${scenario.takeaway}</p>
            <div class="resource-decision-note"><b>Response commitment:</b> ${formatResourceCost(selectedCost)}.${intelligenceVerified ? ` Verification also committed ${intelligence.cost} Intel.` : ""} Committed resources are unavailable for later disruptions.</div>
            ${renderCalculation(correct, currentScoring)}
            <button id="confirm-decision" class="primary-button" type="button">Apply Decision and Continue</button>
          `;

          requiredElement<HTMLButtonElement>("#confirm-decision", feedback).addEventListener("click", () => {
            hide();
            resolve(selectedIndex, intelligenceVerified);
          });
        });
      });
    };

    verifyIntelligenceButton.onclick = () => {
      if (intelligenceVerified) return;
      const update = request.verifyIntelligence();
      if (!update) return;
      currentResources = update;
      currentScoring = {
        ...currentScoring,
        disruptionLoss: Math.max(1, currentScoring.disruptionLoss - intelligence.disruptionReduction),
        intelligenceReduction: intelligence.disruptionReduction,
      };
      intelligenceVerified = true;
      intelligencePanel.dataset.state = "verified";
      intelligenceConfidence.textContent = "verified confidence";
      intelligenceUncertainty.textContent = intelligence.verificationFinding;
      intelligenceForecast.textContent = intelligence.forecast;
      intelligenceForecastCard.classList.remove("forecast-locked");
      verifyIntelligenceButton.disabled = true;
      verifyIntelligenceButton.textContent = `Signal verified · ${intelligence.cost} Intel committed`;
      renderResourceContext();
      renderOptions();
      options.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    };

    renderResourceContext();
    renderOptions();

    backdrop.classList.remove("hidden");
    document.body.classList.add("modal-open");
    modal.scrollTop = 0;
    options.querySelector<HTMLButtonElement>("button")?.focus();
  };

  return { show };
}
