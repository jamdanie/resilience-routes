import scenariosJson from "../data/scenarios.json";
import type { Scenario } from "../game/types";
import { glossaryTerms } from "./glossary";
import { renderMissionBriefing } from "./missionBriefing";

const scenarios = scenariosJson as Scenario[];

function renderScenarioLibrary(): string {
  return scenarios
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
          <a href="#project">Project</a>
        </nav>
        <div class="topbar-actions">
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
                <label for="difficulty">Exercise difficulty</label>
                <select id="difficulty">
                  <option value="easy">Easy — recommended option shown, no timer</option>
                  <option value="medium" selected>Medium — standard impacts, 4-minute timer</option>
                  <option value="hard">Hard — stronger cascades, 3-minute timer</option>
                </select>
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
            <article><span>Nodes stabilized</span><strong id="hud-completed">0 / 3</strong><small>Mission objective</small></article>
            <article><span>Time remaining</span><strong id="hud-timer">—</strong><small id="hud-timer-label">Launch to begin</small></article>
            <article><span>Difficulty</span><strong id="hud-difficulty">—</strong><small>Response conditions</small></article>
          </div>

          <div id="game-status" class="notice" role="status">
            Select a difficulty and launch the regional scenario.
          </div>

          <div class="exercise-grid">
            <div class="map-column">
              <div id="game-canvas" class="game-canvas" aria-label="Interactive supply-chain network"></div>
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
              </section>

              <section class="incident-panel">
                <div class="panel-title"><span>Mission log</span><button id="clear-log" type="button">Clear</button></div>
                <div id="mission-log" class="mission-log" aria-live="polite">
                  <article class="log-item info"><time>READY</time><p>Launch the scenario to initialize the operating picture.</p></article>
                </div>
              </section>
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
          <div class="scenario-grid">${renderScenarioLibrary()}</div>
        </section>

        <section id="project" class="section project-section">
          <div class="section-heading split-heading">
            <div><p class="eyebrow">Portfolio architecture</p><h2>A maintainable application instead of one oversized file.</h2></div>
            <p>The entry point starts the app. Separate modules handle the interface, game engine, data, definitions, reports, and styling.</p>
          </div>
          <div class="architecture-grid">
            <article><span>Application</span><h3>Bootstrap and session control</h3><p>Starts the platform, wires events, and manages a clean restart without mixing game logic into the page markup.</p></article>
            <article><span>Game</span><h3>Phaser simulation engine</h3><p>Handles movement, network nodes, mission timing, scoring, and completion conditions.</p></article>
            <article><span>Content</span><h3>Structured scenario data</h3><p>Defines incidents, terminology, response choices, rationales, and learning takeaways in JSON.</p></article>
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
        <li><b>Choose a response.</b><span>The simulator explains why that option helps or increases risk.</span></li>
        <li><b>Continue the mission.</b><span>Stabilize three nodes and review the final report.</span></li>
      </ol>
      <div class="drawer-callout"><b>Keyboard controls</b><span>Move: WASD or arrows · Investigate: E · Quick reference: M</span></div>
    </aside>

    <aside id="glossary-panel" class="drawer glossary-drawer" aria-hidden="true" aria-labelledby="glossary-title">
      <button id="close-glossary" class="close-button" type="button" aria-label="Close glossary">×</button>
      <p class="eyebrow">Plain-language reference</p>
      <h2 id="glossary-title">Supply-chain glossary</h2>
      <p class="drawer-intro">Each definition includes an example and the reason the term matters during a disruption.</p>
      <div class="glossary-list">${renderGlossaryEntries()}</div>
    </aside>

    <div id="modal-backdrop" class="modal-backdrop hidden" role="presentation">
      <section id="challenge-modal" class="modal challenge-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-heading">
          <div><p id="modal-node-type" class="eyebrow"></p><h2 id="modal-title"></h2></div>
          <span class="modal-step">Investigate → Define → Decide</span>
        </div>
        <p id="modal-event" class="event-callout"></p>
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
