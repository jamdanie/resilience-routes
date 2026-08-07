import Phaser from "phaser";
import type { ScheduledAmbientEvent } from "./types";

const KIND_COLORS = {
  weather: 0x77c8ff,
  economic: 0xf0bd62,
  security: 0xff7d88,
  operations: 0x9d8df1
} as const;

interface ActiveEventView {
  event: ScheduledAmbientEvent;
  container: Phaser.GameObjects.Container;
  elapsedSeconds: number;
}

export class AmbientEventSystem {
  private readonly scene: Phaser.Scene;
  private readonly scheduled: ScheduledAmbientEvent[];
  private readonly onStart: (event: ScheduledAmbientEvent) => void;
  private readonly onEnd: (event: ScheduledAmbientEvent) => void;
  private readonly triggered = new Set<string>();
  private readonly active = new Map<string, ActiveEventView>();
  private elapsedSeconds = 0;

  constructor(
    scene: Phaser.Scene,
    scheduled: ScheduledAmbientEvent[],
    onStart: (event: ScheduledAmbientEvent) => void,
    onEnd: (event: ScheduledAmbientEvent) => void
  ) {
    this.scene = scene;
    this.scheduled = scheduled;
    this.onStart = onStart;
    this.onEnd = onEnd;
  }

  create(): void {
    const next = this.scheduled[0];
    if (next) {
      this.scene.game.events.emit("ambient-event-preview", {
        count: this.scheduled.length,
        nextWindow: next.triggerSeconds
      });
    }
  }

  update(delta: number): void {
    this.elapsedSeconds += delta / 1000;
    this.scheduled.forEach((event) => {
      if (!this.triggered.has(event.id) && this.elapsedSeconds >= event.triggerSeconds) {
        this.activate(event);
      }
    });

    this.active.forEach((view, id) => {
      view.elapsedSeconds += delta / 1000;
      const pulse = 1 + Math.sin(view.elapsedSeconds * 5) * 0.06;
      view.container.setScale(pulse);
      if (view.elapsedSeconds >= view.event.durationSeconds) this.clear(id);
    });
  }

  finish(): void {
    [...this.active.keys()].forEach((id) => this.clear(id));
  }

  private activate(event: ScheduledAmbientEvent): void {
    this.triggered.add(event.id);
    const color = KIND_COLORS[event.kind];
    const [x, y] = event.location;
    const container = this.scene.add.container(x, y + 30).setDepth(3.5);
    const influence = this.scene.add
      .circle(0, 0, event.radius, color, 0.07)
      .setStrokeStyle(2, color, 0.45);
    const marker = this.scene.add
      .circle(0, 0, 15, 0x081725, 0.96)
      .setStrokeStyle(2, color, 1);
    const symbol = this.scene.add
      .text(0, -1, this.symbolFor(event.kind), {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: `#${color.toString(16).padStart(6, "0")}`,
        fontStyle: "bold"
      })
      .setOrigin(0.5);
    const label = this.scene.add
      .text(0, 22, event.title.toUpperCase(), {
        fontFamily: "Arial, sans-serif",
        fontSize: "8px",
        color: "#dcecff",
        backgroundColor: "#081725",
        padding: { x: 6, y: 3 },
        fontStyle: "bold"
      })
      .setOrigin(0.5, 0)
      .setVisible(false);
    container.add([influence, marker, symbol, label]);
    container.setSize(56, 56);
    container.setInteractive(
      new Phaser.Geom.Circle(0, 0, 28),
      Phaser.Geom.Circle.Contains
    );
    if (container.input) container.input.cursor = "pointer";
    container.on("pointerover", () => label.setVisible(true));
    container.on("pointerout", () => label.setVisible(false));
    container.on("pointerdown", () => this.scene.game.events.emit("ambient-event-focus", event));
    this.active.set(event.id, { event, container, elapsedSeconds: 0 });
    this.onStart(event);
    this.scene.game.events.emit("ambient-event-focus", event);
  }

  private clear(id: string): void {
    const view = this.active.get(id);
    if (!view) return;
    this.active.delete(id);
    view.container.destroy(true);
    this.onEnd(view.event);
  }

  private symbolFor(kind: ScheduledAmbientEvent["kind"]): string {
    if (kind === "weather") return "W";
    if (kind === "economic") return "$";
    if (kind === "security") return "!";
    return "O";
  }
}
