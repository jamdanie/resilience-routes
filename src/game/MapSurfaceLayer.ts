import Phaser from "phaser";

export type MapSurfaceMode = "infrastructure" | "terrain" | "minimal";

const MODE_ORDER: MapSurfaceMode[] = ["infrastructure", "terrain", "minimal"];

/**
 * A self-contained operational basemap for the fictional mission regions.
 * It deliberately avoids third-party map tiles so the exercise keeps working
 * offline and on GitHub Pages without API keys, billing, or tile licensing.
 */
export class MapSurfaceLayer {
  private readonly scene: Phaser.Scene;
  private readonly missionId: string;
  private baseContainer!: Phaser.GameObjects.Container;
  private terrainContainer!: Phaser.GameObjects.Container;
  private infrastructureContainer!: Phaser.GameObjects.Container;
  private labelContainer!: Phaser.GameObjects.Container;
  private mode: MapSurfaceMode = "infrastructure";

  constructor(scene: Phaser.Scene, missionId: string) {
    this.scene = scene;
    this.missionId = missionId;
  }

  create(): void {
    this.baseContainer = this.scene.add.container(0, 0).setDepth(0.1);
    this.terrainContainer = this.scene.add.container(0, 0).setDepth(0.13);
    this.infrastructureContainer = this.scene.add.container(0, 0).setDepth(0.16);
    this.labelContainer = this.scene.add.container(0, 0).setDepth(0.19);

    if (this.missionId === "gulf-coast") this.drawGulfCoast();
    else this.drawPacificNorthwest();
    this.applyMode();
  }

  setMode(mode: MapSurfaceMode): MapSurfaceMode {
    this.mode = mode;
    this.applyMode();
    return this.mode;
  }

  cycleMode(): MapSurfaceMode {
    const index = MODE_ORDER.indexOf(this.mode);
    return this.setMode(MODE_ORDER[(index + 1) % MODE_ORDER.length]);
  }

  private applyMode(): void {
    const terrain = this.mode === "terrain";
    const infrastructure = this.mode === "infrastructure";

    this.baseContainer.setVisible(true).setAlpha(this.mode === "minimal" ? 0.68 : 1);
    this.terrainContainer.setVisible(this.mode !== "minimal").setAlpha(terrain ? 0.94 : 0.42);
    this.infrastructureContainer
      .setVisible(this.mode !== "minimal")
      .setAlpha(infrastructure ? 0.92 : 0.46);
    this.labelContainer.setVisible(this.mode !== "minimal").setAlpha(infrastructure ? 1 : 0.72);
  }

