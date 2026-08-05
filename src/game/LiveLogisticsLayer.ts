import Phaser from "phaser";
import type {
  AmbientEventEffect,
  AssetRunPlan,
  LogisticsAssetInfo,
  MissionAssetDefinition,
  MissionWeather,
  LogisticsMode,
  ScenarioLogisticsEffect,
  LogisticsSnapshot,
  LogisticsStatus,
  LogisticsTransition,
  WeatherPhase
  ,WeatherRunPlan
} from "./types";

interface LogisticsAssetDefinition extends Omit<LogisticsAssetInfo, "status" | "operationalNote" | "routeState"> {
  alternateRoute: string;
  color: number;
  speed: number;
  startProgress: number;
  path: Array<[number, number]>;
  alternatePath: Array<[number, number]>;
  initialRoute?: "planned" | "alternate";
}

interface RouteMetrics {
  points: Phaser.Math.Vector2[];
  segmentLengths: number[];
  totalLength: number;
}

interface LogisticsAssetView extends RouteMetrics {
  definition: LogisticsAssetDefinition;
  container: Phaser.GameObjects.Container;
  icon: Phaser.GameObjects.Graphics;
  halo: Phaser.GameObjects.Arc;
  statusDot: Phaser.GameObjects.Arc;
  statusLabel: Phaser.GameObjects.Text;
  routeTrace: Phaser.GameObjects.Graphics;
  progress: number;
  status: LogisticsStatus;
  routeState: "Planned route" | "Alternate route";
  scenarioStatus: LogisticsStatus | null;
  scenarioNote: string | null;
  weatherStatus: LogisticsStatus | null;
  weatherNote: string | null;
  ambientEffects: Map<string, { status: LogisticsStatus; note: string }>;
  baselineAlternate: boolean;
  missionComplete: boolean;
  operationalNote: string;
}

interface ScenarioAssetEffect {
  assetId: string;
  activeStatus: LogisticsStatus;
  activeReason: string;
  correctStatus: LogisticsStatus;
  correctReason: string;
  incorrectStatus: LogisticsStatus;
  incorrectReason: string;
}

const STATUS_COLORS: Record<LogisticsStatus, number> = {
  "In transit": 0x65d59d,
  Delayed: 0xf0bd62,
  Holding: 0xff7d88,
  Rerouted: 0x77c8ff,
  "Mission complete": 0x9d8df1
};

const STATUS_SPEED: Record<LogisticsStatus, number> = {
  "In transit": 1,
  Delayed: 0.28,
  Holding: 0,
  Rerouted: 0.82,
  "Mission complete": 0.45
};

const STATUS_PRIORITY: Record<LogisticsStatus, number> = {
  "In transit": 0,
  Rerouted: 1,
  Delayed: 2,
  Holding: 3,
  "Mission complete": 4
};

const DEFAULT_NOTE: Record<LogisticsStatus, string> = {
  "In transit": "The asset is moving on its planned route with no active restriction.",
  Delayed: "The asset is still moving, but at reduced speed because capacity or access is limited.",
  Holding: "The asset has stopped in a safe position until the route can be used again.",
  Rerouted: "The asset is moving on a visible alternate route around the disrupted node.",
  "Mission complete": "The exercise has ended; the asset remains visible for review."
};

