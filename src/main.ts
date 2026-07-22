import Phaser from "phaser";
import "./style.css";
import { SupplyChainScene } from "./game/SupplyChainScene";
import type { Difficulty, GameReport, Scenario } from "./game/types";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root was not found.");

app.innerHTML = `
  <div class="app-shell">
    <header class="app-header">
      <div class="brand-block">
        <div class="brand-mark" aria-hidden="true">RR</div>
        <div>
          <strong>Resilience Routes</strong>
          <span>Supply Chain Quest</span>
        </div>
      </div>

      <div class="header-mission">
        <span class="status-dot" aria-hidden="true"></span>
        <div>
          <strong>Mission 01</strong>
          <span>Stabilize three connected infrastructure nodes</span>
        </div>
      </div>

      <div class="header-actions">
        <label class="difficulty-control" for="difficulty">
          <span>Difficulty</span>
          <select id="difficulty">
            <option value="easy">Easy</option>
            <option value="medium" selected>Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <button id="restart-game" class="button button-secondary" type="button" disabled>
          Restart
        </button>
        <button id="help-button" class="button button-primary" type="button">
          How to play
        </button>
      </div>
    </header>

    <aside class="side-rail" aria-label="Application sections">
      <button class="rail-button active" type="button" data-view="play" aria-pressed="true">
        <span class="rail-icon" aria-hidden="true">▶</span>
        <span>Play</span>
      </button>
      <button class="rail-button" type="button" data-view="learn" aria-pressed="false">
        <span class="rail-icon" aria-hidden="true">◎</span>
        <span>Learn</span>
      </button>
      <button class="rail-button" type="button" data-view="team" aria-pressed="false">
        <span class="rail-icon" aria-hidden="true">◫</span>
        <span>Team</span>
      </button>
      <button class="rail-button" type="button" data-view="status" aria-pressed="false">
        <span class="rail-icon" aria-hidden="true">✓</span>
        <span>Status</span>
      </button>
    </aside>

    <main class="workspace">
      <section class="workspace-view active" data-panel="play" aria-label="Playable game">
        <div class="game-toolbar">
          <div class="metric">
            <span>Resilience</span>
            <strong id="resilience-value">--</strong>
            <div class="meter" aria-hidden="true"><span id="resilience-meter"></span></div>
          </div>
          <div class="metric">
            <span>Nodes resolved</span>
            <strong id="nodes-value">0 / 3</strong>
          </div>
          <div class="metric">
            <span>Time remaining</span>
            <strong id="timer-value">--:--</strong>
          </div>
          <div class="mission-state" id="mission-state">
            Ready for briefing
          </div>
        </div>

        <div class="play-layout">
          <section class="map-panel" aria-label="Regional supply network map">
            <div id="game-canvas" class="game-canvas"></div>
            <div class="map-controls" aria-label="Game controls">
              <span><kbd>WASD</kbd> or arrows to move</span>
              <span><kbd>E</kbd> interact</span>
              <span>or click any node</span>
            </div>
            <div id="start-cover" class="start-cover">
              <div class="start-card">
                <span class="section-kicker">Mission briefing</span>
                <h1>Keep the network operating.</h1>
                <p>
                  Investigate infrastructure disruptions, choose a response, and
                  keep the resilience score above zero. Resolve three nodes to
                  complete the mission.
                </p>
                <div class="briefing-points">
                  <div><strong>1</strong><span>Choose a difficulty</span></div>
                  <div><strong>2</strong><span>Click a node or move to it</span></div>
                  <div><strong>3</strong><span>Review the real-world impact</span></div>
                  <div><strong>4</strong><span>Select the best response</span></div>
                </div>
                <button id="start-game" class="button button-primary button-large" type="button">
                  Begin mission
                </button>
              </div>
            </div>
          </section>

          <aside class="intel-panel" aria-label="Mission information">
            <div class="intel-header">
              <div>
                <span class="section-kicker">Mission intel</span>
                <h2 id="intel-title">Regional network</h2>
              </div>
              <span id="intel-badge" class="badge">Overview</span>
            </div>

            <div id="intel-content" class="intel-content">
              <p>
                Each location represents a real supply-chain function. Select a node
                to see what it supports and how a disruption can spread.
              </p>

              <div class="intel-list">
                <div>
                  <span>Primary objective</span>
                  <strong>Resolve 3 disruptions</strong>
                </div>
                <div>
                  <span>Failure condition</span>
                  <strong>Resilience reaches 0</strong>
                </div>
                <div>
                  <span>Learning focus</span>
                  <strong>Cascading risk and redundancy</strong>
                </div>
              </div>
            </div>

            <div class="activity-panel">
              <span class="section-kicker">Latest activity</span>
              <p id="activity-text">Start the mission when you are ready.</p>
            </div>
          </aside>
        </div>
      </section>

      <section class="workspace-view information-view" data-panel="learn" aria-label="Learning model">
        <div class="view-heading">
          <div>
            <span class="section-kicker">Learning model</span>
            <h1>Understand the full disruption chain.</h1>
          </div>
          <p>
            Each scenario explains why the node matters, how failure starts, when
            the risk increases, and where the effects spread.
          </p>
        </div>

        <div class="learning-cards">
          <article>
            <span class="step-number">01</span>
            <h2>Why it matters</h2>
            <p>Connect the infrastructure node to the people, industries, and resources that depend on it.</p>
          </article>
          <article>
            <span class="step-number">02</span>
            <h2>How it fails</h2>
            <p>Follow the operational sequence from the original hazard to transportation, inventory, and service impacts.</p>
          </article>
          <article>
            <span class="step-number">03</span>
            <h2>When risk rises</h2>
            <p>Recognize the conditions that make a disruption more likely, severe, or difficult to recover from.</p>
          </article>
          <article>
            <span class="step-number">04</span>
            <h2>Where it spreads</h2>
            <p>Trace the cascading effects through ports, rail, roads, airports, warehouses, suppliers, and communities.</p>
          </article>
        </div>

        <div class="learning-outcomes">
          <h2>Learning outcomes</h2>
          <div class="outcome-grid">
            <span>Identify chokepoints</span>
            <span>Compare redundancy and efficiency</span>
            <span>Practice resource prioritization</span>
            <span>Recognize digital and physical dependencies</span>
            <span>Explain cascading disruption</span>
          </div>
        </div>
      </section>

      <section class="workspace-view information-view" data-panel="team" aria-label="Contributors">
        <div class="view-heading">
          <div>
            <span class="section-kicker">Contributors</span>
            <h1>Team roles and current due-outs.</h1>
          </div>
          <p>Each role feeds reviewed material into the same playable model and portfolio.</p>
        </div>

        <div class="team-grid">
          <article><span>Prototype and hazards</span><h2>James Daniels</h2><p>Repository, deployment, inject logic, hazard content, issues, and milestone tracking.</p></article>
          <article><span>Game design and global trade</span><h2>Kristina-Marie Horton</h2><p>Core mechanics, win conditions, resources, trade flows, and partner logic.</p></article>
          <article><span>Visual design</span><h2>A'zariah Turner</h2><p>Map style, node icons, card layout, original artwork, and visual consistency.</p></article>
          <article><span>Infrastructure</span><h2>Lauren Hession</h2><p>Ports, airports, rail, roads, chokepoints, dependencies, and alternate routes.</p></article>
          <article><span>Content and writing</span><h2>Rachel Farlinger</h2><p>Rules, learning text, scenario descriptions, instructions, and after-action prompts.</p></article>
          <article><span>Exercises and U.S. scale</span><h2>Role support needed</h2><p>State or regional adaptation, inject timeline, evaluation measures, and facilitator use.</p></article>
        </div>
      </section>

      <section class="workspace-view information-view" data-panel="status" aria-label="Project status">
        <div class="view-heading">
          <div>
            <span class="section-kicker">Project status</span>
            <h1>First milestone readiness.</h1>
          </div>
          <p>The first version stays deliberately small so the group can test the learning model before expanding it.</p>
        </div>

        <div class="status-board">
          <article><span class="status-tag green">Ready</span><h2>Technical foundation</h2><p>Browser game, GitHub Pages deployment, static security boundary, and team workflow.</p></article>
          <article><span class="status-tag green">Ready</span><h2>Hazard inject structure</h2><p>Five starter scenarios with decisions, consequences, and learning takeaways.</p></article>
          <article><span class="status-tag yellow">Team review</span><h2>Game rules</h2><p>Working digital loop exists. Official scoring and tabletop alignment still need approval.</p></article>
          <article><span class="status-tag yellow">Content due</span><h2>Trade and infrastructure</h2><p>Starter content exists. Role leads should replace it with reviewed project research.</p></article>
          <article><span class="status-tag yellow">Design due</span><h2>Original visual assets</h2><p>The dashboard is functional. Team-created icons, map art, and card visuals remain due.</p></article>
          <article><span class="status-tag red">Not started</span><h2>U.S. scale mode</h2><p>A named owner, first region, and exercise objectives still need to be selected.</p></article>
        </div>
      </section>
    </main>
  </div>

  <div id="drawer-backdrop" class="overlay hidden" role="presentation">
    <section id="guide-drawer" class="drawer" role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <div class="drawer-header">
        <div>
          <span class="section-kicker">Quick reference</span>
          <h2 id="guide-title">How to play</h2>
        </div>
        <button id="close-guide" class="icon-button" type="button" aria-label="Close instructions">×</button>
      </div>

      <div class="instruction-list">
        <div><strong>1</strong><p>Select easy, medium, or hard before starting.</p></div>
        <div><strong>2</strong><p>Use WASD or arrow keys, or click an infrastructure node directly.</p></div>
        <div><strong>3</strong><p>Review why, how, when, and where the disruption matters.</p></div>
        <div><strong>4</strong><p>Choose a response. Your decision changes the resilience score.</p></div>
        <div><strong>5</strong><p>Resolve three nodes before resilience reaches zero or time expires.</p></div>
      </div>

      <div class="difficulty-table">
        <div><span>Easy</span><p>Hints shown, lower penalties, no timer.</p></div>
        <div><span>Medium</span><p>Standard effects and a four-minute timer.</p></div>
        <div><span>Hard</span><p>Stronger cascades and a three-minute timer.</p></div>
      </div>
    </section>
  </div>

  <div id="challenge-backdrop" class="overlay hidden" role="presentation">
    <section class="decision-modal" role="dialog" aria-modal="true" aria-labelledby="challenge-title">
      <div class="decision-header">
        <div>
          <span id="challenge-type" class="section-kicker"></span>
          <h2 id="challenge-title"></h2>
        </div>
        <span class="badge">Active inject</span>
      </div>

      <p id="challenge-event" class="event-summary"></p>

      <div class="impact-tabs" role="tablist" aria-label="Disruption explanation">
        <button class="impact-tab active" type="button" data-impact="why">Why</button>
        <button class="impact-tab" type="button" data-impact="how">How</button>
        <button class="impact-tab" type="button" data-impact="when">When</button>
        <button class="impact-tab" type="button" data-impact="where">Where</button>
      </div>
      <div id="impact-copy" class="impact-copy"></div>

      <div class="decision-question">
        <h3 id="challenge-question"></h3>
        <div id="challenge-options" class="decision-options"></div>
      </div>
    </section>
  </div>

  <div id="report-backdrop" class="overlay hidden" role="presentation">
    <section class="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <span class="section-kicker">After-action report</span>
      <h2 id="report-title">Mission results</h2>
      <p id="report-summary" class="report-summary"></p>
      <div id="report-decisions" class="report-decisions"></div>
      <div class="report-actions">
        <button id="review-dashboard" class="button button-secondary" type="button">Review dashboard</button>
        <button id="restart-report" class="button button-primary" type="button">Run again</button>
      </div>
    </section>
  </div>
`;

function requiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

const startButton = requiredElement<HTMLButtonElement>("#start-game");
const restartButton = requiredElement<HTMLButtonElement>("#restart-game");
const difficultySelect = requiredElement<HTMLSelectElement>("#difficulty");
const gameCanvas = requiredElement<HTMLDivElement>("#game-canvas");
const startCover = requiredElement<HTMLDivElement>("#start-cover");
const helpButton = requiredElement<HTMLButtonElement>("#help-button");
const guideBackdrop = requiredElement<HTMLDivElement>("#drawer-backdrop");
const closeGuideButton = requiredElement<HTMLButtonElement>("#close-guide");
const challengeBackdrop = requiredElement<HTMLDivElement>("#challenge-backdrop");
const optionsContainer = requiredElement<HTMLDivElement>("#challenge-options");
const impactCopy = requiredElement<HTMLDivElement>("#impact-copy");
const reportBackdrop = requiredElement<HTMLDivElement>("#report-backdrop");
const restartReport = requiredElement<HTMLButtonElement>("#restart-report");
const reviewDashboard = requiredElement<HTMLButtonElement>("#review-dashboard");
const resilienceValue = requiredElement<HTMLElement>("#resilience-value");
const resilienceMeter = requiredElement<HTMLElement>("#resilience-meter");
const nodesValue = requiredElement<HTMLElement>("#nodes-value");
const timerValue = requiredElement<HTMLElement>("#timer-value");
const missionState = requiredElement<HTMLElement>("#mission-state");
const activityText = requiredElement<HTMLElement>("#activity-text");
const intelTitle = requiredElement<HTMLElement>("#intel-title");
const intelBadge = requiredElement<HTMLElement>("#intel-badge");
const intelContent = requiredElement<HTMLElement>("#intel-content");