  private drawPacificNorthwest(): void {
    const base = this.scene.add.graphics();

    // Land and coastal water create a recognizable regional silhouette.
    base.fillStyle(0x18342d, 0.82);
    base.fillRect(0, 96, 960, 504);
    base.fillStyle(0x092d48, 0.96);
    base.fillPoints([
      new Phaser.Geom.Point(0, 96), new Phaser.Geom.Point(188, 96),
      new Phaser.Geom.Point(220, 165), new Phaser.Geom.Point(176, 245),
      new Phaser.Geom.Point(210, 335), new Phaser.Geom.Point(165, 430),
      new Phaser.Geom.Point(205, 600), new Phaser.Geom.Point(0, 600)
    ], true);
    base.lineStyle(3, 0x68b7cb, 0.62);
    base.beginPath();
    base.moveTo(188, 96);
    base.lineTo(220, 165);
    base.lineTo(176, 245);
    base.lineTo(210, 335);
    base.lineTo(165, 430);
    base.lineTo(205, 600);
    base.strokePath();

    // Bathymetry and shoreline shallows.
    base.lineStyle(1, 0x43a0c3, 0.22);
    [18, 42, 68].forEach((offset) => {
      base.beginPath();
      base.moveTo(188 - offset, 100);
      base.lineTo(220 - offset, 165);
      base.lineTo(176 - offset, 245);
      base.lineTo(210 - offset, 335);
      base.lineTo(165 - offset, 430);
      base.lineTo(205 - offset, 595);
      base.strokePath();
    });

    // Navigable river / inland waterway.
    base.lineStyle(16, 0x163d51, 0.84);
    base.beginPath();
    base.moveTo(930, 115);
    base.lineTo(820, 185);
    base.lineTo(690, 268);
    base.lineTo(565, 350);
    base.lineTo(425, 415);
    base.lineTo(205, 444);
    base.strokePath();
    base.lineStyle(2, 0x4e91ab, 0.44);
    base.strokePath();
    this.baseContainer.add(base);

    this.drawPnwTerrain();
    this.drawPnwInfrastructure();
    this.addMapLabel(72, 545, "PACIFIC APPROACH", "deep-water shipping lane", "water");
    this.addMapLabel(515, 124, "CASCADE RANGE", "elevation and winter exposure", "terrain");
    this.addMapLabel(340, 532, "INLAND VALLEY", "freight and distribution corridor", "land");
    this.addMapLabel(708, 342, "COLUMBIA CORRIDOR", "river · highway · rail", "water");
    this.addMapAttribution("FICTIONAL PNW OPERATIONAL BASEMAP • NOT FOR NAVIGATION");
  }

  private drawPnwTerrain(): void {
    const terrain = this.scene.add.graphics();
    terrain.fillStyle(0x466a48, 0.34);
    terrain.fillEllipse(560, 310, 250, 475);
    terrain.fillEllipse(735, 300, 190, 450);
    terrain.fillStyle(0x315b3d, 0.24);
    terrain.fillEllipse(420, 360, 190, 350);

    // Closely spaced contours make the mountains read as relief rather than decoration.
    terrain.lineStyle(1, 0xa8c59c, 0.34);
    for (let offset = 0; offset < 7; offset += 1) {
      terrain.strokeEllipse(550 + offset * 28, 310, 105 + offset * 20, 430 - offset * 35);
    }
    terrain.lineStyle(1, 0x7d9b75, 0.2);
    for (let x = 300; x < 900; x += 90) {
      terrain.beginPath();
      terrain.moveTo(x, 570);
      terrain.lineTo(x + 75, 455);
      terrain.lineTo(x + 30, 360);
      terrain.lineTo(x + 105, 250);
      terrain.strokePath();
    }
    this.terrainContainer.add(terrain);
  }

