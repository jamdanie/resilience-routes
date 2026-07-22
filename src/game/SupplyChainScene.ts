import Phaser from "phaser";
import scenariosJson from "../data/scenarios.json";
import type {
  DecisionRecord,
  Difficulty,
  GameReport,
  Scenario
} from "./types";

const scenarios = scenariosJson as Scenario[];

interface DifficultySettings {
  movementSpeed: number;
  disruptionMultiplier: number;
  wrongAnswerPenalty: number;
  correctAnswerRecovery: number;
  timeLimitSeconds: number | null;
  showHints: boolean;
  startingResilience: number;
}

const difficultySettings: Record<Difficulty, DifficultySettings> = {
  easy: {
    movementSpeed: 225,
    disruptionMultiplier: 0.65,
    wrongAnswerPenalty: 3,
    correctAnswerRecovery: 8,
    timeLimitSeconds: null,
    showHints: true,
    startingResilience: 90
  },
  medium: {
    movementSpeed: 205,
    disruptionMultiplier: 1,
    wrongAnswerPenalty: 7,
    correctAnswerRecovery: 5,
    timeLimitSeconds: 240,
    showHints: false,
    startingResilience: 82
  },
  hard: {
    movementSpeed: 190,
    disruptionMultiplier: 1.35,
    wrongAnswerPenalty: 12,
    correctAnswerRecovery: 2,
    timeLimitSeconds: 180,
    showHints: false,
    startingResilience: 74
  }
};

interface NodeView {
  scenario: Scenario;
  container: Phaser.GameObjects.Container;
  card: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  completed: boolean;
}

export class SupplyChainScene extends Phaser.Scene {
  private difficulty: Difficulty;
  private settings: DifficultySettings;
  private player!: Phaser.GameObjects.Arc;
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
  private decisions: DecisionRecord[] = [];
  private lastTimerUpdate = 0;
  private finished = false;

  constructor(difficulty: Difficulty) {
    super("SupplyChainScene");
    this.difficulty = difficulty;
    this.settings = difficultySettings[difficulty];
  }

  create(): void {
    this.resilience = this.settings.startingResilience;
    this.remainingSeconds = this.settings.timeLimitSeconds;

    this.drawWorld();
    this.createNodes();
    this.createPlayer();
    this.createControls();
    this.createPrompt();
    this.emitHud();

    this.game.events.emit("game-ready");
  }

  update(time: number, delta: number): void {
    if (this.finished || this.challengeOpen) return;

    this.updateMovement(delta);
    this.updateNearbyPrompt();

    if (
      this.remainingSeconds !== null &&
      time - this.lastTimerUpdate >= 1000
    ) {
      const secondsElapsed = Math.floor((time - this.lastTimerUpdate) / 1000);
      this.remainingSeconds = Math.max(0, this.remainingSeconds - secondsElapsed);
      this.lastTimerUpdate = time;
      this.emitHud();

      if (this.remainingSeconds <= 0) {
        this.finishGame("time-expired");
      }
    }
  }

  private drawWorld(): void {
    this.cameras.main.setBackgroundColor("#111827");

    const graphics = this.add.graphics();

    graphics.fillStyle(0x162033, 1);
    graphics.fillRoundedRect(20, 18, 920, 70, 14);

    graphics.lineStyle(1, 0x26344a, 0.55);
    for (let x = 0; x <= 960; x += 48) {
      graphics.lineBetween(x, 96, x, 600);
    }
    for (let y = 96; y <= 600; y += 48) {
      graphics.lineBetween(0, y, 960, y);
    }

    graphics.lineStyle(6, 0x40516b, 0.72);
    const routes = [
      [155, 190, 445, 160],
      [445, 160, 755, 210],
      [755, 210, 695, 465],
      [695, 465, 270, 450],
      [270, 450, 155, 190],
      [445, 160, 270, 450]
    ];

    for (const [x1, y1, x2, y2] of routes) {
      graphics.lineBetween(x1, y1, x2, y2);
    }

    this.add.text(48, 35, "REGIONAL SUPPLY NETWORK", {
      fontFamily: "Arial, sans-serif",
      fontSize: "20px",
      color: "#f3f6fb",
      fontStyle: "bold"
    });

    this.add.text(
      48,
      61,
      "Click a node or move through the network to investigate a disruption.",
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: "#9cabc1"
      }
    );

