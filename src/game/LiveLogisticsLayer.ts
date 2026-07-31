import Phaser from "phaser";
import type {
  LogisticsAssetInfo,
  LogisticsMode,
  LogisticsStatus
} from "./types";

interface LogisticsAssetDefinition extends Omit<LogisticsAssetInfo, "status" | "operationalNote"> {
  color: number;
  speed: number;
  startProgress: number;
  path: Array<[number, number]>;
}

interface LogisticsAssetView {
  definition: LogisticsAssetDefinition;
  container: Phaser.GameObjects.Container;
  icon: Phaser.GameObjects.Graphics;
  halo: Phaser.GameObjects.Arc;
  statusDot: Phaser.GameObjects.Arc;
  statusLabel: Phaser.GameObjects.Text;
  points: Phaser.Math.Vector2[];
  segmentLengths: number[];
  totalLength: number;
  progress: number;
  status: LogisticsStatus;
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

const ASSETS: LogisticsAssetDefinition[] = [
  {
    id: "vessel-cascade",
    name: "MV Cascade",
    mode: "Vessel",
    route: "Coastal approach → Port Horizon → inland transfer",
    cargo: "Packaged food, medical supplies, and containerized goods",
    meaning: "A cargo vessel moves large quantities of goods between ports.",
    color: 0x45b7e8,
    speed: 35,
    startProgress: 0.08,
    path: [[82, 310], [155, 190], [445, 160], [82, 310]]
  },
  {
    id: "airlift-27",
    name: "SkyLift 27",
    mode: "Aircraft",
    route: "Skybridge Airport → Northstar Logistics Hub",
    cargo: "Urgent medicine, electronics, and time-sensitive parts",
    meaning: "Air cargo moves urgent or high-value goods quickly between hubs.",
    color: 0xe3b455,
    speed: 66,
    startProgress: 0.34,
    path: [[755, 210], [695, 465], [270, 450], [755, 210]]
  },
  {
    id: "freight-6",
    name: "PNW Freight 6",
    mode: "Freight train",
    route: "Riverbend Rail Junction → Cedar Distribution Center",
    cargo: "Grain, fuel, building materials, and industrial equipment",
    meaning: "A freight train moves heavy cargo efficiently across long inland routes.",
    color: 0x70c37d,
    speed: 42,
    startProgress: 0.58,
    path: [[445, 160], [270, 450], [155, 190], [445, 160]]
  },
  {
    id: "roadlink-14",
    name: "RoadLink 14",
    mode: "Truck",
    route: "Cedar Distribution Center → Northstar Logistics Hub → Skybridge Airport",
    cargo: "Groceries, hospital supplies, and priority replacement parts",
    meaning: "A truck handles flexible last-mile and alternate-route deliveries.",
    color: 0x9a89ef,
    speed: 50,
    startProgress: 0.76,
    path: [[270, 450], [695, 465], [755, 210], [270, 450]]
  }
];

const SCENARIO_EFFECTS: Record<string, Array<{ assetId: string; status: LogisticsStatus }>> = {
  "port-closure": [
    { assetId: "vessel-cascade", status: "Holding" },
    { assetId: "roadlink-14", status: "Rerouted" }
  ],
  "flood-corridor": [
    { assetId: "freight-6", status: "Delayed" },
    { assetId: "roadlink-14", status: "Rerouted" }
  ],
  "wildfire-smoke": [{ assetId: "airlift-27", status: "Holding" }],
  "cyber-logistics": [
    { assetId: "roadlink-14", status: "Delayed" },
    { assetId: "freight-6", status: "Delayed" }
  ],
  "fuel-shortage": [{ assetId: "roadlink-14", status: "Holding" }]
};

export class LiveLogisticsLayer {
  private readonly scene: Phaser.Scene;
  private readonly assets = new Map<string, LogisticsAssetView>();
  private selectedAssetId: string | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    this.drawLayerLabel();
    ASSETS.forEach((definition) => this.createAsset(definition));
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

  applyScenarioDisruption(scenarioId: string): void {
    const effects = SCENARIO_EFFECTS[scenarioId] ?? [];
    effects.forEach(({ assetId, status }) => this.setStatus(assetId, status));
  }

  resolveScenario(scenarioId: string, correct: boolean): void {
    const effects = SCENARIO_EFFECTS[scenarioId] ?? [];
    effects.forEach(({ assetId, status }) => {
      const resolvedStatus: LogisticsStatus = correct
        ? status === "Holding" || status === "Delayed"
          ? "Rerouted"
          : "In transit"
        : status === "Rerouted"
          ? "Delayed"
          : status;
      this.setStatus(assetId, resolvedStatus);
    });
  }

