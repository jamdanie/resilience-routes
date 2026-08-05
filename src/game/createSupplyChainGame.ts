import Phaser from "phaser";
import { SupplyChainScene } from "./SupplyChainScene";
import type { Difficulty, MissionRunPlan } from "./types";

export function createSupplyChainGame(
  parent: HTMLElement,
  difficulty: Difficulty,
  runPlan: MissionRunPlan
): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 600,
    backgroundColor: "#08111f",
    scene: [new SupplyChainScene(difficulty, runPlan)],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 600
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false
    },
    input: {
      keyboard: true,
      mouse: true,
      touch: true
    },
    audio: {
      noAudio: true
    }
  });
}