  private drawPnwInfrastructure(): void {
    const infrastructure = this.scene.add.graphics();

    // Highway network with secondary roads.
    this.drawRoad(infrastructure, [[205, 390], [330, 360], [500, 300], [675, 255], [850, 190]], true);
    this.drawRoad(infrastructure, [[270, 520], [315, 450], [440, 365], [565, 350], [695, 465]], false);
    this.drawRoad(infrastructure, [[695, 465], [765, 360], [755, 210], [850, 150]], false);
    this.drawRoad(infrastructure, [[440, 365], [445, 160]], false);

    // Rail corridor: parallel rails and regular ties.
    this.drawRail(infrastructure, [270, 450], [445, 160]);
    this.drawRail(infrastructure, [270, 450], [695, 465]);

    // Port basin, quay, four berths, and container stacks.
    infrastructure.fillStyle(0x0a3850, 0.94);
    infrastructure.fillRoundedRect(112, 142, 114, 108, 8);
    infrastructure.lineStyle(2, 0x88bfd2, 0.5);
    infrastructure.strokeRoundedRect(112, 142, 114, 108, 8);
    infrastructure.fillStyle(0x687780, 0.76);
    infrastructure.fillRect(173, 148, 44, 92);
    infrastructure.lineStyle(3, 0xb0c0c7, 0.68);
    [160, 182, 204, 226].forEach((y) => infrastructure.lineBetween(125, y, 175, y));
    [[182, 158], [195, 158], [182, 174], [195, 174], [182, 190], [195, 190]].forEach(([x, y]) => {
      infrastructure.fillStyle(0x3e8aa1, 0.7);
      infrastructure.fillRect(x, y, 9, 12);
    });
    infrastructure.lineStyle(5, 0x8c9aa2, 0.58);
    infrastructure.lineBetween(92, 264, 150, 235);

    // Distribution campus and loading docks.
    infrastructure.fillStyle(0x42515b, 0.78);
    infrastructure.fillRoundedRect(222, 420, 96, 62, 4);
    infrastructure.fillStyle(0x62737d, 0.64);
    infrastructure.fillRect(235, 432, 62, 30);
    infrastructure.fillStyle(0xacc0ca, 0.48);
    [238, 252, 266, 280].forEach((x) => infrastructure.fillRect(x, 466, 9, 5));
    infrastructure.lineStyle(2, 0xb6c6cd, 0.38);
    infrastructure.strokeRoundedRect(222, 420, 96, 62, 4);

    // Digital hub / logistics control campus.
    infrastructure.fillStyle(0x414b5c, 0.74);
    infrastructure.fillRoundedRect(660, 430, 82, 66, 5);
    infrastructure.fillStyle(0x67b18a, 0.18);
    infrastructure.fillRect(672, 442, 58, 42);
    infrastructure.lineStyle(1, 0x8cd5aa, 0.5);
    infrastructure.strokeRoundedRect(660, 430, 82, 66, 5);
    this.infrastructureContainer.add(infrastructure);

    // Airport runway, parallel taxiway, apron, and terminal.
    this.addRunway(755, 210, -19, 190, "16 / 34");
    this.addTerminal(714, 250, "CARGO APRON");

    this.addPoi(154, 126, "PORT HORIZON", "CONTAINER TERMINAL", "port");
    this.addPoi(432, 112, "RIVERBEND JUNCTION", "INTERMODAL RAIL YARD", "rail");
    this.addPoi(748, 112, "SKYBRIDGE AIRPORT", "CARGO RUNWAY 16/34", "airport");
    this.addPoi(248, 497, "CEDAR DISTRIBUTION", "WAREHOUSE CAMPUS", "warehouse");
    this.addPoi(654, 504, "NORTHSTAR HUB", "DIGITAL LOGISTICS", "hub");
    this.addRoadShield(470, 326, "I-5");
    this.addRoadShield(725, 351, "SR 18");
  }

  private drawGulfCoast(): void {
    const base = this.scene.add.graphics();
    base.fillStyle(0x263b2d, 0.84);
    base.fillRect(0, 96, 960, 504);
    base.fillStyle(0x082f4b, 0.96);
    base.fillPoints([
      new Phaser.Geom.Point(0, 470), new Phaser.Geom.Point(150, 438),
      new Phaser.Geom.Point(270, 482), new Phaser.Geom.Point(405, 448),
      new Phaser.Geom.Point(535, 492), new Phaser.Geom.Point(680, 452),
      new Phaser.Geom.Point(820, 482), new Phaser.Geom.Point(960, 445),
      new Phaser.Geom.Point(960, 600), new Phaser.Geom.Point(0, 600)
    ], true);
    base.lineStyle(3, 0x67b7ca, 0.64);
    base.beginPath();
    base.moveTo(0, 470);
    base.lineTo(150, 438);
    base.lineTo(270, 482);
    base.lineTo(405, 448);
    base.lineTo(535, 492);
    base.lineTo(680, 452);
    base.lineTo(820, 482);
    base.lineTo(960, 445);
    base.strokePath();

    // Ship channel and bayous.
    base.lineStyle(18, 0x123b51, 0.9);
    base.beginPath();
    base.moveTo(510, 98);
    base.lineTo(478, 205);
    base.lineTo(548, 318);
    base.lineTo(525, 470);
    base.strokePath();
    base.lineStyle(7, 0x18485d, 0.76);
    base.beginPath();
    base.moveTo(360, 260);
    base.lineTo(440, 328);
    base.lineTo(525, 390);
    base.strokePath();
    base.beginPath();
    base.moveTo(685, 260);
    base.lineTo(610, 342);
    base.lineTo(525, 410);
    base.strokePath();
    this.baseContainer.add(base);

    this.drawGulfTerrain();
    this.drawGulfInfrastructure();
    this.addMapLabel(95, 540, "GULF APPROACH", "deep-draft shipping lane", "water");
    this.addMapLabel(270, 395, "COASTAL WETLANDS", "surge and flood exposure", "terrain");
    this.addMapLabel(660, 120, "ENERGY CORRIDOR", "refinery · pipeline · transfer", "land");
    this.addMapLabel(495, 330, "SHIP CHANNEL", "controlled marine passage", "water");
    this.addMapAttribution("FICTIONAL GULF OPERATIONAL BASEMAP • NOT FOR NAVIGATION");
  }

