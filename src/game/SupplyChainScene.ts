import Phaser from "phaser";
import { difficultySettings } from "./config";
import { AmbientEventSystem } from "./AmbientEventSystem";
import { LiveLogisticsLayer } from "./LiveLogisticsLayer";
import { MapSurfaceLayer, type MapSurfaceMode } from "./MapSurfaceLayer";
import { formatResourceCost, StrategicResourceSystem } from "./StrategicResourceSystem";
import { WeatherSystemLayer } from "./WeatherSystemLayer";
import type {
  DecisionRecord,
  Difficulty,
  GameReport,
  HudUpdate,
  LogisticsTransition,
  MissionRunPlan,
  Scenario
  ,ScheduledAmbientEvent
} from "./types";

interface NodeView {
  scenario: Scenario;
  container: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Rectangle;
  card: Phaser.GameObjects.Rectangle;
  accent: Phaser.GameObjects.Rectangle;
  type: Phaser.GameObjects.Text;
  status: Phaser.GameObjects.Text;
  label: Phaser.GameObjects.Text;
  accentColor: number;
  active: boolean;
  completed: boolean;
}

interface ChallengeRequest {
  scenario: Scenario;
  showHint: boolean;
  resources: ReturnType<StrategicResourceSystem["snapshot"]>;
  intelligence: {
    confidence: "low" | "moderate" | "high";
    confirmed: string;
    uncertainty: string;
    verificationFinding: string;
    forecast: string;
    cost: number;
    disruptionReduction: number;
  };
  verifyIntelligence: () => ReturnType<StrategicResourceSystem["snapshot"]> | null;
  scoring: {
    currentResilience: number;
    basePenalty: number;
    disruptionLoss: number;
    disruptionMultiplier: number;
    responseRecovery: number;
    wrongAnswerPenalty: number;
  };
  resolve: (selectedIndex: number, intelligenceVerified: boolean) => void;
}

export class SupplyChainScene extends Phaser.Scene {
  private readonly difficulty: Difficulty;
  private readonly runPlan: MissionRunPlan;
  private readonly settings;
  private player!: Phaser.GameObjects.Arc;
  private playerHalo!: Phaser.GameObjects.Arc;
  private playerLabel!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private guideKey!: Phaser.Input.Keyboard.Key;
  private nodes: NodeView[] = [];
  private focusedNode: NodeView | null = null;
  private nodeDisplayMode: "compact" | "detail" = "compact";
  private promptText!: Phaser.GameObjects.Text;
  private challengeOpen = false;
  private resilience = 0;
  private completed = 0;
  private remainingSeconds: number | null = null;
  private elapsedSeconds = 0;
  private decisions: DecisionRecord[] = [];
  private ambientEventRecords: GameReport["ambientEvents"] = [];
  private timerAccumulatorMs = 0;
  private finished = false;
  private logisticsLayer!: LiveLogisticsLayer;
  private weatherLayer!: WeatherSystemLayer;
  private ambientEvents!: AmbientEventSystem;
  private surfaceLayer!: MapSurfaceLayer;
  private strategicResources!: StrategicResourceSystem;
  private pendingConsequence: { source: string; penalty: number; text: string } | null = null;

  constructor(difficulty: Difficulty, runPlan: MissionRunPlan) {
    super("SupplyChainScene");
    this.difficulty = difficulty;
    this.runPlan = runPlan;
    const baseSettings = difficultySettings[difficulty];
    this.settings = {
      ...baseSettings,
      startingResilience: Phaser.Math.Clamp(
        baseSettings.startingResilience + runPlan.condition.startingResilienceAdjustment,
        0,
        100
      ),
      disruptionMultiplier:
        baseSettings.disruptionMultiplier * runPlan.condition.disruptionMultiplier,
      correctAnswerRecovery: Math.max(
        0,
        baseSettings.correctAnswerRecovery + runPlan.condition.recoveryAdjustment
      ),
      wrongAnswerPenalty: Math.max(
        0,
        baseSettings.wrongAnswerPenalty + runPlan.condition.wrongAnswerAdjustment
      )
    };
  }

