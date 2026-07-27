import "./style.css";

type Mode = "planning" | "operations" | "review";
type AssetType = "ship" | "plane" | "train" | "truck";
type CargoType = "medical" | "food" | "fuel" | "electronics" | "relief";
type ThreatType = "cyber" | "weather" | "infrastructure" | "crowd" | "ai";
type Severity = "low" | "guarded" | "elevated" | "high" | "critical";

interface Point {
  x: number;
  y: number;
}

interface Route {
  id: string;
  name: string;
  type: AssetType;
  points: Point[];
  cargo: CargoType;
  priority: number;
  origin: string;
  destination: string;
  etaMinutes: number;
  risk: number;
}

interface MovingAsset {
  id: string;
  callsign: string;
  routeId: string;
  progress: number;
  speed: number;
  status: "moving" | "holding" | "rerouted" | "delayed";
  delay: number;
}

interface Infrastructure {
  id: string;
  name: string;
  short: string;
  category: string;
  x: number;
  y: number;
  health: number;
  capacity: number;
  dependencies: string[];
  icon: string;
}

interface POI {
  id: string;
  name: string;
  type: "hospital" | "stadium" | "eoc" | "water" | "power" | "data" | "school";
  x: number;
  y: number;
  people: number;
  criticality: number;
  icon: string;
}

interface Threat {
  id: string;
  type: ThreatType;
  title: string;
  summary: string;
  target: string;
  severity: Severity;
  active: boolean;
  discovered: boolean;
  timer: number;
  spread: number;
}

interface FeedItem {
  time: string;
  level: "info" | "warning" | "critical" | "success";
  text: string;
}

interface Allocation {
  cyber: number;
  logistics: number;
  medical: number;
  publicSafety: number;
  intelligence: number;
  reserveFuel: number;
}

interface SimState {
  mode: Mode;
  missionMinute: number;
  running: boolean;
  speed: 1 | 2 | 4;
  resilience: number;
  publicConfidence: number;
  supplyHealth: number;
  cyberPosture: number;
  infrastructureHealth: number;
  score: number;
  budget: number;
  allocation: Allocation;
  assets: MovingAsset[];
  infrastructure: Infrastructure[];
  threats: Threat[];
  feed: FeedItem[];
  selectedInfrastructure: string | null;
  selectedAsset: string | null;
  selectedThreat: string | null;
  completedObjectives: Set<string>;
}

const routes: Route[] = [
  {
    id: "pacific-sea",
    name: "Pacific Maritime Corridor",
    type: "ship",
    points: [{x:5,y:48},{x:18,y:43},{x:31,y:41},{x:43,y:37},{x:55,y:35},{x:68,y:34},{x:83,y:39},{x:94,y:46}],
    cargo: "electronics",
    priority: 2,
    origin: "Busan",
    destination: "Tacoma",
    etaMinutes: 310,
    risk: 24
  },
  {
    id: "atlantic-sea",
    name: "Atlantic Relief Corridor",
    type: "ship",
    points: [{x:5,y:58},{x:20,y:55},{x:36,y:52},{x:51,y:48},{x:66,y:46},{x:82,y:48},{x:94,y:52}],
    cargo: "relief",
    priority: 4,
    origin: "Rotterdam",
    destination: "New York",
    etaMinutes: 260,
    risk: 18
  },
  {
    id: "polar-air",
    name: "Polar Air Cargo Route",
    type: "plane",
    points: [{x:8,y:31},{x:24,y:22},{x:42,y:18},{x:61,y:20},{x:79,y:27},{x:94,y:34}],
    cargo: "medical",
    priority: 5,
    origin: "Frankfurt",
    destination: "Seattle",
    etaMinutes: 140,
    risk: 16
  },
  {
    id: "continental-rail",
    name: "Continental Rail Spine",
    type: "train",
    points: [{x:9,y:70},{x:25,y:68},{x:40,y:64},{x:55,y:63},{x:70,y:66},{x:91,y:69}],
    cargo: "fuel",
    priority: 4,
    origin: "Los Angeles",
    destination: "Chicago",
    etaMinutes: 190,
    risk: 20
  },
  {
    id: "regional-truck",
    name: "Regional Distribution Loop",
    type: "truck",
    points: [{x:59,y:55},{x:68,y:60},{x:76,y:56},{x:83,y:62},{x:74,y:71},{x:64,y:68},{x:59,y:55}],
    cargo: "food",
    priority: 3,
    origin: "Distribution Campus",
    destination: "Regional Market",
    etaMinutes: 75,
    risk: 14
  }
];

const infrastructureTemplate: Infrastructure[] = [
  { id:"port", name:"Harbor Gateway", short:"PORT", category:"Transportation", x:88, y:45, health:92, capacity:88, dependencies:["rail","data","warehouse"], icon:"⚓" },
  { id:"airport", name:"Regional Air Cargo Hub", short:"AIR", category:"Transportation", x:82, y:31, health:94, capacity:86, dependencies:["data","power","warehouse"], icon:"✈" },
  { id:"rail", name:"Inland Rail Junction", short:"RAIL", category:"Transportation", x:69, y:66, health:90, capacity:82, dependencies:["port","power","data"], icon:"▤" },
  { id:"warehouse", name:"Distribution Campus", short:"DC", category:"Supply Chain", x:60, y:56, health:91, capacity:79, dependencies:["port","rail","airport","data"], icon:"▣" },
  { id:"data", name:"Logistics Data Exchange", short:"DATA", category:"Cyber", x:73, y:50, health:89, capacity:92, dependencies:["power"], icon:"⌁" },
  { id:"power", name:"Regional Power Grid", short:"GRID", category:"Utilities", x:52, y:68, health:93, capacity:84, dependencies:["fuel","data"], icon:"⚡" },
  { id:"fuel", name:"Fuel Distribution Terminal", short:"FUEL", category:"Energy", x:45, y:61, health:88, capacity:75, dependencies:["port","rail","power"], icon:"◆" },
  { id:"water", name:"Water Treatment Plant", short:"WATER", category:"Utilities", x:79, y:74, health:95, capacity:89, dependencies:["power","data"], icon:"◉" }
];

const poiTemplate: POI[] = [
  { id:"hospital", name:"Regional Medical Center", type:"hospital", x:87, y:64, people:1850, criticality:5, icon:"✚" },
  { id:"stadium", name:"Metro Stadium", type:"stadium", x:73, y:78, people:42000, criticality:4, icon:"◫" },
  { id:"eoc", name:"Emergency Operations Center", type:"eoc", x:64, y:42, people:160, criticality:5, icon:"◎" },
  { id:"school", name:"Civic School District", type:"school", x:92, y:76, people:7200, criticality:3, icon:"⌂" },
  { id:"datacenter", name:"Cloud Availability Zone", type:"data", x:56, y:45, people:80, criticality:5, icon:"▦" }
];