let game: Phaser.Game | null = null;
let currentImpact: Record<"why" | "how" | "when" | "where", string> | null = null;

function setText(selector: string, value: string): void {
  requiredElement<HTMLElement>(selector).textContent = value;
}

function switchView(view: string): void {
  document.querySelectorAll<HTMLButtonElement>(".rail-button").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  document.querySelectorAll<HTMLElement>(".workspace-view").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === view);
  });
}

document.querySelectorAll<HTMLButtonElement>(".rail-button").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view ?? "play"));
});

function openGuide(): void {
  guideBackdrop.classList.remove("hidden");
  closeGuideButton.focus();
}

function closeGuide(): void {
  guideBackdrop.classList.add("hidden");
  helpButton.focus();
}

helpButton.addEventListener("click", openGuide);
closeGuideButton.addEventListener("click", closeGuide);
guideBackdrop.addEventListener("click", (event) => {
  if (event.target === guideBackdrop) closeGuide();
});

function formatTimer(seconds: number | null): string {
  if (seconds === null) return "No limit";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function updateHud(payload: {
  resilience: number;
  completed: number;
  remainingSeconds: number | null;
  difficulty: Difficulty;
}): void {
  resilienceValue.textContent = `${payload.resilience}`;
  resilienceMeter.style.width = `${payload.resilience}%`;
  nodesValue.textContent = `${payload.completed} / 3`;
  timerValue.textContent = formatTimer(payload.remainingSeconds);

  if (payload.resilience >= 70) {
    resilienceMeter.dataset.level = "good";
  } else if (payload.resilience >= 35) {
    resilienceMeter.dataset.level = "warning";
  } else {
    resilienceMeter.dataset.level = "danger";
  }
}

function showNodeIntel(scenario: Scenario): void {
  intelTitle.textContent = scenario.title;
  intelBadge.textContent = scenario.nodeType;
  intelContent.innerHTML = "";

  const event = document.createElement("p");
  event.className = "intel-event";
  event.textContent = scenario.event;

  const prompt = document.createElement("p");
  prompt.className = "intel-prompt";
  prompt.textContent = "Click this node to investigate, or move near it and press E.";

  intelContent.append(event, prompt);
}

function beginGame(): void {
  if (game) return;

  const difficulty = difficultySelect.value as Difficulty;
  difficultySelect.disabled = true;
  restartButton.disabled = false;
  startCover.classList.add("hidden");
  missionState.textContent = "Mission active";
  activityText.textContent = "Select a node or move through the network.";

  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 960,
    height: 600,
    parent: gameCanvas,
    backgroundColor: "#111827",
    scene: [new SupplyChainScene(difficulty)],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: true,
      pixelArt: false
    }
  });

  game.events.on("toggle-guide", openGuide);
  game.events.on("hud-update", updateHud);
  game.events.on("node-focus", (scenario: Scenario) => showNodeIntel(scenario));

  game.events.on(
    "show-challenge",
    (payload: {
      scenario: Scenario;
      showHint: boolean;
      resolve: (selectedIndex: number) => void;
    }) => showChallenge(payload)
  );

  game.events.on(
    "decision-result",
    (result: {
      correct: boolean;
      resilienceChange: number;
      resilience: number;
      takeaway: string;
    }) => {
      const change = result.resilienceChange >= 0
        ? `+${result.resilienceChange}`
        : `${result.resilienceChange}`;

      activityText.textContent = `${
        result.correct ? "Effective response." : "Response increased risk."
      } Resilience ${change}. ${result.takeaway}`;
    }
  );

  game.events.on("game-complete", (report: GameReport) => showReport(report));
}