  create(): void {
    this.challengeOpen = false;
    this.resilience = this.settings.startingResilience;
    this.completed = 0;
    this.remainingSeconds = this.settings.timeLimitSeconds;
    this.elapsedSeconds = 0;
    this.decisions = [];
    this.ambientEventRecords = [];
    this.timerAccumulatorMs = 0;
    this.finished = false;
    this.pendingConsequence = null;
    this.strategicResources = new StrategicResourceSystem(this.difficulty);

    this.drawWorld();
    this.logisticsLayer = new LiveLogisticsLayer(
      this,
      this.runPlan.mission.assets,
      this.runPlan.mission.weather,
      this.runPlan.assetPlans,
      this.runPlan.weatherPlan
    );
    this.logisticsLayer.create();
    this.weatherLayer = new WeatherSystemLayer(this, (phase) => {
      const transitions = this.logisticsLayer.applyWeatherPhase(phase);
      this.emitTransportationUpdate("Weather effect", transitions, phase === "warning" ? "critical" : "info");
    }, this.runPlan.mission.weather, this.runPlan.weatherPlan);
    this.weatherLayer.create();
    this.ambientEvents = new AmbientEventSystem(
      this,
      this.runPlan.ambientEvents,
      (event) => this.startAmbientEvent(event),
      (event) => this.endAmbientEvent(event)
    );
    this.ambientEvents.create();
    this.createNodes();
    this.createPlayer();
    this.createControls();
    this.createPrompt();
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.weatherLayer.inspectAt(pointer.worldX, pointer.worldY);
    });
    this.game.events.on("cycle-map-mode", () => {
      const mode = this.surfaceLayer.cycleMode();
      this.game.events.emit("map-surface-mode", mode);
    });
    this.game.events.on("set-map-mode", (mode: MapSurfaceMode) => {
      const selected = this.surfaceLayer.setMode(mode);
      this.game.events.emit("map-surface-mode", selected);
    });
    this.game.events.on("cycle-node-display", () => {
      this.nodeDisplayMode = this.nodeDisplayMode === "compact" ? "detail" : "compact";
      this.nodes.forEach((node) => this.applyNodePresentation(node, this.nodeDisplayMode === "detail"));
      this.game.events.emit("node-display-mode", this.nodeDisplayMode);
    });
    this.game.events.on("investigate-node", (scenarioId: string) => {
      const node = this.nodes.find(({ scenario }) => scenario.id === scenarioId);
      if (node) this.openChallenge(node);
    });
    this.emitHud();
    this.game.events.emit("resources-update", this.strategicResources.snapshot());

    this.game.events.emit("mission-log", {
      level: "info",
      text: `${this.runPlan.condition.title}: ${this.runPlan.condition.summary} Mission seed ${this.runPlan.seed}.`
    });
    this.game.events.emit("mission-started", this.runPlan);
    this.game.events.emit("game-ready");
  }

  update(_time: number, delta: number): void {
    this.weatherLayer.update(delta);
    this.logisticsLayer.update(delta);
    this.ambientEvents.update(delta);
    if (this.finished || this.challengeOpen) return;

    this.updateMovement(delta);
    this.updateNearbyPrompt();

    this.timerAccumulatorMs += delta;
    if (this.timerAccumulatorMs >= 1000) {
      const secondsElapsed = Math.floor(this.timerAccumulatorMs / 1000);
      this.timerAccumulatorMs -= secondsElapsed * 1000;
      this.elapsedSeconds += secondsElapsed;

      if (this.remainingSeconds !== null) {
        this.remainingSeconds = Math.max(
          0,
          this.remainingSeconds - secondsElapsed
        );

        if (this.remainingSeconds <= 0) {
          this.emitHud();
          this.finishGame("time-expired");
          return;
        }
      }

      this.emitHud();
    }
  }

  private drawWorld(): void {
    this.cameras.main.setBackgroundColor("#07111f");

    const background = this.add.graphics();
    background.fillGradientStyle(0x0a1728, 0x0a1728, 0x10243a, 0x10243a, 1);
    background.fillRect(0, 0, 960, 600);

    background.lineStyle(1, 0x27405b, 0.28);
    for (let x = 0; x <= 960; x += 48) background.lineBetween(x, 96, x, 600);
    for (let y = 96; y <= 600; y += 48) background.lineBetween(0, y, 960, y);

    this.surfaceLayer = new MapSurfaceLayer(this, this.runPlan.mission.id);
    this.surfaceLayer.create();

    background.fillStyle(0x0d1c2f, 0.98);
    background.fillRoundedRect(20, 18, 920, 70, 14);
    background.lineStyle(1, 0x355474, 0.7);
    background.strokeRoundedRect(20, 18, 920, 70, 14);

    this.drawRoutes();

    this.add.text(48, 33, this.runPlan.mission.mapTitle.toUpperCase(), {
      fontFamily: "Arial, sans-serif",
      fontSize: "20px",
      color: "#f2f7ff",
      fontStyle: "bold"
    });

    this.add.text(
      48,
      61,
      "Investigate connected infrastructure, define the risk, and choose a response.",
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#94abc2"
      }
    );

    this.add
      .text(900, 42, `SEED ${this.runPlan.seed}`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        color: "#77c8ff",
        fontStyle: "bold"
      })
      .setOrigin(1, 0.5);

    this.add
      .text(900, 65, this.runPlan.mission.mapSubtitle.toUpperCase(), {
        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        color: "#718ba4"
      })
      .setOrigin(1, 0.5);

    this.drawLegend();
  }

  private drawRoutes(): void {
    const routes = this.runPlan.mission.routes.map((route) => ({
      ...route,
      colorValue: Phaser.Display.Color.HexStringToColor(route.color).color
    }));

    const routeLayer = this.add.graphics().setDepth(0.3);
    for (const route of routes) {
      const [[x1, y1], [x2, y2]] = [route.from, route.to];
      routeLayer.lineStyle(8, 0x07111f, 0.95);
      routeLayer.lineBetween(x1, y1, x2, y2);
      routeLayer.lineStyle(3, route.colorValue, 0.62);
      routeLayer.lineBetween(x1, y1, x2, y2);
    }

    const flowLayer = this.add.graphics().setDepth(0.31);
    flowLayer.lineStyle(1, 0x9ccdf1, 0.22);
    routes.forEach((route) => {
      const [[x1, y1], [x2, y2]] = [route.from, route.to];
      const segments = 12;
      for (let index = 0; index < segments; index += 2) {
        const start = index / segments;
        const end = Math.min(1, (index + 1) / segments);
        flowLayer.lineBetween(
          Phaser.Math.Linear(x1, x2, start),
          Phaser.Math.Linear(y1, y2, start),
          Phaser.Math.Linear(x1, x2, end),
          Phaser.Math.Linear(y1, y2, end)
        );
      }
    });
  }

  private drawLegend(): void {
    const legend = this.add.container(30, 105);
    legend.setDepth(3);
    const panel = this.add
      .rectangle(0, 0, 162, 48, 0x0b192a, 0.92)
      .setOrigin(0)
      .setStrokeStyle(1, 0x2a4662, 0.9);
    const dotOpen = this.add.circle(15, 16, 5, 0x45b7e8, 1);
    const dotDone = this.add.circle(15, 33, 5, 0x70c37d, 1);
    const openText = this.add.text(28, 10, "UNRESOLVED NODE", {
      fontFamily: "Arial, sans-serif",
      fontSize: "9px",
      color: "#9db2c7"
    });
    const doneText = this.add.text(28, 27, "STABILIZED NODE", {
      fontFamily: "Arial, sans-serif",
      fontSize: "9px",
      color: "#9db2c7"
    });
    legend.add([panel, dotOpen, dotDone, openText, doneText]);
  }

  private createNodes(): void {
    const activeIds = new Set(this.runPlan.activeScenarioIds);
    const activeScenarios = this.runPlan.scenarios.filter((scenario) => activeIds.has(scenario.id));
    const positions = this.layoutActiveNodes(activeScenarios);
    this.nodes = activeScenarios.map((scenario) => {
      const position = positions.get(scenario.id) ?? { x: scenario.x, y: scenario.y + 30 };
      const container = this.add.container(position.x, position.y);
      container.setDepth(4);
      const accentColor = Phaser.Display.Color.HexStringToColor(scenario.color).color;

      const shadow = this.add
        .rectangle(3, 5, 132, 64, 0x020711, 0.35)
        .setOrigin(0.5);

      const card = this.add
        .rectangle(0, 0, 132, 64, 0x122238, 0.96)
        .setStrokeStyle(2, 0x466681, 1)
        .setOrigin(0.5);

      const accent = this.add
        .rectangle(-59, 0, 5, 46, accentColor, 1)
        .setOrigin(0.5);

      const type = this.add
        .text(-49, -19, scenario.nodeType.toUpperCase(), {
          fontFamily: "Arial, sans-serif",
          fontSize: "8px",
          color: "#8ca4bc",
          fontStyle: "bold"
        })
        .setOrigin(0, 0.5);

      const label = this.add
        .text(-49, 0, scenario.title, {
          fontFamily: "Arial, sans-serif",
          fontSize: "11px",
          color: "#f2f7ff",
          fontStyle: "bold",
          wordWrap: { width: 96 }
        })
        .setOrigin(0, 0.5);

      const status = this.add
        .text(-49, 21, "SELECT", {
          fontFamily: "Arial, sans-serif",
          fontSize: "8px",
          color: scenario.color,
          fontStyle: "bold"
        })
        .setOrigin(0, 0.5);

      container.add([shadow, card, accent, type, label, status]);
      container.setSize(150, 82);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-75, -41, 150, 82),
        Phaser.Geom.Rectangle.Contains
      );
      if (container.input) container.input.cursor = "pointer";

      const node: NodeView = {
        scenario,
        container,
        shadow,
        card,
        accent,
        type,
        status,
        label,
        accentColor,
        active: true,
        completed: false
      };

      container.on("pointerover", () => {
        if (!node.active) return;
        this.setFocusedNode(node);
        if (!this.finished && !node.completed) {
          card.setStrokeStyle(2, accentColor, 1);
          container.setScale(1.035);
        }
        this.game.events.emit("node-focus", scenario, !node.completed);
      });

      container.on("pointerout", () => {
        if (this.finished || node.completed || !node.active) return;
        if (this.focusedNode === node) this.setFocusedNode(null);
        card.setStrokeStyle(2, 0x466681, 1);
        container.setScale(1);
      });

      container.on("pointerdown", () => {
        this.setFocusedNode(node);
        this.game.events.emit("node-focus", scenario, !node.completed);
        if (node.active && !node.completed) this.openChallenge(node);
      });

      return node;
    });
  }

  private setFocusedNode(node: NodeView | null): void {
    if (this.focusedNode === node) return;
    const previous = this.focusedNode;
    this.focusedNode = node;
    if (previous) this.applyNodePresentation(previous, this.nodeDisplayMode === "detail");
    if (node) this.applyNodePresentation(node, true);
  }

  private applyNodePresentation(node: NodeView, expanded: boolean): void {
    const width = expanded ? 164 : 132;
    const height = expanded ? 88 : 64;
    const left = expanded ? -61 : -49;
    node.shadow.setSize(width, height).setPosition(3, expanded ? 6 : 5);
    node.card.setSize(width, height);
    node.accent.setSize(expanded ? 6 : 5, expanded ? 68 : 46).setX(expanded ? -74 : -59);
    node.type.setPosition(left, expanded ? -27 : -19).setFontSize(expanded ? 9 : 8);
    node.label
      .setPosition(left, expanded ? 1 : 0)
      .setFontSize(expanded ? 14 : 11)
      .setWordWrapWidth(expanded ? 122 : 96);
    node.status
      .setPosition(left, expanded ? 30 : 21)
      .setFontSize(expanded ? 9 : 8);
    if (!node.completed) node.status.setText(expanded ? "CLICK TO INVESTIGATE" : "SELECT");
    node.container.setDepth(expanded ? 5.25 : 4);
  }

  private createPlayer(): void {
    const [startX, startY] = this.runPlan.mission.playerStart;
    this.player = this.add
      .circle(startX, startY, 15, 0x58aef5, 1)
      .setStrokeStyle(4, 0xe0f1ff, 1)
      .setDepth(5);

    this.playerHalo = this.add.circle(startX, startY, 23, 0x58aef5, 0.12).setDepth(5);

    this.playerLabel = this.add
      .text(startX, startY + 29, "RESPONSE LEAD", {
        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        color: "#dcecff",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(5);
  }

  private createControls(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable.");

    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys("W,A,S,D") as Record<
      "W" | "A" | "S" | "D",
      Phaser.Input.Keyboard.Key
    >;

    this.interactKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.guideKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    this.interactKey.on("down", () => this.interactWithNearestNode());
    this.guideKey.on("down", () => this.game.events.emit("toggle-guide"));
  }

  private createPrompt(): void {
    this.promptText = this.add
      .text(480, 570, "Click any visible node, or move near one and press E.", {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#dcecff",
        backgroundColor: "#0d1d30",
        padding: { x: 15, y: 9 }
      })
      .setOrigin(0.5)
      .setStroke("#07111f", 1)
      .setDepth(6);
  }

  private updateMovement(delta: number): void {
    let horizontal = 0;
    let vertical = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) horizontal -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) horizontal += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vertical -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vertical += 1;

    const direction = new Phaser.Math.Vector2(horizontal, vertical);
    if (direction.lengthSq() === 0) return;

    direction.normalize();
    const distance = this.settings.movementSpeed * (delta / 1000);

    this.player.x = Phaser.Math.Clamp(
      this.player.x + direction.x * distance,
      24,
      936
    );
    this.player.y = Phaser.Math.Clamp(
      this.player.y + direction.y * distance,
      110,
      540
    );
    this.playerLabel.setPosition(this.player.x, this.player.y + 29);
    this.playerHalo.setPosition(this.player.x, this.player.y);
  }

  private updateNearbyPrompt(): void {
    const nearest = this.getNearestAvailableNode();

    if (nearest && nearest.distance <= 105) {
      this.promptText.setText(`Press E to investigate ${nearest.node.scenario.title}`);
      this.game.events.emit("node-focus", nearest.node.scenario, true);
      return;
    }

    this.promptText.setText("Click any visible node, or move near one and press E.");
  }

  private getNearestAvailableNode():
    | { node: NodeView; distance: number }
    | undefined {
    return this.nodes
      .filter((node) => node.active && !node.completed)
      .map((node) => ({
        node,
        distance: Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          node.container.x,
          node.container.y
        )
      }))
      .sort((a, b) => a.distance - b.distance)[0];
  }

  private interactWithNearestNode(): void {
    if (this.challengeOpen || this.finished) return;

    const nearest = this.getNearestAvailableNode();
    if (!nearest || nearest.distance > 105) {
      this.promptText.setText("Move closer to an unresolved node, or click it directly.");
      return;
    }

    this.openChallenge(nearest.node);
  }

  private openChallenge(node: NodeView): void {
    if (this.challengeOpen || this.finished || node.completed || !node.active) return;

    this.applyPendingConsequence();
    if (this.finished || this.resilience <= 0) return;

    this.challengeOpen = true;
    this.setFocusedNode(node);
    node.card.setFillStyle(0x35212a, 1).setStrokeStyle(2, 0xff7d88, 1);
    node.status.setText("ACTIVE DISRUPTION").setColor("#ff9ca5");

    const transitions = this.logisticsLayer.applyScenarioDisruption(node.scenario.logisticsEffects);
    this.game.events.emit("node-focus", node.scenario, true);
    this.game.events.emit("mission-log", {
      level: "warning",
      text: `${node.scenario.title}: ${node.scenario.event} ${this.describeTransitions(transitions)}`
    });

    const disruptionLoss = Math.round(
      node.scenario.basePenalty * this.settings.disruptionMultiplier
    );
    const intelligence = this.intelligenceForScenario(node.scenario);

    const request: ChallengeRequest = {
      scenario: node.scenario,
      showHint: this.settings.showHints,
      resources: this.strategicResources.snapshot(),
      intelligence,
      verifyIntelligence: () => {
        const update = this.strategicResources.spend({ intelligence: intelligence.cost });
        if (!update) return null;
        this.game.events.emit("resources-update", update);
        this.game.events.emit("mission-log", {
          level: "info",
          text: `${node.scenario.title}: the response team committed ${intelligence.cost} Intel to verify the signal. ${intelligence.verificationFinding}`
        });
        return update;
      },
      scoring: {
        currentResilience: this.resilience,
        basePenalty: node.scenario.basePenalty,
        disruptionLoss,
        disruptionMultiplier: this.settings.disruptionMultiplier,
        responseRecovery: this.settings.correctAnswerRecovery,
        wrongAnswerPenalty: this.settings.wrongAnswerPenalty
      },
      resolve: (selectedIndex: number, intelligenceVerified: boolean) =>
        this.resolveChallenge(node, selectedIndex, intelligenceVerified)
    };

    this.game.events.emit("show-challenge", request);
  }

  private resolveChallenge(node: NodeView, selectedIndex: number, intelligenceVerified: boolean): void {
    if (node.completed || this.finished) return;

    const scenario = node.scenario;
    const safeIndex = Phaser.Math.Clamp(selectedIndex, 0, scenario.options.length - 1);
    const resourceCost = scenario.resourceCosts[safeIndex] ?? {};
    const resourceUpdate = this.strategicResources.spend(resourceCost);
    if (!resourceUpdate) {
      this.game.events.emit("mission-log", {
        level: "critical",
        text: `${scenario.title}: the selected response cannot be committed because required resources are no longer available.`
      });
      return;
    }
    this.game.events.emit("resources-update", resourceUpdate);
    const correct = safeIndex === scenario.correctIndex;
    this.showResourceDeployment(node, resourceCost, correct);
    const rawDisruptionLoss = Math.round(
      scenario.basePenalty * this.settings.disruptionMultiplier
    );
    const intelligenceReduction = intelligenceVerified ? 2 : 0;
    const disruptionLoss = Math.max(1, rawDisruptionLoss - intelligenceReduction);

    const resilienceChange = correct
      ? Math.max(-2, this.settings.correctAnswerRecovery - disruptionLoss)
      : -(disruptionLoss + this.settings.wrongAnswerPenalty);

    const resilienceBefore = this.resilience;

    this.resilience = Phaser.Math.Clamp(
      this.resilience + resilienceChange,
      0,
      100
    );

    node.completed = true;
    node.container.setScale(1);
    this.game.events.emit("node-focus", node.scenario, false);

    this.completed += 1;
    this.challengeOpen = false;
    const transitions = this.logisticsLayer.resolveScenario(scenario.logisticsEffects, correct);

    if (correct) {
      node.card.setFillStyle(0x12332d, 1).setStrokeStyle(2, 0x70c995, 1);
      node.label.setColor("#dff8ec");
      node.status.setText("STABILIZED").setColor("#70c995");
    } else {
      node.card.setFillStyle(0x382c1b, 1).setStrokeStyle(2, 0xf0bd62, 1);
      node.label.setColor("#fff0cf");
      node.status.setText("DEGRADED").setColor("#f0bd62");
    }

    const recordedResourceCost = {
      ...resourceCost,
      intelligence: (resourceCost.intelligence ?? 0) + (intelligenceVerified ? 1 : 0)
    };
    const resourceCommitment = formatResourceCost(recordedResourceCost);
    const operationalConsequence = correct
      ? `${resourceCommitment} committed. The response stabilized the immediate dependency, but those resources are no longer available for later disruptions.`
      : `${resourceCommitment} committed without stabilizing the dependency. A downstream two-point resilience loss will occur before the next decision or final report.`;

    this.decisions.push({
      scenarioId: scenario.id,
      title: scenario.title,
      selectedOption: scenario.options[safeIndex] ?? "No response",
      correct,
      resilienceChange,
      resilienceBefore,
      resilienceAfter: this.resilience,
      disruptionLoss,
      responseRecovery: correct ? this.settings.correctAnswerRecovery : 0,
      wrongAnswerPenalty: correct ? 0 : this.settings.wrongAnswerPenalty,
      calculation: `${intelligenceVerified ? `Verified loss: ${rawDisruptionLoss} − 2 = ${disruptionLoss}. ` : ""}${
        correct
          ? this.settings.correctAnswerRecovery - disruptionLoss < -2
            ? `${resilienceBefore} + ${this.settings.correctAnswerRecovery} - ${disruptionLoss} = ${resilienceBefore + this.settings.correctAnswerRecovery - disruptionLoss}; apply the −2 safeguard → ${this.resilience}`
            : `${resilienceBefore} + ${this.settings.correctAnswerRecovery} - ${disruptionLoss} = ${this.resilience}`
          : `${resilienceBefore} - ${disruptionLoss} - ${this.settings.wrongAnswerPenalty} = ${this.resilience}`
      }`,
      rationale: scenario.optionRationales[safeIndex] ?? scenario.takeaway,
      takeaway: scenario.takeaway,
      resourcesSpent: recordedResourceCost,
      resourcesRemaining: { ...resourceUpdate.remaining },
      intelligenceVerified,
      intelligenceCost: intelligenceVerified ? 1 : 0,
      intelligenceFinding: intelligenceVerified
        ? this.intelligenceForScenario(scenario).verificationFinding
        : "The decision was made from the preliminary operating picture.",
      operationalConsequence
    });

    if (!correct) {
      this.pendingConsequence = {
        source: scenario.title,
        penalty: 2,
        text: `Downstream effects from ${scenario.title} reduced resilience because the connected dependency remained unstable.`
      };
    }

    this.game.events.emit("decision-result", {
      correct,
      resilienceChange,
      resilience: this.resilience,
      takeaway: scenario.takeaway
    });
    this.game.events.emit("mission-log", {
      level: correct ? "success" : "critical",
      text: `${scenario.title} ${correct ? "stabilized" : "remains degraded"}. ${resourceCommitment} committed. Resilience ${
        resilienceChange >= 0 ? "+" : ""
      }${resilienceChange}. ${this.describeTransitions(transitions)}`
    });

    this.emitHud();

    if (this.resilience <= 0) {
      this.finishGame("network-failed");
    } else if (this.completed >= this.runPlan.mission.target) {
      this.applyPendingConsequence();
      if (this.resilience <= 0) {
        this.finishGame("network-failed");
        return;
      }
      this.finishGame("completed");
    }
  }

  private applyPendingConsequence(): void {
    if (!this.pendingConsequence || this.finished) return;
    const consequence = this.pendingConsequence;
    this.pendingConsequence = null;
    this.resilience = Phaser.Math.Clamp(this.resilience - consequence.penalty, 0, 100);
    this.game.events.emit("mission-log", {
      level: "critical",
      text: `${consequence.text} Resilience −${consequence.penalty}.`
    });
    this.game.events.emit("decision-consequence", {
      source: consequence.source,
      penalty: consequence.penalty,
      resilience: this.resilience,
      text: consequence.text
    });
    this.emitHud();
    if (this.resilience <= 0) this.finishGame("network-failed");
  }

  private showResourceDeployment(
    node: NodeView,
    resourceCost: Scenario["resourceCosts"][number],
    effective: boolean
  ): void {
    const totalCommitted = Object.values(resourceCost).reduce((total, amount) => total + amount, 0);
    const color = effective ? 0x70c995 : 0xf0bd62;
    const pulse = this.add.circle(node.container.x, node.container.y, 55, color, 0.08)
      .setStrokeStyle(3, color, 0.86)
      .setDepth(5.5);
    const message = totalCommitted > 0
      ? `${totalCommitted} RESOURCE UNIT${totalCommitted === 1 ? "" : "S"} COMMITTED`
      : "NO RESOURCES COMMITTED";
    const label = this.add.text(node.container.x, node.container.y - 62, message, {
      fontFamily: "Arial, sans-serif",
      fontSize: "8px",
      color: effective ? "#c9f3dc" : "#ffe1a4",
      backgroundColor: "#07111fe6",
      padding: { x: 8, y: 5 },
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(6);

    this.tweens.add({
      targets: pulse,
      scale: 1.65,
      alpha: 0,
      duration: 1050,
      ease: "Cubic.Out",
      onComplete: () => pulse.destroy()
    });
    this.tweens.add({
      targets: label,
      y: label.y - 18,
      alpha: 0,
      delay: 650,
      duration: 900,
      ease: "Cubic.Out",
      onComplete: () => label.destroy()
    });
  }

  private intelligenceForScenario(scenario: Scenario): ChallengeRequest["intelligence"] {
    const authored = scenario.intelligence;
    return {
      confidence: authored?.confidence ?? (scenario.basePenalty >= 18 ? "low" : "moderate"),
      confirmed: authored?.confirmed ?? scenario.event,
      uncertainty: authored?.uncertainty ?? `The first report has not confirmed the timing, available alternate capacity, or full downstream reach. ${scenario.how}`,
      verificationFinding: authored?.verificationFinding ?? `${scenario.when} ${scenario.where}`,
      forecast: authored?.forecast ?? scenario.cascadeSteps.slice(1).join(" → "),
      cost: 1,
      disruptionReduction: 2
    };
  }

  private emitHud(): void {
    const update: HudUpdate = {
      difficulty: this.difficulty,
      resilience: this.resilience,
      completed: this.completed,
      target: this.runPlan.mission.target,
      remainingSeconds: this.remainingSeconds
    };
    this.game.events.emit("hud-update", update);
  }

  private emitTransportationUpdate(
    label: string,
    transitions: LogisticsTransition[],
    level: "info" | "warning" | "critical" | "success"
  ): void {
    if (transitions.length === 0) return;
    this.game.events.emit("mission-log", {
      level,
      text: `${label}: ${this.describeTransitions(transitions)}`
    });
  }

  private layoutActiveNodes(scenarios: Scenario[]): Map<string, { x: number; y: number }> {
    const placed: Array<{ x: number; y: number }> = [];
    const result = new Map<string, { x: number; y: number }>();
    const offsets = [
      { x: 0, y: 0 }, { x: 0, y: 112 }, { x: 0, y: -112 },
      { x: -180, y: 0 }, { x: 180, y: 0 }, { x: -165, y: 106 },
      { x: 165, y: 106 }, { x: -165, y: -106 }, { x: 165, y: -106 }
    ];

    scenarios.forEach((scenario) => {
      const base = { x: scenario.x, y: scenario.y + 30 };
      const position = offsets
        .map((offset) => ({
          x: Phaser.Math.Clamp(base.x + offset.x, 92, 868),
          y: Phaser.Math.Clamp(base.y + offset.y, 155, 520)
        }))
        .find((candidate) =>
          placed.every((other) =>
            Math.abs(candidate.x - other.x) >= 148 || Math.abs(candidate.y - other.y) >= 82
          )
        ) ?? base;
      placed.push(position);
      result.set(scenario.id, position);
    });

    return result;
  }

  private startAmbientEvent(event: ScheduledAmbientEvent): void {
    this.ambientEventRecords.push({
      id: event.id,
      kind: event.kind,
      title: event.title,
      summary: event.summary,
      triggerSeconds: event.triggerSeconds,
      durationSeconds: event.durationSeconds
    });
    const transitions = this.logisticsLayer.applyAmbientEvent(event.id, event.effects);
    this.game.events.emit("mission-log", {
      level: event.kind === "security" ? "critical" : "warning",
      text: `${event.title}: ${event.summary} ${this.describeTransitions(transitions)}`
    });
  }

  private endAmbientEvent(event: ScheduledAmbientEvent): void {
    const transitions = this.logisticsLayer.clearAmbientEvent(event.id);
    this.game.events.emit("mission-log", {
      level: "info",
      text: `${event.title} cleared. ${this.describeTransitions(transitions)}`
    });
  }

  private describeTransitions(transitions: LogisticsTransition[]): string {
    if (transitions.length === 0) return "No transportation status changed.";
    return transitions
      .map((transition) => `${transition.name} is ${transition.status.toLowerCase()}`)
      .join("; ") + ".";
  }

  private finishGame(outcome: GameReport["outcome"]): void {
    if (this.finished) return;

    this.finished = true;
    this.ambientEvents.finish();
    this.logisticsLayer.setMissionComplete();
    this.promptText.setText("Mission complete. Review the after-action report.");
    this.game.events.emit("mission-log", {
      level: outcome === "completed" ? "success" : "critical",
      text: outcome === "completed"
        ? "Mission objective complete. Transportation activity is frozen for after-action review."
        : "Mission ended before the network objective was completed. Transportation activity is frozen for review."
    });

    const resourceSnapshot = this.strategicResources.snapshot();
    const report: GameReport = {
      missionId: this.runPlan.mission.id,
      missionName: this.runPlan.mission.name,
      region: this.runPlan.mission.region,
      seed: this.runPlan.seed,
      condition: this.runPlan.condition,
      target: this.runPlan.mission.target,
      difficulty: this.difficulty,
      completed: this.completed,
      resilience: this.resilience,
      outcome,
      elapsedSeconds: this.elapsedSeconds,
      initialResources: resourceSnapshot.initial,
      remainingResources: resourceSnapshot.remaining,
      ambientEvents: this.ambientEventRecords,
      decisions: this.decisions
    };

    this.game.events.emit("game-complete", report);
  }
}