const threatTemplates: Threat[] = [
  {
    id:"ai-phish",
    type:"ai",
    title:"AI-enabled spearphishing campaign",
    summary:"Synthetic voice and highly tailored messages are targeting logistics supervisors and emergency-management partners.",
    target:"data",
    severity:"elevated",
    active:false,
    discovered:false,
    timer:7,
    spread:1.5
  },
  {
    id:"port-ransomware",
    type:"cyber",
    title:"Ransomware affecting port scheduling",
    summary:"Gate appointments and container-location services are degrading while terminal operations remain partially available.",
    target:"port",
    severity:"high",
    active:false,
    discovered:false,
    timer:14,
    spread:2.2
  },
  {
    id:"rail-flood",
    type:"weather",
    title:"Flooding threatens rail corridor",
    summary:"Rapid river rise is undermining a bridge approach and reducing freight capacity inland.",
    target:"rail",
    severity:"high",
    active:false,
    discovered:true,
    timer:22,
    spread:1.7
  },
  {
    id:"stadium-gathering",
    type:"crowd",
    title:"Large public gathering increases demand",
    summary:"A sold-out championship event will strain transportation, emergency medical, communications, and public-safety resources.",
    target:"stadium",
    severity:"guarded",
    active:false,
    discovered:true,
    timer:34,
    spread:1.1
  },
  {
    id:"grid-anomaly",
    type:"infrastructure",
    title:"Power-grid control anomaly",
    summary:"Automated protection systems are reporting irregular commands at two substations that support logistics and water operations.",
    target:"power",
    severity:"critical",
    active:false,
    discovered:false,
    timer:45,
    spread:2.8
  }
];

const assetTemplate: MovingAsset[] = [
  { id:"ship-1", callsign:"PACIFIC TRADER", routeId:"pacific-sea", progress:.08, speed:.0017, status:"moving", delay:0 },
  { id:"ship-2", callsign:"BLUE HORIZON", routeId:"atlantic-sea", progress:.38, speed:.0014, status:"moving", delay:0 },
  { id:"plane-1", callsign:"MEDAIR 217", routeId:"polar-air", progress:.22, speed:.0038, status:"moving", delay:0 },
  { id:"plane-2", callsign:"CARGO 804", routeId:"polar-air", progress:.66, speed:.0032, status:"moving", delay:0 },
  { id:"train-1", callsign:"BNSF 81", routeId:"continental-rail", progress:.17, speed:.0021, status:"moving", delay:0 },
  { id:"train-2", callsign:"FUEL 44", routeId:"continental-rail", progress:.72, speed:.0018, status:"moving", delay:0 },
  { id:"truck-1", callsign:"MEDICAL 12", routeId:"regional-truck", progress:.08, speed:.0044, status:"moving", delay:0 },
  { id:"truck-2", callsign:"FOOD 33", routeId:"regional-truck", progress:.44, speed:.0040, status:"moving", delay:0 },
  { id:"truck-3", callsign:"RELIEF 07", routeId:"regional-truck", progress:.79, speed:.0037, status:"moving", delay:0 }
];

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root not found.");

const state: SimState = {
  mode:"planning",
  missionMinute:0,
  running:false,
  speed:1,
  resilience:84,
  publicConfidence:68,
  supplyHealth:88,
  cyberPosture:62,
  infrastructureHealth:91,
  score:0,
  budget:12,
  allocation:{ cyber:2, logistics:2, medical:2, publicSafety:2, intelligence:2, reserveFuel:2 },
  assets:structuredClone(assetTemplate),
  infrastructure:structuredClone(infrastructureTemplate),
  threats:structuredClone(threatTemplates),
  feed:[],
  selectedInfrastructure:null,
  selectedAsset:null,
  selectedThreat:null,
  completedObjectives:new Set()
};

