import type Phaser from "phaser";
import { createSupplyChainGame } from "../game/createSupplyChainGame";
import type {
  Difficulty,
  GameReport,
  HudUpdate,
  LogisticsAssetInfo,
  LogisticsSnapshot,
  Scenario,
  WeatherUpdate
} from "../game/types";
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
import { createMissionBriefingController } from "../ui/missionBriefing";
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
  const assetMode = requiredElement<HTMLElement>("#asset-mode");
  const assetName = requiredElement<HTMLElement>("#asset-name");
  const assetStatus = requiredElement<HTMLElement>("#asset-status");
  const assetStatusDot = requiredElement<HTMLElement>("#asset-status-dot");
  const assetRoute = requiredElement<HTMLElement>("#asset-route");
  const assetCargo = requiredElement<HTMLElement>("#asset-cargo");
  const assetDefinition = requiredElement<HTMLElement>("#asset-definition");
  const assetStatusSummary = requiredElement<HTMLElement>("#asset-status-summary");
  const assetStatusBoard = requiredElement<HTMLElement>("#asset-status-board");
  const weatherPanel = requiredElement<HTMLElement>("#weather-panel");
  const weatherSeverity = requiredElement<HTMLElement>("#weather-severity");
  const weatherTitle = requiredElement<HTMLElement>("#weather-title");
  const weatherSummary = requiredElement<HTMLElement>("#weather-summary");
  const weatherWind = requiredElement<HTMLElement>("#weather-wind");
  const weatherArea = requiredElement<HTMLElement>("#weather-area");
  const weatherTiming = requiredElement<HTMLElement>("#weather-timing");

  const guide = createGuidePanelController();
  const glossary = createGlossaryPanelController();
  const challengeModal = createChallengeModalController();

  let briefing: ReturnType<typeof createMissionBriefingController>;

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
    assetMode.textContent = "Asset tracking";
    assetName.textContent = "Select a moving asset";
    assetStatus.textContent = "Ships, aircraft, trains, and trucks continue moving behind the network nodes.";
    assetStatusDot.dataset.status = "idle";
    assetRoute.textContent = "Select an icon on the map.";
    assetCargo.textContent = "Movement details will appear here.";
    assetDefinition.innerHTML = `<b>Live logistics</b><span>Animated assets show how goods continue moving, hold, delay, or reroute during a disruption.</span>`;
    assetStatusSummary.textContent = "4 assets awaiting launch";
    assetStatusBoard.innerHTML = `<p class="asset-board-empty">Launch the scenario to connect the live movement board.</p>`;
    weatherPanel.dataset.phase = "idle";
    weatherSeverity.textContent = "Forecast monitoring";
    weatherTitle.textContent = "High-wind system expected";
    weatherSummary.textContent = "Launch the scenario to track the storm across the regional network.";
    weatherWind.textContent = "Forecast pending";
    weatherArea.textContent = "Coastal and inland routes";
    weatherTiming.textContent = "Awaiting launch";
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

  briefing = createMissionBriefingController((difficulty) => {
    difficultySelect.value = difficulty;
    enterPlatform();
  });

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

  const renderLogisticsSnapshot = (snapshot: LogisticsSnapshot): void => {
    assetStatusSummary.textContent = `${snapshot.moving} moving · ${snapshot.delayed} delayed · ${snapshot.holding} holding · ${snapshot.rerouted} on alternate routes`;
    assetStatusBoard.replaceChildren();

    snapshot.assets.forEach((asset) => {
      const row = document.createElement("article");
      row.className = "asset-board-row";
      row.dataset.status = asset.status.toLowerCase().replaceAll(" ", "-");

      const identity = document.createElement("span");
      const name = document.createElement("b");
      name.textContent = asset.name;
      const mode = document.createElement("small");
      mode.textContent = asset.mode;
      identity.append(name, mode);

      const condition = document.createElement("span");
      const status = document.createElement("b");
      status.textContent = asset.status;
      const route = document.createElement("small");
      route.textContent = asset.routeState;
      condition.append(status, route);

      row.append(identity, condition);
      assetStatusBoard.append(row);
    });
  };

  startExerciseButton.addEventListener("click", () => briefing.open(difficultySelect.value as Difficulty));
  homeGlossaryButton.addEventListener("click", glossary.open);
  requiredElement<HTMLButtonElement>("#glossary-button").addEventListener("click", glossary.open);
  requiredElement<HTMLButtonElement>("#glossary-button-secondary").addEventListener("click", glossary.open);
  requiredElement<HTMLButtonElement>("#guide-button").addEventListener("click", guide.open);
  requiredElement<HTMLButtonElement>("#mission-briefing-button").addEventListener("click", () => briefing.open(difficultySelect.value as Difficulty));
  requiredElement<HTMLButtonElement>("#clear-log").addEventListener("click", () => missionLog.replaceChildren());

  returnHomeButton.addEventListener("click", () => {
    destroyGame();
    resetExerciseUi();
    reportModal.hide();
    guide.close();
    glossary.close();
    briefing.close();
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
    game.events.on("logistics-focus", (asset: LogisticsAssetInfo) => {
      assetMode.textContent = asset.mode;
      assetName.textContent = asset.name;
      assetStatus.textContent = `${asset.status}. ${asset.operationalNote}`;
      assetStatusDot.dataset.status = asset.status.toLowerCase().replaceAll(" ", "-");
      assetRoute.textContent = `${asset.routeState}: ${asset.route}`;
      assetCargo.textContent = asset.cargo;
      assetDefinition.innerHTML = `<b>${asset.mode}</b><span>${asset.meaning}</span>`;
    });
    game.events.on("logistics-snapshot", (snapshot: LogisticsSnapshot) => {
      renderLogisticsSnapshot(snapshot);
    });
    game.events.on("weather-update", (weather: WeatherUpdate) => {
      weatherPanel.dataset.phase = weather.phase;
      weatherSeverity.textContent = weather.severity;
      weatherTitle.textContent = weather.title;
      weatherSummary.textContent = weather.summary;
      weatherWind.textContent = weather.wind;
      weatherArea.textContent = weather.affectedArea;
      weatherTiming.textContent = weather.timing;
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
