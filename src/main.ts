import "./style.css";

type NodeId = "port" | "rail" | "warehouse" | "digital" | "airport";
type ResourceId = "funds" | "teams" | "intel";

type NodeState = {
  id: NodeId;
  name: string;
  label: string;
  icon: string;
  role: string;
  health: number;
  x: number;
  y: number;
  dependencies: NodeId[];
};

type Choice = {
  title: string;
  description: string;
  cost: Partial<Record<ResourceId, number>>;
  resilience: number;
  readiness: number;
  effects: Partial<Record<NodeId, number>>;
  lesson: string;
};

type Inject = {
  category: string;
  title: string;
  summary: string;
  signal: string;
  why: string;
  target: NodeId;
  damage: number;
  choices: Choice[];
};

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing #app");

const originalNodes: NodeState[] = [
  { id: "port", name: "Harbor Gateway", label: "PORT", icon: "⚓", role: "Maritime cargo transfer and customs processing", health: 88, x: 16, y: 29, dependencies: ["rail", "warehouse", "digital"] },
  { id: "rail", name: "Inland Rail Hub", label: "RAIL", icon: "▤", role: "High-volume inland movement and intermodal transfer", health: 86, x: 47, y: 19, dependencies: ["port", "warehouse", "digital"] },
  { id: "airport", name: "Regional Airfield", label: "AIR", icon: "✈", role: "Time-sensitive and emergency cargo movement", health: 91, x: 81, y: 29, dependencies: ["warehouse", "digital"] },
  { id: "digital", name: "Logistics Control", label: "DATA", icon: "⌁", role: "Scheduling, inventory visibility, and coordination", health: 89, x: 33, y: 73, dependencies: ["port", "rail", "airport", "warehouse"] },
  { id: "warehouse", name: "Distribution Campus", label: "DC", icon: "▣", role: "Inventory buffering, cold storage, and fulfillment", health: 84, x: 68, y: 72, dependencies: ["port", "rail", "airport", "digital"] }
];

const injects: Inject[] = [
  {
    category: "Cyber disruption",
    title: "Port scheduling systems are unavailable",
    summary: "A ransomware event has disabled gate appointments and container-location systems. The terminal is physically open, but truck queues and cargo uncertainty are growing.",
    signal: "Average gate processing time increased 240% in 45 minutes.",
    why: "Modern ports depend on digital coordination as much as cranes and roads. Information failure can stop cargo even when physical infrastructure remains intact.",
    target: "port", damage: 18,
    choices: [
      { title: "Activate offline continuity procedures", description: "Use paper manifests and pre-cleared carrier lists for priority cargo.", cost: { teams: 1, intel: 1 }, resilience: 9, readiness: 6, effects: { port: 15, warehouse: 3 }, lesson: "Rehearsed offline procedures preserve minimum throughput and reduce dependence on a single digital process." },
      { title: "Restore systems and publish controlled updates", description: "Deploy cyber teams while communicating verified operating status.", cost: { funds: 1, teams: 1 }, resilience: 7, readiness: 7, effects: { port: 11, digital: 7 }, lesson: "Technical recovery works better when operators and partners receive timely, trusted information." },
      { title: "Close all gates until recovery", description: "Stop processing to avoid data errors and wait for normal systems.", cost: {}, resilience: -8, readiness: -3, effects: { port: -8, rail: -5, warehouse: -6 }, lesson: "A full stop may reduce data errors but transfers disruption into queues, storage limits, and downstream shortages." }
    ]
  },
  {
    category: "Extreme weather",
    title: "Flooding closes the primary rail corridor",
    summary: "A river has overtopped a vulnerable track section. Intermodal containers cannot move inland through the normal corridor for at least 36 hours.",
    signal: "Rail operator estimates 36–60 hours before inspection clearance.",
    why: "Rail corridors concentrate large volumes into few routes. One closure can create port congestion and force expensive modal shifts.",
    target: "rail", damage: 22,
    choices: [
      { title: "Use the alternate southern corridor", description: "Reroute priority trains and accept additional transit time.", cost: { funds: 1, intel: 1 }, resilience: 10, readiness: 5, effects: { rail: 16, port: 4 }, lesson: "Redundancy has a normal-day cost but prevents catastrophic dependence on one route." },
      { title: "Shift critical loads to trucks", description: "Reserve road capacity for medical and high-impact industrial cargo.", cost: { funds: 2, teams: 1 }, resilience: 7, readiness: 4, effects: { rail: 9, warehouse: 7 }, lesson: "Modal substitution is strongest when scarce capacity is reserved for high-value or time-sensitive cargo." },
      { title: "Hold cargo at the port", description: "Wait for the rail line to reopen and avoid rerouting expense.", cost: {}, resilience: -7, readiness: -2, effects: { port: -10, warehouse: -5 }, lesson: "Waiting may reduce immediate expense, but storage limits turn delay into a cascading network problem." }
    ]
  },
  {
    category: "Inventory pressure",
    title: "Warehouse capacity is nearly exhausted",
    summary: "Inbound cargo is accumulating while outbound transportation remains uneven. Cold storage and labor availability are both constrained.",
    signal: "Cold-storage utilization is 96%; general storage is 91%.",
    why: "Warehouses are buffers, not unlimited storage. When capacity is exhausted, delays spread backward to transportation and forward to customers.",
    target: "warehouse", damage: 20,
    choices: [
      { title: "Create a priority allocation cell", description: "Rank cargo by life safety, perishability, and production impact.", cost: { teams: 1, intel: 1 }, resilience: 10, readiness: 8, effects: { warehouse: 17, airport: 3 }, lesson: "Transparent prioritization criteria help limited capacity support the greatest public and economic value." },
      { title: "Lease temporary overflow capacity", description: "Use commercial space and mobile cold-storage units.", cost: { funds: 2 }, resilience: 7, readiness: 4, effects: { warehouse: 14, port: 3 }, lesson: "Pre-negotiated private-sector agreements make temporary capacity faster and safer to activate." },
      { title: "Continue first-in, first-out", description: "Process cargo by arrival time without criticality screening.", cost: {}, resilience: -6, readiness: -2, effects: { warehouse: -8, airport: -4 }, lesson: "A neutral queue can produce poor outcomes when low-impact cargo consumes capacity needed by critical supplies." }
    ]
  },
  {
    category: "Information integrity",
    title: "Partners report conflicting inventory data",
    summary: "Three systems disagree on fuel, medical supplies, and replacement components. Leaders cannot confidently determine which shortages are real.",
    signal: "Critical inventory values differ by more than 18% across systems.",
    why: "Resilience depends on trustworthy shared information. Incorrect data can waste scarce transportation and response resources.",
    target: "digital", damage: 21,
    choices: [
      { title: "Build a verified common operating picture", description: "Reconcile priority items using named owners, timestamps, and confidence levels.", cost: { teams: 1, intel: 2 }, resilience: 11, readiness: 9, effects: { digital: 18, warehouse: 5, airport: 3 }, lesson: "A common operating picture should show source, timestamp, owner, and confidence—not only a single number." },
      { title: "Use the largest reported value", description: "Assume the most optimistic inventory dataset is correct.", cost: {}, resilience: -9, readiness: -5, effects: { digital: -9, warehouse: -5 }, lesson: "Optimistic assumptions hide shortages and delay corrective action. Provenance and confidence matter." },
      { title: "Pause until every number matches", description: "Require full agreement before allocating resources.", cost: { intel: 1 }, resilience: -2, readiness: 2, effects: { digital: 6, port: -4, airport: -3 }, lesson: "Perfect information is rarely available during disruption. Decision thresholds must account for uncertainty." }
    ]
  },
  {
    category: "Humanitarian priority",
    title: "Airport capacity is needed for urgent medicine",
    summary: "Road delays threaten delivery of time-sensitive medicine. The airport can support an air bridge, but ramp space, crews, and funding are limited.",
    signal: "Two hospitals reach minimum medical inventory in 14 hours.",
    why: "Air transport is expensive but valuable when delay has a high human cost. Resilience means matching transport mode to consequence.",
    target: "airport", damage: 19,
    choices: [
      { title: "Open a limited medical air bridge", description: "Reserve flights for medicines and critical repair components.", cost: { funds: 2, teams: 1 }, resilience: 12, readiness: 7, effects: { airport: 18, warehouse: 4 }, lesson: "Air bridges work best when tightly prioritized and integrated with ground distribution at both ends." },
      { title: "Use air capacity for all delayed cargo", description: "Attempt broad substitution for disrupted surface transport.", cost: { funds: 3, teams: 2 }, resilience: 2, readiness: 1, effects: { airport: 9 }, lesson: "Air capacity cannot economically replace high-volume surface networks. Broad use quickly consumes scarce resources." },
      { title: "Wait for roads to normalize", description: "Avoid air-transport costs and continue normal routing.", cost: {}, resilience: -10, readiness: -4, effects: { airport: -6, warehouse: -6 }, lesson: "Cost avoidance is not efficient when delay creates severe health, safety, or production consequences." }
    ]
  }
];