startButton.addEventListener("click", beginGame);
restartButton.addEventListener("click", () => window.location.reload());

function setImpactTab(name: "why" | "how" | "when" | "where"): void {
  if (!currentImpact) return;

  document.querySelectorAll<HTMLButtonElement>(".impact-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.impact === name);
  });

  impactCopy.textContent = currentImpact[name];
}

document.querySelectorAll<HTMLButtonElement>(".impact-tab").forEach((button) => {
  button.addEventListener("click", () => {
    setImpactTab((button.dataset.impact ?? "why") as "why" | "how" | "when" | "where");
  });
});

function showChallenge(payload: {
  scenario: Scenario;
  showHint: boolean;
  resolve: (selectedIndex: number) => void;
}): void {
  const { scenario, showHint, resolve } = payload;

  setText("#challenge-type", scenario.nodeType);
  setText("#challenge-title", scenario.title);
  setText("#challenge-event", scenario.event);
  setText("#challenge-question", scenario.question);

  currentImpact = {
    why: scenario.why,
    how: scenario.how,
    when: scenario.when,
    where: scenario.where
  };
  setImpactTab("why");

  optionsContainer.replaceChildren();

  scenario.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "decision-option";

    const marker = document.createElement("span");
    marker.className = "option-marker";
    marker.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.className = "option-text";
    text.textContent = option;

    button.append(marker, text);

    if (showHint && index === scenario.correctIndex) {
      const hint = document.createElement("small");
      hint.textContent = "Recommended";
      button.append(hint);
    }

    button.addEventListener("click", () => {
      resolve(index);
      challengeBackdrop.classList.add("hidden");
    });

    optionsContainer.append(button);
  });

  challengeBackdrop.classList.remove("hidden");
  optionsContainer.querySelector<HTMLButtonElement>("button")?.focus();
}