  private drawGulfTerrain(): void {
    const terrain = this.scene.add.graphics();
    terrain.fillStyle(0x557347, 0.35);
    terrain.fillEllipse(260, 414, 310, 145);
    terrain.fillEllipse(670, 412, 340, 145);
    terrain.fillStyle(0x274e3b, 0.38);
    [170, 250, 330, 625, 710, 795].forEach((x, index) => {
      terrain.fillEllipse(x, 435 - (index % 2) * 20, 95, 55);
    });
    terrain.lineStyle(1, 0x9bbb83, 0.3);
    for (let offset = 0; offset < 5; offset += 1) {
      terrain.strokeEllipse(280 + offset * 120, 414, 170, 72);
    }
    this.terrainContainer.add(terrain);
  }

  private drawGulfInfrastructure(): void {
    const infrastructure = this.scene.add.graphics();
    this.drawRoad(infrastructure, [[100, 300], [280, 285], [465, 260], [650, 230], [870, 205]], true);
    this.drawRoad(infrastructure, [[155, 210], [300, 330], [525, 400], [700, 430], [860, 380]], false);
    this.drawRoad(infrastructure, [[420, 150], [480, 260], [525, 400]], false);
    this.drawRail(infrastructure, [155, 210], [420, 150]);
    this.drawRail(infrastructure, [420, 150], [285, 455]);

    // Port, energy transfer complex, tanks, and warehouse campus.
    infrastructure.fillStyle(0x0b3a51, 0.95);
    infrastructure.fillRoundedRect(105, 165, 120, 105, 8);
    infrastructure.fillStyle(0x6a777e, 0.78);
    infrastructure.fillRect(162, 172, 54, 86);
    infrastructure.lineStyle(3, 0xb2c0c5, 0.65);
    [185, 208, 231, 250].forEach((y) => infrastructure.lineBetween(118, y, 165, y));

    infrastructure.fillStyle(0x4f4d46, 0.74);
    infrastructure.fillRoundedRect(595, 145, 220, 155, 12);
    infrastructure.lineStyle(1, 0xc8ad76, 0.48);
    infrastructure.strokeRoundedRect(595, 145, 220, 155, 12);
    [630, 680, 730, 780].forEach((x) => {
      infrastructure.fillStyle(0x77766d, 0.7);
      infrastructure.fillCircle(x, 205, 18);
      infrastructure.lineStyle(2, 0xd3c79e, 0.45);
      infrastructure.strokeCircle(x, 205, 18);
    });
    infrastructure.lineStyle(4, 0xb88c47, 0.46);
    infrastructure.lineBetween(615, 260, 795, 260);

    infrastructure.fillStyle(0x4a565d, 0.78);
    infrastructure.fillRoundedRect(238, 424, 98, 62, 5);
    infrastructure.fillStyle(0xabc0c8, 0.45);
    [252, 268, 284, 300].forEach((x) => infrastructure.fillRect(x, 470, 10, 5));
    this.infrastructureContainer.add(infrastructure);

    this.addRunway(760, 205, -10, 190, "09 / 27");
    this.addTerminal(724, 244, "AIR CARGO");
    this.addPoi(138, 135, "BAYOU GATEWAY", "MARINE TERMINAL", "port");
    this.addPoi(398, 112, "DELTA RAIL YARD", "INTERMODAL TERMINAL", "rail");
    this.addPoi(748, 110, "GULF AIR CARGO", "RUNWAY 09/27", "airport");
    this.addPoi(248, 501, "INLAND RELIEF HUB", "WAREHOUSE CAMPUS", "warehouse");
    this.addPoi(616, 318, "ENERGY TRANSFER", "TANK FARM & PIPELINES", "hub");
    this.addRoadShield(410, 270, "I-10");
    this.addRoadShield(715, 370, "US 90");
  }