let nodes = structuredClone(originalNodes);
let resources = { funds: 6, teams: 5, intel: 5 };
let round = 0;
let resilience = 82;
let readiness = 52;
let score = 0;
let started = false;
let selected: number | null = null;
let history: Array<{ inject: Inject; choice: Choice; cascade: string }> = [];
let timerSeconds = 60;
let timerId: number | null = null;
let advisorUsed = false;
let fogRevealed = false;
let soundEnabled = true;
const SAVE_KEY = "resilience-routes-v3-save";
const achievements = new Set<string>();

app.innerHTML = `
<div class="shell">
  <header class="topbar">
    <div class="brand"><span>RR</span><div><b>Resilience Routes</b><small>Supply Chain Command Exercise</small></div></div>
    <div class="status"><i></i><div><b id="top-status">Briefing ready</b><small id="top-substatus">Regional continuity exercise</small></div></div>
    <div class="header-actions">
      <button id="resume" class="secondary hidden" type="button">Resume saved mission</button>
      <button id="settings" class="secondary" type="button">Settings</button>
      <button id="reset" class="primary" type="button">New mission</button>
    </div>
  </header>
  <aside class="rail">
    <button class="nav active" data-view="mission" type="button"><span>◈</span><b>Mission</b></button>
    <button class="nav" data-view="network" type="button"><span>⌘</span><b>Network</b></button>
    <button class="nav" data-view="guide" type="button"><span>≡</span><b>Guide</b></button>
    <button class="nav" data-view="resources" type="button"><span>↗</span><b>Learn</b></button>
    <button class="nav" data-view="team" type="button"><span>◎</span><b>Team</b></button>
    <button class="nav" data-view="aar" type="button"><span>✓</span><b>Review</b></button>
  </aside>
  <main>
    <section class="view active" data-panel="mission">
      <div class="hud">
        <article><span>Network resilience</span><strong id="resilience">82</strong><div class="bar"><i id="resilience-bar"></i></div></article>
        <article><span>Preparedness</span><strong id="readiness">52</strong><div class="bar"><i id="readiness-bar"></i></div></article>
        <article><span>Decision cycle</span><strong id="round">0 / 5</strong><small id="round-note">Awaiting launch</small></article>
        <article><span>Resources</span><div class="resources"><b id="funds">6</b><small>Funds</small><b id="teams">5</b><small>Teams</small><b id="intel">5</b><small>Intel</small></div></article>
      </div>
      <div class="mission-grid">
        <section class="map-card">
          <div class="section-head"><div><span class="eyebrow">Live operating picture</span><h1>Regional supply network</h1></div><div class="legend"><span><i class="ok"></i>Stable</span><span><i class="warn"></i>Strained</span><span><i class="bad"></i>Critical</span></div></div>
          <div id="map" class="map"></div>
          <div class="map-foot"><span id="map-message">Start the mission to receive the first disruption inject.</span><button id="analyze" type="button">Analyze dependencies →</button></div>
        </section>
        <aside class="decision-card">
          <div id="welcome" class="center-state">
            <span class="mission-icon">◈</span><span class="eyebrow">Command briefing</span><h2>Can you keep essential goods moving?</h2>
            <p>Respond to five connected disruptions. Every choice changes node health, consumes resources, and can cause cascading effects.</p>
            <div class="brief"><div><b>5</b><span>Injects</span></div><div><b>3</b><span>Resources</span></div><div><b>1</b><span>Network</span></div></div>
            <button id="start" class="primary wide" type="button">Begin command exercise</button>
          </div>
          <div id="inject" class="inject hidden">
            <div class="inject-top"><span id="category" class="eyebrow"></span><div class="inject-meta"><span id="timer" class="timer-pill">01:00</span><span id="inject-count" class="pill"></span></div></div>
            <h2 id="title"></h2><p id="summary" class="summary"></p>
            <div id="fog-panel" class="fog-panel">
              <div><span>INFORMATION STATUS</span><b>Operational picture incomplete</b></div>
              <button id="reveal-intel" class="secondary compact" type="button">Spend 1 intel to verify</button>
            </div>
            <div id="signal-panel" class="signal hidden"><span>VERIFIED SIGNAL</span><b id="signal"></b></div>
            <div class="advisor-panel">
              <div><span class="eyebrow">Advisor perspectives</span><small>One advisor consultation per inject. Costs 1 intel.</small></div>
              <div class="advisor-buttons">
                <button type="button" data-advisor="logistics">Logistics</button>
                <button type="button" data-advisor="cyber">Cyber</button>
                <button type="button" data-advisor="public">Public safety</button>
              </div>
              <p id="advisor-output">Consult an advisor for a perspective—not a guaranteed answer.</p>
            </div>
            <button id="why-button" class="why-button" type="button" aria-expanded="false">Why this matters <span>＋</span></button><p id="why" class="why hidden"></p>
            <div id="choices" class="choices"></div>
            <div class="decision-foot"><p id="help">Select a response to review its cost and effect.</p><button id="commit" class="primary wide" type="button" disabled>Commit decision</button></div>
          </div>
          <div id="result" class="result hidden"><span id="result-tag" class="pill"></span><h2 id="result-title"></h2><p id="lesson"></p><div id="effects" class="effects"></div><div class="cascade"><span>CASCADING EFFECT</span><p id="cascade"></p></div><button id="continue" class="primary wide" type="button">Continue</button></div>
        </aside>
      </div>
      <section class="timeline-card"><div class="section-head compact"><div><span class="eyebrow">Exercise progression</span><h2>Decision timeline</h2></div><span id="score" class="pill">Score 0</span></div><div id="timeline" class="timeline"></div></section>
    </section>
    <section class="view" data-panel="network"><div class="page-head"><div><span class="eyebrow">Dependency analysis</span><h1>How disruption moves through the network</h1></div><p>Select a node to inspect its condition and dependencies.</p></div><div class="analysis"><div id="analysis-map" class="map analysis-map"></div><aside id="inspector" class="inspector"></aside></div></section>
    <section class="view" data-panel="guide">
      <div class="page-head"><div><span class="eyebrow">Exercise guide</span><h1>Mission and learning intent</h1></div><p>Built for students, emergency managers, cybersecurity professionals, and supply-chain teams.</p></div>
      <article class="hero"><span class="eyebrow">Mission objective</span><h2>Maintain movement of essential goods while the network absorbs multiple shocks.</h2><p>Strong decisions balance continuity, life safety, cost, trusted information, redundancy, public-private coordination, and future readiness.</p></article>
      <div class="guide-grid"><article><b>01</b><h3>Read the signal</h3><p>Separate verified operational facts from assumptions and rumors.</p></article><article><b>02</b><h3>Check dependencies</h3><p>Trace which infrastructure nodes, communities, and industries will be affected next.</p></article><article><b>03</b><h3>Spend deliberately</h3><p>Funds, response teams, and intelligence are limited. Every allocation creates an opportunity cost.</p></article><article><b>04</b><h3>Build readiness</h3><p>Choose actions that improve procedures, partnerships, redundancy, and the next response.</p></article></div>
      <article class="learning-panel"><span class="eyebrow">Facilitated team play</span><h2>Assign roles before committing a decision</h2><div class="role-pills"><span>Incident commander</span><span>Logistics lead</span><span>Cyber lead</span><span>Public-safety lead</span><span>Finance lead</span><span>Intelligence lead</span></div><p>Each role should recommend an action and explain its tradeoff. The group must agree—or the incident commander must decide—before the response is committed.</p></article>
    </section>

    <section class="view" data-panel="resources">
      <div class="page-head"><div><span class="eyebrow">Learning library</span><h1>Official resources and further study</h1></div><p>Use these public resources to connect the simulation to real planning, data, cybersecurity, transportation, and continuity practices.</p></div>
      <div class="resource-library">
        <article><span class="resource-agency">FEMA</span><h2>National Risk Index</h2><p>Explore community-level natural-hazard risk, expected annual loss, social vulnerability, and resilience.</p><a href="https://hazards.fema.gov/nri/" target="_blank" rel="noreferrer">Open FEMA National Risk Index ↗</a></article>
        <article><span class="resource-agency">FEMA</span><h2>Resilience Analysis and Planning Tool</h2><p>Use a public GIS tool to visualize population, infrastructure, and resilience considerations for planning.</p><a href="https://rapt-fema.hub.arcgis.com/" target="_blank" rel="noreferrer">Open FEMA RAPT ↗</a></article>
        <article><span class="resource-agency">Ready.gov</span><h2>Business emergency planning</h2><p>Review continuity, crisis communications, emergency response, and IT disaster-recovery guidance.</p><a href="https://www.ready.gov/business/emergency-plans" target="_blank" rel="noreferrer">Open Ready.gov planning guidance ↗</a></article>
        <article><span class="resource-agency">U.S. DOT</span><h2>National Freight Strategic Plan</h2><p>Learn how national freight policy addresses safety, efficiency, resilience, security, innovation, and workforce needs.</p><a href="https://www.transportation.gov/freight/NFSP" target="_blank" rel="noreferrer">Open the National Freight Strategic Plan ↗</a></article>
        <article><span class="resource-agency">U.S. DOT</span><h2>Freight and logistics supply-chain assessment</h2><p>Review transportation vulnerabilities, stakeholder findings, and policy responses intended to strengthen freight resilience.</p><a href="https://www.transportation.gov/supplychains" target="_blank" rel="noreferrer">Open the supply-chain assessment ↗</a></article>
        <article><span class="resource-agency">U.S. DOT</span><h2>National Transportation Recovery Strategy</h2><p>Study roles and recommendations for restoring transportation networks following a major disaster.</p><a href="https://www.transportation.gov/disaster-recovery" target="_blank" rel="noreferrer">Open transportation recovery resources ↗</a></article>
        <article><span class="resource-agency">CISA</span><h2>Cybersecurity and infrastructure security</h2><p>Explore guidance for critical infrastructure, cyber resilience, incident response, and supply-chain risk management.</p><a href="https://www.cisa.gov/topics/critical-infrastructure-security-and-resilience" target="_blank" rel="noreferrer">Open CISA infrastructure resources ↗</a></article>
        <article><span class="resource-agency">NIST</span><h2>Cybersecurity Framework</h2><p>Connect cyber decisions to governance, identification, protection, detection, response, and recovery outcomes.</p><a href="https://www.nist.gov/cyberframework" target="_blank" rel="noreferrer">Open the NIST Cybersecurity Framework ↗</a></article>
      </div>
      <div class="resource-note"><strong>Educational-use notice:</strong> Resilience Routes is a learning simulation, not an operational decision-support system. External resources remain under their issuing agencies and should be checked for current guidance before professional use.</div>
    </section>

    <section class="view" data-panel="team">
      <div class="page-head"><div><span class="eyebrow">Project contributors</span><h1>One shared product, distinct areas of expertise</h1></div><p>Contributor descriptions document the project structure and should be updated as work is submitted, reviewed, and merged.</p></div>
      <div class="team-grid">
        <article><span>Prototype, integration, and hazards</span><h2>James Daniels</h2><p>Repository setup, browser prototype, deployment, game integration, hazard mechanics, documentation structure, and release coordination.</p><em>Current status: implemented foundation and game-ready releases.</em></article>
        <article><span>Game design and global trade</span><h2>Kristina-Marie Horton</h2><p>Core game loop, rules, win and loss conditions, resource categories, trade relationships, and alignment with the tabletop concept.</p><em>Credit specific accepted work in pull requests and the changelog.</em></article>
        <article><span>Visual design</span><h2>A'zariah Turner</h2><p>Original visual direction, map style, icons, layout, accessible presentation, and consistent visual identity.</p><em>Replace placeholder symbols with approved original or licensed assets.</em></article>
        <article><span>Infrastructure research</span><h2>Lauren Hession</h2><p>Ports, rail, aviation, roads, warehousing, chokepoints, dependencies, alternate routes, and infrastructure consequences.</p><em>Document reviewed node research in scenario issues.</em></article>
        <article><span>Content and writing</span><h2>Rachel Farlinger</h2><p>Opening instructions, scenario language, why/how/when/where explanations, card wording, rules, and after-action questions.</p><em>Review all player-facing text for clarity and consistent terminology.</em></article>
        <article><span>U.S. scale and domestic injects</span><h2>Justin Ngo</h2><p>State and regional scenarios, domestic inject cards, exercise audiences, learning objectives, and evaluation measures.</p><em>Initial role interest documented; scope should be confirmed by the team.</em></article>
        <article><span>Program concept and direction</span><h2>Sunny Wescott</h2><p>Originating concept, intended audience, project framing, tabletop and digital relationship, and emergency-management toolkit direction.</p><em>Final product decisions remain subject to team and program approval.</em></article>
        <article><span>Mentorship and operational context</span><h2>John P. Farrell</h2><p>Mentor perspective, operational resilience context, emergency-management relevance, and professional feedback.</p><em>Credit guidance without implying agency endorsement.</em></article>
      </div>
      <article class="credit-policy"><span class="eyebrow">Contribution policy</span><h2>Credit work that is actually delivered</h2><p>Role assignments are not the same as authorship. Every merged contribution should identify the contributor, files or content supplied, reviewer, date, and related issue or pull request. Government agencies linked in this project do not sponsor or endorse the simulation.</p><a href="https://github.com/jamdanie/resilience-routes" target="_blank" rel="noreferrer">View repository and contribution history ↗</a></article>
    </section>
    <section class="view" data-panel="aar">
      <div class="page-head">
        <div><span class="eyebrow">After-action review</span><h1>Performance and decision record</h1></div>
        <div class="aar-actions"><button id="print-aar" class="secondary" type="button">Print / Save PDF</button><button id="export-aar" class="secondary" type="button">Export JSON</button></div>
      </div>
      <div id="aar"></div>
    </section>
  </main>
  <div id="toast" class="toast"></div>
  <div id="settings-modal" class="modal-backdrop hidden">
    <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="modal-head"><div><span class="eyebrow">Simulation settings</span><h2 id="settings-title">Mission configuration</h2></div><button id="close-settings" class="icon-button" type="button" aria-label="Close settings">×</button></div>
      <label>Decision time
        <select id="timer-setting">
          <option value="45">45 seconds</option>
          <option value="60" selected>60 seconds</option>
          <option value="90">90 seconds</option>
          <option value="0">Untimed</option>
        </select>
      </label>
      <label class="check-row"><input id="sound-setting" type="checkbox" checked> Enable interface sound cues</label>
      <label class="check-row"><input id="motion-setting" type="checkbox" checked> Enable animation and motion</label>
      <p>Settings apply to the next inject. This version stores mission progress only in this browser.</p>
      <button id="save-settings" class="primary wide" type="button">Save settings</button>
    </section>
  </div>
</div>`;