app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">RR</span>
        <div>
          <strong>Resilience Routes</strong>
          <span>Global Operations & Critical Infrastructure Simulator</span>
        </div>
      </div>

      <div class="mission-status">
        <span class="status-light"></span>
        <div>
          <b id="mission-title">Mission planning</b>
          <small id="mission-subtitle">Pacific Northwest continuity exercise</small>
        </div>
      </div>

      <div class="top-actions">
        <button id="help-button" class="secondary-button" type="button">Mission guide</button>
        <button id="new-mission" class="primary-button" type="button">New mission</button>
      </div>
    </header>

    <aside class="side-nav" aria-label="Simulator sections">
      <button class="nav-button active" data-view="operations" type="button"><span>◈</span><b>Ops</b></button>
      <button class="nav-button" data-view="threats" type="button"><span>⌁</span><b>Threats</b></button>
      <button class="nav-button" data-view="infrastructure" type="button"><span>▦</span><b>Assets</b></button>
      <button class="nav-button" data-view="learning" type="button"><span>◎</span><b>Learn</b></button>
      <button class="nav-button" data-view="team" type="button"><span>◫</span><b>Team</b></button>
      <button class="nav-button" data-view="review" type="button"><span>✓</span><b>Review</b></button>
    </aside>

    <main class="workspace">
      <section id="operations-view" class="view active">
        <div class="metrics-row">
          <article class="metric-card"><span>Network resilience</span><strong id="resilience-metric">84</strong><div class="meter"><i id="resilience-bar"></i></div></article>
          <article class="metric-card"><span>Supply health</span><strong id="supply-metric">88</strong><div class="meter"><i id="supply-bar"></i></div></article>
          <article class="metric-card"><span>Cyber posture</span><strong id="cyber-metric">62</strong><div class="meter"><i id="cyber-bar"></i></div></article>
          <article class="metric-card"><span>Public confidence</span><strong id="confidence-metric">68</strong><div class="meter"><i id="confidence-bar"></i></div></article>
          <article class="metric-card time-card"><span>Mission clock</span><strong id="mission-clock">T+00:00</strong><small id="simulation-state">Paused for planning</small></article>
        </div>

        <div class="operations-grid">
          <section class="map-card">
            <div class="panel-heading">
              <div><span class="eyebrow">Common operating picture</span><h1>Living logistics and infrastructure network</h1></div>
              <div class="map-controls">
                <button id="toggle-routes" class="chip-button active" type="button">Routes</button>
                <button id="toggle-poi" class="chip-button active" type="button">POIs</button>
                <button id="toggle-threats" class="chip-button active" type="button">Threats</button>
              </div>
            </div>
            <div id="live-map" class="live-map" aria-label="Animated simulated logistics network"></div>
            <div class="map-footer">
              <div id="ticker" class="ticker">Allocate preparedness resources, then launch the exercise.</div>
              <div class="simulation-controls">
                <button id="pause-play" class="primary-button compact" type="button">Launch exercise</button>
                <button class="speed-button active" data-speed="1" type="button">1×</button>
                <button class="speed-button" data-speed="2" type="button">2×</button>
                <button class="speed-button" data-speed="4" type="button">4×</button>
              </div>
            </div>
          </section>

          <aside class="command-panel">
            <div id="planning-panel">
              <span class="eyebrow">Preparedness phase</span>
              <h2>Allocate limited capability before disruption begins.</h2>
              <p>Your starting investments influence how quickly the network detects, absorbs, and recovers from cyber and physical incidents.</p>
              <div id="allocation-list" class="allocation-list"></div>
              <div class="budget-line"><span>Remaining budget</span><strong id="budget-value">12</strong></div>
              <button id="start-exercise" class="primary-button wide" type="button">Confirm plan and launch</button>
            </div>

            <div id="active-panel" class="hidden">
              <div class="panel-heading tight">
                <div><span class="eyebrow">Command decisions</span><h2 id="active-title">Monitor the operating picture</h2></div>
                <span id="threat-level" class="threat-level guarded">Guarded</span>
              </div>
              <div id="active-detail" class="active-detail">
                <p>Select a threat, infrastructure node, or moving shipment to inspect it.</p>
              </div>
              <div class="advisor-tabs">
                <button class="advisor-tab active" data-advisor="logistics" type="button">Logistics</button>
                <button class="advisor-tab" data-advisor="cyber" type="button">Cyber</button>
                <button class="advisor-tab" data-advisor="public" type="button">Public safety</button>
              </div>
              <div id="advisor-message" class="advisor-message">Logistics advisor: protect medical, food, fuel, and restoration cargo before optimizing general throughput.</div>
              <div id="decision-actions" class="decision-actions"></div>
            </div>
          </aside>
        </div>

        <div class="lower-grid">
          <section class="feed-card">
            <div class="panel-heading tight"><div><span class="eyebrow">Live operational feed</span><h2>Events and intelligence</h2></div><button id="clear-feed" class="text-button" type="button">Clear</button></div>
            <div id="event-feed" class="event-feed"></div>
          </section>

          <section class="objectives-card">
            <div class="panel-heading tight"><div><span class="eyebrow">Mission objectives</span><h2>Protect essential services</h2></div><span id="score-badge" class="score-badge">Score 0</span></div>
            <div id="objectives-list" class="objectives-list"></div>
          </section>
        </div>
      </section>

      <section id="threats-view" class="view">
        <div class="page-heading"><div><span class="eyebrow">Threat intelligence</span><h1>Cyber, AI-enabled, physical, and crowd risks</h1></div><p>Threats are simulated for education. They do not represent live incidents or operational intelligence.</p></div>
        <div id="threat-catalog" class="catalog-grid"></div>
      </section>

      <section id="infrastructure-view" class="view">
        <div class="page-heading"><div><span class="eyebrow">Critical infrastructure</span><h1>Dependencies and points of interest</h1></div><p>Examine the systems that move essential goods and support public safety.</p></div>
        <div class="asset-layout">
          <div id="infrastructure-catalog" class="catalog-grid infrastructure-grid"></div>
          <aside id="dependency-inspector" class="dependency-inspector"></aside>
        </div>
      </section>

      <section id="learning-view" class="view">
        <div class="page-heading"><div><span class="eyebrow">Learning library</span><h1>Official resilience, infrastructure, and cybersecurity resources</h1></div><p>Use these government resources to connect the simulation to real planning concepts.</p></div>
        <div class="resource-grid">
          <a href="https://www.cisa.gov/topics/critical-infrastructure-security-and-resilience" target="_blank" rel="noreferrer"><span>CISA</span><h2>Critical Infrastructure Security and Resilience</h2><p>Sector risk management, resilience, and infrastructure-security guidance.</p></a>
          <a href="https://www.cisa.gov/topics/cyber-threats-and-advisories" target="_blank" rel="noreferrer"><span>CISA</span><h2>Cyber Threats and Advisories</h2><p>Current public advisories, alerts, and cybersecurity information.</p></a>
          <a href="https://www.nist.gov/cyberframework" target="_blank" rel="noreferrer"><span>NIST</span><h2>Cybersecurity Framework</h2><p>Organize cybersecurity risk through Govern, Identify, Protect, Detect, Respond, and Recover.</p></a>
          <a href="https://www.fema.gov/emergency-managers/risk-management" target="_blank" rel="noreferrer"><span>FEMA</span><h2>Risk Management</h2><p>Hazard risk, mitigation, continuity, and resilience resources.</p></a>
          <a href="https://www.ready.gov/business" target="_blank" rel="noreferrer"><span>Ready.gov</span><h2>Business Preparedness</h2><p>Continuity planning, emergency response, crisis communication, and recovery.</p></a>
          <a href="https://www.transportation.gov/freight" target="_blank" rel="noreferrer"><span>USDOT</span><h2>Freight Policy and Planning</h2><p>National freight strategy, logistics, safety, efficiency, and resilience.</p></a>
          <a href="https://www.faa.gov/air_traffic" target="_blank" rel="noreferrer"><span>FAA</span><h2>Air Traffic</h2><p>Public information about the national airspace and air-traffic operations.</p></a>
          <a href="https://www.maritime.dot.gov/" target="_blank" rel="noreferrer"><span>MARAD</span><h2>Maritime Administration</h2><p>Maritime transportation, ports, sealift, and supply-chain resources.</p></a>
        </div>
        <div class="disclaimer-callout"><strong>Educational simulation</strong><p>The moving ships, aircraft, trains, trucks, attacks, crowds, and infrastructure conditions in this project are fictional. This application is not a live tracker, emergency warning system, routing tool, or government decision-support platform.</p></div>
      </section>

      <section id="team-view" class="view">
        <div class="page-heading"><div><span class="eyebrow">Project contributors</span><h1>Roles, direction, and attribution</h1></div><p>Credit reflects the project’s current role structure and should be updated as reviewed contributions are merged.</p></div>
        <div class="team-grid">
          <article><span>Originating concept and program direction</span><h2>Sunny Wescott</h2><p>Defined the educational vision connecting global supply chains, hazards, infrastructure, resource sharing, and resilience.</p></article>
          <article><span>Prototype, integration, hazards, and deployment</span><h2>James Daniels</h2><p>Application architecture, simulation implementation, GitHub deployment, scenario integration, and release coordination.</p></article>
          <article><span>Game design and global trade</span><h2>Kristina-Marie Horton</h2><p>Game mechanics, global trade relationships, resource logic, win conditions, and tabletop alignment.</p></article>
          <article><span>Visual design</span><h2>A'zariah Turner</h2><p>Visual direction, map concepts, original assets, icons, and interface consistency.</p></article>
          <article><span>Infrastructure research</span><h2>Lauren Hession</h2><p>Ports, airports, rail, highways, chokepoints, dependencies, and alternate routes.</p></article>
          <article><span>Content and writing</span><h2>Rachel Farlinger</h2><p>Rules, learning text, scenario wording, facilitator material, and after-action prompts.</p></article>
          <article><span>U.S. scale and domestic injects</span><h2>Justin Ngo</h2><p>State and regional scenarios, domestic inject cards, and U.S.-scale exercise content.</p></article>
          <article><span>Mentorship and operational context</span><h2>John P. Farrell</h2><p>Mentor guidance informed by emergency management, homeland security, and wildfire-tracking experience.</p></article>
        </div>
      </section>

      <section id="review-view" class="view">
        <div class="page-heading"><div><span class="eyebrow">After-action review</span><h1>Mission performance and lessons learned</h1></div><div><button id="print-review" class="secondary-button" type="button">Print / Save PDF</button></div></div>
        <div id="review-content"></div>
      </section>
    </main>

    <div id="guide-modal" class="modal-backdrop hidden">
      <section class="guide-modal" role="dialog" aria-modal="true" aria-labelledby="guide-title">
        <div class="modal-heading"><div><span class="eyebrow">Mission guide</span><h2 id="guide-title">Living operations exercise</h2></div><button id="close-guide" class="icon-button" type="button">×</button></div>
        <ol>
          <li><b>Plan.</b> Allocate limited resources before the exercise begins.</li>
          <li><b>Observe.</b> Watch simulated logistics move through the network.</li>
          <li><b>Detect.</b> Threats emerge over time and may initially be hidden.</li>
          <li><b>Decide.</b> Select incidents or infrastructure and commit response actions.</li>
          <li><b>Learn.</b> Review cascading consequences and complete an after-action report.</li>
        </ol>
        <p>All assets and incidents are simulated. No live aircraft, maritime, or security data is used.</p>
      </section>
    </div>

    <div id="toast" class="toast" aria-live="polite"></div>
  </div>
