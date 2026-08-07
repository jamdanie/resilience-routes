import Phaser from "phaser";
import type { ConsequenceLensUpdate, MissionRunPlan, Scenario } from "./types";

interface ConsequenceNodeView {
  scenario: Scenario;
  container: Phaser.GameObjects.Container;
}

interface ConsequenceRoute {
  from: [number, number];
  to: [number, number];
  color: number;
}

export class ConsequenceLensLayer {
  private readonly scene: Phaser.Scene;
  private readonly runPlan: MissionRunPlan;
  private readonly nodes: ConsequenceNodeView[];
  private readonly graphics: Phaser.GameObjects.Graphics;
  private enabled = true;
  private focusedNode: ConsequenceNodeView | null = null;
  private routes: ConsequenceRoute[] = [];
  private flow = 0;

  constructor(scene: Phaser.Scene, runPlan: MissionRunPlan, nodes: ConsequenceNodeView[]) {
    this.scene = scene;
    this.runPlan = runPlan;
    this.nodes = nodes;
    this.graphics = scene.add.graphics().setDepth(3.15);
  }

  update(delta: number): void {
    if (!this.enabled || this.routes.length === 0) return;
    this.flow = (this.flow + delta / 1800) % 1;
    this.drawFlow();
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    this.focus(this.focusedNode);
    return this.enabled;
  }

  focus(node: ConsequenceNodeView | null): void {
    this.focusedNode = node;
    this.routes = [];
    this.graphics.clear();
    this.nodes.forEach((candidate) => candidate.container.setAlpha(1));

    if (!this.enabled || !node) {
      this.scene.game.events.emit("consequence-lens-update", null);
      return;
    }

    const origin: [number, number] = [node.scenario.x, node.scenario.y + 30];
    this.routes = this.runPlan.mission.routes
      .map((route) => {
        const fromDistance = Phaser.Math.Distance.Between(origin[0], origin[1], route.from[0], route.from[1]);
        const toDistance = Phaser.Math.Distance.Between(origin[0], origin[1], route.to[0], route.to[1]);
        if (Math.min(fromDistance, toDistance) > 95) return null;
        const forward = fromDistance <= toDistance;
        return {
          from: (forward ? route.from : route.to) as [number, number],
          to: (forward ? route.to : route.from) as [number, number],
          color: Phaser.Display.Color.HexStringToColor(route.color).color
        };
      })
      .filter((route): route is ConsequenceRoute => route !== null);

    const connectedScenarios = this.routes
      .map(({ to }) => this.nearestScenarioTo(to, node.scenario.id))
      .filter((scenario): scenario is Scenario => scenario !== null);

    this.nodes.forEach((candidate) => {
      const point: [number, number] = [candidate.scenario.x, candidate.scenario.y + 30];
      const connected = this.routes.some(({ to }) =>
        Phaser.Math.Distance.Between(point[0], point[1], to[0], to[1]) <= 105
      );
      if (candidate !== node && !connected) candidate.container.setAlpha(0.34);
    });

    const uniqueNodes = [...new Map(connectedScenarios.map((scenario) => [scenario.title, scenario])).values()];
    const affectedAssets = node.scenario.logisticsEffects
      .map((effect) => this.runPlan.mission.assets.find((asset) => asset.id === effect.assetId)?.name)
      .filter((name): name is string => Boolean(name));
    const update: ConsequenceLensUpdate = {
      scenarioId: node.scenario.id,
      title: node.scenario.title,
      exposure: node.scenario.basePenalty >= 18 ? "high" : node.scenario.basePenalty >= 13 ? "elevated" : "guarded",
      routeCount: this.routes.length,
      connectedNodes: uniqueNodes.map((scenario) => ({ title: scenario.title, nodeType: scenario.nodeType })),
      affectedAssets: [...new Set(affectedAssets)],
      consequence: node.scenario.cascadeSteps.at(-1) ?? node.scenario.how,
      confidence: node.scenario.intelligence?.confidence ?? "moderate"
    };
    this.drawFlow();
    this.scene.game.events.emit("consequence-lens-update", update);
  }

  private nearestScenarioTo(point: [number, number], excludeId: string): Scenario | null {
    const candidate = this.runPlan.scenarios
      .filter((scenario) => scenario.id !== excludeId)
      .map((scenario) => ({
        scenario,
        distance: Phaser.Math.Distance.Between(point[0], point[1], scenario.x, scenario.y + 30)
      }))
      .sort((a, b) => a.distance - b.distance)[0];
    return candidate && candidate.distance <= 105 ? candidate.scenario : null;
  }

  private drawFlow(): void {
    this.graphics.clear();
    this.routes.forEach((route, index) => {
      const [[x1, y1], [x2, y2]] = [route.from, route.to];
      this.graphics.lineStyle(11, route.color, 0.08);
      this.graphics.lineBetween(x1, y1, x2, y2);
      this.graphics.lineStyle(3, route.color, 0.92);
      this.graphics.lineBetween(x1, y1, x2, y2);
      const progress = (this.flow + index * 0.21) % 1;
      this.graphics.fillStyle(0xe6f6ff, 1);
      this.graphics.fillCircle(
        Phaser.Math.Linear(x1, x2, progress),
        Phaser.Math.Linear(y1, y2, progress),
        4
      );
    });
  }
}