const $ = <T extends HTMLElement>(selector: string): T => {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing ${selector}`);
  return node;
};
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const level = (health: number) => health < 45 ? "critical" : health < 70 ? "warning" : "stable";
const node = (id: NodeId) => nodes.find(n => n.id === id)!;
const affordable = (c: Choice["cost"]) => (c.funds ?? 0) <= resources.funds && (c.teams ?? 0) <= resources.teams && (c.intel ?? 0) <= resources.intel;
const costText = (c: Choice["cost"]) => {
  const parts = [c.funds && `${c.funds} funds`, c.teams && `${c.teams} teams`, c.intel && `${c.intel} intel`].filter(Boolean);
  return parts.length ? parts.join(" · ") : "No immediate resource cost";
};


type SavedState = {
  nodes: NodeState[];
  resources: typeof resources;
  round: number;
  resilience: number;
  readiness: number;
  score: number;
  started: boolean;
  history: Array<{ injectIndex: number; choiceIndex: number; cascade: string }>;
  timerSeconds: number;
  achievements: string[];
};

function playTone(frequency = 520, duration = 0.06) {
  if (!soundEnabled) return;
  try {
    const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.025;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.stop(context.currentTime + duration);
  } catch {
    // Audio is optional.
  }
}

function saveGame() {
  const saved: SavedState = {
    nodes,
    resources,
    round,
    resilience,
    readiness,
    score,
    started,
    history: history.map(record => ({
      injectIndex: injects.indexOf(record.inject),
      choiceIndex: record.inject.choices.indexOf(record.choice),
      cascade: record.cascade
    })),
    timerSeconds,
    achievements: [...achievements]
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
  const resume = document.querySelector<HTMLButtonElement>("#resume");
  if (resume) resume.classList.toggle("hidden", !started && history.length === 0);
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const saved = JSON.parse(raw) as SavedState;
    nodes = saved.nodes;
    resources = saved.resources;
    round = saved.round;
    resilience = saved.resilience;
    readiness = saved.readiness;
    score = saved.score;
    started = saved.started;
    timerSeconds = saved.timerSeconds ?? 60;
    achievements.clear();
    (saved.achievements ?? []).forEach(item => achievements.add(item));
    history = saved.history.map(record => ({
      inject: injects[record.injectIndex],
      choice: injects[record.injectIndex].choices[record.choiceIndex],
      cascade: record.cascade
    }));
    update();
    if (started && round < injects.length) showInject(false);
    else if (history.length) finish();
    toast("Saved mission restored");
    return true;
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return false;
  }
}

function formatTimer(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function stopTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  stopTimer();
  const configured = Number((document.querySelector<HTMLSelectElement>("#timer-setting")?.value ?? "60"));
  timerSeconds = configured;
  const timer = document.querySelector<HTMLElement>("#timer");
  if (!timer) return;
  timer.textContent = configured === 0 ? "UNTIMED" : formatTimer(timerSeconds);
  timer.classList.remove("urgent");
  if (configured === 0) return;
  timerId = window.setInterval(() => {
    timerSeconds -= 1;
    timer.textContent = formatTimer(timerSeconds);
    timer.classList.toggle("urgent", timerSeconds <= 15);
    if (timerSeconds <= 0) {
      stopTimer();
      resilience = clamp(resilience - 5);
      readiness = clamp(readiness - 3);
      achievements.add("Under Pressure");
      toast("Decision time expired: resilience reduced");
      if (selected === null) choose(0);
      commit();
    }
  }, 1000);
}

function revealIntel() {
  if (fogRevealed) return;
  if (resources.intel < 1) {
    toast("No intelligence points available");
    return;
  }
  resources.intel -= 1;
  fogRevealed = true;
  $("#fog-panel").classList.add("hidden");
  $("#signal-panel").classList.remove("hidden");
  $("#why").classList.remove("hidden");
  achievements.add("Verified Picture");
  playTone(680);
  update();
  saveGame();
}

function advisorText(kind: string, inject: Inject) {
  const best = inject.choices.slice().sort((a, b) => b.resilience - a.resilience)[0];
  if (kind === "logistics") return `Logistics advisor: protect throughput and prioritize scarce capacity. “${best.title}” appears strongest for continuity, but check its resource cost.`;
  if (kind === "cyber") return inject.category.includes("Cyber") || inject.category.includes("Information")
    ? `Cyber advisor: establish trusted data, contain the incident, and preserve a minimum manual operating capability.`
    : `Cyber advisor: verify whether digital dependencies or communications could amplify this physical disruption.`;
  return `Public-safety advisor: prioritize life safety, medicine, food, fuel, and consequences of delay before optimizing cost.`;
}

function consultAdvisor(kind: string) {
  if (advisorUsed) {
    toast("Only one advisor consultation is available for this inject");
    return;
  }
  if (resources.intel < 1) {
    toast("No intelligence points available");
    return;
  }
  resources.intel -= 1;
  advisorUsed = true;
  $("#advisor-output").textContent = advisorText(kind, injects[round]);
  document.querySelectorAll<HTMLButtonElement>("[data-advisor]").forEach(button => button.disabled = true);
  achievements.add("Collaborative Command");
  playTone(600);
  update();
  saveGame();
}

function calculateAchievements() {
  if (history.length === injects.length) achievements.add("Mission Complete");
  if (history.every(item => item.choice.resilience >= 0) && history.length === injects.length) achievements.add("No Preventable Cascades");
  if (resources.funds >= 2 && history.length === injects.length) achievements.add("Budget Discipline");
  if (readiness >= 70) achievements.add("Future Ready");
  if (resilience >= 80 && history.length === injects.length) achievements.add("Network Guardian");
  if (nodes.every(item => item.health >= 60) && history.length === injects.length) achievements.add("Balanced Recovery");
}

function exportAar() {
  calculateAchievements();
  const report = {
    generatedAt: new Date().toISOString(),
    score,
    resilience,
    readiness,
    resources,
    nodeHealth: nodes.map(({ id, name, health }) => ({ id, name, health })),
    achievements: [...achievements],
    decisions: history.map((item, index) => ({
      round: index + 1,
      category: item.inject.category,
      incident: item.inject.title,
      response: item.choice.title,
      lesson: item.choice.lesson,
      cascade: item.cascade
    }))
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "resilience-routes-after-action-report.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function renderMap(selector = "#map", inspect = false) {
  const target = $<HTMLDivElement>(selector);
  const pairs: [NodeId, NodeId][] = [["port","rail"],["port","digital"],["port","warehouse"],["rail","warehouse"],["rail","digital"],["airport","warehouse"],["airport","digital"],["warehouse","digital"]];
  target.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${pairs.map(([a,b]) => `<line x1="${node(a).x}" y1="${node(a).y}" x2="${node(b).x}" y2="${node(b).y}" class="${level(Math.min(node(a).health,node(b).health))}"/>`).join("")}</svg>${nodes.map(n => `<button class="map-node ${level(n.health)}" style="left:${n.x}%;top:${n.y}%" data-node="${n.id}" type="button"><span>${n.icon}</span><div><small>${n.label}</small><b>${n.name}</b></div><strong>${n.health}</strong></button>`).join("")}`;
  target.querySelectorAll<HTMLButtonElement>(".map-node").forEach(button => button.addEventListener("click", () => inspect ? renderInspector(button.dataset.node as NodeId) : toast(`${node(button.dataset.node as NodeId).name}: ${node(button.dataset.node as NodeId).health}% health`)));
}