`;

const $ = <T extends HTMLElement = HTMLElement>(selector: string): T => {
  const item = document.querySelector<T>(selector);
  if (!item) throw new Error(`Missing ${selector}`);
  return item;
};

const objectives = [
  { id:"hospital", text:"Keep the regional hospital supplied", check:() => routeCargoHealth("medical") >= 55 && poiTemplate.find(p=>p.id==="hospital")!.criticality > 0 },
  { id:"water", text:"Keep water treatment above 55% health", check:() => infra("water").health >= 55 },
  { id:"cyber", text:"Prevent cyber posture from falling below 35", check:() => state.cyberPosture >= 35 },
  { id:"confidence", text:"Maintain public confidence above 45", check:() => state.publicConfidence >= 45 },
  { id:"supply", text:"Complete the mission with supply health above 60", check:() => state.supplyHealth >= 60 && state.missionMinute >= 60 }
];

function infra(id: string): Infrastructure {
  const result = state.infrastructure.find(item => item.id === id);
  if (!result) throw new Error(`Unknown infrastructure ${id}`);
  return result;
}

function routeForAsset(asset: MovingAsset): Route {
  const route = routes.find(item => item.id === asset.routeId);
  if (!route) throw new Error(`Unknown route ${asset.routeId}`);
  return route;
}

function routeCargoHealth(cargo: CargoType): number {
  const matching = state.assets.filter(asset => routeForAsset(asset).cargo === cargo);
  if (!matching.length) return 100;
  const avgDelay = matching.reduce((sum, asset) => sum + asset.delay, 0) / matching.length;
  return Math.max(0, Math.round(100 - avgDelay * 2.2));
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function missionTime(): string {
  const total = state.missionMinute;
  return `T+${String(Math.floor(total / 60)).padStart(2,"0")}:${String(total % 60).padStart(2,"0")}`;
}

function interpolate(points: Point[], progress: number): Point {
  if (points.length < 2) return points[0] ?? {x:0,y:0};
  const segments = points.length - 1;
  const scaled = Math.max(0, Math.min(.999999, progress)) * segments;
  const index = Math.floor(scaled);
  const local = scaled - index;
  const a = points[index];
  const b = points[index + 1];
  return { x:a.x + (b.x-a.x)*local, y:a.y + (b.y-a.y)*local };
}

function assetIcon(type: AssetType): string {
  return type === "ship" ? "▰" : type === "plane" ? "✈" : type === "train" ? "▤" : "▱";
}

function cargoLabel(cargo: CargoType): string {
  return cargo.charAt(0).toUpperCase() + cargo.slice(1);
}

function severityRank(level: Severity): number {
  return {low:1,guarded:2,elevated:3,high:4,critical:5}[level];
}

function currentThreatLevel(): Severity {
  const active = state.threats.filter(item => item.active);
  if (!active.length) return "guarded";
  return active.sort((a,b)=>severityRank(b.severity)-severityRank(a.severity))[0].severity;
}

function addFeed(text: string, level: FeedItem["level"]="info"): void {
  state.feed.unshift({time:missionTime(), level, text});
  state.feed = state.feed.slice(0, 30);
  renderFeed();
}

function renderAllocations(): void {
  const container = $("#allocation-list");
  const labels: Record<keyof Allocation, string> = {
    cyber:"Cyber teams",
    logistics:"Logistics coordination",
    medical:"Medical surge",
    publicSafety:"Public safety",
    intelligence:"Intelligence",
    reserveFuel:"Reserve fuel"
  };
  container.innerHTML = (Object.keys(state.allocation) as Array<keyof Allocation>).map(key => `
    <div class="allocation-row">
      <div><b>${labels[key]}</b><small>${allocationDescription(key)}</small></div>
      <div class="stepper">
        <button type="button" data-allocation="${key}" data-direction="-1">−</button>
        <strong>${state.allocation[key]}</strong>
        <button type="button" data-allocation="${key}" data-direction="1">+</button>
      </div>
    </div>
  `).join("");
  container.querySelectorAll<HTMLButtonElement>("[data-allocation]").forEach(button => {
    button.addEventListener("click", () => {
      if (state.running) return;
      const key = button.dataset.allocation as keyof Allocation;
      const direction = Number(button.dataset.direction);
      if (direction > 0 && state.budget <= 0) return showToast("No planning budget remains");
      if (direction < 0 && state.allocation[key] <= 0) return;
      state.allocation[key] += direction;
      state.budget -= direction;
      renderAllocations();
      updateMetrics();
    });
  });
}

function allocationDescription(key: keyof Allocation): string {
  const descriptions: Record<keyof Allocation,string> = {
    cyber:"Detection, segmentation, recovery, and identity protection",
    logistics:"Rerouting, carrier coordination, and throughput restoration",
    medical:"Hospital support, medical cargo, and surge capacity",
    publicSafety:"Crowd safety, traffic, emergency response, and communication",
    intelligence:"Earlier threat discovery and clearer operating information",
    reserveFuel:"Power, transport, generators, and continuity operations"
  };
  return descriptions[key];
}

function renderMap(): void {
  const map = $("#live-map");
  const routeSvg = routes.map(route => {
    const path = route.points.map((point,index)=>`${index===0?"M":"L"} ${point.x} ${point.y}`).join(" ");
    return `<path class="route-line ${route.type}" data-route="${route.id}" d="${path}" />`;
  }).join("");

  const infrastructureHtml = state.infrastructure.map(node => `
    <button class="infra-marker ${node.health < 40 ? "critical" : node.health < 65 ? "warning" : ""}" style="left:${node.x}%;top:${node.y}%;" data-infra="${node.id}" type="button">
      <span>${node.icon}</span><div><small>${node.short}</small><b>${node.name}</b></div><strong>${node.health}</strong>
    </button>
  `).join("");

  const poiHtml = poiTemplate.map(poi => `
    <button class="poi-marker" style="left:${poi.x}%;top:${poi.y}%;" data-poi="${poi.id}" type="button" title="${poi.name}">
      <span>${poi.icon}</span><small>${poi.name}</small>
    </button>
  `).join("");

  const threatsHtml = state.threats.filter(item => item.active && item.discovered).map(threat => {
    const targetInfra = state.infrastructure.find(item=>item.id===threat.target);
    const targetPoi = poiTemplate.find(item=>item.id===threat.target);
    const x = targetInfra?.x ?? targetPoi?.x ?? 50;
    const y = targetInfra?.y ?? targetPoi?.y ?? 50;
    return `<button class="threat-marker ${threat.severity}" style="left:${x}%;top:${y}%;" data-threat="${threat.id}" type="button"><span>!</span></button>`;
  }).join("");

  map.innerHTML = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="oceanFade" x1="0" x2="1"><stop offset="0" stop-color="#0b1b2d"/><stop offset="1" stop-color="#0c2235"/></linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#oceanFade)"/>
      <path class="land-mass" d="M4 17 C16 9 31 12 39 23 C44 30 37 37 30 41 C24 45 24 59 18 70 C13 79 5 76 3 63 Z"/>
      <path class="land-mass" d="M52 11 C62 7 74 10 79 18 C83 24 89 28 97 29 L98 76 C88 82 79 78 74 72 C69 67 63 66 59 60 C54 53 58 42 53 35 C49 28 46 18 52 11 Z"/>
      <path class="land-detail" d="M7 25 C18 22 29 25 36 31 M12 52 C20 48 25 48 31 55 M60 21 C71 19 82 23 92 31 M63 51 C72 48 84 50 94 58"/>
      ${routeSvg}
    </svg>
    <span class="region-label north-america">NORTH AMERICA</span>
    <span class="region-label europe">EUROPE</span>
    <span class="region-label asia">ASIA-PACIFIC</span>
    <span class="region-label regional">REGIONAL OPERATIONS AREA</span>
    <div id="assets-layer"></div>
    <div id="infrastructure-layer">${infrastructureHtml}</div>
    <div id="poi-layer">${poiHtml}</div>
    <div id="threat-layer">${threatsHtml}</div>
  `;

  map.querySelectorAll<HTMLButtonElement>("[data-infra]").forEach(button => button.addEventListener("click",()=>selectInfrastructure(button.dataset.infra!)));
  map.querySelectorAll<HTMLButtonElement>("[data-poi]").forEach(button => button.addEventListener("click",()=>selectPoi(button.dataset.poi!)));
  map.querySelectorAll<HTMLButtonElement>("[data-threat]").forEach(button => button.addEventListener("click",()=>selectThreat(button.dataset.threat!)));
  renderAssets();
}

