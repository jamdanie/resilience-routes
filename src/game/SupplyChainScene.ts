import Phaser from "phaser";
import scenariosJson from "../data/scenarios.json";
import { difficultySettings, MISSION_TARGET } from "./config";
import { LiveLogisticsLayer } from "./LiveLogisticsLayer";
import { WeatherSystemLayer } from "./WeatherSystemLayer";
import type {
  DecisionRecord,
  Difficulty,
  GameReport,
  HudUpdate,
  LogisticsTransition,
  Scenario
} from "./types";

const scenarios = scenariosJson as Scenario[];

interface NodeView {
  scenario: Scenario;
  container: Phaser.GameObjects.Container;
  card: Phaser.GameObjects.Rectangle;
  status: Phaser.GameObjects.Text;
  label: Phaser.GameObjects.Text;
  completed: boolean;
}

interface ChallengeRequest {
  scenario: Scenario;
  showHint: boolean;
  scoring: {
    currentResilience: number;
    basePenalty: number;
    disruptionLoss: number;
    disruptionMultiplier: number;
    responseRecovery: number;
    wrongAnswerPenalty: number;
  };
  resolve: (selectedIndex: number) => void;
}

export class SupplyChainScene extends Phaser.Scene {
  private readonly difficulty: Difficulty;
  private readonly settings;
  private player!: Phaser.GameObjects.Arc;
  private playerHalo!: Phaser.GameObjects.Arc;
  private playerLabel!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private guideKey!: Phaser.Input.Keyboard.Key;
  private nodes: NodeView[] = [];
  private promptText!: Phaser.GameObjects.Text;
  private challengeOpen = false;
  private resilience = 0;
  private completed = 0;
  private remainingSeconds: number | null = null;
  private elapsedSeconds = 0;
  private decisions: DecisionRecord[] = [];
  private timerAccumulatorMs = 0;
  private finished = false;
  private logisticsLayer!: LiveLogisticsLayer;
  private weatherLayer!: WeatherSystemLayer;

  constructor(difficulty: Difficulty) {
    super("SupplyChainScene");
    this.difficulty = difficulty;
    this.settings = difficultySettings[difficulty];
  }

  create(): void {
    this.challengeOpen = false;
    this.resilience = this.settings.startingResilience;
    this.completed = 0;
    this.remainingSeconds = this.settings.timeLimitSeconds;
    this.elapsedSeconds = 0;
    this.decisions = [];
    this.timerAccumulatorMs = 0;
    this.finished = false;

    this.drawWorld();
    this.logisticsLayer = new LiveLogisticsLayer(this);
    this.logisticsLayer.create();
    this.weatherLayer = new WeatherSystemLayer(this, (phase) => {
      const transitions = this.logisticsLayer.applyWeatherPhase(phase);
      this.emitTransportationUpdate("Weather effect", transitions, phase === "warning" ? "critical" : "info");
    });
    this.weatherLayer.create();
    this.createNodes();
    this.createPlayer();
    this.createControls();
    this.createPrompt();
    this.emitHud();

    this.game.events.emit("mission-log", {
      level: "info",
      text: "Regional operating picture initialized. Select an unresolved node."
    });
    this.game.events.emit("game-ready");
  }