function renderInspector(id: NodeId = "port") {
  const n = node(id);
  const affected = nodes.filter(x => x.dependencies.includes(id));
  $("#inspector").innerHTML = `<div class="inspect-head"><span>${n.icon}</span><div><small>${n.label} NODE</small><h2>${n.name}</h2></div></div><div class="inspect-health"><span>Operational health</span><b>${n.health}%</b><div class="bar"><i style="width:${n.health}%"></i></div></div><section><small>Primary role</small><p>${n.role}</p></section><section><small>Direct dependencies</small><div class="pills">${n.dependencies.map(x => `<button data-inspect="${x}" type="button">${node(x).label}</button>`).join("")}</div></section><section><small>Failure affects</small><div class="pills">${affected.map(x => `<button data-inspect="${x.id}" type="button">${x.label}</button>`).join("") || "None listed"}</div></section><div class="risk ${level(n.health)}"><b>${n.health < 45 ? "Immediate intervention required" : n.health < 70 ? "Capacity is constrained" : "Operating within acceptable range"}</b><p>Dependencies show how a local disruption can become a network-wide problem.</p></div>`;
  document.querySelectorAll<HTMLButtonElement>("[data-inspect]").forEach(b => b.addEventListener("click", () => renderInspector(b.dataset.inspect as NodeId)));
  document.querySelectorAll("#analysis-map .map-node").forEach(b => b.classList.toggle("selected", (b as HTMLElement).dataset.node === id));
}

