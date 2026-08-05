import Phaser from "phaser";
import type { MissionWeather, WeatherPhase, WeatherRunPlan, WeatherUpdate } from "./types";

const CYCLE_SECONDS = 60;

const WEATHER_DETAILS: Record<WeatherPhase, Omit<WeatherUpdate, "phase">> = {
  approaching: {
    title: "Pacific windstorm approaching",
    severity: "Weather advisory",
    summary: "A fast-moving frontal system is approaching the regional network from the coast.",
    wind: "Sustained 30–40 mph; stronger gusts possible",
    affectedArea: "Coastal approach, Port Horizon, and Skybridge Airport",
    timing: "Conditions deteriorating"
  },
  warning: {
    title: "High-wind warning active",
    severity: "Operational disruption",
    summary: "Unsafe winds have stopped exposed cargo handling and reduced transportation capacity.",
    wind: "Gusts 50–65 mph across exposed infrastructure",
    affectedArea: "Port, airport, rail approaches, and regional highways",
    timing: "Peak impacts occurring now"
  },
  clearing: {
    title: "Storm clearing east of the network",
    severity: "Recovery operations",
    summary: "Winds are decreasing, but inspections and cargo backlogs continue to affect movement.",
    wind: "Gusts decreasing below 30 mph",
    affectedArea: "Eastern routes and alternate transportation corridors",
    timing: "Conditions gradually improving"
  }
};

export class WeatherSystemLayer {
  private readonly scene: Phaser.Scene;
  private readonly onPhaseChange: (phase: WeatherPhase) => void;
  private readonly weather: MissionWeather | null;
  private readonly runPlan: WeatherRunPlan | null;
  private stormContainer!: Phaser.GameObjects.Container;
  private rainLayer!: Phaser.GameObjects.Graphics;
  private phaseLabel!: Phaser.GameObjects.Text;
  private elapsedSeconds = 0;
  private lastPhase: WeatherPhase | null = null;

  constructor(
    scene: Phaser.Scene,
    onPhaseChange: (phase: WeatherPhase) => void,
    weather: MissionWeather | null = null,
    runPlan: WeatherRunPlan | null = null
  ) {
    this.scene = scene;
    this.onPhaseChange = onPhaseChange;
    this.weather = weather;
    this.runPlan = runPlan;
  }

  create(): void {
    this.elapsedSeconds = this.runPlan?.cycleOffsetSeconds ?? 0;
    this.createStormGraphic();
    this.updatePhase(this.phaseForTime(this.elapsedSeconds));
  }

  update(delta: number): void {
    const cycleSeconds = this.weather?.cycleSeconds ?? CYCLE_SECONDS;
    this.elapsedSeconds = (this.elapsedSeconds + delta / 1000) % cycleSeconds;
    const cycleProgress = this.elapsedSeconds / cycleSeconds;
    const phase = this.phaseForTime(this.elapsedSeconds);

    if (phase !== this.lastPhase) this.updatePhase(phase);

    const x = Phaser.Math.Linear(this.runPlan?.startX ?? -145, this.runPlan?.endX ?? 1090, cycleProgress);
    const y = (this.runPlan?.trackY ?? 270) + Math.sin(cycleProgress * Math.PI * 2) * 42;
    this.stormContainer.setPosition(x, y);
    this.drawRain(cycleProgress);
  }