  update(_time: number, delta: number): void {
    this.weatherLayer.update(delta);
    this.logisticsLayer.update(delta);
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

    background.fillStyle(0x0d1c2f, 0.98);
    background.fillRoundedRect(20, 18, 920, 70, 14);
    background.lineStyle(1, 0x355474, 0.7);
    background.strokeRoundedRect(20, 18, 920, 70, 14);

    this.drawRoutes();

    this.add.text(48, 33, "REGIONAL SUPPLY NETWORK", {
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
      .text(900, 42, "MISSION 01", {
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        color: "#77c8ff",
        fontStyle: "bold"
      })
      .setOrigin(1, 0.5);

    this.add
      .text(900, 65, "PACIFIC NORTHWEST CONTINUITY", {
        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        color: "#718ba4"
      })
      .setOrigin(1, 0.5);

    this.drawLegend();
  }

  private drawRoutes(): void {
    const routes: Array<[number, number, number, number, number]> = [
      [155, 190, 445, 160, 0x45b7e8],
      [445, 160, 755, 210, 0xe3b455],
      [755, 210, 695, 465, 0xd97d58],
      [695, 465, 270, 450, 0x9a89ef],
      [270, 450, 155, 190, 0x70c37d],
      [445, 160, 270, 450, 0x6484a3]
    ];

    const routeLayer = this.add.graphics();
    for (const [x1, y1, x2, y2, color] of routes) {
      routeLayer.lineStyle(8, 0x07111f, 0.95);
      routeLayer.lineBetween(x1, y1, x2, y2);
      routeLayer.lineStyle(3, color, 0.62);
      routeLayer.lineBetween(x1, y1, x2, y2);
    }

    const flowLayer = this.add.graphics();
    flowLayer.lineStyle(1, 0x9ccdf1, 0.22);
    routes.forEach(([x1, y1, x2, y2]) => {
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
    this.nodes = scenarios.map((scenario) => {
      const y = scenario.y + 30;
      const container = this.add.container(scenario.x, y);
      container.setDepth(4);
      const accentColor = Phaser.Display.Color.HexStringToColor(scenario.color).color;

      const shadow = this.add
        .rectangle(3, 6, 164, 92, 0x020711, 0.35)
        .setOrigin(0.5);

      const card = this.add
        .rectangle(0, 0, 164, 92, 0x122238, 0.98)
        .setStrokeStyle(2, 0x466681, 1)
        .setOrigin(0.5);

      const accent = this.add
        .rectangle(-74, 0, 6, 70, accentColor, 1)
        .setOrigin(0.5);

      const type = this.add
        .text(-61, -28, scenario.nodeType.toUpperCase(), {
          fontFamily: "Arial, sans-serif",
          fontSize: "9px",
          color: "#8ca4bc",
          fontStyle: "bold"
        })
        .setOrigin(0, 0.5);

      const label = this.add
        .text(-61, 1, scenario.title, {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#f2f7ff",
          fontStyle: "bold",
          wordWrap: { width: 122 }
        })
        .setOrigin(0, 0.5);

      const status = this.add
        .text(-61, 31, "INVESTIGATE", {
          fontFamily: "Arial, sans-serif",
          fontSize: "9px",
          color: scenario.color,
          fontStyle: "bold"
        })
        .setOrigin(0, 0.5);

      container.add([shadow, card, accent, type, label, status]);
      container.setSize(164, 92);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-82, -46, 164, 92),
        Phaser.Geom.Rectangle.Contains
      );

      const node: NodeView = {
        scenario,
        container,
        card,
        status,
        label,
        completed: false
      };

      container.on("pointerover", () => {
        if (this.finished || node.completed) return;
        card.setStrokeStyle(2, accentColor, 1);
        container.setScale(1.025);
        this.game.events.emit("node-focus", scenario);
      });

      container.on("pointerout", () => {
        if (this.finished || node.completed) return;
        card.setStrokeStyle(2, 0x466681, 1);
        container.setScale(1);
      });

      container.on("pointerdown", () => {
        if (!node.completed) this.openChallenge(node);
      });

      return node;
    });
  }

  private createPlayer(): void {
    this.player = this.add
      .circle(475, 320, 15, 0x58aef5, 1)
      .setStrokeStyle(4, 0xe0f1ff, 1)
      .setDepth(5);

    this.playerHalo = this.add.circle(475, 320, 23, 0x58aef5, 0.12).setDepth(5);

    this.playerLabel = this.add
      .text(475, 349, "RESPONSE LEAD", {
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
      .text(480, 570, "Click a node, or move near one and press E.", {
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
      this.game.events.emit("node-focus", nearest.node.scenario);
      return;
    }

    this.promptText.setText("Click a node, or move near one and press E.");
  }

  private getNearestAvailableNode():
    | { node: NodeView; distance: number }
    | undefined {
    return this.nodes
      .filter((node) => !node.completed)
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
    if (this.challengeOpen || this.finished || node.completed) return;

    this.challengeOpen = true;
    node.card.setFillStyle(0x35212a, 1).setStrokeStyle(2, 0xff7d88, 1);
    node.status.setText("ACTIVE DISRUPTION").setColor("#ff9ca5");
    node.container.disableInteractive();

    const transitions = this.logisticsLayer.applyScenarioDisruption(node.scenario.logisticsEffects);
    this.game.events.emit("node-focus", node.scenario);
    this.game.events.emit("mission-log", {
      level: "warning",
      text: `${node.scenario.title}: ${node.scenario.event} ${this.describeTransitions(transitions)}`
    });

    const disruptionLoss = Math.round(
      node.scenario.basePenalty * this.settings.disruptionMultiplier
    );

    const request: ChallengeRequest = {
      scenario: node.scenario,
      showHint: this.settings.showHints,
      scoring: {
        currentResilience: this.resilience,
        basePenalty: node.scenario.basePenalty,
        disruptionLoss,
        disruptionMultiplier: this.settings.disruptionMultiplier,
        responseRecovery: this.settings.correctAnswerRecovery,
        wrongAnswerPenalty: this.settings.wrongAnswerPenalty
      },
      resolve: (selectedIndex: number) => this.resolveChallenge(node, selectedIndex)
    };

    this.game.events.emit("show-challenge", request);
  }

  private resolveChallenge(node: NodeView, selectedIndex: number): void {
    if (node.completed || this.finished) return;

    const scenario = node.scenario;
    const safeIndex = Phaser.Math.Clamp(selectedIndex, 0, scenario.options.length - 1);
    const correct = safeIndex === scenario.correctIndex;
    const disruptionLoss = Math.round(
      scenario.basePenalty * this.settings.disruptionMultiplier
    );

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
    node.container.disableInteractive();

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
      calculation: correct
        ? this.settings.correctAnswerRecovery - disruptionLoss < -2
          ? `${resilienceBefore} + ${this.settings.correctAnswerRecovery} - ${disruptionLoss} = ${resilienceBefore + this.settings.correctAnswerRecovery - disruptionLoss}; apply the −2 safeguard → ${this.resilience}`
          : `${resilienceBefore} + ${this.settings.correctAnswerRecovery} - ${disruptionLoss} = ${this.resilience}`
        : `${resilienceBefore} - ${disruptionLoss} - ${this.settings.wrongAnswerPenalty} = ${this.resilience}`,
      rationale: scenario.optionRationales[safeIndex] ?? scenario.takeaway,
      takeaway: scenario.takeaway
    });

    this.game.events.emit("decision-result", {
      correct,
      resilienceChange,
      resilience: this.resilience,
      takeaway: scenario.takeaway
    });
    this.game.events.emit("mission-log", {
      level: correct ? "success" : "critical",
      text: `${scenario.title} ${correct ? "stabilized" : "remains degraded"}. Resilience ${
        resilienceChange >= 0 ? "+" : ""
      }${resilienceChange}. ${this.describeTransitions(transitions)}`
    });

    this.emitHud();

    if (this.resilience <= 0) {
      this.finishGame("network-failed");
    } else if (this.completed >= MISSION_TARGET) {
      this.finishGame("completed");
    }
  }

  private emitHud(): void {
    const update: HudUpdate = {
      difficulty: this.difficulty,
      resilience: this.resilience,
      completed: this.completed,
      target: MISSION_TARGET,
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

  private describeTransitions(transitions: LogisticsTransition[]): string {
    if (transitions.length === 0) return "No transportation status changed.";
    return transitions
      .map((transition) => `${transition.name} is ${transition.status.toLowerCase()}`)
      .join("; ") + ".";
  }

  private finishGame(outcome: GameReport["outcome"]): void {
    if (this.finished) return;

    this.finished = true;
    this.logisticsLayer.setMissionComplete();
    this.promptText.setText("Mission complete. Review the after-action report.");
    this.game.events.emit("mission-log", {
      level: outcome === "completed" ? "success" : "critical",
      text: outcome === "completed"
        ? "Mission objective complete. Transportation activity is frozen for after-action review."
        : "Mission ended before the network objective was completed. Transportation activity is frozen for review."
    });

    const report: GameReport = {
      difficulty: this.difficulty,
      completed: this.completed,
      resilience: this.resilience,
      outcome,
      elapsedSeconds: this.elapsedSeconds,
      decisions: this.decisions
    };

    this.game.events.emit("game-complete", report);
  }
}