function renderAssets(): void {
  const layer = document.querySelector<HTMLDivElement>("#assets-layer");
  if (!layer) return;
  layer.innerHTML = state.assets.map(asset => {
    const route = routeForAsset(asset);
    const position = interpolate(route.points, asset.progress);
    return `
      <button class="moving-asset ${route.type} ${asset.status}" style="left:${position.x}%;top:${position.y}%;" data-asset="${asset.id}" type="button" title="${asset.callsign}">
        <span>${assetIcon(route.type)}</span>
        <small>${asset.callsign}</small>
      </button>
    `;
  }).join("");
  layer.querySelectorAll<HTMLButtonElement>("[data-asset]").forEach(button=>button.addEventListener("click",()=>selectAsset(button.dataset.asset!)));
}

function renderFeed(): void {
  const container = $("#event-feed");
  if (!state.feed.length) {
    container.innerHTML = `<div class="empty-feed"><span>◎</span><p>Operational events will appear when the exercise begins.</p></div>`;
    return;
  }
  container.innerHTML = state.feed.map(item=>`
    <article class="feed-item ${item.level}"><time>${item.time}</time><span></span><p>${item.text}</p></article>
  `).join("");
}

function renderObjectives(): void {
  objectives.forEach(objective => {
    if (objective.check()) state.completedObjectives.add(objective.id);
    else state.completedObjectives.delete(objective.id);
  });
  $("#objectives-list").innerHTML = objectives.map(objective=>`
    <div class="objective ${state.completedObjectives.has(objective.id) ? "complete" : ""}">
      <span>${state.completedObjectives.has(objective.id) ? "✓" : "○"}</span><p>${objective.text}</p>
    </div>
  `).join("");
}

function updateMetrics(): void {
  $("#resilience-metric").textContent = String(state.resilience);
  $("#supply-metric").textContent = String(state.supplyHealth);
  $("#cyber-metric").textContent = String(state.cyberPosture);
  $("#confidence-metric").textContent = String(state.publicConfidence);
  $("#mission-clock").textContent = missionTime();
  $("#budget-value").textContent = String(state.budget);
  $("#score-badge").textContent = `Score ${state.score}`;
  ($("#resilience-bar") as HTMLElement).style.width = `${state.resilience}%`;
  ($("#supply-bar") as HTMLElement).style.width = `${state.supplyHealth}%`;
  ($("#cyber-bar") as HTMLElement).style.width = `${state.cyberPosture}%`;
  ($("#confidence-bar") as HTMLElement).style.width = `${state.publicConfidence}%`;
  $("#simulation-state").textContent = state.running ? `Running at ${state.speed}×` : state.mode === "review" ? "Exercise complete" : "Paused";
  const level = currentThreatLevel();
  const badge = $("#threat-level");
  badge.textContent = level.charAt(0).toUpperCase() + level.slice(1);
  badge.className = `threat-level ${level}`;
  renderObjectives();
}

function selectInfrastructure(id: string): void {
  state.selectedInfrastructure = id;
  state.selectedAsset = null;
  state.selectedThreat = null;
  const item = infra(id);
  $("#active-title").textContent = item.name;
  $("#active-detail").innerHTML = `
    <div class="detail-metrics"><div><span>Health</span><b>${item.health}%</b></div><div><span>Capacity</span><b>${item.capacity}%</b></div></div>
    <p>${item.category} infrastructure supporting ${item.dependencies.map(dep=>infra(dep).short).join(", ") || "regional operations"}.</p>
    <div class="dependency-list"><span>Dependencies</span>${item.dependencies.map(dep=>`<button type="button" data-jump="${dep}">${infra(dep).name}</button>`).join("")}</div>
  `;
  document.querySelectorAll<HTMLButtonElement>("[data-jump]").forEach(button=>button.addEventListener("click",()=>selectInfrastructure(button.dataset.jump!)));
  renderDecisionActions();
}

function selectAsset(id: string): void {
  state.selectedAsset = id;
  state.selectedInfrastructure = null;
  state.selectedThreat = null;
  const asset = state.assets.find(item=>item.id===id)!;
  const route = routeForAsset(asset);
  $("#active-title").textContent = asset.callsign;
  $("#active-detail").innerHTML = `
    <div class="detail-metrics"><div><span>Status</span><b>${asset.status}</b></div><div><span>Delay</span><b>${asset.delay} min</b></div></div>
    <p>${cargoLabel(route.cargo)} cargo moving from ${route.origin} to ${route.destination} on the ${route.name}.</p>
    <div class="asset-facts"><span>Priority ${route.priority}/5</span><span>Route risk ${route.risk}%</span><span>ETA ${Math.max(1, route.etaMinutes + asset.delay)} min</span></div>
  `;
  renderDecisionActions();
}

function selectPoi(id: string): void {
  const poi = poiTemplate.find(item=>item.id===id)!;
  state.selectedAsset = null;
  state.selectedInfrastructure = null;
  state.selectedThreat = null;
  $("#active-title").textContent = poi.name;
  $("#active-detail").innerHTML = `
    <div class="detail-metrics"><div><span>Population</span><b>${poi.people.toLocaleString()}</b></div><div><span>Criticality</span><b>${poi.criticality}/5</b></div></div>
    <p>Protected point of interest requiring continuity, emergency access, communication, and resource prioritization.</p>
  `;
  renderDecisionActions();
}