function renderTimeline() {
  $("#timeline").innerHTML = injects.map((x,i) => `<div class="step ${history[i] ? "done" : started && i === round ? "active" : ""}"><span>${history[i] ? "✓" : i+1}</span><div><small>${x.category}</small><b>${history[i] ? history[i].choice.title : x.title}</b></div></div>`).join("");
}

function update() {
  $("#resilience").textContent = String(resilience); $("#readiness").textContent = String(readiness);
  $<HTMLElement>("#resilience-bar").style.width = `${resilience}%`; $<HTMLElement>("#readiness-bar").style.width = `${readiness}%`;
  $("#round").textContent = `${started ? Math.min(round+1,5) : history.length} / 5`; $("#round-note").textContent = started ? `Inject ${round+1} active` : history.length === 5 ? "Exercise complete" : "Awaiting launch";
  $("#funds").textContent = String(resources.funds); $("#teams").textContent = String(resources.teams); $("#intel").textContent = String(resources.intel); $("#score").textContent = `Score ${score}`;
  renderMap(); renderTimeline(); renderAar();
}

function showInject(applyDamage = true) {
  const x = injects[round]; selected = null; advisorUsed = false; fogRevealed = false;
  if (applyDamage) {
    node(x.target).health = clamp(node(x.target).health - x.damage);
    node(x.target).dependencies.slice(0,2).forEach(id => node(id).health = clamp(node(id).health - 3));
    resilience = clamp(resilience - 4);
  }
  $("#welcome").classList.add("hidden"); $("#result").classList.add("hidden"); $("#inject").classList.remove("hidden");
  $("#category").textContent = x.category; $("#inject-count").textContent = `Inject ${round+1} of 5`; $("#title").textContent = x.title; $("#summary").textContent = x.summary; $("#signal").textContent = x.signal; $("#why").textContent = x.why; $("#why").classList.add("hidden");
  $("#fog-panel").classList.remove("hidden"); $("#signal-panel").classList.add("hidden"); $("#advisor-output").textContent = "Consult an advisor for a perspective—not a guaranteed answer.";
  document.querySelectorAll<HTMLButtonElement>("[data-advisor]").forEach(button => button.disabled = false);
  $("#choices").innerHTML = x.choices.map((c,i) => `<button class="choice ${affordable(c.cost) ? "" : "disabled"}" data-choice="${i}" type="button" ${affordable(c.cost) ? "" : "disabled"}><i></i><div><b>${c.title}</b><small>${c.description}</small><em>${costText(c.cost)}</em></div><span>›</span></button>`).join("");
  document.querySelectorAll<HTMLButtonElement>(".choice").forEach(b => b.addEventListener("click", () => choose(Number(b.dataset.choice))));
  $<HTMLButtonElement>("#commit").disabled = true; $("#help").textContent = "Select a response to review its cost and effect."; $("#map-message").textContent = `${node(x.target).name} is under pressure. Review the inject and choose a response.`; $("#top-status").textContent = `Inject ${round+1}: ${x.category}`; $("#top-substatus").textContent = x.title; update(); startTimer(); saveGame();
}