  private drawRoad(graphics: Phaser.GameObjects.Graphics, points: number[][], major: boolean): void {
    graphics.lineStyle(major ? 12 : 8, 0x101a22, 0.74);
    this.strokePath(graphics, points);
    graphics.lineStyle(major ? 7 : 4, major ? 0x697782 : 0x53636d, 0.76);
    this.strokePath(graphics, points);
    graphics.lineStyle(1, major ? 0xe1bc63 : 0xc7d0d4, 0.54);
    this.strokePath(graphics, points);
  }

  private drawRail(graphics: Phaser.GameObjects.Graphics, from: number[], to: number[]): void {
    const [x1, y1] = from;
    const [x2, y2] = to;
    const vector = new Phaser.Math.Vector2(x2 - x1, y2 - y1).normalize();
    const normal = new Phaser.Math.Vector2(-vector.y, vector.x).scale(3);
    graphics.lineStyle(2, 0x9aa8ad, 0.58);
    graphics.lineBetween(x1 + normal.x, y1 + normal.y, x2 + normal.x, y2 + normal.y);
    graphics.lineBetween(x1 - normal.x, y1 - normal.y, x2 - normal.x, y2 - normal.y);
    graphics.lineStyle(2, 0x5e5144, 0.55);
    const length = Phaser.Math.Distance.Between(x1, y1, x2, y2);
    for (let distance = 12; distance < length; distance += 14) {
      const x = x1 + vector.x * distance;
      const y = y1 + vector.y * distance;
      graphics.lineBetween(x - normal.x * 1.6, y - normal.y * 1.6, x + normal.x * 1.6, y + normal.y * 1.6);
    }
  }