function selectThreat(id: string): void {
  state.selectedThreat = id;
  state.selectedAsset = null;
  state.selectedInfrastructure = null;
  const threat = state.threats.find(item=>item.id===id)!;
  $("#active-title").textContent = threat.title;
  $("#active-detail").innerHTML = `
    <span class="threat-category">${threat.type.toUpperCase()} THREAT</span>
    <p>${threat.summary}</p>
    <div class="detail-metrics"><div><span>Severity</span><b>${threat.severity}</b></div><div><span>Spread</span><b>${threat.spread.toFixed(1)}×</b></div></div>
  `;
  renderDecisionActions();
}

function renderDecisionActions(): void {
  const container = $("#decision-actions");
  if (state.selectedThreat) {
    container.innerHTML = `
      <button type="button" data-action="contain">Contain and segment</button>
      <button type="button" data-action="reroute">Protect alternate routes</button>
      <button type="button" data-action="communicate">Issue coordinated update</button>
      <button type="button" data-action="investigate">Spend intelligence to investigate</button>
    `;
  } else if (state.selectedInfrastructure) {
    container.innerHTML = `
      <button type="button" data-action="reinforce">Deploy response team</button>
      <button type="button" data-action="backup">Activate backup capability</button>
      <button type="button" data-action="inspect">Conduct rapid assessment</button>
    `;
  } else if (state.selectedAsset) {
    container.innerHTML = `
      <button type="button" data-action="priority">Set priority movement</button>
      <button type="button" data-action="hold">Place in safe holding</button>
      <button type="button" data-action="divert">Divert to alternate route</button>
    `;
  } else {
    container.innerHTML = `<p class="action-placeholder">Select an active object to make a command decision.</p>`;
  }
  container.querySelectorAll<HTMLButtonElement>("[data-action]").forEach(button=>button.addEventListener("click",()=>performAction(button.dataset.action!)));
}

function performAction(action: string): void {
  if (!state.running) return showToast("Launch the exercise before issuing operational commands");
  let cost = 1;
  if (action === "contain" || action === "backup" || action === "divert") cost = 2;
  if (state.budget < cost) return showToast("Insufficient response budget");
  state.budget -= cost;

  if (state.selectedThreat) {
    const threat = state.threats.find(item=>item.id===state.selectedThreat)!;
    if (action === "contain") {
      threat.spread = Math.max(.3, threat.spread - .9 - state.allocation.cyber*.08);
      state.cyberPosture = clamp(state.cyberPosture + 5);
      state.score += 120;
      addFeed(`Containment actions reduced spread of ${threat.title}.`, "success");
    } else if (action === "reroute") {
      state.assets.forEach(asset => {
        if (routeForAsset(asset).priority >= 4) {
          asset.status = "rerouted";
          asset.delay = Math.max(0, asset.delay - 6);
        }
      });
      state.supplyHealth = clamp(state.supplyHealth + 4);
      state.score += 90;
      addFeed("Priority cargo moved to alternate corridors.", "success");
    } else if (action === "communicate") {
      state.publicConfidence = clamp(state.publicConfidence + 7);
      state.score += 65;
      addFeed("Coordinated public and partner update issued.", "info");
    } else if (action === "investigate") {
      threat.discovered = true;
      threat.spread = Math.max(.4, threat.spread - .4 - state.allocation.intelligence*.05);
      state.score += 75;
      addFeed(`Intelligence cell clarified indicators associated with ${threat.title}.`, "info");
    }
  } else if (state.selectedInfrastructure) {
    const item = infra(state.selectedInfrastructure);
    if (action === "reinforce") {
      item.health = clamp(item.health + 8 + state.allocation.logistics);
      state.score += 70;
      addFeed(`Response team deployed to ${item.name}.`, "success");
    } else if (action === "backup") {
      item.capacity = clamp(item.capacity + 10);
      item.health = clamp(item.health + 4);
      state.resilience = clamp(state.resilience + 3);
      state.score += 100;
      addFeed(`Backup capability activated at ${item.name}.`, "success");
    } else {
      item.health = clamp(item.health + 3);
      state.score += 45;
      addFeed(`Rapid assessment completed at ${item.name}.`, "info");
    }
  } else if (state.selectedAsset) {
    const asset = state.assets.find(item=>item.id===state.selectedAsset)!;
    if (action === "priority") {
      asset.delay = Math.max(0, asset.delay - 8);
      asset.speed *= 1.12;
      state.score += 60;
      addFeed(`${asset.callsign} received priority movement authority.`, "success");
    } else if (action === "hold") {
      asset.status = "holding";
      asset.delay += 4;
      addFeed(`${asset.callsign} entered safe holding.`, "warning");
    } else {
      asset.status = "rerouted";
      asset.delay += 5;
      asset.progress = Math.max(0, asset.progress - .03);
      state.score += 40;
      addFeed(`${asset.callsign} diverted to an alternate route.`, "info");
    }
  }
  updateMetrics();
  renderMap();
  renderDecisionActions();
}

function activateThreats(): void {
  state.threats.forEach(threat => {
    if (!threat.active && state.missionMinute >= threat.timer) {
      threat.active = true;
      const detectionBonus = state.allocation.intelligence * 6 + state.cyberPosture * .15;
      if (threat.discovered || Math.random()*100 < detectionBonus) threat.discovered = true;
      addFeed(threat.discovered ? `${threat.title} detected.` : "Unverified anomaly reported in the operating area.", threat.severity === "critical" ? "critical" : "warning");
    }
  });
}

function applyThreatEffects(): void {
  state.threats.filter(item=>item.active).forEach(threat => {
    const mitigation = threat.type === "cyber" || threat.type === "ai"
      ? state.allocation.cyber*.13 + state.cyberPosture*.007
      : threat.type === "crowd"
        ? state.allocation.publicSafety*.14
        : state.allocation.logistics*.1 + state.allocation.reserveFuel*.06;
    const impact = Math.max(.05, threat.spread*.18 - mitigation);

    if (threat.target === "stadium") {
      state.publicConfidence = clamp(state.publicConfidence - impact);
      infra("rail").capacity = clamp(infra("rail").capacity - impact*.4);
      infra("airport").capacity = clamp(infra("airport").capacity - impact*.25);
    } else {
      const target = state.infrastructure.find(item=>item.id===threat.target);
      if (target) {
        target.health = clamp(target.health - impact);
        target.capacity = clamp(target.capacity - impact*.55);
        target.dependencies.forEach(dep => {
          const child = state.infrastructure.find(item=>item.id===dep);
          if (child) child.health = clamp(child.health - impact*.12);
        });
      }
    }

    if (threat.type === "cyber" || threat.type === "ai") state.cyberPosture = clamp(state.cyberPosture - impact*.32);
    state.resilience = clamp(state.resilience - impact*.12);
  });
}

function updateAssets(): void {
  state.assets.forEach(asset => {
    if (asset.status === "holding") {
      asset.delay += .2 * state.speed;
      return;
    }
    const route = routeForAsset(asset);
    let healthFactor = 1;
    if (route.type === "ship") healthFactor = infra("port").health / 100;
    if (route.type === "plane") healthFactor = infra("airport").health / 100;
    if (route.type === "train") healthFactor = infra("rail").health / 100;
    if (route.type === "truck") healthFactor = infra("warehouse").health / 100;

    const threatPenalty = state.threats.filter(item=>item.active).reduce((sum,item)=>sum + item.spread*.008,0);
    const effectiveSpeed = Math.max(.0003, asset.speed * healthFactor - threatPenalty);
    asset.progress += effectiveSpeed * state.speed;
    if (asset.progress >= 1) {
      asset.progress = 0;
      asset.delay = Math.max(0, asset.delay - 4);
      asset.status = "moving";
      state.score += route.priority * 12;
      addFeed(`${asset.callsign} completed delivery of ${route.cargo} cargo.`, "success");
    }
    if (healthFactor < .65) {
      asset.delay += .08 * state.speed;
      if (asset.status === "moving") asset.status = "delayed";
    }
  });
}

