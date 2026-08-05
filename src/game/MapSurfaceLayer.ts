import Phaser from "phaser";

export class MapSurfaceLayer {
  private readonly scene: Phaser.Scene;
  private readonly missionId: string;
  private container!: Phaser.GameObjects.Container;
  private visible = true;

  constructor(scene: Phaser.Scene, missionId: string) {
    this.scene = scene;
    this.missionId = missionId;
  }

  create(): void {
    this.container = this.scene.add.container(0, 0).setDepth(0.15).setVisible(true);
    if (this.missionId === "gulf-coast") this.drawGulfCoast();
    else this.drawPacificNorthwest();
  }

  toggle(): boolean {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
    return this.visible;
  }

  private drawPacificNorthwest(): void {
    const surface = this.scene.add.graphics();
    surface.fillStyle(0x0b3550, 0.42);
    surface.fillPoints([
      new Phaser.Geom.Point(0, 96), new Phaser.Geom.Point(188, 96),
      new Phaser.Geom.Point(220, 165), new Phaser.Geom.Point(176, 245),
      new Phaser.Geom.Point(210, 335), new Phaser.Geom.Point(165, 430),
      new Phaser.Geom.Point(205, 600), new Phaser.Geom.Point(0, 600)
    ], true);
    surface.lineStyle(2, 0x5fb1cf, 0.45);
    surface.beginPath();
    surface.moveTo(188, 96);
    surface.lineTo(220, 165);
    surface.lineTo(176, 245);
    surface.lineTo(210, 335);
    surface.lineTo(165, 430);
    surface.lineTo(205, 600);
    surface.strokePath();

    surface.fillStyle(0x355c43, 0.17);
    surface.fillEllipse(520, 290, 210, 470);
    surface.fillEllipse(690, 310, 150, 440);
    surface.lineStyle(1, 0x8ab091, 0.25);
    for (let offset = 0; offset < 5; offset += 1) {
      surface.strokeEllipse(540 + offset * 28, 305, 115 + offset * 18, 420 - offset * 34);
    }

    surface.lineStyle(4, 0x4c91b4, 0.32);
    surface.beginPath();
    surface.moveTo(785, 145);
    surface.lineTo(650, 250);
    surface.lineTo(515, 355);
    surface.lineTo(330, 415);
    surface.lineTo(185, 430);
    surface.strokePath();

    this.container.add([surface]);
    this.addZone(82, 515, "PACIFIC WATER", "coast and marine approach");
    this.addZone(610, 150, "CASCADE TERRAIN", "high-elevation corridors");
    this.addZone(350, 525, "INLAND VALLEY", "rail and distribution zone");
    this.addStructure(155, 190, "PORT");
    this.addStructure(445, 160, "RAIL");
    this.addStructure(755, 210, "AIR");
    this.addStructure(270, 450, "DC");
  }

  private drawGulfCoast(): void {
    const surface = this.scene.add.graphics();
    surface.fillStyle(0x0b3550, 0.44);
    surface.fillPoints([
      new Phaser.Geom.Point(0, 470), new Phaser.Geom.Point(150, 438),
      new Phaser.Geom.Point(270, 482), new Phaser.Geom.Point(405, 448),
      new Phaser.Geom.Point(535, 492), new Phaser.Geom.Point(680, 452),
      new Phaser.Geom.Point(820, 482), new Phaser.Geom.Point(960, 445),
      new Phaser.Geom.Point(960, 600), new Phaser.Geom.Point(0, 600)
    ], true);
    surface.lineStyle(2, 0x5fb1cf, 0.48);
    surface.beginPath();
    surface.moveTo(0, 470);
    surface.lineTo(150, 438);
    surface.lineTo(270, 482);
    surface.lineTo(405, 448);
    surface.lineTo(535, 492);
    surface.lineTo(680, 452);
    surface.lineTo(820, 482);
    surface.lineTo(960, 445);
    surface.strokePath();

    surface.fillStyle(0x406246, 0.2);
    surface.fillEllipse(270, 415, 260, 120);
    surface.fillEllipse(650, 420, 300, 110);
    surface.lineStyle(1, 0x83ad8a, 0.24);
    for (let offset = 0; offset < 4; offset += 1) {
      surface.strokeEllipse(290 + offset * 120, 414, 170, 70);
    }

    surface.lineStyle(5, 0x4c91b4, 0.3);
    surface.beginPath();
    surface.moveTo(510, 100);
    surface.lineTo(480, 210);
    surface.lineTo(545, 315);
    surface.lineTo(525, 470);
    surface.strokePath();

    surface.fillStyle(0xb98945, 0.1);
    surface.fillRoundedRect(595, 150, 220, 155, 20);
    this.container.add([surface]);
    this.addZone(120, 540, "GULF WATER", "shipping and coastal approach");
    this.addZone(315, 400, "WETLANDS", "low-lying flood exposure");
    this.addZone(690, 135, "ENERGY CORRIDOR", "transfer and industrial zone");
    this.addStructure(155, 210, "PORT");
    this.addStructure(420, 150, "RAIL");
    this.addStructure(760, 205, "AIR");
    this.addStructure(285, 455, "HUB");
  }

  private addZone(x: number, y: number, title: string, subtitle: string): void {
    const label = this.scene.add.text(x, y, `${title}\n${subtitle}`, {
      fontFamily: "Arial, sans-serif",
      fontSize: "8px",
      color: "#6f96ad",
      lineSpacing: 2,
      fontStyle: "bold"
    });
    this.container.add(label);
  }

  private addStructure(x: number, y: number, label: string): void {
    const marker = this.scene.add.rectangle(x, y + 30, 26, 14, 0x5a7890, 0.2)
      .setStrokeStyle(1, 0x8fb1c8, 0.36);
    const text = this.scene.add.text(x, y + 30, label, {
      fontFamily: "Arial, sans-serif",
      fontSize: "6px",
      color: "#93b0c4",
      fontStyle: "bold"
    }).setOrigin(0.5);
    this.container.add([marker, text]);
  }
}