const ASSETS: LogisticsAssetDefinition[] = [
  {
    id: "vessel-cascade",
    name: "MV Cascade",
    mode: "Vessel",
    route: "Coastal approach → Port Horizon → inland transfer",
    alternateRoute: "Coastal holding area → secondary terminal → inland transfer",
    cargo: "Packaged food, medical supplies, and containerized goods",
    meaning: "A cargo vessel moves large quantities of goods between ports.",
    color: 0x45b7e8,
    speed: 35,
    startProgress: 0.08,
    path: [[82, 310], [155, 190], [445, 160], [82, 310]],
    alternatePath: [[82, 310], [92, 500], [270, 500], [445, 160], [82, 310]]
  },
  {
    id: "airlift-27",
    name: "SkyLift 27",
    mode: "Aircraft",
    route: "Skybridge Airport → Northstar Logistics Hub",
    alternateRoute: "Skybridge airspace → eastern diversion → Northstar Logistics Hub",
    cargo: "Urgent medicine, electronics, and time-sensitive parts",
    meaning: "Air cargo moves urgent or high-value goods quickly between hubs.",
    color: 0xe3b455,
    speed: 66,
    startProgress: 0.34,
    path: [[755, 210], [695, 465], [270, 450], [755, 210]],
    alternatePath: [[755, 210], [895, 125], [890, 390], [695, 465], [270, 450], [755, 210]]
  },
  {
    id: "freight-6",
    name: "PNW Freight 6",
    mode: "Freight train",
    route: "Riverbend Rail Junction → Cedar Distribution Center",
    alternateRoute: "Riverbend bypass → western interchange → Cedar Distribution Center",
    cargo: "Grain, fuel, building materials, and industrial equipment",
    meaning: "A freight train moves heavy cargo efficiently across long inland routes.",
    color: 0x70c37d,
    speed: 42,
    startProgress: 0.58,
    path: [[445, 160], [270, 450], [155, 190], [445, 160]],
    alternatePath: [[445, 160], [565, 315], [480, 520], [270, 450], [155, 190], [445, 160]]
  },
  {
    id: "roadlink-14",
    name: "RoadLink 14",
    mode: "Truck",
    route: "Cedar Distribution Center → Northstar Logistics Hub → Skybridge Airport",
    alternateRoute: "Cedar Distribution Center → Riverbend bypass → Skybridge Airport",
    cargo: "Groceries, hospital supplies, and priority replacement parts",
    meaning: "A truck handles flexible last-mile and alternate-route deliveries.",
    color: 0x9a89ef,
    speed: 50,
    startProgress: 0.76,
    path: [[270, 450], [695, 465], [755, 210], [270, 450]],
    alternatePath: [[270, 450], [445, 330], [755, 210], [695, 465], [270, 450]]
  }
];

const SCENARIO_EFFECTS: Record<string, ScenarioAssetEffect[]> = {
  "port-closure": [
    {
      assetId: "vessel-cascade",
      activeStatus: "Holding",
      activeReason: "The closed terminal prevents the vessel from unloading safely.",
      correctStatus: "Rerouted",
      correctReason: "Space was confirmed at a secondary terminal before the vessel changed course.",
      incorrectStatus: "Holding",
      incorrectReason: "No usable terminal capacity was secured, so the vessel remains offshore.",
    },
    {
      assetId: "roadlink-14",
      activeStatus: "Delayed",
      activeReason: "Missed port appointments have interrupted the truck's planned pickup sequence.",
      correctStatus: "Rerouted",
      correctReason: "Reserved road capacity now connects the secondary terminal to inland distribution.",
      incorrectStatus: "Delayed",
      incorrectReason: "The truck is waiting for cargo that remains tied to the closed terminal."
    }
  ],
  "flood-corridor": [
    {
      assetId: "freight-6",
      activeStatus: "Holding",
      activeReason: "The train stopped before entering the flooded rail segment.",
      correctStatus: "Rerouted",
      correctReason: "Priority cars were assigned to a verified rail bypass with available capacity.",
      incorrectStatus: "Delayed",
      incorrectReason: "The train remains queued because alternate rail capacity was not confirmed."
    },
    {
      assetId: "roadlink-14",
      activeStatus: "Delayed",
      activeReason: "Displaced rail freight is adding demand to the road network.",
      correctStatus: "Rerouted",
      correctReason: "Only priority loads were shifted to a checked road route.",
      incorrectStatus: "Holding",
      incorrectReason: "Unplanned freight transfers exceeded available truck and road capacity."
    }
  ],
  "wildfire-smoke": [
    {
      assetId: "airlift-27",
      activeStatus: "Holding",
      activeReason: "Unsafe visibility and ramp conditions prevent local cargo operations.",
      correctStatus: "Rerouted",
      correctReason: "Urgent cargo was diverted to a safer airport using verified thresholds.",
      incorrectStatus: "Holding",
      incorrectReason: "The aircraft cannot continue while local conditions remain unsafe."
    },
    {
      assetId: "roadlink-14",
      activeStatus: "Delayed",
      activeReason: "Smoke and flight changes have disrupted airport truck appointments.",
      correctStatus: "Rerouted",
      correctReason: "The truck is collecting urgent cargo from the alternate airport.",
      incorrectStatus: "Delayed",
      incorrectReason: "The truck remains tied to an airport that cannot accept the shipment."
    }
  ],
  "cyber-logistics": [
    {
      assetId: "roadlink-14",
      activeStatus: "Holding",
      activeReason: "Untrusted gate and inventory data prevent the truck from receiving a verified load.",
      correctStatus: "In transit",
      correctReason: "A tested manual fallback produced a verified dispatch instruction.",
      incorrectStatus: "Holding",
      incorrectReason: "The dispatch remains unverified because affected systems were not contained."
    },
    {
      assetId: "freight-6",
      activeStatus: "Delayed",
      activeReason: "The train is moving slowly while cargo records are checked manually.",
      correctStatus: "In transit",
      correctReason: "Verified records restored normal release and routing procedures.",
      incorrectStatus: "Delayed",
      incorrectReason: "Untrusted cargo records continue to slow train release."
    }
  ],
  "fuel-shortage": [
    {
      assetId: "roadlink-14",
      activeStatus: "Holding",
      activeReason: "The truck lacks enough allocated fuel to complete its normal route.",
      correctStatus: "Rerouted",
      correctReason: "Consolidated priority loads are moving on a shorter fuel-supported route.",
      incorrectStatus: "Holding",
      incorrectReason: "Fuel was not prioritized, so the truck remains unavailable."
    }
  ]
};