function choose(index: number) {
  selected = index; document.querySelectorAll(".choice").forEach((b,i) => b.classList.toggle("selected", i === index));
  const c = injects[round].choices[index]; $<HTMLButtonElement>("#commit").disabled = false; $("#help").innerHTML = `<b>Expected effect ${c.resilience >= 0 ? "+" : ""}${c.resilience}</b> · ${costText(c.cost)}`;
}

function commit() {
  if (selected === null) return; stopTimer(); const x = injects[round]; const c = x.choices[selected]; if (!affordable(c.cost)) return;
  resources.funds -= c.cost.funds ?? 0; resources.teams -= c.cost.teams ?? 0; resources.intel -= c.cost.intel ?? 0;
  Object.entries(c.effects).forEach(([id,value]) => node(id as NodeId).health = clamp(node(id as NodeId).health + Number(value)));
  resilience = clamp(resilience + c.resilience); readiness = clamp(readiness + c.readiness); score += Math.max(0, c.resilience*8 + c.readiness*5);
  const weakest = node(x.target).dependencies.map(node).sort((a,b) => a.health-b.health)[0];
  const cascade = c.resilience >= 7 ? `${node(x.target).name} stabilizes before severe effects reach ${weakest.name}.` : c.resilience >= 0 ? `${node(x.target).name} partially recovers, but ${weakest.name} remains exposed.` : `Pressure spreads from ${node(x.target).name} to ${weakest.name}.`;
  if (c.resilience < 0) { weakest.health = clamp(weakest.health - 7); resilience = clamp(resilience - 3); }
  history.push({ inject:x, choice:c, cascade }); calculateAchievements(); $("#inject").classList.add("hidden"); $("#result").classList.remove("hidden"); $("#result-tag").textContent = c.resilience >= 7 ? "Strong decision" : c.resilience >= 0 ? "Partial stabilization" : "Cascade increased"; $("#result-title").textContent = c.title; $("#lesson").textContent = c.lesson; $("#effects").innerHTML = `<div><span>Resilience</span><b class="${c.resilience>=0?"positive":"negative"}">${c.resilience>=0?"+":""}${c.resilience}</b></div><div><span>Preparedness</span><b class="${c.readiness>=0?"positive":"negative"}">${c.readiness>=0?"+":""}${c.readiness}</b></div><div><span>Target health</span><b>${node(x.target).health}%</b></div>`; $("#cascade").textContent = cascade; $("#map-message").textContent = cascade; update(); saveGame(); playTone(c.resilience >= 0 ? 720 : 260);
}

