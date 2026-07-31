import type { Difficulty } from "../game/types";
import { requiredElement } from "./dom";

const stepCount = 3;

export function renderMissionBriefing(): string {
  return `
    <div id="briefing-backdrop" class="modal-backdrop briefing-backdrop hidden" role="presentation">
      <section class="modal mission-briefing-modal" role="dialog" aria-modal="true" aria-labelledby="briefing-title">
        <header class="briefing-header">
          <div>
            <p class="eyebrow">Mission orientation</p>
            <h2 id="briefing-title">Pacific Northwest Continuity Exercise</h2>
            <p class="briefing-subtitle">Learn the situation, understand the scoring model, and choose your operating conditions before entering Mission Control.</p>
          </div>
          <button id="close-briefing" class="close-button briefing-close" type="button" aria-label="Close mission briefing">×</button>
        </header>

        <div class="briefing-progress" aria-label="Mission briefing progress">
          <button class="briefing-progress-step active" data-briefing-step-button="0" type="button"><span>1</span><b>Situation</b></button>
          <i></i>
          <button class="briefing-progress-step" data-briefing-step-button="1" type="button"><span>2</span><b>How scoring works</b></button>
          <i></i>
          <button class="briefing-progress-step" data-briefing-step-button="2" type="button"><span>3</span><b>Operating conditions</b></button>
        </div>

        <div class="briefing-pages">
          <section class="briefing-page active" data-briefing-page="0">
            <div class="briefing-page-heading">
              <span class="briefing-kicker">Step 1 of 3</span>
              <h3>Understand the network before making decisions.</h3>
              <p>A regional supply network is made of connected places and systems. A problem at one location can create delays or failures somewhere else.</p>
            </div>

            <div class="briefing-situation-grid">
              <article class="situation-card primary">
                <span>Situation</span>
                <h4>Multiple disruptions are appearing across a connected regional network.</h4>
                <p>You will investigate ports, rail corridors, airports, warehouses, and digital logistics systems. Each decision can strengthen the network or make the disruption harder to control.</p>
              </article>
              <article class="situation-card">
                <span>Mission objective</span>
                <h4>Stabilize three infrastructure nodes.</h4>
                <p>A <b>node</b> is one important place or system in a network, such as a port, rail junction, warehouse, airport, or scheduling platform.</p>
              </article>
              <article class="situation-card">
                <span>Success condition</span>
                <h4>Keep resilience above zero.</h4>
                <p><b>Resilience</b> means the network's ability to continue operating, adapt to a disruption, and recover afterward.</p>
              </article>
            </div>

            <section class="briefing-terms" aria-labelledby="briefing-terms-title">
              <div class="briefing-section-heading">
                <div><p class="eyebrow">Definitions first</p><h4 id="briefing-terms-title">Words used throughout the exercise</h4></div>
                <small>No previous supply-chain experience is assumed.</small>
              </div>
              <div class="briefing-term-grid">
                <article><b>Disruption</b><p>An event that interrupts normal work. A flood that closes a rail line is a disruption.</p></article>
                <article><b>Cascading effect</b><p>A problem that spreads through connected systems. A closed port can delay trains, warehouses, stores, and hospitals.</p></article>
                <article><b>Continuity</b><p>The ability to keep essential work operating during a problem, even when normal methods are unavailable.</p></article>
                <article><b>Capacity</b><p>The amount of work a route or facility can handle. An alternate road may exist but may not have enough capacity for every shipment.</p></article>
              </div>
            </section>
          </section>

          <section class="briefing-page" data-briefing-page="1">
            <div class="briefing-page-heading">
              <span class="briefing-kicker">Step 2 of 3</span>
              <h3>See exactly how the resilience score changes.</h3>
              <p>The score is not meant to be mysterious. It is a simple way to show whether your choices are helping the network absorb and recover from disruptions.</p>
            </div>

            <section class="score-explanation-card">
              <p class="eyebrow">Written scoring formula</p>
              <div class="score-formula" aria-label="Current resilience equals starting resilience plus response recovery minus disruption penalties">
                <span>Current resilience</span><b>=</b><span>Starting resilience</span><b>+</b><span>Response recovery</span><b>−</b><span>Disruption penalties</span>
              </div>
              <div class="score-reasoning">
                <article><span>Why start with a score?</span><p>The starting number represents the network's condition before you make any decisions.</p></article>
                <article><span>Why add recovery?</span><p>A strong response helps the network recover, so recovery points are added.</p></article>
                <article><span>Why subtract penalties?</span><p>A poor response allows more damage or delay, so the related penalty is subtracted.</p></article>
              </div>
            </section>

            <section class="worked-example">
              <div class="briefing-section-heading">
                <div><p class="eyebrow">Beginner example</p><h4>Work through every part before using the shorter method.</h4></div>
              </div>
              <div class="worked-example-grid">
                <div class="worked-math">
                  <p><b>Starting resilience:</b> 82</p>
                  <p><b>Effective response recovery:</b> +5</p>
                  <p><b>Disruption penalty:</b> −8</p>
                  <hr>
                  <p class="worked-total">82 + 5 − 8 = <strong>79</strong></p>
                </div>
                <div class="worked-reason">
                  <p><b>Why we do it this way:</b></p>
                  <p>Begin with the condition the network already had. Add the benefit created by the response. Then remove the harm that still occurred. The result, 79, is the network's new resilience.</p>
                  <p class="faster-method"><b>Once this feels comfortable:</b> read the formula as <em>start score + gains − losses</em>.</p>
                </div>
              </div>
            </section>
          </section>

          <section class="briefing-page" data-briefing-page="2">
            <div class="briefing-page-heading">
              <span class="briefing-kicker">Step 3 of 3</span>
              <h3>Choose the level that matches how you want to learn.</h3>
              <p>Difficulty changes the starting score, timer, hints, and strength of disruption penalties. It does not hide definitions or explanations.</p>
            </div>

            <fieldset class="difficulty-card-grid">
              <legend class="sr-only">Exercise difficulty</legend>
              <label class="difficulty-card">
                <input type="radio" name="briefing-difficulty" value="easy">
                <span class="difficulty-label"><b>Easy</b><small>Guided learning</small></span>
                <strong>90 starting resilience</strong>
                <ul><li>No mission timer</li><li>Recommended response is identified</li><li>Smaller disruption penalties</li></ul>
              </label>
              <label class="difficulty-card selected">
                <input type="radio" name="briefing-difficulty" value="medium" checked>
                <span class="difficulty-label"><b>Medium</b><small>Standard exercise</small></span>
                <strong>82 starting resilience</strong>
                <ul><li>4-minute mission timer</li><li>No answer hint</li><li>Standard disruption effects</li></ul>
              </label>
              <label class="difficulty-card">
                <input type="radio" name="briefing-difficulty" value="hard">
                <span class="difficulty-label"><b>Hard</b><small>Decision pressure</small></span>
                <strong>74 starting resilience</strong>
                <ul><li>3-minute mission timer</li><li>Stronger penalties</li><li>Smaller recovery gains</li></ul>
              </label>
            </fieldset>

            <div class="briefing-readiness-card">
              <div><span class="status-dot"></span><p><b>Ready for Mission Control</b><small>You can review the briefing or change difficulty again before launching the live scenario.</small></p></div>
              <button id="complete-briefing" class="primary-button large" type="button">Enter Mission Control</button>
            </div>
          </section>
        </div>

        <footer class="briefing-footer">
          <button id="briefing-back" class="secondary-button" type="button" disabled>Back</button>
          <span id="briefing-step-label">Situation · Step 1 of 3</span>
          <button id="briefing-next" class="primary-button" type="button">Continue</button>
        </footer>
      </section>
    </div>
  `;
}