export class LiveLogisticsLayer {
  private readonly scene: Phaser.Scene;
  private readonly definitions: LogisticsAssetDefinition[];
  private readonly weather: MissionWeather | null;
  private readonly weatherPlan: WeatherRunPlan | null;
  private readonly assets = new Map<string, LogisticsAssetView>();
  private selectedAssetId: string | null = null;

  constructor(
    scene: Phaser.Scene,
    definitions: MissionAssetDefinition[] = [],
    weather: MissionWeather | null = null,
    assetPlans: AssetRunPlan[] = [],
    weatherPlan: WeatherRunPlan | null = null
  ) {
    this.scene = scene;
    this.weather = weather;
    this.weatherPlan = weatherPlan;
    const plans = new Map(assetPlans.map((plan) => [plan.assetId, plan]));
    this.definitions = definitions.length > 0
      ? definitions.map((definition) => {
          const plan = plans.get(definition.id);
          const route = (points: Array<[number, number]>) =>
            plan?.reverseDirection ? [...points].reverse() : points;
          return {
            ...definition,
            color: Phaser.Display.Color.HexStringToColor(definition.color).color,
            speed: definition.speed * (plan?.speedMultiplier ?? 1),
            startProgress: plan?.startProgress ?? definition.startProgress,
            path: route(definition.path),
            alternatePath: route(definition.alternatePath),
            initialRoute: plan?.initialRoute ?? "planned"
          };
        })
      : ASSETS.map((asset) => ({ ...asset, initialRoute: "planned" as const }));
  }

  create(): void {
    this.drawLayerLabel();
    this.definitions.forEach((definition) => this.createAsset(definition));
    this.emitSnapshot();
    this.scene.time.delayedCall(0, () => this.emitSnapshot());
  }

  update(delta: number): void {
    this.assets.forEach((asset) => {
      const speedMultiplier = STATUS_SPEED[asset.status];
      if (speedMultiplier > 0) {
        asset.progress =
          (asset.progress +
            (asset.definition.speed * speedMultiplier * (delta / 1000)) /
              asset.totalLength) %
          1;
      }

      const { point, angle } = this.pointAlongRoute(asset, asset.progress);
      asset.container.setPosition(point.x, point.y);
      asset.icon.setRotation(angle);
    });
  }

  applyScenarioDisruption(scenario: string | ScenarioLogisticsEffect[]): LogisticsTransition[] {
    const effects = typeof scenario === "string" ? SCENARIO_EFFECTS[scenario] ?? [] : scenario;
    const transitions = effects.map((effect) =>
      this.setScenarioStatus(effect.assetId, effect.activeStatus, effect.activeReason)
    ).filter((transition): transition is LogisticsTransition => transition !== null);
    this.emitSnapshot();
    return transitions;
  }