function next() { round++; if (round >= injects.length || resilience <= 0) finish(); else showInject(); }
function finish() {
  stopTimer(); calculateAchievements(); started = false; $("#result").classList.add("hidden"); $("#inject").classList.add("hidden"); $("#welcome").classList.remove("hidden"); const avg = Math.round(nodes.reduce((a,n)=>a+n.health,0)/nodes.length); $("#welcome").innerHTML = `<span class="mission-icon complete">✓</span><span class="eyebrow">Exercise complete</span><h2>${resilience>=80&&readiness>=65?"Command ready":resilience>=60?"Network sustained":"Recovery required"}</h2><p>You finished with ${resilience}% resilience, ${readiness}% preparedness, and ${avg}% average node health.</p><div class="brief"><div><b>${score}</b><span>Score</span></div><div><b>${history.length}</b><span>Decisions</span></div><div><b>${avg}%</b><span>Node health</span></div></div><button id="view-review" class="primary wide" type="button">Open after-action review</button>`; $("#view-review").addEventListener("click", () => switchView("aar")); $("#top-status").textContent = "Exercise complete"; $("#top-substatus").textContent = "After-action review ready"; update(); saveGame();
}

function renderAar() {
  if (!history.length) { $("#aar").innerHTML = `<div class="empty-review"><span>✓</span><h2>No decisions recorded yet</h2><p>Begin the exercise and your choices will appear here.</p></div>`; return; }
  const avg = Math.round(nodes.reduce((a,n)=>a+n.health,0)/nodes.length); const strong = history.filter(h=>h.choice.resilience>=7).length;
  $("#aar").innerHTML = `<div class="aar-metrics"><article><span>Final resilience</span><b>${resilience}%</b></article><article><span>Preparedness</span><b>${readiness}%</b></article><article><span>Average node health</span><b>${avg}%</b></article><article><span>Strong decisions</span><b>${strong} / ${history.length}</b></article></div><div class="aar-grid"><section class="records"><span class="eyebrow">Decision record</span><h2>What happened</h2>${history.map((h,i)=>`<article><span>${i+1}</span><div><small>${h.inject.category}</small><h3>${h.choice.title}</h3><p>${h.choice.lesson}</p><em>${h.cascade}</em></div><b class="${h.choice.resilience>=0?"positive":"negative"}">${h.choice.resilience>=0?"+":""}${h.choice.resilience}</b></article>`).join("")}</section><aside class="assessment"><span class="eyebrow">Command assessment</span><h2>${strong>=3?"Effective continuity leadership":"Continuity gaps remain"}</h2><p>${strong>=3?"You used prioritization, redundancy, and trusted information to contain cascading risk.":"Several choices protected immediate resources but allowed disruption to move into dependent nodes."}</p><div><b>Keep</b><span>Explicit prioritization and alternate routing</span></div><div><b>Improve</b><span>Earlier investment in shared information and readiness</span></div><div><b>Discuss</b><span>Which costs are acceptable when life safety is at risk?</span></div><section class="achievement-box"><span class="eyebrow">Achievements</span><div class="achievement-list">${[...achievements].map(item => `<span>◆ ${item}</span>`).join("") || "<span>Complete the exercise to unlock achievements.</span>"}</div></section></aside></div>`;
}