function recomputeSystemMetrics(): void {
  state.infrastructureHealth = clamp(state.infrastructure.reduce((sum,item)=>sum+item.health,0)/state.infrastructure.length);
  state.supplyHealth = clamp(
    state.infrastructureHealth*.45 +
    routeCargoHealth("medical")*.18 +
    routeCargoHealth("food")*.14 +
    routeCargoHealth("fuel")*.13 +
    routeCargoHealth("relief")*.10
  );
  state.resilience = clamp(state.infrastructureHealth*.45 + state.supplyHealth*.35 + state.cyberPosture*.2);
  const criticalCount = state.infrastructure.filter(item=>item.health<40).length;
  if (criticalCount) state.publicConfidence = clamp(state.publicConfidence - criticalCount*.06*state.speed);
}

function simulationTick(): void {
  if (!state.running) return;
  state.missionMinute += state.speed;
  activateThreats();
  applyThreatEffects();
  updateAssets();
  recomputeSystemMetrics();
  updateMetrics();
  renderAssets();
  renderMapThreatsOnly();

  if (state.missionMinute >= 60 || state.resilience <= 0) finishMission();
}

function renderMapThreatsOnly(): void {
  const threatLayer = document.querySelector<HTMLDivElement>("#threat-layer");
  if (!threatLayer) return;
  threatLayer.innerHTML = state.threats.filter(item=>item.active && item.discovered).map(threat => {
    const targetInfra = state.infrastructure.find(item=>item.id===threat.target);
    const targetPoi = poiTemplate.find(item=>item.id===threat.target);
    const x = targetInfra?.x ?? targetPoi?.x ?? 50;
    const y = targetInfra?.y ?? targetPoi?.y ?? 50;
    return `<button class="threat-marker ${threat.severity}" style="left:${x}%;top:${y}%;" data-threat="${threat.id}" type="button"><span>!</span></button>`;
  }).join("");
  threatLayer.querySelectorAll<HTMLButtonElement>("[data-threat]").forEach(button=>button.addEventListener("click",()=>selectThreat(button.dataset.threat!)));
  state.infrastructure.forEach(item => {
    const marker = document.querySelector<HTMLButtonElement>(`[data-infra="${item.id}"]`);
    if (!marker) return;
    marker.classList.toggle("warning", item.health < 65 && item.health >= 40);
    marker.classList.toggle("critical", item.health < 40);
    const health = marker.querySelector("strong");
    if (health) health.textContent = String(item.health);
  });
}

function startExercise(): void {
  state.mode = "operations";
  state.running = true;
  state.cyberPosture = clamp(state.cyberPosture + state.allocation.cyber*3 + state.allocation.intelligence);
  state.supplyHealth = clamp(state.supplyHealth + state.allocation.logistics*2 + state.allocation.reserveFuel);
  state.publicConfidence = clamp(state.publicConfidence + state.allocation.publicSafety*2);
  infra("water").health = clamp(infra("water").health + state.allocation.reserveFuel);
  $("#planning-panel").classList.add("hidden");
  $("#active-panel").classList.remove("hidden");
  $("#pause-play").textContent = "Pause";
  $("#mission-title").textContent = "Living operations exercise";
  $("#mission-subtitle").textContent = "Monitor movement, threats, and cascading consequences";
  addFeed("Exercise launched. Simulated logistics network is active.", "info");
  addFeed("Priority medical, food, fuel, and relief shipments are in motion.", "info");
  updateMetrics();
}

function finishMission(): void {
  state.running = false;
  state.mode = "review";
  $("#pause-play").textContent = "Complete";
  $("#mission-title").textContent = "Exercise complete";
  $("#mission-subtitle").textContent = "After-action review is ready";
  addFeed("Exercise complete. Review performance and lessons learned.", "success");
  renderReview();
  switchView("review");
}

function renderReview(): void {
  const strongObjectives = state.completedObjectives.size;
  const avgHealth = Math.round(state.infrastructure.reduce((sum,item)=>sum+item.health,0)/state.infrastructure.length);
  const delayed = state.assets.filter(item=>item.delay>10).length;
  const detected = state.threats.filter(item=>item.discovered).length;
  const grade = state.resilience >= 80 && strongObjectives >= 4 ? "A" : state.resilience >= 68 ? "B" : state.resilience >= 55 ? "C" : "Recovery required";
  $("#review-content").innerHTML = `
    <div class="review-metrics">
      <article><span>Mission grade</span><strong>${grade}</strong><small>Based on continuity and objectives</small></article>
      <article><span>Final resilience</span><strong>${state.resilience}%</strong><small>Whole-network performance</small></article>
      <article><span>Average infrastructure</span><strong>${avgHealth}%</strong><small>Eight systems assessed</small></article>
      <article><span>Objectives achieved</span><strong>${strongObjectives} / ${objectives.length}</strong><small>Essential services protected</small></article>
      <article><span>Threats detected</span><strong>${detected} / ${state.threats.length}</strong><small>Information and cyber posture</small></article>
      <article><span>Major delays</span><strong>${delayed}</strong><small>Shipments delayed over 10 minutes</small></article>
    </div>
    <div class="review-grid">
      <section class="review-section">
        <span class="eyebrow">System condition</span><h2>Critical infrastructure</h2>
        ${state.infrastructure.map(item=>`<div class="review-line"><span>${item.name}</span><div><i style="width:${item.health}%"></i></div><b>${item.health}%</b></div>`).join("")}
      </section>
      <aside class="review-section">
        <span class="eyebrow">Lessons learned</span><h2>Command assessment</h2>
        <p>${state.resilience >= 70 ? "The network remained functional despite multiple connected disruptions." : "Cascading impacts exceeded available preparedness and response capacity."}</p>
        <div class="lesson"><b>Keep</b><span>Prioritize life-safety cargo and protect trusted operational information.</span></div>
        <div class="lesson"><b>Improve</b><span>Invest earlier in alternate routes, cyber recovery, and infrastructure redundancy.</span></div>
        <div class="lesson"><b>Discuss</b><span>How should leaders balance cost, public confidence, and continuity during uncertain threats?</span></div>
        <button id="review-again" class="primary-button wide" type="button">Run another mission</button>
      </aside>
    </div>
  `;
  $("#review-again").addEventListener("click",resetMission);
}

function renderThreatCatalog(): void {
  $("#threat-catalog").innerHTML = state.threats.map(threat=>`
    <article class="catalog-card">
      <div class="catalog-heading"><span class="threat-type">${threat.type}</span><span class="threat-level ${threat.severity}">${threat.severity}</span></div>
      <h2>${threat.title}</h2><p>${threat.summary}</p>
      <div class="catalog-meta"><span>Target: ${threat.target}</span><span>Status: ${threat.active ? threat.discovered ? "Detected" : "Unverified" : "Dormant"}</span></div>
    </article>
  `).join("");
}