  setMissionComplete(): void {
    this.assets.forEach((asset) => this.setStatus(asset.definition.id, "Mission complete"));
  }

  private drawLayerLabel(): void {
    const panel = this.scene.add
      .rectangle(932, 116, 214, 30, 0x081725, 0.94)
      .setOrigin(1, 0)
      .setStrokeStyle(1, 0x2a4662, 0.9);
    const dot = this.scene.add.circle(735, 131, 4, STATUS_COLORS["In transit"], 1);
    const label = this.scene.add
      .text(746, 124, "LIVE LOGISTICS  •  SELECT AN ASSET", {
        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        color: "#9db2c7",
        fontStyle: "bold"
      })
      .setOrigin(0, 0);
    panel.setDepth(2);
    dot.setDepth(3);
    label.setDepth(3);
  }

  private createAsset(definition: LogisticsAssetDefinition): void {
    const points = definition.path.map(([x, y]) => new Phaser.Math.Vector2(x, y));
    const segmentLengths = points.slice(0, -1).map((point, index) =>
      Phaser.Math.Distance.Between(point.x, point.y, points[index + 1].x, points[index + 1].y)
    );
    const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);

    const container = this.scene.add.container(0, 0).setDepth(1);
    const halo = this.scene.add
      .circle(0, 0, 18, definition.color, 0.08)
      .setStrokeStyle(1, definition.color, 0.28);
    const icon = this.scene.add.graphics();
    this.drawAssetIcon(icon, definition.mode, definition.color);
    const statusDot = this.scene.add
      .circle(13, -13, 4, STATUS_COLORS["In transit"], 1)
      .setStrokeStyle(2, 0x07111f, 1);
    const statusLabel = this.scene.add
      .text(0, -27, "IN TRANSIT", {
        fontFamily: "Arial, sans-serif",
        fontSize: "8px",
        color: "#dcecff",
        backgroundColor: "#081725",
        padding: { x: 5, y: 3 },
        fontStyle: "bold"
      })
      .setOrigin(0.5, 1)
      .setVisible(false);

    container.add([halo, icon, statusDot, statusLabel]);
    container.setSize(52, 52);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-26, -26, 52, 52),
      Phaser.Geom.Rectangle.Contains
    );

    const view: LogisticsAssetView = {
      definition,
      container,
      icon,
      halo,
      statusDot,
      statusLabel,
      points,
      segmentLengths,
      totalLength,
      progress: definition.startProgress,
      status: "In transit"
    };
    this.assets.set(definition.id, view);

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
        asset.statusLabel.setVisible(
          asset.definition.id === definition.id || asset.status !== "In transit"
        );
      });
      statusLabel.setVisible(true);
      this.emitAssetFocus(view);
    });

    const start = this.pointAlongRoute(view, view.progress);
    container.setPosition(start.point.x, start.point.y);
    icon.setRotation(start.angle);
  }

  private drawAssetIcon(
    graphics: Phaser.GameObjects.Graphics,
    mode: LogisticsMode,
    color: number
  ): void {
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

  private pointAlongRoute(
    asset: LogisticsAssetView,
    progress: number
  ): { point: Phaser.Math.Vector2; angle: number } {
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

  private setStatus(assetId: string, status: LogisticsStatus): void {
    const asset = this.assets.get(assetId);
    if (!asset) return;

    asset.status = status;
    asset.statusDot.setFillStyle(STATUS_COLORS[status], 1);
    asset.statusLabel
      .setText(status.toUpperCase())
      .setColor(`#${STATUS_COLORS[status].toString(16).padStart(6, "0")}`)
      .setVisible(status !== "In transit" || this.selectedAssetId === assetId);

    if (this.selectedAssetId === assetId) this.emitAssetFocus(asset);
  }

  private emitAssetFocus(asset: LogisticsAssetView): void {
    const noteByStatus: Record<LogisticsStatus, string> = {
      "In transit": "The asset is moving on its planned route with no active restriction.",
      Delayed: "The asset is still moving, but at reduced speed because capacity or access is limited.",
      Holding: "The asset has stopped in a safe position until the route can be used again.",
      Rerouted: "The asset is moving along an alternate path to avoid the disrupted node.",
      "Mission complete": "The exercise has ended; the asset remains visible for review."
    };
    const payload: LogisticsAssetInfo = {
      id: asset.definition.id,
      name: asset.definition.name,
      mode: asset.definition.mode,
      status: asset.status,
      route: asset.definition.route,
      cargo: asset.definition.cargo,
      meaning: asset.definition.meaning,
      operationalNote: noteByStatus[asset.status]
    };
    this.scene.game.events.emit("logistics-focus", payload);
  }
}