  resolveScenario(scenario: string | ScenarioLogisticsEffect[], correct: boolean): LogisticsTransition[] {
    const effects = typeof scenario === "string" ? SCENARIO_EFFECTS[scenario] ?? [] : scenario;
    const transitions = effects.map((effect) =>
      this.setScenarioStatus(
        effect.assetId,
        correct ? effect.correctStatus : effect.incorrectStatus,
        correct ? effect.correctReason : effect.incorrectReason
      )
    ).filter((transition): transition is LogisticsTransition => transition !== null);
    this.emitSnapshot();
    return transitions;
  }

  applyWeatherPhase(phase: WeatherPhase): LogisticsTransition[] {
    const weatherEffects: Record<WeatherPhase, Record<string, { status: LogisticsStatus; reason: string }>> = {
      approaching: {
        "vessel-cascade": { status: "Delayed", reason: "Increasing coastal winds are slowing the vessel's approach." },
        "airlift-27": { status: "Delayed", reason: "The aircraft is operating with additional wind checks and spacing." }
      },
      warning: {
        "vessel-cascade": { status: "Holding", reason: "High winds have stopped exposed port and vessel operations." },
        "airlift-27": { status: "Holding", reason: "Crosswinds exceed the exercise safety threshold for cargo operations." },
        "freight-6": { status: "Delayed", reason: "Wind inspections and debris checks are reducing rail speed." },
        "roadlink-14": { status: "Delayed", reason: "High-profile vehicles are moving at reduced speed in strong winds." }
      },
      clearing: {
        "vessel-cascade": { status: "Rerouted", reason: "The vessel is using a protected approach while the main terminal is inspected." },
        "airlift-27": { status: "Rerouted", reason: "The aircraft is using an alternate arrival path during recovery inspections." }
      }
    };

    const configuredEffects = this.weather?.phases[phase].assetEffects.filter((effect) =>
      !this.weatherPlan || this.weatherPlan.affectedAssetIds.includes(effect.assetId)
    );
    const activeEffects = configuredEffects
      ? Object.fromEntries(
          configuredEffects.map((effect) => [
            effect.assetId,
            { status: effect.status, reason: effect.reason }
          ])
        )
      : weatherEffects[phase];
    const transitions: LogisticsTransition[] = [];
    this.assets.forEach((asset) => {
      const effect = activeEffects[asset.definition.id];
      const previousStatus = asset.status;
      asset.weatherStatus = effect?.status ?? null;
      asset.weatherNote = effect?.reason ?? null;
      this.applyEffectiveStatus(asset);
      if (effect) {
        transitions.push(this.transitionFor(asset, previousStatus, effect.reason));
      }
    });
    this.emitSnapshot();
    return transitions;
  }

  applyAmbientEvent(eventId: string, effects: AmbientEventEffect[]): LogisticsTransition[] {
    const transitions = effects
      .map((effect) => {
        const asset = this.assets.get(effect.assetId);
        if (!asset) return null;
        const previousStatus = asset.status;
        asset.ambientEffects.set(eventId, { status: effect.status, note: effect.reason });
        this.applyEffectiveStatus(asset);
        return this.transitionFor(asset, previousStatus, effect.reason);
      })
      .filter((transition): transition is LogisticsTransition => transition !== null);
    this.emitSnapshot();
    return transitions;
  }

  clearAmbientEvent(eventId: string): LogisticsTransition[] {
    const transitions: LogisticsTransition[] = [];
    this.assets.forEach((asset) => {
      if (!asset.ambientEffects.has(eventId)) return;
      const previousStatus = asset.status;
      asset.ambientEffects.delete(eventId);
      this.applyEffectiveStatus(asset);
      transitions.push(this.transitionFor(asset, previousStatus, "The temporary inject ended and current route conditions were recalculated."));
    });
    this.emitSnapshot();
    return transitions;
  }

  setMissionComplete(): void {
    this.assets.forEach((asset) => {
      asset.missionComplete = true;
      this.applyEffectiveStatus(asset);
    });
    this.emitSnapshot();
  }

