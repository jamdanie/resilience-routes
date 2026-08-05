import { missionPacks } from "../data/missions";

function renderMissionOptions(): string {
  return missionPacks
    .map((mission) => `<option value="${mission.id}">${mission.name}</option>`)
    .join("");
}

export function renderLandingScreen(): string {
  const firstMission = missionPacks[0];
  return `
    <main id="landing-screen" class="landing-screen">
      <div class="landing-grid" aria-hidden="true"></div>

      <header class="landing-header">
        <div class="landing-brand">
          <span class="brand-mark">RR</span>
          <span>
            <strong>Resilience Routes</strong>
            <small>Supply Chain & Critical Infrastructure Simulator</small>
          </span>
        </div>
        <div class="readiness"><i></i><span>Training environment ready</span></div>
      </header>

      <section class="landing-content">
        <div class="landing-copy">
          <p class="eyebrow">Interactive resilience training platform</p>
          <h1>See how one disruption can move through an entire network.</h1>
          <p class="landing-summary">
            Investigate ports, rail corridors, airports, warehouses, and digital
            logistics systems. The guided briefing defines the language and explains the scoring model first. During the mission, every scenario shows the cause-and-effect chain and why one response is stronger than another.
          </p>
          <div class="landing-actions">
            <button id="start-exercise" class="primary-button large" type="button">Begin Mission Briefing</button>
            <button id="open-glossary-home" class="secondary-button large" type="button">Review Key Terms</button>
          </div>
          <label class="landing-mission-select" for="landing-mission">
            <span>Choose a regional mission</span>
            <select id="landing-mission">${renderMissionOptions()}</select>
          </label>
          <div class="landing-proof" aria-label="Platform features">
            <span><b>${missionPacks.length}</b> regional missions</span>
            <span><b>Random</b> disruption set</span>
            <span><b>3</b> difficulty levels</span>
          </div>
        </div>

        <aside class="landing-brief" aria-label="Mission preview">
          <div class="brief-heading">
            <span>Mission preview</span>
            <strong id="landing-preview-title">${firstMission.name}</strong>
          </div>
          <div class="brief-map" aria-hidden="true">
            <b class="node node-a"></b><b class="node node-b"></b><b class="node node-c"></b><b class="node node-d"></b>
          </div>
          <dl>
            <div><dt>Region</dt><dd id="landing-preview-region">${firstMission.region}</dd></div>
            <div><dt>Objective</dt><dd id="landing-preview-objective">Address ${firstMission.target} randomly selected disruptions</dd></div>
            <div><dt>Learning model</dt><dd>Brief → Define → Explain → Decide → Review</dd></div>
            <div><dt>Data source</dt><dd>Fictional educational scenarios</dd></div>
            <div><dt>Controls</dt><dd>Mouse, keyboard, or touch</dd></div>
          </dl>
        </aside>
      </section>

      <footer class="landing-footer">
        <span>Designed as a portfolio-ready educational simulation.</span>
        <span>No live operational, flight, maritime, or emergency data is used.</span>
      </footer>
    </main>
  `;
}