  private strokePath(graphics: Phaser.GameObjects.Graphics, points: number[][]): void {
    graphics.beginPath();
    graphics.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => graphics.lineTo(x, y));
    graphics.strokePath();
  }

  private addRunway(x: number, y: number, angle: number, length: number, number: string): void {
    const radians = Phaser.Math.DegToRad(angle);
    const runway = this.scene.add.rectangle(x, y, length, 22, 0x26333a, 0.96)
      .setStrokeStyle(2, 0xaab5bb, 0.68)
      .setRotation(radians);
    const centerline = this.scene.add.rectangle(x, y, length - 24, 2, 0xe6e4d9, 0.65)
      .setRotation(radians);
    const taxiway = this.scene.add.rectangle(x + 4, y + 24, length - 22, 5, 0x8a7443, 0.58)
      .setRotation(radians);
    const runwayNumber = this.scene.add.text(x, y - 2, number, {
      fontFamily: "Arial, sans-serif",
      fontSize: "7px",
      color: "#dce5e8",
      fontStyle: "bold"
    }).setOrigin(0.5).setRotation(radians);
    this.infrastructureContainer.add([runway, centerline, taxiway, runwayNumber]);
  }

  private addTerminal(x: number, y: number, label: string): void {
    const apron = this.scene.add.rectangle(x, y, 80, 42, 0x45545d, 0.72)
      .setStrokeStyle(1, 0x9fafb6, 0.45);
    const terminal = this.scene.add.rectangle(x, y + 2, 48, 17, 0x77868d, 0.76);
    const text = this.scene.add.text(x, y + 28, label, {
      fontFamily: "Arial, sans-serif",
      fontSize: "6px",
      color: "#9fb2bc",
      fontStyle: "bold"
    }).setOrigin(0.5);
    this.infrastructureContainer.add([apron, terminal, text]);
  }

  private addPoi(
    x: number,
    y: number,
    title: string,
    subtitle: string,
    kind: "port" | "rail" | "airport" | "warehouse" | "hub"
  ): void {
    const color = {
      port: 0x4dbde8,
      rail: 0xb7c3ca,
      airport: 0xe8be65,
      warehouse: 0x78c990,
      hub: 0xa28cf0
    }[kind];
    const marker = this.scene.add.circle(x, y, 5, color, 0.92)
      .setStrokeStyle(2, 0x07111f, 0.9);
    const titleText = this.scene.add.text(x + 10, y - 6, title, {
      fontFamily: "Arial, sans-serif",
      fontSize: "7px",
      color: "#c7d8e4",
      fontStyle: "bold"
    });
    const subtitleText = this.scene.add.text(x + 10, y + 3, subtitle, {
      fontFamily: "Arial, sans-serif",
      fontSize: "6px",
      color: "#7694a7"
    });
    this.labelContainer.add([marker, titleText, subtitleText]);
  }

  private addMapLabel(
    x: number,
    y: number,
    title: string,
    subtitle: string,
    kind: "water" | "terrain" | "land"
  ): void {
    const color = kind === "water" ? "#6db6d0" : kind === "terrain" ? "#93b48d" : "#8fa8a1";
    const label = this.scene.add.text(x, y, `${title}\n${subtitle}`, {
      fontFamily: "Arial, sans-serif",
      fontSize: "7px",
      color,
      lineSpacing: 2,
      fontStyle: "bold"
    });
    this.labelContainer.add(label);
  }

  private addRoadShield(x: number, y: number, text: string): void {
    const shield = this.scene.add.rectangle(x, y, 26, 14, 0x273743, 0.92)
      .setStrokeStyle(1, 0xb8c4ca, 0.6);
    const label = this.scene.add.text(x, y, text, {
      fontFamily: "Arial, sans-serif",
      fontSize: "7px",
      color: "#e4ebee",
      fontStyle: "bold"
    }).setOrigin(0.5);
    this.labelContainer.add([shield, label]);
  }

  private addMapAttribution(text: string): void {
    const attribution = this.scene.add.text(945, 590, text, {
      fontFamily: "Arial, sans-serif",
      fontSize: "6px",
      color: "#6e8797",
      backgroundColor: "#07111fcc",
      padding: { x: 6, y: 3 }
    }).setOrigin(1, 1);
    this.labelContainer.add(attribution);

    const north = this.scene.add.text(918, 112, "N\n↑", {
      fontFamily: "Arial, sans-serif",
      fontSize: "9px",
      color: "#9eb5c4",
      align: "center",
      fontStyle: "bold"
    }).setOrigin(0.5, 0);
    const scale = this.scene.add.graphics();
    scale.lineStyle(2, 0xaac0cc, 0.66);
    scale.lineBetween(850, 570, 912, 570);
    scale.lineBetween(850, 566, 850, 574);
    scale.lineBetween(912, 566, 912, 574);
    const scaleText = this.scene.add.text(881, 575, "25 km", {
      fontFamily: "Arial, sans-serif",
      fontSize: "6px",
      color: "#849cac"
    }).setOrigin(0.5, 0);
    this.labelContainer.add([north, scale, scaleText]);
  }
}
