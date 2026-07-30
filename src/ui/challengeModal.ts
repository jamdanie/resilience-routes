import type { Scenario } from "../game/types";
import { requiredElement } from "./dom";

export interface ChallengeRequest {
  scenario: Scenario;
  showHint: boolean;
  resolve: (selectedIndex: number) => void;
}

export interface ChallengeModalController {
  show: (request: ChallengeRequest) => void;
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
  const terms = requiredElement<HTMLElement>("#modal-terms");
  const question = requiredElement("#modal-question");
  const options = requiredElement<HTMLElement>("#modal-options");
  const feedback = requiredElement<HTMLElement>("#decision-feedback");

  const hide = (): void => {
    backdrop.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };

  const show = (request: ChallengeRequest): void => {
    const { scenario, showHint, resolve } = request;

    nodeType.textContent = scenario.nodeType;
    title.textContent = scenario.title;
    eventText.textContent = scenario.event;
    why.textContent = scenario.why;
    how.textContent = scenario.how;
    when.textContent = scenario.when;
    where.textContent = scenario.where;
    question.textContent = scenario.question;

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
          <p><b>Why:</b> ${scenario.optionRationales[selectedIndex]}</p>
          <p><b>Decision rule:</b> ${scenario.responsePrinciple}</p>
          <p><b>Remember:</b> ${scenario.takeaway}</p>
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
