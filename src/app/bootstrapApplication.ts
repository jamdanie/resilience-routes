import type Phaser from "phaser";
import { defaultMission, getMissionPack, missionPacks } from "../data/missions";
import { createSupplyChainGame } from "../game/createSupplyChainGame";
import { createMissionRunPlan, createMissionSeed } from "../game/randomization";
import { clearRunHistory, loadRunHistory, saveRunReport } from "../game/runHistory";
import {
  STRATEGIC_RESOURCE_KEYS,
  STRATEGIC_RESOURCE_LABELS
} from "../game/StrategicResourceSystem";
import type {
  Difficulty,
  GameReport,
  HudUpdate,
  LogisticsAssetInfo,
  LogisticsSnapshot,
  MissionRunPlan,
  Scenario,
  StrategicResourceUpdate,
  StoredRunSummary,
  WeatherCursorUpdate,
  WeatherUpdate
} from "../game/types";
import { createPresenceController } from "./presence";
import { renderApplicationShell } from "../ui/appShell";
import {
  createChallengeModalController,
  type ChallengeRequest
} from "../ui/challengeModal";
import { createCommandPaletteController, type CommandId } from "../ui/commandPalette";
import { formatSeconds, requiredElement } from "../ui/dom";
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
  const landingMissionSelect = requiredElement<HTMLSelectElement>("#landing-mission");
  const landingPreviewTitle = requiredElement<HTMLElement>("#landing-preview-title");
  const landingPreviewRegion = requiredElement<HTMLElement>("#landing-preview-region");
  const landingPreviewObjective = requiredElement<HTMLElement>("#landing-preview-objective");
  const homeGlossaryButton = requiredElement<HTMLButtonElement>("#open-glossary-home");
  const returnHomeButton = requiredElement<HTMLButtonElement>("#return-home");
  const startGameButton = requiredElement<HTMLButtonElement>("#start-game");
  const mapDetailButton = requiredElement<HTMLButtonElement>("#map-detail-button");
  const nodeLabelButton = requiredElement<HTMLButtonElement>("#node-label-button");
  const zoomOutButton = requiredElement<HTMLButtonElement>("#zoom-out-button");
  const zoomResetButton = requiredElement<HTMLButtonElement>("#zoom-reset-button");
  const zoomInButton = requiredElement<HTMLButtonElement>("#zoom-in-button");
  const mapFocusButton = requiredElement<HTMLButtonElement>("#map-focus-button");
  const commandPaletteButton = requiredElement<HTMLButtonElement>("#command-palette-button");
  const investigateFocusButton = requiredElement<HTMLButtonElement>("#investigate-focus-button");
  const difficultySelect = requiredElement<HTMLSelectElement>("#difficulty");
  const missionSelect = requiredElement<HTMLSelectElement>("#mission-pack");
  const missionSeedInput = requiredElement<HTMLInputElement>("#mission-seed");
  const newSeedButton = requiredElement<HTMLButtonElement>("#new-seed");
  const runIdentity = requiredElement<HTMLElement>("#run-identity");
  const runHistory = requiredElement<HTMLElement>("#run-history");
  const clearHistoryButton = requiredElement<HTMLButtonElement>("#clear-history");
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
  const resourcePool = requiredElement<HTMLElement>("#resource-pool");
  const pauseGameButton = requiredElement<HTMLButtonElement>("#pause-game-button");
  const pauseOverlay = requiredElement<HTMLElement>("#pause-overlay");
  const commandState = requiredElement<HTMLElement>("#command-state");
  const operatorCallsign = requiredElement<HTMLElement>("#operator-callsign");
  const weatherCursorGauge = requiredElement<HTMLElement>("#weather-cursor-gauge");
  const weatherCursorValue = requiredElement<HTMLElement>("#weather-cursor-value");
  const weatherCursorZone = requiredElement<HTMLElement>("#weather-cursor-zone");
  const weatherCursorCondition = requiredElement<HTMLElement>("#weather-cursor-condition");
  const presenceIndicator = requiredElement<HTMLElement>("#presence-indicator");
  const presenceCount = requiredElement<HTMLElement>("#presence-count");
  const missionPulse = requiredElement<HTMLElement>("#mission-pulse");
  const missionPulseTitle = requiredElement<HTMLElement>("#mission-pulse-title");
  const missionPulseCountdown = requiredElement<HTMLElement>("#mission-pulse-countdown");

  const guide = createGuidePanelController();
  const glossary = createGlossaryPanelController();
  const challengeModal = createChallengeModalController();
  const presence = createPresenceController(({ connected, active, label }) => {
    presenceIndicator.dataset.connected = String(connected);
    presenceCount.textContent = active === null ? label : `${active} ${label.toLowerCase()}`;
  });

  let briefing: ReturnType<typeof createMissionBriefingController>;

  let game: Phaser.Game | null = null;
  let logCounter = 0;
  let currentRunPlan: MissionRunPlan | null = null;
  let missionPaused = false;
  let mapFocusActive = false;

  const setMapFocus = (active: boolean): void => {
    if (!game && active) return;
    mapFocusActive = active;
    platformShell.classList.toggle("map-focus-mode", active);
    document.body.classList.toggle("map-focus-active", active);
    mapFocusButton.setAttribute("aria-pressed", String(active));
    mapFocusButton.setAttribute("aria-label", active ? "Exit tactical map focus mode" : "Enter tactical map focus mode");
    mapFocusButton.textContent = active ? "Exit focus" : "Focus map";
    window.requestAnimationFrame(() => game?.scale.refresh());
  };

  const updateMissionPulse = (elapsedSeconds: number): void => {
    if (!currentRunPlan) return;
    const events = [...currentRunPlan.ambientEvents].sort((a, b) => a.triggerSeconds - b.triggerSeconds);
    const active = events.find((event) => elapsedSeconds >= event.triggerSeconds && elapsedSeconds < event.triggerSeconds + event.durationSeconds);
    const next = events.find((event) => event.triggerSeconds > elapsedSeconds);

    if (active) {
      const remaining = Math.max(0, Math.ceil(active.triggerSeconds + active.durationSeconds - elapsedSeconds));
      missionPulse.dataset.kind = active.kind;
      missionPulseTitle.textContent = active.title;
      missionPulseCountdown.textContent = `Active inject · ${remaining}s remaining`;
    } else if (next) {
      missionPulse.dataset.kind = next.kind;
      missionPulseTitle.textContent = next.title;
      missionPulseCountdown.textContent = `Next ${next.kind} inject · T−${Math.max(0, Math.ceil(next.triggerSeconds - elapsedSeconds))}s`;
    } else {
      missionPulse.dataset.kind = "clear";
      missionPulseTitle.textContent = "Scheduled injects complete";
      missionPulseCountdown.textContent = "Continue stabilizing decision nodes";
    }
  };

  const setPaused = (paused: boolean): void => {
    if (!game) return;
    missionPaused = paused;
    if (paused) game.scene.pause("SupplyChainScene");
    else game.scene.resume("SupplyChainScene");
    pauseGameButton.setAttribute("aria-pressed", String(paused));
    pauseGameButton.textContent = paused ? "Resume mission" : "Pause mission";
    pauseOverlay.classList.toggle("hidden", !paused);
    commandState.textContent = paused
      ? "Operations are holding. Resume when you are ready."
      : "Mission active · live systems updating";
  };

  const resetResourceUi = (): void => {
    STRATEGIC_RESOURCE_KEYS.forEach((key) => {
      requiredElement<HTMLElement>(`#resource-${key}`).textContent = "—";
      resourcePool.querySelector<HTMLElement>(`[data-resource="${key}"]`)?.removeAttribute("data-level");
    });
  };

  const renderResources = (update: StrategicResourceUpdate): void => {
    STRATEGIC_RESOURCE_KEYS.forEach((key) => {
      const remaining = update.remaining[key];
      const initial = update.initial[key];
      const element = requiredElement<HTMLElement>(`#resource-${key}`);
      const card = resourcePool.querySelector<HTMLElement>(`[data-resource="${key}"]`);
      element.textContent = `${remaining}/${initial}`;
      if (card) {
        card.dataset.level = remaining === 0 ? "depleted" : remaining <= Math.max(1, Math.floor(initial * 0.34)) ? "low" : "ready";
        card.title = `${STRATEGIC_RESOURCE_LABELS[key]}: ${remaining} of ${initial} remaining`;
      }
    });
  };

  const selectedMission = () => getMissionPack(missionSelect.value);

  const setMission = (missionId: string): void => {
    const mission = getMissionPack(missionId);
    missionSelect.value = mission.id;
    landingMissionSelect.value = mission.id;
    landingPreviewTitle.textContent = mission.name;
    landingPreviewRegion.textContent = mission.region;
    landingPreviewObjective.textContent = `Address ${mission.target} randomly selected disruptions`;
  };

  const renderHistory = (history: StoredRunSummary[] = loadRunHistory()): void => {
    if (history.length === 0) {
      runHistory.innerHTML = `<p class="history-empty">Complete a mission to begin the comparison history.</p>`;
      return;
    }

    runHistory.innerHTML = history
      .map((run) => `
        <article class="history-row">
          <div><span>${run.region}</span><b>${run.missionName}</b><small>${new Date(run.completedAt).toLocaleString()}</small></div>
          <div><span>Result</span><b>${run.resilience} resilience · ${run.accuracy}% accuracy</b><small>${run.completed}/${run.target} addressed · ${run.resourceReservePercent ?? "—"}% resources remaining · ${run.ambientEventCount ?? 0} temporary injects · ${formatSeconds(run.elapsedSeconds)} · ${run.difficulty}</small></div>
          <div><span>Operating condition</span><b>${run.conditionTitle}</b><small>Seed ${run.seed}</small></div>
          <button class="secondary-button compact" type="button" data-replay-seed="${run.seed}" data-replay-mission="${run.missionId}">Load this run</button>
        </article>
      `)
      .join("");
  };

  const resetExerciseUi = (): void => {
    const mission = selectedMission();
    requiredElement("#hud-resilience").textContent = "—";
    requiredElement("#hud-completed").textContent = `0 / ${mission.target}`;
    requiredElement("#hud-timer").textContent = "—";
    requiredElement("#hud-timer-label").textContent = "Launch to begin";
    requiredElement("#hud-difficulty").textContent = "—";
    requiredElement<HTMLElement>("#hud-resilience-fill").style.width = "0%";
    gameStatus.textContent = "Select a difficulty and launch the regional scenario.";
    focusType.textContent = "Network overview";
    focusTitle.textContent = "Select an infrastructure node";
    focusEvent.textContent = "Hover over, approach, or select a node to preview the disruption located there.";
    focusTerms.innerHTML = `<b>Terms will be defined before the decision.</b><span>No prior supply-chain experience is required.</span>`;
    investigateFocusButton.disabled = true;
    investigateFocusButton.textContent = "Investigate selected node";
    delete investigateFocusButton.dataset.scenarioId;
    missionLog.innerHTML = `<article class="log-item info"><time>READY</time><p>Launch the scenario to initialize the operating picture.</p></article>`;
    assetMode.textContent = "Asset tracking";
    assetName.textContent = "Select a moving asset";
    assetStatus.textContent = "Ships, aircraft, trains, and trucks continue moving behind the network nodes.";
    assetStatusDot.dataset.status = "idle";
    assetRoute.textContent = "Select an icon on the map.";
    assetCargo.textContent = "Movement details will appear here.";
    assetDefinition.innerHTML = `<b>Live logistics</b><span>Animated assets show how goods continue moving, hold, delay, or reroute during a disruption.</span>`;
    assetStatusSummary.textContent = `${mission.assets.length} assets awaiting launch`;
    assetStatusBoard.innerHTML = `<p class="asset-board-empty">Launch the scenario to connect the live movement board.</p>`;
    weatherPanel.dataset.phase = "idle";
    weatherSeverity.textContent = "Forecast monitoring";
    weatherTitle.textContent = mission.weather.phases.approaching.title;
    weatherSummary.textContent = `Launch ${mission.name} to track changing conditions.`;
    weatherWind.textContent = "Forecast pending";
    weatherArea.textContent = "Coastal and inland routes";
    weatherTiming.textContent = "Awaiting launch";
    weatherCursorGauge.style.setProperty("--weather-level", "0%");
    weatherCursorValue.textContent = "0";
    weatherCursorZone.textContent = "Move across the map";
    weatherCursorCondition.textContent = "Localized exposure will appear here.";
    missionPulse.dataset.kind = "standby";
    missionPulseTitle.textContent = "Inject schedule offline";
    missionPulseCountdown.textContent = "Launch a mission to begin";
    operatorCallsign.textContent = "Response Lead · Standby";
    commandState.textContent = "Launch a scenario to connect mission controls.";
    pauseGameButton.disabled = true;
    pauseGameButton.textContent = "Pause mission";
    pauseGameButton.setAttribute("aria-pressed", "false");
    pauseOverlay.classList.add("hidden");
    missionPaused = false;
    setMapFocus(false);
    runIdentity.innerHTML = `<span>${mission.name}</span><b>New random seed will be generated at launch</b>`;
    currentRunPlan = null;
    logCounter = 0;
    resetResourceUi();
  };

  const destroyGame = (): void => {
    if (!game) return;
    game.destroy(true);
    game = null;
    gameCanvas.replaceChildren();
    startGameButton.disabled = false;
    difficultySelect.disabled = false;
    missionSelect.disabled = false;
    missionSeedInput.disabled = false;
    newSeedButton.disabled = false;
    mapDetailButton.disabled = true;
    mapDetailButton.textContent = "Map: Infrastructure";
    mapDetailButton.dataset.mode = "infrastructure";
    nodeLabelButton.disabled = true;
    nodeLabelButton.textContent = "Labels: Compact";
    nodeLabelButton.dataset.mode = "compact";
    [zoomOutButton, zoomResetButton, zoomInButton, mapFocusButton].forEach((button) => { button.disabled = true; });
    zoomResetButton.textContent = "100%";
    pauseGameButton.disabled = true;
    pauseOverlay.classList.add("hidden");
    missionPaused = false;
    setMapFocus(false);
  };

  const restartExercise = (): void => {
    destroyGame();
    resetExerciseUi();
    missionSeedInput.value = "";
    document.querySelector("#mission-control")?.scrollIntoView({ behavior: "smooth" });
  };

  const reportModal = createReportModalController(restartExercise, (report) => {
    renderHistory(saveRunReport(report));
  });

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

  startExerciseButton.addEventListener("click", () => {
    setMission(landingMissionSelect.value);
    briefing.open(difficultySelect.value as Difficulty, selectedMission());
  });
  landingMissionSelect.addEventListener("change", () => setMission(landingMissionSelect.value));
  missionSelect.addEventListener("change", () => {
    setMission(missionSelect.value);
    missionSeedInput.value = "";
    resetExerciseUi();
  });
  newSeedButton.addEventListener("click", () => {
    missionSeedInput.value = createMissionSeed();
    runIdentity.innerHTML = `<span>Prepared seed</span><b>${missionSeedInput.value}</b>`;
  });
  homeGlossaryButton.addEventListener("click", glossary.open);
  requiredElement<HTMLButtonElement>("#glossary-button").addEventListener("click", glossary.open);
  requiredElement<HTMLButtonElement>("#glossary-button-secondary").addEventListener("click", glossary.open);
  requiredElement<HTMLButtonElement>("#guide-button").addEventListener("click", guide.open);
  requiredElement<HTMLButtonElement>("#ops-reference-button").addEventListener("click", guide.open);
  pauseGameButton.addEventListener("click", () => setPaused(!missionPaused));
  mapDetailButton.addEventListener("click", () => game?.events.emit("cycle-map-mode"));
  nodeLabelButton.addEventListener("click", () => game?.events.emit("cycle-node-display"));
  zoomOutButton.addEventListener("click", () => game?.events.emit("map-zoom-step", -0.1));
  zoomResetButton.addEventListener("click", () => game?.events.emit("map-zoom-reset"));
  zoomInButton.addEventListener("click", () => game?.events.emit("map-zoom-step", 0.1));
  mapFocusButton.addEventListener("click", () => setMapFocus(!mapFocusActive));
  investigateFocusButton.addEventListener("click", () => {
    const scenarioId = investigateFocusButton.dataset.scenarioId;
    if (scenarioId) game?.events.emit("investigate-node", scenarioId);
  });
  requiredElement<HTMLButtonElement>("#mission-briefing-button").addEventListener("click", () => briefing.open(difficultySelect.value as Difficulty, selectedMission()));
  requiredElement<HTMLButtonElement>("#clear-log").addEventListener("click", () => missionLog.replaceChildren());
  clearHistoryButton.addEventListener("click", () => {
    clearRunHistory();
    renderHistory([]);
  });
  runHistory.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-replay-seed]");
    if (!button) return;
    setMission(button.dataset.replayMission ?? defaultMission.id);
    missionSeedInput.value = button.dataset.replaySeed ?? "";
    resetExerciseUi();
    runIdentity.innerHTML = `<span>Loaded reproducible run</span><b>Seed ${missionSeedInput.value}</b>`;
    document.querySelector("#mission-control")?.scrollIntoView({ behavior: "smooth" });
  });

  returnHomeButton.addEventListener("click", () => {
    destroyGame();
    resetExerciseUi();
    reportModal.hide();
    guide.close();
    glossary.close();
    briefing.close();
    platformShell.classList.add("hidden");
    landingScreen.classList.remove("hidden");
    presence.setMission(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  startGameButton.addEventListener("click", () => {
    if (game) return;

    const difficulty = difficultySelect.value as Difficulty;
    currentRunPlan = createMissionRunPlan(selectedMission(), missionSeedInput.value);
    missionSeedInput.value = currentRunPlan.seed;
    startGameButton.disabled = true;
    difficultySelect.disabled = true;
    missionSelect.disabled = true;
    missionSeedInput.disabled = true;
    newSeedButton.disabled = true;
    mapDetailButton.disabled = false;
    mapDetailButton.textContent = "Map: Infrastructure";
    mapDetailButton.dataset.mode = "infrastructure";
    nodeLabelButton.disabled = false;
    nodeLabelButton.textContent = "Labels: Compact";
    nodeLabelButton.dataset.mode = "compact";
    [zoomOutButton, zoomResetButton, zoomInButton, mapFocusButton].forEach((button) => { button.disabled = false; });
    zoomOutButton.disabled = true;
    zoomResetButton.textContent = "100%";
    pauseGameButton.disabled = false;
    pauseGameButton.textContent = "Pause mission";
    pauseGameButton.setAttribute("aria-pressed", "false");
    pauseOverlay.classList.add("hidden");
    missionPaused = false;
    gameStatus.textContent = "Scenario loading. Investigate a node to begin.";
    missionLog.replaceChildren();

    game = createSupplyChainGame(gameCanvas, difficulty, currentRunPlan);

    game.events.on("toggle-guide", guide.toggle);
    game.events.on("show-challenge", (request: ChallengeRequest) => challengeModal.show(request));
    game.events.on("hud-update", (update: HudUpdate) => {
      updateHud(update);
      updateMissionPulse(update.elapsedSeconds);
    });
    game.events.on("node-focus", (scenario: Scenario, available = true) => {
      focusType.textContent = scenario.nodeType;
      focusTitle.textContent = scenario.title;
      focusEvent.textContent = scenario.event;
      focusTerms.innerHTML = `<b>${scenario.keyTerms.length} terms defined</b><span>${scenario.keyTerms.map((term) => term.term).join(" · ")}</span>`;
      investigateFocusButton.dataset.scenarioId = scenario.id;
      investigateFocusButton.disabled = !available;
      investigateFocusButton.textContent = available ? "Investigate selected node" : "Node already addressed";
    });
    game.events.on("node-display-mode", (mode: "compact" | "detail") => {
      nodeLabelButton.dataset.mode = mode;
      nodeLabelButton.textContent = mode === "compact" ? "Labels: Compact" : "Labels: Detailed";
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
    game.events.on("resources-update", (update: StrategicResourceUpdate) => {
      renderResources(update);
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
    game.events.on("weather-cursor", (weather: WeatherCursorUpdate) => {
      weatherCursorGauge.style.setProperty("--weather-level", `${weather.intensity}%`);
      weatherCursorGauge.dataset.level = weather.intensity >= 70 ? "severe" : weather.intensity >= 35 ? "caution" : "clear";
      weatherCursorValue.textContent = String(weather.intensity);
      weatherCursorZone.textContent = weather.zone;
      weatherCursorCondition.textContent = `${weather.condition} · ${weather.proximity}`;
      weatherCursorGauge.title = `${weather.zone}: ${weather.intensity}% localized weather exposure. ${weather.wind}`;
    });
    game.events.on("ambient-event-focus", (event: { kind: string; title: string; summary: string; durationSeconds: number }) => {
      focusType.textContent = `${event.kind} inject`;
      focusTitle.textContent = event.title;
      focusEvent.textContent = event.summary;
      focusTerms.innerHTML = `<b>Temporary network condition</b><span>Expected duration: ${event.durationSeconds} exercise seconds. The movement board shows the affected asset.</span>`;
    });
    game.events.on("map-surface-mode", (mode: "infrastructure" | "terrain" | "minimal") => {
      const label = mode === "infrastructure" ? "Infrastructure" : mode === "terrain" ? "Terrain" : "Minimal";
      mapDetailButton.textContent = `Map: ${label}`;
      mapDetailButton.dataset.mode = mode;
      mapDetailButton.setAttribute("aria-label", `Current map layer: ${label}. Activate to change layer.`);
    });
    game.events.on("map-zoom-update", (zoom: number) => {
      zoomResetButton.textContent = `${Math.round(zoom * 100)}%`;
      zoomOutButton.disabled = zoom <= 1;
      zoomInButton.disabled = zoom >= 1.6;
    });
    game.events.on("mission-started", (runPlan: MissionRunPlan) => {
      runIdentity.innerHTML = `<span>${runPlan.mission.region} · ${runPlan.condition.title}</span><b>Seed ${runPlan.seed} · ${runPlan.activeScenarioIds.length} decision injects · ${runPlan.ambientEvents.length} temporary injects</b>`;
      operatorCallsign.textContent = `Response Lead · ${runPlan.mission.region}`;
      commandState.textContent = "Mission active · live systems updating";
      presence.setMission(runPlan.mission.id);
    });
    game.events.on("decision-result", (result: DecisionResult) => {
      const direction = result.resilienceChange >= 0 ? "+" : "";
      gameStatus.textContent = `${result.correct ? "Effective response." : "Response increased risk."} Resilience ${direction}${result.resilienceChange}; current score ${result.resilience}. ${result.takeaway}`;
    });
    game.events.on("decision-consequence", (result: { penalty: number; resilience: number; text: string }) => {
      gameStatus.textContent = `${result.text} Resilience −${result.penalty}; current score ${result.resilience}.`;
    });
    game.events.on("mission-log", (entry: MissionLogEntry) => appendLog(entry));
    game.events.on("game-ready", () => {
      gameStatus.textContent = "Scenario active. Every visible node can be clicked, or you can move nearby and press E.";
    });
    game.events.on("game-complete", (report: GameReport) => {
      pauseGameButton.disabled = true;
      pauseOverlay.classList.add("hidden");
      commandState.textContent = "Mission complete · after-action review ready";
      setMapFocus(false);
      presence.setMission(null);
      reportModal.show(report);
    });

    document.querySelector("#exercise")?.scrollIntoView({ behavior: "smooth" });
  });

  const runCommand = (command: CommandId): void => {
    const commands: Record<CommandId, () => void> = {
      pause: () => { if (!pauseGameButton.disabled) setPaused(!missionPaused); },
      focus: () => { if (!mapFocusButton.disabled) setMapFocus(!mapFocusActive); },
      map: () => { if (!mapDetailButton.disabled) game?.events.emit("cycle-map-mode"); },
      labels: () => { if (!nodeLabelButton.disabled) game?.events.emit("cycle-node-display"); },
      "zoom-in": () => { if (!zoomInButton.disabled) game?.events.emit("map-zoom-step", 0.1); },
      "zoom-out": () => { if (!zoomOutButton.disabled) game?.events.emit("map-zoom-step", -0.1); },
      "zoom-reset": () => { if (!zoomResetButton.disabled) game?.events.emit("map-zoom-reset"); },
      reference: guide.open,
      glossary: glossary.open
    };
    commands[command]();
  };

  const commandPalette = createCommandPaletteController(runCommand);
  commandPaletteButton.addEventListener("click", commandPalette.open);
  window.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement | null;
    const editing = target?.matches("input, textarea, select") || target?.isContentEditable;
    if (platformShell.classList.contains("hidden")) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      commandPalette.toggle();
      return;
    }
    if (editing || commandPalette.isOpen()) return;
    if (document.querySelector(".modal-backdrop:not(.hidden), .briefing-overlay:not(.hidden)")) return;
    if (event.key === "Escape" && mapFocusActive) {
      event.preventDefault();
      setMapFocus(false);
      return;
    }
    const shortcuts: Record<string, CommandId> = {
      p: "pause",
      f: "focus",
      l: "map",
      n: "labels",
      "+": "zoom-in",
      "=": "zoom-in",
      "-": "zoom-out",
      "0": "zoom-reset",
      m: "reference",
      g: "glossary"
    };
    const command = shortcuts[event.key.toLowerCase()];
    if (command) {
      event.preventDefault();
      runCommand(command);
    }
  });

  missionPacks.forEach((mission) => {
    if (!missionSelect.querySelector(`option[value="${mission.id}"]`)) {
      throw new Error(`Mission selector is missing ${mission.id}.`);
    }
  });
  setMission(defaultMission.id);
  renderHistory();
  resetExerciseUi();
}
