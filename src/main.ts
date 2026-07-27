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

app.innerHTML = `
<div class="shell">
  <header class="topbar">
    <div class="brand"><span>RR</span><div><b>Resilience Routes</b><small>Supply Chain Command Exercise</small></div></div>
    <div class="status"><i></i><div><b id="top-status">Briefing ready</b><small id="top-substatus">Regional continuity exercise</small></div></div>
    <button id="reset" class="primary" type="button">New mission</button>
  </header>
  <aside class="rail">
    <button class="nav active" data-view="mission" type="button"><span>◈</span><b>Mission</b></button>
    <button class="nav" data-view="network" type="button"><span>⌘</span><b>Network</b></button>
    <button class="nav" data-view="guide" type="button"><span>≡</span><b>Guide</b></button>
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
            <div class="inject-top"><span id="category" class="eyebrow"></span><span id="inject-count" class="pill"></span></div>
            <h2 id="title"></h2><p id="summary" class="summary"></p>
            <div class="signal"><span>LIVE SIGNAL</span><b id="signal"></b></div>
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
    <section class="view" data-panel="guide"><div class="page-head"><div><span class="eyebrow">Exercise guide</span><h1>Mission and learning intent</h1></div><p>Built for students, emergency managers, and supply-chain teams.</p></div><article class="hero"><span class="eyebrow">Mission objective</span><h2>Maintain movement of essential goods while the network absorbs multiple shocks.</h2><p>Strong decisions balance continuity, life safety, cost, trusted information, redundancy, and future readiness.</p></article><div class="guide-grid"><article><b>01</b><h3>Read the signal</h3><p>Separate operational facts from assumptions.</p></article><article><b>02</b><h3>Check dependencies</h3><p>Trace which nodes will be affected next.</p></article><article><b>03</b><h3>Spend deliberately</h3><p>Funds, teams, and intelligence are limited.</p></article><article><b>04</b><h3>Build readiness</h3><p>Choose actions that improve the next response.</p></article></div></section>
    <section class="view" data-panel="aar"><div class="page-head"><div><span class="eyebrow">After-action review</span><h1>Performance and decision record</h1></div><p>Your report updates after each choice.</p></div><div id="aar"></div></section>
  </main>
  <div id="toast" class="toast"></div>
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

function showInject() {
  const x = injects[round]; selected = null;
  node(x.target).health = clamp(node(x.target).health - x.damage); x.target && node(x.target).dependencies.slice(0,2).forEach(id => node(id).health = clamp(node(id).health - 3)); resilience = clamp(resilience - 4);
  $("#welcome").classList.add("hidden"); $("#result").classList.add("hidden"); $("#inject").classList.remove("hidden");
  $("#category").textContent = x.category; $("#inject-count").textContent = `Inject ${round+1} of 5`; $("#title").textContent = x.title; $("#summary").textContent = x.summary; $("#signal").textContent = x.signal; $("#why").textContent = x.why; $("#why").classList.add("hidden");
  $("#choices").innerHTML = x.choices.map((c,i) => `<button class="choice ${affordable(c.cost) ? "" : "disabled"}" data-choice="${i}" type="button" ${affordable(c.cost) ? "" : "disabled"}><i></i><div><b>${c.title}</b><small>${c.description}</small><em>${costText(c.cost)}</em></div><span>›</span></button>`).join("");
  document.querySelectorAll<HTMLButtonElement>(".choice").forEach(b => b.addEventListener("click", () => choose(Number(b.dataset.choice))));
  $<HTMLButtonElement>("#commit").disabled = true; $("#help").textContent = "Select a response to review its cost and effect."; $("#map-message").textContent = `${node(x.target).name} is under pressure. Review the inject and choose a response.`; $("#top-status").textContent = `Inject ${round+1}: ${x.category}`; $("#top-substatus").textContent = x.title; update();
}

function choose(index: number) {
  selected = index; document.querySelectorAll(".choice").forEach((b,i) => b.classList.toggle("selected", i === index));
  const c = injects[round].choices[index]; $<HTMLButtonElement>("#commit").disabled = false; $("#help").innerHTML = `<b>Expected effect ${c.resilience >= 0 ? "+" : ""}${c.resilience}</b> · ${costText(c.cost)}`;
}

function commit() {
  if (selected === null) return; const x = injects[round]; const c = x.choices[selected]; if (!affordable(c.cost)) return;
  resources.funds -= c.cost.funds ?? 0; resources.teams -= c.cost.teams ?? 0; resources.intel -= c.cost.intel ?? 0;
  Object.entries(c.effects).forEach(([id,value]) => node(id as NodeId).health = clamp(node(id as NodeId).health + Number(value)));
  resilience = clamp(resilience + c.resilience); readiness = clamp(readiness + c.readiness); score += Math.max(0, c.resilience*8 + c.readiness*5);
  const weakest = node(x.target).dependencies.map(node).sort((a,b) => a.health-b.health)[0];
  const cascade = c.resilience >= 7 ? `${node(x.target).name} stabilizes before severe effects reach ${weakest.name}.` : c.resilience >= 0 ? `${node(x.target).name} partially recovers, but ${weakest.name} remains exposed.` : `Pressure spreads from ${node(x.target).name} to ${weakest.name}.`;
  if (c.resilience < 0) { weakest.health = clamp(weakest.health - 7); resilience = clamp(resilience - 3); }
  history.push({ inject:x, choice:c, cascade }); $("#inject").classList.add("hidden"); $("#result").classList.remove("hidden"); $("#result-tag").textContent = c.resilience >= 7 ? "Strong decision" : c.resilience >= 0 ? "Partial stabilization" : "Cascade increased"; $("#result-title").textContent = c.title; $("#lesson").textContent = c.lesson; $("#effects").innerHTML = `<div><span>Resilience</span><b class="${c.resilience>=0?"positive":"negative"}">${c.resilience>=0?"+":""}${c.resilience}</b></div><div><span>Preparedness</span><b class="${c.readiness>=0?"positive":"negative"}">${c.readiness>=0?"+":""}${c.readiness}</b></div><div><span>Target health</span><b>${node(x.target).health}%</b></div>`; $("#cascade").textContent = cascade; $("#map-message").textContent = cascade; update();
}

function next() { round++; if (round >= injects.length || resilience <= 0) finish(); else showInject(); }
function finish() {
  started = false; $("#result").classList.add("hidden"); $("#inject").classList.add("hidden"); $("#welcome").classList.remove("hidden"); const avg = Math.round(nodes.reduce((a,n)=>a+n.health,0)/nodes.length); $("#welcome").innerHTML = `<span class="mission-icon complete">✓</span><span class="eyebrow">Exercise complete</span><h2>${resilience>=80&&readiness>=65?"Command ready":resilience>=60?"Network sustained":"Recovery required"}</h2><p>You finished with ${resilience}% resilience, ${readiness}% preparedness, and ${avg}% average node health.</p><div class="brief"><div><b>${score}</b><span>Score</span></div><div><b>${history.length}</b><span>Decisions</span></div><div><b>${avg}%</b><span>Node health</span></div></div><button id="view-review" class="primary wide" type="button">Open after-action review</button>`; $("#view-review").addEventListener("click", () => switchView("aar")); $("#top-status").textContent = "Exercise complete"; $("#top-substatus").textContent = "After-action review ready"; update();
}

function renderAar() {
  if (!history.length) { $("#aar").innerHTML = `<div class="empty-review"><span>✓</span><h2>No decisions recorded yet</h2><p>Begin the exercise and your choices will appear here.</p></div>`; return; }
  const avg = Math.round(nodes.reduce((a,n)=>a+n.health,0)/nodes.length); const strong = history.filter(h=>h.choice.resilience>=7).length;
  $("#aar").innerHTML = `<div class="aar-metrics"><article><span>Final resilience</span><b>${resilience}%</b></article><article><span>Preparedness</span><b>${readiness}%</b></article><article><span>Average node health</span><b>${avg}%</b></article><article><span>Strong decisions</span><b>${strong} / ${history.length}</b></article></div><div class="aar-grid"><section class="records"><span class="eyebrow">Decision record</span><h2>What happened</h2>${history.map((h,i)=>`<article><span>${i+1}</span><div><small>${h.inject.category}</small><h3>${h.choice.title}</h3><p>${h.choice.lesson}</p><em>${h.cascade}</em></div><b class="${h.choice.resilience>=0?"positive":"negative"}">${h.choice.resilience>=0?"+":""}${h.choice.resilience}</b></article>`).join("")}</section><aside class="assessment"><span class="eyebrow">Command assessment</span><h2>${strong>=3?"Effective continuity leadership":"Continuity gaps remain"}</h2><p>${strong>=3?"You used prioritization, redundancy, and trusted information to contain cascading risk.":"Several choices protected immediate resources but allowed disruption to move into dependent nodes."}</p><div><b>Keep</b><span>Explicit prioritization and alternate routing</span></div><div><b>Improve</b><span>Earlier investment in shared information and readiness</span></div><div><b>Discuss</b><span>Which costs are acceptable when life safety is at risk?</span></div></aside></div>`;
}

function switchView(view: string) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", (v as HTMLElement).dataset.panel === view)); document.querySelectorAll(".nav").forEach(v => v.classList.toggle("active", (v as HTMLElement).dataset.view === view)); if (view === "network") { renderMap("#analysis-map", true); renderInspector(); } if (view === "aar") renderAar();
}
function toast(text: string) { const t = $("#toast"); t.textContent = text; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),1800); }
function reset() { location.reload(); }

document.querySelectorAll<HTMLButtonElement>(".nav").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view!)));
$("#start").addEventListener("click",()=>{ started=true; showInject(); }); $("#commit").addEventListener("click",commit); $("#continue").addEventListener("click",next); $("#reset").addEventListener("click",reset); $("#analyze").addEventListener("click",()=>switchView("network")); $("#why-button").addEventListener("click",()=>{ const w=$("#why"); w.classList.toggle("hidden"); const b=$<HTMLButtonElement>("#why-button"); const open=!w.classList.contains("hidden"); b.setAttribute("aria-expanded",String(open)); b.querySelector("span")!.textContent=open?"−":"＋"; });
update();
