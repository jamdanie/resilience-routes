import { missionPacks } from "../data/missions";
import { glossaryTerms } from "./glossary";
import { renderMissionBriefing } from "./missionBriefing";

function renderScenarioLibrary(): string {
  return missionPacks
    .map((mission) => `
      <section class="scenario-mission-group">
        <div><span>${mission.region}</span><h3>${mission.name}</h3><p>${mission.description}</p></div>
        <div class="scenario-grid">
          ${mission.scenarios
            .map(
              (scenario) => `
                <article class="scenario-card" style="--scenario-accent:${scenario.color}">
                  <span>${scenario.nodeType}</span>
                  <h3>${scenario.title}</h3>
                  <p>${scenario.event}</p>
                  <small>${scenario.keyTerms.length} defined terms</small>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `)
    .join("");
}

function renderMissionOptions(): string {
  return missionPacks
    .map((mission) => `<option value="${mission.id}">${mission.name}</option>`)
    .join("");
}

function renderGlossaryEntries(): string {
  return glossaryTerms
    .map(
      (entry) => `
        <details class="glossary-entry">
          <summary>${entry.term}</summary>
          <p><b>Definition:</b> ${entry.definition}</p>
          <p><b>Example:</b> ${entry.example}</p>
          <p><b>Why it matters:</b> ${entry.whyItMatters}</p>
        </details>
      `
    )
    .join("");
}

export function renderApplicationShell(): string {
  return `
    <div id="platform-shell" class="platform-shell hidden">
      <header class="topbar">
        <a class="brand" href="#mission-control" aria-label="Resilience Routes home">
          <span class="brand-mark">RR</span>
          <span><strong>Resilience Routes</strong><small>Mission Control</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#mission-control">Briefing</a>
          <a href="#exercise">Exercise</a>
          <a href="#learning">Learning</a>
          <a href="#scenarios">Scenarios</a>
          <a href="#history">History</a>
          <a href="#project">Project</a>
        </nav>
        <div class="topbar-actions">
          <div id="presence-indicator" class="presence-indicator" data-connected="true" title="This indicator only shows a global count when a presence service is configured.">
            <i aria-hidden="true"></i><span id="presence-count">Live session</span>
          </div>
          <button id="command-palette-button" class="secondary-button compact command-palette-trigger" type="button" aria-keyshortcuts="Control+K">Commands <kbd>Ctrl K</kbd></button>
          <button id="glossary-button" class="text-button" type="button">Glossary</button>
          <button id="return-home" class="secondary-button compact" type="button">Exit Mission</button>
        </div>
      </header>

      <main>
        <section id="mission-control" class="hero mission-hero">
          <div class="hero-copy-block">
            <p class="eyebrow">Mission preparation</p>
            <h1>Coordinate the response before disruption becomes a crisis.</h1>
            <p class="hero-copy">
              Enter a connected regional supply network. Investigate a disruption,
              learn the terminology in plain language, compare response options,
              and see how your decision changes overall resilience.
            </p>

            <div class="mission-actions-card">
              <div>
                <label for="mission-pack">Regional mission</label>
                <select id="mission-pack">${renderMissionOptions()}</select>
              </div>
              <div>
                <label for="difficulty">Exercise difficulty</label>
                <select id="difficulty">
                  <option value="easy">Easy — recommended option shown, no timer</option>
                  <option value="medium" selected>Medium — standard impacts, 4-minute timer</option>
                  <option value="hard">Hard — stronger cascades, 3-minute timer</option>
                </select>
              </div>
              <div class="seed-control">
                <label for="mission-seed">Mission seed <small>Leave blank for a new random run</small></label>
                <div><input id="mission-seed" maxlength="32" autocomplete="off" placeholder="Random seed"><button id="new-seed" class="secondary-button compact" type="button">New random seed</button></div>
              </div>
              <div class="mission-action-buttons">
                <button id="start-game" class="primary-button" type="button">Launch Regional Scenario</button>
                <button id="mission-briefing-button" class="secondary-button" type="button">Review Mission Briefing</button>
              </div>
              <small>Use the mouse or touch to select nodes. Keyboard players can use WASD or arrow keys and press E.</small>
            </div>
          </div>

          <aside class="command-intent-card">
            <p class="eyebrow">Commander's intent</p>
            <h2>Stabilize three connected nodes.</h2>
            <p>Keep the regional resilience score above zero while protecting essential movement, trusted information, and public safety.</p>
            <div class="intent-list">
              <span><i>01</i>Define unfamiliar terms before making a decision.</span>
              <span><i>02</i>Trace how effects spread through connected systems.</span>
              <span><i>03</i>Use limited capacity for the most important needs first.</span>
              <span><i>04</i>Review why every selected response helped or increased risk.</span>
            </div>
          </aside>
        </section>

        <section id="exercise" class="section exercise-section" aria-labelledby="exercise-heading">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Live exercise</p>
              <h2 id="exercise-heading">Regional supply network</h2>
            </div>
            <div class="section-actions">
              <button id="guide-button" class="secondary-button" type="button">Quick Reference</button>
              <button id="glossary-button-secondary" class="secondary-button" type="button">Definitions</button>
            </div>
          </div>

          <div class="hud-grid" aria-label="Exercise status">
            <article>
              <span>Network resilience</span>
              <strong id="hud-resilience">—</strong>
              <div class="hud-meter"><i id="hud-resilience-fill"></i></div>
            </article>
            <article><span>Disruptions addressed</span><strong id="hud-completed">0 / 3</strong><small>Mission objective</small></article>
            <article><span>Time remaining</span><strong id="hud-timer">—</strong><small id="hud-timer-label">Launch to begin</small></article>
            <article><span>Difficulty</span><strong id="hud-difficulty">—</strong><small>Response conditions</small></article>
          </div>

          <section class="resource-command-bar" aria-label="Available mission resources" aria-live="polite">
            <div class="resource-command-heading">
              <span>Strategic resources</span>
              <small>Every commitment reduces what remains for later disruptions.</small>
            </div>
            <div id="resource-pool" class="resource-pool">
              <article data-resource="funds"><span>Funds</span><strong id="resource-funds">—</strong></article>
              <article data-resource="crews"><span>Field crews</span><strong id="resource-crews">—</strong></article>
              <article data-resource="transport"><span>Transport</span><strong id="resource-transport">—</strong></article>
              <article data-resource="fuel"><span>Fuel</span><strong id="resource-fuel">—</strong></article>
              <article data-resource="intelligence"><span>Intel</span><strong id="resource-intelligence">—</strong></article>
              <article data-resource="inventory"><span>Reserves</span><strong id="resource-inventory">—</strong></article>
            </div>
          </section>

          <div id="game-status" class="notice" role="status">
            Select a difficulty and launch the regional scenario.
          </div>
          <div id="run-identity" class="run-identity" aria-live="polite">
            <span>Mission not launched</span><b>Seed will appear here</b>
          </div>

          <section class="mission-command-strip" aria-label="Mission controls and local weather telemetry">
            <div class="command-strip-identity">
              <span>Response station</span>
              <b id="operator-callsign">Response Lead · Standby</b>
              <small id="command-state">Launch a scenario to connect mission controls.</small>
            </div>
            <div class="cursor-weather" aria-live="polite">
              <div id="weather-cursor-gauge" class="weather-cursor-gauge" style="--weather-level:0%"><span id="weather-cursor-value">0</span><small>%</small></div>
              <div><span>Weather at cursor</span><b id="weather-cursor-zone">Move across the map</b><small id="weather-cursor-condition">Localized exposure will appear here.</small></div>
            </div>
            <div id="mission-pulse" class="mission-pulse" data-kind="standby" aria-live="polite">
              <i aria-hidden="true"></i>
              <div><span>Mission pulse</span><b id="mission-pulse-title">Inject schedule offline</b><small id="mission-pulse-countdown">Launch a mission to begin</small></div>
            </div>
            <div class="command-strip-actions">
              <button id="ops-reference-button" class="secondary-button compact" type="button">Quick reference</button>
              <button id="pause-game-button" class="primary-button compact" type="button" disabled aria-pressed="false">Pause mission</button>
            </div>
          </section>

          <div class="exercise-grid">
            <div class="map-column">
              <div class="map-toolbar">
                <div><b>Operational map</b><span>Roads, rail, runways, docks, terrain, vehicles, weather, and decision nodes.</span></div>
                <div class="map-toolbar-actions">
                  <button id="node-label-button" class="secondary-button compact" type="button" aria-label="Change decision-node label density" disabled>Labels: Compact</button>
                  <button id="map-detail-button" class="secondary-button compact map-mode-button" type="button" aria-label="Change operational map layer" disabled>Map: Infrastructure</button>
                  <div class="map-zoom-controls" role="group" aria-label="Tactical map zoom">
                    <button id="zoom-out-button" class="secondary-button compact" type="button" aria-label="Zoom map out" disabled>−</button>
                    <button id="zoom-reset-button" class="secondary-button compact" type="button" aria-label="Reset map zoom" disabled>100%</button>
                    <button id="zoom-in-button" class="secondary-button compact" type="button" aria-label="Zoom map in" disabled>+</button>
                  </div>
                  <button id="map-focus-button" class="secondary-button compact" type="button" aria-label="Enter tactical map focus mode" aria-pressed="false" disabled>Focus map</button>
                </div>
              </div>
              <div class="game-stage">
                <div id="game-canvas" class="game-canvas" aria-label="Interactive supply-chain network"></div>
                <div id="pause-overlay" class="pause-overlay hidden" role="status"><span>Mission paused</span><b>The clock, weather, assets, and injects are holding.</b></div>
              </div>
              <p class="canvas-disclaimer">The network, locations, incidents, and scores are fictional and intended only for education.</p>
            </div>

            <aside class="operations-sidebar">
              <section class="intel-panel" aria-live="polite">
                <p class="eyebrow">Node intelligence</p>
                <span id="focus-type" class="intel-type">Network overview</span>
                <h3 id="focus-title">Select an infrastructure node</h3>
                <p id="focus-event">Hover over, approach, or select a node to preview the disruption located there.</p>
                <div id="focus-terms" class="focus-terms">
                  <b>Terms will be defined before the decision.</b>
                  <span>No prior supply-chain experience is required.</span>
                </div>
                <button id="investigate-focus-button" class="primary-button compact investigate-focus-button" type="button" disabled>Investigate selected node</button>
              </section>

              <details class="asset-panel operations-disclosure" aria-live="polite" open>
                <summary class="panel-title"><span>Live movements</span><i id="asset-status-dot" class="asset-status-dot"></i></summary>
                <div class="operations-disclosure-body">
                <span id="asset-mode" class="intel-type">Asset tracking</span>
                <h3 id="asset-name">Select a moving asset</h3>
                <p id="asset-status" class="asset-status">Ships, aircraft, trains, and trucks continue moving behind the network nodes.</p>
                <dl class="asset-details">
                  <div><dt>Route</dt><dd id="asset-route">Select an icon on the map.</dd></div>
                  <div><dt>Cargo</dt><dd id="asset-cargo">Movement details will appear here.</dd></div>
                </dl>
                <div id="asset-definition" class="focus-terms">
                  <b>Live logistics</b>
                  <span>Animated assets show how goods continue moving, hold, delay, or reroute during a disruption.</span>
                </div>
                <div class="asset-board-heading">
                  <span>Network movement board</span>
                  <small id="asset-status-summary">4 assets awaiting launch</small>
                </div>
                <div id="asset-status-board" class="asset-status-board">
                  <p class="asset-board-empty">Launch the scenario to connect the live movement board.</p>
                </div>
                </div>
              </details>

              <details id="weather-panel" class="weather-panel operations-disclosure" data-phase="idle" aria-live="polite" open>
                <summary class="panel-title"><span>Weather disruption</span><i class="weather-pulse"></i></summary>
                <div class="operations-disclosure-body">
                <span id="weather-severity" class="intel-type">Forecast monitoring</span>
                <h3 id="weather-title">High-wind system expected</h3>
                <p id="weather-summary">Launch the scenario to track the storm across the regional network.</p>
                <dl class="weather-details">
                  <div><dt>Wind</dt><dd id="weather-wind">Forecast pending</dd></div>
                  <div><dt>Area</dt><dd id="weather-area">Coastal and inland routes</dd></div>
                  <div><dt>Timing</dt><dd id="weather-timing">Awaiting launch</dd></div>
                </dl>
                </div>
              </details>

              <details class="incident-panel operations-disclosure" open>
                <summary class="panel-title"><span>Mission log</span><i class="disclosure-chevron" aria-hidden="true"></i></summary>
                <div class="operations-disclosure-body">
                <div class="panel-inline-actions"><span>Newest activity first</span><button id="clear-log" type="button">Clear</button></div>
                <div id="mission-log" class="mission-log" aria-live="polite">
                  <article class="log-item info"><time>READY</time><p>Launch the scenario to initialize the operating picture.</p></article>
                </div>
                </div>
              </details>
            </aside>
          </div>
        </section>

        <section id="learning" class="section learning-section">
          <div class="section-heading split-heading">
            <div>
              <p class="eyebrow">Learning model</p>
              <h2>Nothing important is left undefined.</h2>
            </div>
            <p>The simulator teaches the concept before testing the decision. Each scenario follows the same repeatable pattern.</p>
          </div>
          <div class="learning-steps">
            <article><span>01</span><h3>Define</h3><p>Every key term is explained in everyday language, followed by a concrete example.</p></article>
            <article><span>02</span><h3>Connect</h3><p>The scenario explains why the node matters and how the disruption reaches other systems.</p></article>
            <article><span>03</span><h3>Decide</h3><p>You compare realistic options and receive a plain-language reason for each option.</p></article>
            <article><span>04</span><h3>Review</h3><p>The after-action report records the decision, resilience impact, rationale, and lesson learned.</p></article>
          </div>
          <div class="learning-formula-card">
            <div><p class="eyebrow">Scoring explained</p><h3>Current resilience = starting resilience + recovery − penalties</h3></div>
            <p>In plain language: begin with the network condition, add what a strong response restores, and subtract the harm that remains. Once the full reasoning is comfortable, you can read it as <b>start + gains − losses</b>.</p>
          </div>
        </section>

        <section id="scenarios" class="section scenario-section">
          <div class="section-heading split-heading">
            <div><p class="eyebrow">Scenario library</p><h2>Connected physical and digital disruptions</h2></div>
            <p>Scenario content is stored in structured JSON, so new incidents can be added without rewriting the game engine.</p>
          </div>
          <div class="scenario-library">${renderScenarioLibrary()}</div>
        </section>

        <section id="history" class="section history-section">
          <div class="section-heading split-heading">
            <div><p class="eyebrow">Local run history</p><h2>Compare decisions across different missions.</h2></div>
            <button id="clear-history" class="secondary-button" type="button">Clear history</button>
          </div>
          <p class="history-intro">Completed runs are stored only in this browser. Seeds let you repeat the same disruption set and option order.</p>
          <div id="run-history" class="run-history"><p class="history-empty">Complete a mission to begin the comparison history.</p></div>
        </section>

        <section id="project" class="section project-section">
          <div class="section-heading split-heading">
            <div><p class="eyebrow">Portfolio architecture</p><h2>A maintainable application instead of one oversized file.</h2></div>
            <p>The entry point starts the app. Separate modules handle the interface, game engine, data, definitions, reports, and styling.</p>
          </div>
          <div class="architecture-grid">
            <article><span>Application</span><h3>Bootstrap and session control</h3><p>Starts the platform, wires events, and manages a clean restart without mixing game logic into the page markup.</p></article>
            <article><span>Game</span><h3>Phaser simulation engine</h3><p>Handles movement, network nodes, resource commitments, downstream consequences, mission timing, scoring, and completion conditions.</p></article>
            <article><span>Content</span><h3>Structured scenario data</h3><p>Defines incidents, terminology, response choices, resource costs, rationales, and learning takeaways in JSON.</p></article>
            <article><span>Interface</span><h3>Reusable UI controllers</h3><p>Manages the landing screen, glossary, quick reference, challenge workflow, HUD, and report.</p></article>
          </div>

          <div class="contributors-block">
            <p class="eyebrow">Project contributors</p>
            <div class="contributors-grid">
              <article><h3>James Daniels</h3><p>Prototype architecture, scenario integration, hazards, deployment, and release coordination.</p></article>
              <article><h3>Kristina-Marie Horton</h3><p>Game design, global trade relationships, resource logic, and win conditions.</p></article>
              <article><h3>A'zariah Turner</h3><p>Visual direction, maps, icons, and interface consistency.</p></article>
              <article><h3>Lauren Hession</h3><p>Ports, airports, rail, highways, chokepoints, dependencies, and alternate routes.</p></article>
              <article><h3>Rachel Farlinger</h3><p>Rules, learning text, scenario wording, and after-action prompts.</p></article>
              <article><h3>Justin Ngo</h3><p>U.S.-scale scenarios, state and regional injects, and domestic exercise content.</p></article>
            </div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <p>Resilience Routes is an educational simulation. It does not use live operational data or provide emergency guidance.</p>
      </footer>
    </div>

    ${renderMissionBriefing()}

    <aside id="guide-panel" class="drawer" aria-hidden="true" aria-labelledby="guide-title">
      <button id="close-guide" class="close-button" type="button" aria-label="Close quick reference">×</button>
      <p class="eyebrow">Quick reference</p>
      <h2 id="guide-title">How to play</h2>
      <ol class="guide-list">
        <li><b>Select a difficulty.</b><span>Easy includes hints. Medium and Hard add time pressure and stronger consequences.</span></li>
        <li><b>Launch the scenario.</b><span>The regional network appears in the exercise panel.</span></li>
        <li><b>Investigate a node.</b><span>Click it, tap it, or move nearby and press E.</span></li>
        <li><b>Read the definitions.</b><span>Open the term cards before comparing the response options.</span></li>
        <li><b>Check the resource cost.</b><span>Funds, crews, transportation, fuel, intelligence, and reserves are limited for the entire run.</span></li>
        <li><b>Choose a response.</b><span>The simulator explains why that option helps or increases risk and removes committed resources from the mission pool.</span></li>
        <li><b>Continue the mission.</b><span>Later options depend on what remains. Stabilize three nodes and review resource use in the final report.</span></li>
      </ol>
      <div class="drawer-callout"><b>Keyboard controls</b><span>Move: WASD or arrows · Investigate: E · Quick reference: M</span></div>
      <div class="drawer-callout"><b>Command shortcuts</b><span>Commands: Ctrl K · Pause: P · Map focus: F · Zoom: + / − / 0 · Close: Esc</span></div>
    </aside>

    <aside id="glossary-panel" class="drawer glossary-drawer" aria-hidden="true" aria-labelledby="glossary-title">
      <button id="close-glossary" class="close-button" type="button" aria-label="Close glossary">×</button>
      <p class="eyebrow">Plain-language reference</p>
      <h2 id="glossary-title">Supply-chain glossary</h2>
      <p class="drawer-intro">Each definition includes an example and the reason the term matters during a disruption.</p>
      <div class="glossary-list">${renderGlossaryEntries()}</div>
    </aside>

    <div id="command-palette" class="command-palette-backdrop hidden" role="presentation">
      <section class="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-palette-title">
        <div class="command-palette-heading">
          <div><p class="eyebrow">Adaptive command</p><h2 id="command-palette-title">Run a command</h2></div>
          <button id="close-command-palette" class="close-button" type="button" aria-label="Close command palette">×</button>
        </div>
        <label class="command-search-label" for="command-search">Search commands</label>
        <input id="command-search" class="command-search" autocomplete="off" placeholder="Type pause, map, layers, reference…">
        <div id="command-list" class="command-list" role="listbox" aria-label="Available commands">
          <button type="button" data-command="pause"><span>Pause or resume mission</span><kbd>P</kbd></button>
          <button type="button" data-command="focus"><span>Toggle tactical map focus</span><kbd>F</kbd></button>
          <button type="button" data-command="map"><span>Cycle operational map layer</span><kbd>L</kbd></button>
          <button type="button" data-command="labels"><span>Change node label density</span><kbd>N</kbd></button>
          <button type="button" data-command="zoom-in"><span>Zoom tactical map in</span><kbd>+</kbd></button>
          <button type="button" data-command="zoom-out"><span>Zoom tactical map out</span><kbd>−</kbd></button>
          <button type="button" data-command="zoom-reset"><span>Reset tactical map zoom</span><kbd>0</kbd></button>
          <button type="button" data-command="reference"><span>Open quick reference</span><kbd>M</kbd></button>
          <button type="button" data-command="glossary"><span>Open supply-chain glossary</span><kbd>G</kbd></button>
        </div>
        <p id="command-empty" class="command-empty hidden">No command matches that search.</p>
        <small class="command-palette-help">Use ↑ ↓ to move · Enter to run · Esc to close</small>
      </section>
    </div>

    <div id="modal-backdrop" class="modal-backdrop hidden" role="presentation">
      <section id="challenge-modal" class="modal challenge-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-heading">
          <div><p id="modal-node-type" class="eyebrow"></p><h2 id="modal-title"></h2></div>
          <span class="modal-step">Investigate → Define → Decide</span>
        </div>
        <p id="modal-event" class="event-callout"></p>
        <section id="modal-intelligence-panel" class="intelligence-panel" data-state="preliminary" aria-live="polite">
          <div class="intelligence-heading">
            <div><p class="eyebrow">Intelligence picture</p><h3>Decide whether to verify before acting</h3></div>
            <span id="intel-confidence" class="intel-confidence">Preliminary confidence</span>
          </div>
          <div class="intelligence-grid">
            <article><span>Confirmed</span><p id="intel-confirmed"></p></article>
            <article><span>Still uncertain</span><p id="intel-uncertainty"></p></article>
            <article id="intel-forecast-card" class="forecast-locked"><span>Consequence forecast</span><p id="intel-forecast">Spend 1 Intel to verify the signal and improve the forecast.</p></article>
          </div>
          <button id="verify-intelligence-button" class="secondary-button compact" type="button">Verify signal · 1 Intel</button>
          <small>Verification reduces uncertainty and the immediate disruption loss by 2 points, but the Intel cannot be used later.</small>
        </section>
        <div class="four-part-grid">
          <article><h3>Why this matters</h3><p id="modal-why"></p></article>
          <article><h3>How it spreads</h3><p id="modal-how"></p></article>
          <article><h3>When risk increases</h3><p id="modal-when"></p></article>
          <article><h3>Where effects appear</h3><p id="modal-where"></p></article>
        </div>
        <section class="cascade-section" aria-labelledby="cascade-title">
          <div class="term-heading">
            <div><p class="eyebrow">Cascading effect</p><h3 id="cascade-title">Follow the disruption from cause to consequence</h3></div>
            <small>A cascading effect is a problem that moves through connected systems.</small>
          </div>
          <div id="modal-cascade" class="cascade-chain"></div>
        </section>
        <section class="term-section">
          <div class="term-heading"><div><p class="eyebrow">Definitions</p><h3>Key terms used in this scenario</h3></div><small>Open each term before deciding.</small></div>
          <div id="modal-terms" class="term-grid"></div>
        </section>
        <section class="decision-section">
          <p class="eyebrow">Command decision</p>
          <h3 id="modal-question"></h3>
          <div id="modal-resource-context" class="modal-resource-context"></div>
          <div id="modal-options" class="option-list"></div>
          <div id="decision-feedback" class="decision-feedback hidden" role="status"></div>
        </section>
      </section>
    </div>

    <div id="report-backdrop" class="modal-backdrop hidden" role="presentation">
      <section class="modal report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <div class="modal-heading">
          <div><p class="eyebrow">After-action report</p><h2 id="report-title">Mission results</h2></div>
          <button id="print-report" class="secondary-button compact" type="button">Print / Save PDF</button>
        </div>
        <div id="report-summary" class="report-summary"></div>
        <div id="report-decisions" class="report-decisions"></div>
        <div class="report-actions">
          <button id="restart-button" class="primary-button" type="button">Run Another Mission</button>
          <button id="close-report" class="secondary-button" type="button">Review Platform</button>
        </div>
      </section>
    </div>
  `;
}