  private createStormGraphic(): void {
    this.stormContainer = this.scene.add
      .container(this.runPlan?.startX ?? -145, this.runPlan?.trackY ?? 270)
      .setDepth(0.6);

    const influence = this.scene.add
      .ellipse(0, 18, 270, 170, 0x294663, 0.12)
      .setStrokeStyle(1, 0x77c8ff, 0.16);
    const cloudShadow = this.scene.add.ellipse(0, 10, 174, 60, 0x020711, 0.28);
    const cloudA = this.scene.add.circle(-48, -2, 36, 0x334d68, 0.72);
    const cloudB = this.scene.add.circle(0, -20, 49, 0x3d5872, 0.78);
    const cloudC = this.scene.add.circle(52, -2, 35, 0x334d68, 0.72);
    const cloudBase = this.scene.add
      .rectangle(0, 12, 132, 40, 0x334d68, 0.76)
      .setOrigin(0.5);

    const windLines = this.scene.add.graphics();
    windLines.lineStyle(2, 0xb8dcf5, 0.45);
    windLines.beginPath();
    windLines.moveTo(-98, -12);
    windLines.lineTo(-35, -12);
    windLines.moveTo(-116, 3);
    windLines.lineTo(-58, 3);
    windLines.moveTo(58, 1);
    windLines.lineTo(116, 1);
    windLines.strokePath();

    this.rainLayer = this.scene.add.graphics();
    this.phaseLabel = this.scene.add
      .text(0, 62, "WEATHER ADVISORY", {
        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        color: "#dcecff",
        backgroundColor: "#081725",
        padding: { x: 7, y: 4 },
        fontStyle: "bold"
      })
      .setOrigin(0.5, 0);

    this.stormContainer.add([
      influence,
      cloudShadow,
      cloudA,
      cloudB,
      cloudC,
      cloudBase,
      windLines,
      this.rainLayer,
      this.phaseLabel
    ]);
    this.stormContainer.setSize(280, 190);
    this.stormContainer.setInteractive(
      new Phaser.Geom.Rectangle(-140, -78, 280, 190),
      Phaser.Geom.Rectangle.Contains
    );
    this.stormContainer.on("pointerover", () => this.stormContainer.setAlpha(1));
    this.stormContainer.on("pointerout", () => this.stormContainer.setAlpha(0.88));
    this.stormContainer.on("pointerdown", () => {
      const phase = this.lastPhase ?? "approaching";
      this.scene.game.events.emit("weather-update", this.weatherPayload(phase));
    });
    this.stormContainer.setAlpha(0.88);
  }

  private drawRain(cycleProgress: number): void {
    this.rainLayer.clear();
    this.rainLayer.lineStyle(1, 0x77c8ff, 0.42);
    for (let index = 0; index < 15; index += 1) {
      const x = -72 + index * 10;
      const offset = (cycleProgress * 130 + index * 11) % 58;
      const y = 24 + offset;
      this.rainLayer.lineBetween(x, y, x - 7, y + 13);
    }
  }

  private phaseForTime(seconds: number): WeatherPhase {
    const cycleSeconds = this.weather?.cycleSeconds ?? CYCLE_SECONDS;
    if (seconds < cycleSeconds * 0.2) return "approaching";
    if (seconds < cycleSeconds * 0.7) return "warning";
    return "clearing";
  }

  private updatePhase(phase: WeatherPhase): void {
    this.lastPhase = phase;
    this.onPhaseChange(phase);

    const labelByPhase: Record<WeatherPhase, string> = {
      approaching: "WEATHER ADVISORY",
      warning: "HIGH-WIND WARNING",
      clearing: "RECOVERY CONDITIONS"
    };
    const colorByPhase: Record<WeatherPhase, string> = {
      approaching: "#f0bd62",
      warning: "#ff7d88",
      clearing: "#77c8ff"
    };
    this.phaseLabel.setText(labelByPhase[phase]).setColor(colorByPhase[phase]);

    const payload = this.weatherPayload(phase);
    this.scene.game.events.emit("weather-update", payload);
    this.scene.game.events.emit("mission-log", {
      level: phase === "warning" ? "critical" : phase === "approaching" ? "warning" : "info",
      text: `${payload.severity}: ${payload.summary}`
    });
  }

  private weatherPayload(phase: WeatherPhase): WeatherUpdate {
    const configured = this.weather?.phases[phase];
    if (!configured) return { phase, ...WEATHER_DETAILS[phase] };
    const { assetEffects: _assetEffects, ...details } = configured;
    return {
      phase,
      ...details,
      timing: `${details.timing} · localized effect on ${this.runPlan?.affectedAssetIds.length ?? "regional"} assets`
    };
  }
}