function switchView(view: string) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", (v as HTMLElement).dataset.panel === view)); document.querySelectorAll(".nav").forEach(v => v.classList.toggle("active", (v as HTMLElement).dataset.view === view)); if (view === "network") { renderMap("#analysis-map", true); renderInspector(); } if (view === "aar") renderAar();
}
function toast(text: string) { const t = $("#toast"); t.textContent = text; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),1800); }
function reset() {
  stopTimer();
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

document.querySelectorAll<HTMLButtonElement>(".nav").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view!)));
$("#start").addEventListener("click",()=>{ started=true; showInject(); });
$("#commit").addEventListener("click",commit);
$("#continue").addEventListener("click",next);
$("#reset").addEventListener("click",reset);
$("#resume").addEventListener("click",loadGame);
$("#analyze").addEventListener("click",()=>switchView("network"));
$("#reveal-intel").addEventListener("click", revealIntel);
document.querySelectorAll<HTMLButtonElement>("[data-advisor]").forEach(button => button.addEventListener("click", () => consultAdvisor(button.dataset.advisor!)));
$("#why-button").addEventListener("click",()=>{ const w=$("#why"); w.classList.toggle("hidden"); const b=$<HTMLButtonElement>("#why-button"); const open=!w.classList.contains("hidden"); b.setAttribute("aria-expanded",String(open)); b.querySelector("span")!.textContent=open?"−":"＋"; });
$("#settings").addEventListener("click",()=>$("#settings-modal").classList.remove("hidden"));
$("#close-settings").addEventListener("click",()=>$("#settings-modal").classList.add("hidden"));
$("#save-settings").addEventListener("click",()=>{
  soundEnabled = $<HTMLInputElement>("#sound-setting").checked;
  document.documentElement.classList.toggle("reduce-motion", !$<HTMLInputElement>("#motion-setting").checked);
  $("#settings-modal").classList.add("hidden");
  toast("Settings saved");
});
$("#print-aar").addEventListener("click",()=>window.print());
$("#export-aar").addEventListener("click",exportAar);
window.addEventListener("keydown",(event)=>{
  if (event.key === "Escape") $("#settings-modal").classList.add("hidden");
  if (event.key.toLowerCase() === "n") reset();
  if (event.key.toLowerCase() === "r" && !fogRevealed && started) revealIntel();
  if (event.key === "Enter" && selected !== null && started) commit();
});
window.addEventListener("beforeunload", saveGame);
update();
if (localStorage.getItem(SAVE_KEY)) $("#resume").classList.remove("hidden");