function showReport(report: GameReport): void {
  const outcomeText: Record<GameReport["outcome"], string> = {
    completed: "Mission complete. You stabilized three connected nodes.",
    "network-failed": "Mission ended because network resilience reached zero.",
    "time-expired": "The response window closed before three nodes were stabilized."
  };

  missionState.textContent = report.outcome === "completed" ? "Mission complete" : "Mission ended";

  setText(
    "#report-summary",
    `${outcomeText[report.outcome]} Final resilience: ${report.resilience}/100.`
  );

  const decisionContainer = requiredElement<HTMLDivElement>("#report-decisions");
  decisionContainer.replaceChildren();

  report.decisions.forEach((decision) => {
    const row = document.createElement("article");
    const status = document.createElement("span");
    const body = document.createElement("div");
    const heading = document.createElement("h3");
    const selected = document.createElement("p");
    const takeaway = document.createElement("p");

    status.className = `decision-status ${decision.correct ? "correct" : "incorrect"}`;
    status.textContent = decision.correct ? "Effective" : "Review";

    heading.textContent = decision.title;
    selected.textContent = `Your response: ${decision.selectedOption}`;
    takeaway.textContent = decision.takeaway;

    body.append(heading, selected, takeaway);
    row.append(status, body);
    decisionContainer.append(row);
  });

  reportBackdrop.classList.remove("hidden");
  restartReport.focus();
}

restartReport.addEventListener("click", () => window.location.reload());
reviewDashboard.addEventListener("click", () => {
  reportBackdrop.classList.add("hidden");
  switchView("status");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    guideBackdrop.classList.add("hidden");
  }
});