  private drawLayerLabel(): void {
    const panel = this.scene.add.rectangle(932, 116, 214, 30, 0x081725, 0.94)
      .setOrigin(1, 0)
      .setStrokeStyle(1, 0x2a4662, 0.9);
    const dot = this.scene.add.circle(735, 131, 4, STATUS_COLORS["In transit"], 1);
    const label = this.scene.add.text(746, 124, "LIVE LOGISTICS  •  SELECT AN ASSET", {
      fontFamily: "Arial, sans-serif",
      fontSize: "9px",
      color: "#9db2c7",
      fontStyle: "bold"
    }).setOrigin(0, 0);
    panel.setDepth(2);
    dot.setDepth(3);
    label.setDepth(3);
  }

  private createAsset(definition: LogisticsAssetDefinition): void {
    const baselineAlternate = definition.initialRoute === "alternate";
    const metrics = this.buildRouteMetrics(baselineAlternate ? definition.alternatePath : definition.path);
    const routeTrace = this.scene.add.graphics().setDepth(0.8);
    const container = this.scene.add.container(0, 0).setDepth(1);
    const halo = this.scene.add.circle(0, 0, 18, definition.color, 0.08)
      .setStrokeStyle(1, definition.color, 0.28);
    const icon = this.scene.add.graphics();
    this.drawAssetIcon(icon, definition.mode, definition.color);
    const statusDot = this.scene.add.circle(13, -13, 4, STATUS_COLORS["In transit"], 1)
      .setStrokeStyle(2, 0x07111f, 1);
    const statusLabel = this.scene.add.text(0, -27, "IN TRANSIT", {
      fontFamily: "Arial, sans-serif",
      fontSize: "8px",
      color: "#dcecff",
      backgroundColor: "#081725",
      padding: { x: 5, y: 3 },
      fontStyle: "bold"
    }).setOrigin(0.5, 1).setVisible(false);

    container.add([halo, icon, statusDot, statusLabel]);
    container.setSize(64, 64);
    container.setInteractive(new Phaser.Geom.Rectangle(-32, -32, 64, 64), Phaser.Geom.Rectangle.Contains);
    if (container.input) container.input.cursor = "pointer";

    const view: LogisticsAssetView = {
      definition,
      container,
      icon,
      halo,
      statusDot,
      statusLabel,
      routeTrace,
      ...metrics,
      progress: definition.startProgress,
      status: baselineAlternate ? "Rerouted" : "In transit",
      routeState: baselineAlternate ? "Alternate route" : "Planned route",
      scenarioStatus: null,
      scenarioNote: null,
      weatherStatus: null,
      weatherNote: null,
      ambientEffects: new Map(),
      baselineAlternate,
      missionComplete: false,
      operationalNote: baselineAlternate
        ? "The seeded operating plan began on a verified alternate route."
        : DEFAULT_NOTE["In transit"]
    };
    this.assets.set(definition.id, view);
    if (baselineAlternate) this.drawRouteTrace(view);
    this.applyEffectiveStatus(view);

    container.on("pointerover", () => {
      halo.setFillStyle(definition.color, 0.24);
      statusLabel.setVisible(true);
      this.emitAssetFocus(view);
    });
    container.on("pointerout", () => {
      halo.setFillStyle(definition.color, 0.08);
      statusLabel.setVisible(this.selectedAssetId === definition.id || view.status !== "In transit");
    });
    container.on("pointerdown", () => {
      this.selectedAssetId = definition.id;
      this.assets.forEach((asset) => {
        asset.statusLabel.setVisible(asset.definition.id === definition.id || asset.status !== "In transit");
      });
      statusLabel.setVisible(true);
      this.emitAssetFocus(view);
    });

    const start = this.pointAlongRoute(view, view.progress);
    container.setPosition(start.point.x, start.point.y);
    icon.setRotation(start.angle);
  }