    this.add
      .text(900, 52, "MISSION 01", {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#8ba4cb",
        fontStyle: "bold"
      })
      .setOrigin(1, 0.5);
  }

  private createNodes(): void {
    this.nodes = scenarios.map((scenario) => {
      const y = scenario.y + 30;
      const container = this.add.container(scenario.x, y);

      const shadow = this.add
        .rectangle(3, 5, 154, 84, 0x060a12, 0.28)
        .setOrigin(0.5);

      const card = this.add
        .rectangle(0, 0, 154, 84, 0x1d293c, 1)
        .setStrokeStyle(2, 0x52647f, 1)
        .setOrigin(0.5);

      const accentColor =
        Phaser.Display.Color.HexStringToColor(scenario.color).color;

      const accent = this.add
        .rectangle(-69, 0, 6, 64, accentColor, 1)
        .setOrigin(0.5);

      const type = this.add
        .text(-56, -25, scenario.nodeType.toUpperCase(), {
          fontFamily: "Arial, sans-serif",
          fontSize: "10px",
          color: "#91a4bf",
          fontStyle: "bold"
        })
        .setOrigin(0, 0.5);

      const label = this.add
        .text(-56, 4, scenario.title, {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#f3f6fb",
          fontStyle: "bold",
          wordWrap: { width: 112 }
        })
        .setOrigin(0, 0.5);

      const action = this.add
        .text(-56, 29, "CLICK TO INVESTIGATE", {
          fontFamily: "Arial, sans-serif",
          fontSize: "9px",
          color: "#6f8db9"
        })
        .setOrigin(0, 0.5);

      container.add([shadow, card, accent, type, label, action]);
      container.setSize(154, 84);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-77, -42, 154, 84),
        Phaser.Geom.Rectangle.Contains
      );

      container.on("pointerover", () => {
        if (this.finished) return;
        card.setStrokeStyle(2, 0x8fb2ea, 1);
        this.game.events.emit("node-focus", scenario);
      });

      container.on("pointerout", () => {
        if (!this.finished) card.setStrokeStyle(2, 0x52647f, 1);
      });

      const node: NodeView = {
        scenario,
        container,
        card,
        label,
        completed: false
      };

      container.on("pointerdown", () => {
        if (!node.completed) this.openChallenge(node);
      });

      return node;
    });
  }

  private createPlayer(): void {
    this.player = this.add
      .circle(475, 320, 15, 0x4d7ee8, 1)
      .setStrokeStyle(4, 0xdce8ff, 1);

    this.playerLabel = this.add
      .text(475, 347, "YOU", {
        fontFamily: "Arial, sans-serif",
        fontSize: "10px",
        color: "#dce8ff",
        fontStyle: "bold"
      })
      .setOrigin(0.5);
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
        fontSize: "13px",
        color: "#dce8ff",
        backgroundColor: "#162033",
        padding: { x: 14, y: 8 }
      })
      .setOrigin(0.5);
  }

  private updateMovement(delta: number): void {
    let horizontal = 0;
    let vertical = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) horizontal -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) horizontal += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vertical -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vertical += 1;

    const direction = new Phaser.Math.Vector2(horizontal, vertical);

    if (direction.lengthSq() > 0) {
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
      this.playerLabel.setPosition(this.player.x, this.player.y + 27);
    }
  }

  private updateNearbyPrompt(): void {
    const nearest = this.getNearestAvailableNode();

    if (nearest && nearest.distance <= 100) {
      this.promptText.setText(
        `Press E to investigate ${nearest.node.scenario.title}`
      );
      this.game.events.emit("node-focus", nearest.node.scenario);
    } else {
      this.promptText.setText("Click a node, or move near one and press E.");
    }
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

    if (!nearest || nearest.distance > 100) {
      this.promptText.setText("Move closer to an unfinished node or click it.");
      return;
    }

    this.openChallenge(nearest.node);
  }

  private openChallenge(node: NodeView): void {
    if (this.challengeOpen || this.finished || node.completed) return;

    this.challengeOpen = true;
    this.game.events.emit("node-focus", node.scenario);

    this.game.events.emit("show-challenge", {
      scenario: node.scenario,
      showHint: this.settings.showHints,
      resolve: (selectedIndex: number) =>
        this.resolveChallenge(node, selectedIndex)
    });
  }

  private resolveChallenge(node: NodeView, selectedIndex: number): void {
    if (node.completed || this.finished) return;

    const scenario = node.scenario;
    const correct = selectedIndex === scenario.correctIndex;
    const disruptionLoss = Math.round(
      scenario.basePenalty * this.settings.disruptionMultiplier
    );

    const resilienceChange = correct
      ? Math.max(-2, this.settings.correctAnswerRecovery - disruptionLoss)
      : -(disruptionLoss + this.settings.wrongAnswerPenalty);

    this.resilience = Phaser.Math.Clamp(
      this.resilience + resilienceChange,
      0,
      100
    );

    node.completed = true;
    node.card.setFillStyle(0x1a3330, 1).setStrokeStyle(2, 0x5bb98a, 1);
    node.label.setColor("#dff8ec").setText(`Resolved: ${scenario.title}`);
    node.container.disableInteractive();

    this.completed += 1;
    this.challengeOpen = false;

    this.decisions.push({
      scenarioId: scenario.id,
      title: scenario.title,
      selectedOption: scenario.options[selectedIndex] ?? "No response",
      correct,
      resilienceChange,
      takeaway: scenario.takeaway
    });

    this.game.events.emit("decision-result", {
      correct,
      resilienceChange,
      resilience: this.resilience,
      takeaway: scenario.takeaway
    });

    this.emitHud();

    if (this.resilience <= 0) {
      this.finishGame("network-failed");
    } else if (this.completed >= 3) {
      this.finishGame("completed");
    }
  }

  private emitHud(): void {
    this.game.events.emit("hud-update", {
      difficulty: this.difficulty,
      resilience: this.resilience,
      completed: this.completed,
      remainingSeconds: this.remainingSeconds
    });
  }

  private finishGame(outcome: GameReport["outcome"]): void {
    if (this.finished) return;

    this.finished = true;
    this.promptText.setText("Mission complete. Review the after-action report.");

    const report: GameReport = {
      difficulty: this.difficulty,
      completed: this.completed,
      resilience: this.resilience,
      outcome,
      decisions: this.decisions
    };

    this.game.events.emit("game-complete", report);
  }
}