function renderInfrastructureCatalog(): void {
  $("#infrastructure-catalog").innerHTML = state.infrastructure.map(item=>`
    <button class="catalog-card infrastructure-card" data-catalog-infra="${item.id}" type="button">
      <div class="catalog-heading"><span class="infra-icon">${item.icon}</span><span>${item.category}</span></div>
      <h2>${item.name}</h2>
      <div class="catalog-meta"><span>Health ${item.health}%</span><span>Capacity ${item.capacity}%</span></div>
    </button>
  `).join("") + poiTemplate.map(item=>`
    <button class="catalog-card infrastructure-card poi-card" data-catalog-poi="${item.id}" type="button">
      <div class="catalog-heading"><span class="infra-icon">${item.icon}</span><span>Point of interest</span></div>
      <h2>${item.name}</h2>
      <div class="catalog-meta"><span>Population ${item.people.toLocaleString()}</span><span>Criticality ${item.criticality}/5</span></div>
    </button>
  `).join("");
  document.querySelectorAll<HTMLButtonElement>("[data-catalog-infra]").forEach(button=>button.addEventListener("click",()=>renderDependencyInspector(button.dataset.catalogInfra!)));
  document.querySelectorAll<HTMLButtonElement>("[data-catalog-poi]").forEach(button=>button.addEventListener("click",()=>renderPoiInspector(button.dataset.catalogPoi!)));
  renderDependencyInspector("port");
}

function renderDependencyInspector(id: string): void {
  const item = infra(id);
  const dependents = state.infrastructure.filter(node=>node.dependencies.includes(id));
  $("#dependency-inspector").innerHTML = `
    <div class="inspector-header"><span>${item.icon}</span><div><small>${item.category}</small><h2>${item.name}</h2></div></div>
    <div class="inspector-stat"><span>Health</span><strong>${item.health}%</strong></div>
    <div class="inspector-stat"><span>Capacity</span><strong>${item.capacity}%</strong></div>
    <section><span>Depends on</span>${item.dependencies.map(dep=>`<button data-inspect="${dep}" type="button">${infra(dep).name}</button>`).join("") || "<p>No modeled dependencies.</p>"}</section>
    <section><span>Supports</span>${dependents.map(dep=>`<button data-inspect="${dep.id}" type="button">${dep.name}</button>`).join("") || "<p>No direct dependent modeled.</p>"}</section>
  `;
  document.querySelectorAll<HTMLButtonElement>("[data-inspect]").forEach(button=>button.addEventListener("click",()=>renderDependencyInspector(button.dataset.inspect!)));
}

function renderPoiInspector(id: string): void {
  const item = poiTemplate.find(poi=>poi.id===id)!;
  $("#dependency-inspector").innerHTML = `
    <div class="inspector-header"><span>${item.icon}</span><div><small>Point of interest</small><h2>${item.name}</h2></div></div>
    <div class="inspector-stat"><span>Modeled population</span><strong>${item.people.toLocaleString()}</strong></div>
    <div class="inspector-stat"><span>Criticality</span><strong>${item.criticality}/5</strong></div>
    <section><span>Planning considerations</span><p>Emergency access, communications, transportation, medical support, power, water, and public-information coordination.</p></section>
  `;
}

function advisorMessage(type: string): string {
  const active = state.threats.filter(item=>item.active);
  const worst = active.sort((a,b)=>severityRank(b.severity)-severityRank(a.severity))[0];
  if (type === "cyber") {
    return worst && (worst.type==="cyber" || worst.type==="ai")
      ? `Cyber advisor: ${worst.title} requires identity protection, segmentation, trusted backups, and coordinated recovery.`
      : "Cyber advisor: protect identity, data integrity, communications, and operational technology before an incident expands.";
  }
  if (type === "public") {
    return "Public-safety advisor: large gatherings and critical facilities require clear communication, medical access, transportation control, and life-safety prioritization.";
  }
  return "Logistics advisor: protect medical, food, fuel, and restoration cargo before optimizing general throughput.";
}

function switchView(view: string): void {
  document.querySelectorAll<HTMLElement>(".view").forEach(panel=>panel.classList.toggle("active", panel.id === `${view}-view`));
  document.querySelectorAll<HTMLButtonElement>(".nav-button").forEach(button=>button.classList.toggle("active", button.dataset.view===view));
  if (view === "threats") renderThreatCatalog();
  if (view === "infrastructure") renderInfrastructureCatalog();
  if (view === "review") renderReview();
}

function showToast(message: string): void {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(()=>toast.classList.remove("show"),2200);
}

function resetMission(): void {
  window.location.reload();
}

function setLayerVisibility(selector: string, visible: boolean): void {
  const layer = document.querySelector<HTMLElement>(selector);
  if (layer) layer.classList.toggle("layer-hidden", !visible);
}

renderAllocations();
renderMap();
renderFeed();
renderObjectives();
renderDecisionActions();
updateMetrics();

document.querySelectorAll<HTMLButtonElement>(".nav-button").forEach(button=>button.addEventListener("click",()=>switchView(button.dataset.view!)));
document.querySelectorAll<HTMLButtonElement>(".speed-button").forEach(button=>button.addEventListener("click",()=>{
  state.speed = Number(button.dataset.speed) as 1|2|4;
  document.querySelectorAll(".speed-button").forEach(item=>item.classList.remove("active"));
  button.classList.add("active");
  updateMetrics();
}));
document.querySelectorAll<HTMLButtonElement>(".advisor-tab").forEach(button=>button.addEventListener("click",()=>{
  document.querySelectorAll(".advisor-tab").forEach(item=>item.classList.remove("active"));
  button.classList.add("active");
  $("#advisor-message").textContent = advisorMessage(button.dataset.advisor!);
}));
$("#start-exercise").addEventListener("click",startExercise);
$("#pause-play").addEventListener("click",()=>{
  if (state.mode === "planning") return startExercise();
  if (state.mode === "review") return;
  state.running = !state.running;
  $("#pause-play").textContent = state.running ? "Pause" : "Resume";
  updateMetrics();
});
$("#new-mission").addEventListener("click",resetMission);
$("#clear-feed").addEventListener("click",()=>{state.feed=[];renderFeed();});
$("#help-button").addEventListener("click",()=>$("#guide-modal").classList.remove("hidden"));
$("#close-guide").addEventListener("click",()=>$("#guide-modal").classList.add("hidden"));
$("#print-review").addEventListener("click",()=>window.print());

let routesVisible = true;
let poiVisible = true;
let threatsVisible = true;
$("#toggle-routes").addEventListener("click",()=>{
  routesVisible = !routesVisible;
  $("#toggle-routes").classList.toggle("active", routesVisible);
  document.querySelectorAll(".route-line").forEach(item=>item.classList.toggle("layer-hidden",!routesVisible));
});
$("#toggle-poi").addEventListener("click",()=>{
  poiVisible = !poiVisible;
  $("#toggle-poi").classList.toggle("active",poiVisible);
  setLayerVisibility("#poi-layer",poiVisible);
});
$("#toggle-threats").addEventListener("click",()=>{
  threatsVisible = !threatsVisible;
  $("#toggle-threats").classList.toggle("active",threatsVisible);
  setLayerVisibility("#threat-layer",threatsVisible);
});

window.setInterval(simulationTick, 240);