export interface MissionBriefingController {
  open: (difficulty?: Difficulty) => void;
  close: () => void;
}

export function createMissionBriefingController(
  onComplete: (difficulty: Difficulty) => void
): MissionBriefingController {
  const backdrop = requiredElement<HTMLElement>("#briefing-backdrop");
  const closeButton = requiredElement<HTMLButtonElement>("#close-briefing");
  const backButton = requiredElement<HTMLButtonElement>("#briefing-back");
  const nextButton = requiredElement<HTMLButtonElement>("#briefing-next");
  const completeButton = requiredElement<HTMLButtonElement>("#complete-briefing");
  const stepLabel = requiredElement<HTMLElement>("#briefing-step-label");
  const pages = Array.from(document.querySelectorAll<HTMLElement>("[data-briefing-page]"));
  const progressButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-briefing-step-button]"));
  const difficultyInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="briefing-difficulty"]'));
  const difficultyCards = Array.from(document.querySelectorAll<HTMLElement>(".difficulty-card"));
  let currentStep = 0;

  const stepNames = ["Situation", "How scoring works", "Operating conditions"];

  const updateStep = (nextStep: number): void => {
    currentStep = Math.max(0, Math.min(stepCount - 1, nextStep));
    pages.forEach((page, index) => page.classList.toggle("active", index === currentStep));
    progressButtons.forEach((button, index) => {
      button.classList.toggle("active", index === currentStep);
      button.classList.toggle("complete", index < currentStep);
      button.setAttribute("aria-current", index === currentStep ? "step" : "false");
    });
    backButton.disabled = currentStep === 0;
    nextButton.classList.toggle("hidden", currentStep === stepCount - 1);
    stepLabel.textContent = `${stepNames[currentStep]} · Step ${currentStep + 1} of ${stepCount}`;
    requiredElement<HTMLElement>(".mission-briefing-modal").scrollTo({ top: 0, behavior: "smooth" });
  };

  const syncDifficultyCards = (): void => {
    difficultyCards.forEach((card) => {
      const input = card.querySelector<HTMLInputElement>('input[name="briefing-difficulty"]');
      card.classList.toggle("selected", Boolean(input?.checked));
    });
  };

  const setDifficulty = (difficulty: Difficulty): void => {
    const selectedInput = difficultyInputs.find((input) => input.value === difficulty);
    if (selectedInput) selectedInput.checked = true;
    syncDifficultyCards();
  };

  const open = (difficulty: Difficulty = "medium"): void => {
    setDifficulty(difficulty);
    updateStep(0);
    backdrop.classList.remove("hidden");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => closeButton.focus());
  };

  const close = (): void => {
    backdrop.classList.add("hidden");
    backdrop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  backButton.addEventListener("click", () => updateStep(currentStep - 1));
  nextButton.addEventListener("click", () => updateStep(currentStep + 1));
  closeButton.addEventListener("click", close);
  progressButtons.forEach((button) => {
    button.addEventListener("click", () => updateStep(Number(button.dataset.briefingStepButton ?? 0)));
  });
  difficultyInputs.forEach((input) => input.addEventListener("change", syncDifficultyCards));
  completeButton.addEventListener("click", () => {
    const selected = difficultyInputs.find((input) => input.checked)?.value as Difficulty | undefined;
    close();
    onComplete(selected ?? "medium");
  });
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !backdrop.classList.contains("hidden")) close();
  });

  syncDifficultyCards();
  updateStep(0);

  return { open, close };
}
