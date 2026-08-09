import Phaser from "phaser";
import { cursorUpdate, haversineMiles, MAP_BOUNDS, screenToGeographic } from "./geo";
import type { GeoCursorUpdate, GeoMeasurementUpdate, GisToolMode, MissionRunPlan, Scenario } from "./types";

export class GISOverlayLayer {
  private readonly scene: Phaser.Scene;
  private readonly runPlan: MissionRunPlan;
  private readonly scenarios: Scenario[];
  private grid!: Phaser.GameObjects.Container;
  private analysis!: Phaser.GameObjects.Graphics;
  private tool: GisToolMode = "navigate";
  private measureStart: GeoCursorUpdate | null = null;
  private lastCursorEmit = 0;

  constructor(scene: Phaser.Scene, runPlan: MissionRunPlan) {
    this.scene = scene;
    this.runPlan = runPlan;
    const activeIds = new Set(runPlan.activeScenarioIds);
    this.scenarios = runPlan.scenarios.filter((scenario) => activeIds.has(scenario.id));
  }

  create(): void {
    this.createCoordinateGrid();
    this.analysis = this.scene.add.graphics().setDepth(7.5);
    this.setGridVisible(false);
    this.scene.game.events.emit("gis-tool-state", this.tool);
  }

  inspectAt(x: number, y: number): void {
    if (!this.insideMap(x, y)) return;
    const now = performance.now();
    if (now - this.lastCursorEmit < 60) return;
    this.lastCursorEmit = now;
    this.scene.game.events.emit("gis-cursor", cursorUpdate(x, y, this.runPlan.mission.geography));
  }

  handlePointerDown(x: number, y: number): boolean {
    if (this.tool === "navigate" || !this.insideMap(x, y)) return false;
    if (this.tool === "identify") this.identify(x, y);
    else this.measure(x, y);
    return true;
  }

  setTool(tool: GisToolMode): void {
    this.tool = tool;
    if (tool !== "measure") this.measureStart = null;
    this.analysis.clear();
    this.scene.game.events.emit("gis-tool-state", tool);
  }

  isNavigationMode(): boolean {
    return this.tool === "navigate";
  }

  setGridVisible(visible: boolean): void {
    this.grid.setVisible(visible);
  }

  clear(): void {
    this.measureStart = null;
    this.analysis.clear();
    const update: GeoMeasurementUpdate = { state: "cleared", distanceMiles: null, start: null, end: null };
    this.scene.game.events.emit("gis-measurement", update);
    this.scene.game.events.emit("gis-identify", null);
  }

  private createCoordinateGrid(): void {
    this.grid = this.scene.add.container(0, 0);
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(1, 0x62c7e8, 0.24);
    for (let column = 1; column < 10; column += 1) {
      const x = MAP_BOUNDS.left + (MAP_BOUNDS.right - MAP_BOUNDS.left) * column / 10;
      graphics.lineBetween(x, MAP_BOUNDS.top, x, MAP_BOUNDS.bottom);
    }
    for (let row = 1; row < 10; row += 1) {
      const y = MAP_BOUNDS.top + (MAP_BOUNDS.bottom - MAP_BOUNDS.top) * row / 10;
      graphics.lineBetween(MAP_BOUNDS.left, y, MAP_BOUNDS.right, y);
    }
    this.grid.add(graphics);

    for (let column = 0; column < 10; column += 1) {
      const label = String.fromCharCode(65 + column);
      const x = MAP_BOUNDS.left + (MAP_BOUNDS.right - MAP_BOUNDS.left) * (column + 0.5) / 10;
      this.grid.add(this.gridLabel(x, MAP_BOUNDS.top + 6, label).setOrigin(0.5, 0));
    }
    for (let row = 0; row < 10; row += 1) {
      const y = MAP_BOUNDS.top + (MAP_BOUNDS.bottom - MAP_BOUNDS.top) * (row + 0.5) / 10;
      this.grid.add(this.gridLabel(MAP_BOUNDS.left + 6, y, String(row + 1).padStart(2, "0")).setOrigin(0, 0.5));
    }
    this.grid.setDepth(2.8);
  }