  private drawAssetIcon(graphics: Phaser.GameObjects.Graphics, mode: LogisticsMode, color: number): void {
    graphics.fillStyle(0x07111f, 0.94);
    graphics.fillCircle(0, 0, 14);
    graphics.lineStyle(1, color, 0.9);
    graphics.strokeCircle(0, 0, 14);
    graphics.fillStyle(color, 1);

    if (mode === "Vessel") {
      graphics.fillTriangle(-10, -3, 10, -3, 6, 7);
      graphics.fillRect(-4, -8, 8, 5);
      return;
    }
    if (mode === "Aircraft") {
      graphics.fillTriangle(11, 0, -8, -4, -8, 4);
      graphics.fillTriangle(1, 0, -4, -10, -4, 10);
      return;
    }
    if (mode === "Freight train") {
      graphics.fillRoundedRect(-10, -7, 20, 13, 3);
      graphics.fillStyle(0x07111f, 1);
      graphics.fillRect(-6, -4, 5, 4);
      graphics.fillRect(2, -4, 5, 4);
      graphics.fillStyle(color, 1);
      graphics.fillCircle(-6, 8, 2.5);
      graphics.fillCircle(6, 8, 2.5);
      return;
    }
    graphics.fillRect(-11, -6, 13, 11);
    graphics.fillRoundedRect(2, -3, 9, 8, 2);
    graphics.fillCircle(-6, 7, 2.5);
    graphics.fillCircle(7, 7, 2.5);
  }

  private buildRouteMetrics(path: Array<[number, number]>): RouteMetrics {
    const points = path.map(([x, y]) => new Phaser.Math.Vector2(x, y));
    const segmentLengths = points.slice(0, -1).map((point, index) =>
      Phaser.Math.Distance.Between(point.x, point.y, points[index + 1].x, points[index + 1].y)
    );
    return {
      points,
      segmentLengths,
      totalLength: segmentLengths.reduce((sum, length) => sum + length, 0)
    };
  }

