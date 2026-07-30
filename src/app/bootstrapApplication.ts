import type Phaser from "phaser";
import { createSupplyChainGame } from "../game/createSupplyChainGame";
import type { Difficulty, GameReport, HudUpdate, Scenario } from "../game/types";
import { renderApplicationShell } from "../ui/appShell";
import {
  createChallengeModalController,
  type ChallengeRequest
} from "../ui/challengeModal";
import { requiredElement } from "../ui/dom";
import { createGlossaryPanelController } from "../ui/glossaryPanel";
import { createGuidePanelController } from "../ui/guidePanel";
import { updateHud } from "../ui/hud";
import { renderLandingScreen } from "../ui/landing";
import { createReportModalController } from "../ui/reportModal";

interface DecisionResult {
  correct: boolean;
  resilienceChange: number;
  resilience: number;
  takeaway: string;
}

interface MissionLogEntry {
  level: "info" | "warning" | "critical" | "success";
  text: string;
}

export function bootstrapApplication(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) throw new Error("Application root was not found.");

  app.innerHTML = `${renderLandingScreen()}${renderApplicationShell()}`;

  const landingScreen = requiredElement<HTMLElement>("#landing-screen");
  const platformShell = requiredElement<HTMLElement>("#platform-shell");
  const startExerciseButton = requiredElement<HTMLButtonElement>("#start-exercise");
  const homeGlossaryButton = requiredElement<HTMLButtonElement>("#open-glossary-home");
  const returnHomeButton = requiredElement<HTMLButtonElement>("#return-home");
  const startGameButton = requiredElement<HTMLButtonElement>("#start-game");
  const difficultySelect = requiredElement<HTMLSelectElement>("#difficulty");
  const gameCanvas = requiredElement<HTMLDivElement>("#game-canvas");
  const gameStatus = requiredElement<HTMLDivElement>("#game-status");
  const focusType = requiredElement<HTMLElement>("#focus-type");
  const focusTitle = requiredElement<HTMLElement>("#focus-title");
  const focusEvent = requiredElement<HTMLElement>("#focus-event");
  const focusTerms = requiredElement<HTMLElement>("#focus-terms");
  const missionLog = requiredElement<HTMLElement>("#mission-log");

  const guide = createGuidePanelController();
  const glossary = createGlossaryPanelController();
  const challengeModal = createChallengeModalController();

  let game: Phaser.Game | null = null;
  let logCounter = 0;

  const resetExerciseUi = (): void => {
    requiredElement("#hud-resilience").textContent = "—";
    requiredElement("#hud-completed").textContent = "0 / 3";
    requiredElement("#hud-timer").textContent = "—";
    requiredElement("#hud-timer-label").textContent = "Launch to begin";
    requiredElement("#hud-difficulty").textContent = "—";
    requiredElement<HTMLElement>("#hud-resilience-fill").style.width = "0%";
    gameStatus.textContent = "Select a difficulty and launch the regional scenario.";
    focusType.textContent = "Network overview";
    focusTitle.textContent = "Select an infrastructure node";
    focusEvent.textContent = "Hover over, approach, or select a node to preview the disruption located there.";
    focusTerms.innerHTML = `<b>Terms will be defined before the decision.</b><span>No prior supply-chain experience is required.</span>`;
    missionLog.innerHTML = `<article class="log-item info"><time>READY</time><p>Launch the scenario to initialize the operating picture.</p></article>`;
    logCounter = 0;
  };

  const destroyGame = (): void => {
    if (!game) return;
    game.destroy(true);
    game = null;
    gameCanvas.replaceChildren();
    startGameButton.disabled = false;
    difficultySelect.disabled = false;
  };

  const restartExercise = (): void => {
    destroyGame();
    resetExerciseUi();
    document.querySelector("#mission-control")?.scrollIntoView({ behavior: "smooth" });
  };

  const reportModal = createReportModalController(restartExercise);

  const enterPlatform = (targetId = "mission-control"): void => {
    landingScreen.classList.add("hidden");
    platformShell.classList.remove("hidden");
    window.requestAnimationFrame(() => {
      document.querySelector(`#${targetId}`)?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const appendLog = (entry: MissionLogEntry): void => {
    logCounter += 1;
    if (missionLog.querySelector("time")?.textContent === "READY") missionLog.replaceChildren();
    const article = document.createElement("article");
    article.className = `log-item ${entry.level}`;
    const time = document.createElement("time");
    time.textContent = `LOG ${String(logCounter).padStart(2, "0")}`;
    const text = document.createElement("p");
    text.textContent = entry.text;
    article.append(time, text);
    missionLog.prepend(article);
  };

  startExerciseButton.addEventListener("click", () => enterPlatform());
  homeGlossaryButton.addEventListener("click", glossary.open);
  requiredElement<HTMLButtonElement>("#glossary-button").addEventListener("click", glossary.open);
  requiredElement<HTMLButtonElement>("#glossary-button-secondary").addEventListener("click", glossary.open);
  requiredElement<HTMLButtonElement>("#guide-button").addEventListener("click", guide.open);
  requiredElement<HTMLButtonElement>("#clear-log").addEventListener("click", () => missionLog.replaceChildren());

  returnHomeButton.addEventListener("click", () => {
    destroyGame();
    resetExerciseUi();
    reportModal.hide();
    guide.close();
    glossary.close();
    platformShell.classList.add("hidden");
    landingScreen.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  startGameButton.addEventListener("click", () => {
    if (game) return;

    const difficulty = difficultySelect.value as Difficulty;
    startGameButton.disabled = true;
    difficultySelect.disabled = true;
    gameStatus.textContent = "Scenario loading. Investigate a node to begin.";
    missionLog.replaceChildren();

    game = createSupplyChainGame(gameCanvas, difficulty);

    game.events.on("toggle-guide", guide.toggle);
    game.events.on("show-challenge", (request: ChallengeRequest) => challengeModal.show(request));
    game.events.on("hud-update", (update: HudUpdate) => updateHud(update));
    game.events.on("node-focus", (scenario: Scenario) => {
      focusType.textContent = scenario.nodeType;
      focusTitle.textContent = scenario.title;
      focusEvent.textContent = scenario.event;
      focusTerms.innerHTML = `<b>${scenario.keyTerms.length} terms defined</b><span>${scenario.keyTerms.map((term) => term.term).join(" · ")}</span>`;
    });
    game.events.on("decision-result", (result: DecisionResult) => {
      const direction = result.resilienceChange >= 0 ? "+" : "";
      gameStatus.textContent = `${result.correct ? "Effective response." : "Response increased risk."} Resilience ${direction}${result.resilienceChange}; current score ${result.resilience}. ${result.takeaway}`;
    });
    game.events.on("mission-log", (entry: MissionLogEntry) => appendLog(entry));
    game.events.on("game-ready", () => {
      gameStatus.textContent = "Scenario active. Click a node, or move nearby and press E.";
    });
    game.events.on("game-complete", (report: GameReport) => reportModal.show(report));

    document.querySelector("#exercise")?.scrollIntoView({ behavior: "smooth" });
  });

  resetExerciseUi();
}