  private gridLabel(x: number, y: number, text: string): Phaser.GameObjects.Text {
    return this.scene.add.text(x, y, text, {
      fontFamily: "Arial, sans-serif",
      fontSize: "8px",
      color: "#7bd6ef",
      backgroundColor: "#07111fcc",
      padding: { x: 3, y: 2 }
    });
  }

  private identify(x: number, y: number): void {
    const selected = cursorUpdate(x, y, this.runPlan.mission.geography);
    const selectedGeo = screenToGeographic(x, y, this.runPlan.mission.geography);
    const nearest = this.scenarios
      .map((scenario) => {
        const scenarioGeo = screenToGeographic(scenario.x, scenario.y, this.runPlan.mission.geography);
        return { scenario, distanceMiles: haversineMiles(selectedGeo, scenarioGeo) };
      })
      .sort((a, b) => a.distanceMiles - b.distanceMiles)[0];

    this.analysis.clear();
    this.analysis.lineStyle(2, 0x7bd6ef, 0.95).strokeCircle(x, y, 12);
    this.analysis.lineBetween(x - 18, y, x + 18, y);
    this.analysis.lineBetween(x, y - 18, x, y + 18);
    if (nearest) this.analysis.lineStyle(1, 0x7bd6ef, 0.45).lineBetween(x, y, nearest.scenario.x, nearest.scenario.y);

    this.scene.game.events.emit("gis-identify", {
      ...selected,
      nearestNode: nearest?.scenario.title ?? "No decision node",
      nodeType: nearest?.scenario.nodeType ?? "Outside active network",
      distanceMiles: nearest ? Math.round(nearest.distanceMiles * 10) / 10 : 0
    });
  }

  private measure(x: number, y: number): void {
    const point = cursorUpdate(x, y, this.runPlan.mission.geography);
    if (!this.measureStart) {
      this.measureStart = point;
      this.analysis.clear();
      this.analysis.fillStyle(0xf0bd62, 1).fillCircle(x, y, 6);
      this.analysis.lineStyle(1, 0xf0bd62, 0.7).strokeCircle(x, y, 13);
      this.scene.game.events.emit("gis-measurement", {
        state: "awaiting-second",
        distanceMiles: null,
        start: point,
        end: null
      } satisfies GeoMeasurementUpdate);
      return;
    }

    const distanceMiles = haversineMiles(this.measureStart, point);
    this.analysis.clear();
    this.analysis.lineStyle(3, 0xf0bd62, 0.95).lineBetween(this.measureStart.x, this.measureStart.y, x, y);
    this.analysis.fillStyle(0xf0bd62, 1).fillCircle(this.measureStart.x, this.measureStart.y, 6).fillCircle(x, y, 6);
    const midpointX = (this.measureStart.x + x) / 2;
    const midpointY = (this.measureStart.y + y) / 2;
    this.analysis.fillStyle(0x07111f, 0.9).fillRoundedRect(midpointX - 35, midpointY - 12, 70, 24, 6);
    const label = this.scene.add.text(midpointX, midpointY, `${distanceMiles.toFixed(1)} mi`, {
      fontFamily: "Arial, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#ffe1a2"
    }).setOrigin(0.5).setDepth(7.6);
    this.scene.time.delayedCall(7000, () => label.destroy());
    this.scene.game.events.emit("gis-measurement", {
      state: "complete",
      distanceMiles: Math.round(distanceMiles * 10) / 10,
      start: this.measureStart,
      end: point
    } satisfies GeoMeasurementUpdate);
    this.measureStart = null;
  }

  private insideMap(x: number, y: number): boolean {
    return x >= MAP_BOUNDS.left && x <= MAP_BOUNDS.right && y >= MAP_BOUNDS.top && y <= MAP_BOUNDS.bottom;
  }
}