  private pointAlongRoute(asset: RouteMetrics, progress: number): { point: Phaser.Math.Vector2; angle: number } {
    let remaining = progress * asset.totalLength;
    for (let index = 0; index < asset.segmentLengths.length; index += 1) {
      const length = asset.segmentLengths[index];
      if (remaining <= length || index === asset.segmentLengths.length - 1) {
        const start = asset.points[index];
        const end = asset.points[index + 1];
        const localProgress = Phaser.Math.Clamp(remaining / length, 0, 1);
        return {
          point: new Phaser.Math.Vector2(
            Phaser.Math.Linear(start.x, end.x, localProgress),
            Phaser.Math.Linear(start.y, end.y, localProgress)
          ),
          angle: Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y)
        };
      }
      remaining -= length;
    }
    return { point: asset.points[0].clone(), angle: 0 };
  }

  private setScenarioStatus(assetId: string, status: LogisticsStatus, reason: string): LogisticsTransition | null {
    const asset = this.assets.get(assetId);
    if (!asset) return null;
    const previousStatus = asset.status;
    asset.scenarioStatus = status;
    asset.scenarioNote = reason;
    this.applyEffectiveStatus(asset);
    return this.transitionFor(asset, previousStatus, reason);
  }

  private transitionFor(asset: LogisticsAssetView, previousStatus: LogisticsStatus, reason: string): LogisticsTransition {
    return {
      assetId: asset.definition.id,
      name: asset.definition.name,
      mode: asset.definition.mode,
      previousStatus,
      status: asset.status,
      reason
    };
  }

  private applyEffectiveStatus(asset: LogisticsAssetView): void {
    const candidates = [
      asset.scenarioStatus ? { status: asset.scenarioStatus, note: asset.scenarioNote } : null,
      asset.weatherStatus ? { status: asset.weatherStatus, note: asset.weatherNote } : null,
      ...asset.ambientEffects.values()
    ].filter((candidate): candidate is { status: LogisticsStatus; note: string | null } => candidate !== null);

    const effective = asset.missionComplete
      ? { status: "Mission complete" as LogisticsStatus, note: DEFAULT_NOTE["Mission complete"] }
      : candidates.sort((a, b) => STATUS_PRIORITY[b.status] - STATUS_PRIORITY[a.status])[0] ??
        (asset.baselineAlternate
          ? { status: "Rerouted" as LogisticsStatus, note: "The seeded operating plan began on a verified alternate route." }
          : { status: "In transit" as LogisticsStatus, note: DEFAULT_NOTE["In transit"] });

    asset.status = effective.status;
    asset.operationalNote = effective.note ?? DEFAULT_NOTE[effective.status];
    const shouldUseAlternateRoute =
      asset.baselineAlternate ||
      asset.scenarioStatus === "Rerouted" ||
      asset.weatherStatus === "Rerouted" ||
      [...asset.ambientEffects.values()].some((effect) => effect.status === "Rerouted");
    this.activateRoute(asset, shouldUseAlternateRoute);

    asset.statusDot.setFillStyle(STATUS_COLORS[asset.status], 1);
    asset.statusLabel
      .setText(asset.status.toUpperCase())
      .setColor(`#${STATUS_COLORS[asset.status].toString(16).padStart(6, "0")}`)
      .setVisible(asset.status !== "In transit" || this.selectedAssetId === asset.definition.id);

    if (this.selectedAssetId === asset.definition.id) this.emitAssetFocus(asset);
  }

  private activateRoute(asset: LogisticsAssetView, alternate: boolean): void {
    const routeState = alternate ? "Alternate route" : "Planned route";
    if (asset.routeState === routeState) return;

    const currentPosition = new Phaser.Math.Vector2(asset.container.x, asset.container.y);
    const metrics = this.buildRouteMetrics(alternate ? asset.definition.alternatePath : asset.definition.path);
    asset.points = metrics.points;
    asset.segmentLengths = metrics.segmentLengths;
    asset.totalLength = metrics.totalLength;
    asset.progress = this.closestProgress(metrics, currentPosition);
    asset.routeState = routeState;
    this.drawRouteTrace(asset);
  }

  private closestProgress(route: RouteMetrics, position: Phaser.Math.Vector2): number {
    let closestProgress = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (let sample = 0; sample < 120; sample += 1) {
      const progress = sample / 120;
      const point = this.pointAlongRoute(route, progress).point;
      const distance = Phaser.Math.Distance.Between(position.x, position.y, point.x, point.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestProgress = progress;
      }
    }
    return closestProgress;
  }

  private drawRouteTrace(asset: LogisticsAssetView): void {
    asset.routeTrace.clear();
    if (asset.routeState !== "Alternate route") return;
    asset.routeTrace.lineStyle(2, asset.definition.color, 0.58);
    for (let segment = 0; segment < asset.points.length - 1; segment += 1) {
      const start = asset.points[segment];
      const end = asset.points[segment + 1];
      for (let dash = 0; dash < 10; dash += 2) {
        asset.routeTrace.lineBetween(
          Phaser.Math.Linear(start.x, end.x, dash / 10),
          Phaser.Math.Linear(start.y, end.y, dash / 10),
          Phaser.Math.Linear(start.x, end.x, (dash + 1) / 10),
          Phaser.Math.Linear(start.y, end.y, (dash + 1) / 10)
        );
      }
    }
  }

  private assetInfo(asset: LogisticsAssetView): LogisticsAssetInfo {
    return {
      id: asset.definition.id,
      name: asset.definition.name,
      mode: asset.definition.mode,
      status: asset.status,
      routeState: asset.routeState,
      route: asset.routeState === "Alternate route" ? asset.definition.alternateRoute : asset.definition.route,
      cargo: asset.definition.cargo,
      meaning: asset.definition.meaning,
      operationalNote: asset.operationalNote
    };
  }

  private emitAssetFocus(asset: LogisticsAssetView): void {
    this.scene.game.events.emit("logistics-focus", this.assetInfo(asset));
  }

  private emitSnapshot(): void {
    const assets = [...this.assets.values()].map((asset) => this.assetInfo(asset));
    const snapshot: LogisticsSnapshot = {
      assets,
      moving: assets.filter((asset) => asset.status === "In transit" || asset.status === "Rerouted").length,
      delayed: assets.filter((asset) => asset.status === "Delayed").length,
      holding: assets.filter((asset) => asset.status === "Holding").length,
      rerouted: assets.filter((asset) => asset.routeState === "Alternate route").length
    };
    this.scene.game.events.emit("logistics-snapshot", snapshot);
  }
}
