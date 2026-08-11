import type { HudUpdate } from "../game/types";
import { formatSeconds, requiredElement } from "./dom";

export function updateHud(update: HudUpdate): void {
  requiredElement("#hud-resilience").textContent = String(update.resilience);
  requiredElement("#hud-completed").textContent = `${update.completed} / ${update.target}`;
  requiredElement("#hud-difficulty").textContent =
    update.difficulty.charAt(0).toUpperCase() + update.difficulty.slice(1);

  const fill = requiredElement<HTMLElement>("#hud-resilience-fill");
  fill.style.width = `${update.resilience}%`;
  fill.dataset.level =
    update.resilience >= 70 ? "stable" : update.resilience >= 40 ? "strained" : "critical";

  const timer = requiredElement("#hud-timer");
  const timerLabel = requiredElement("#hud-timer-label");

  if (update.remainingSeconds === null) {
    timer.textContent = "Untimed";
    timerLabel.textContent = "Learning mode";
  } else {
    timer.textContent = formatSeconds(update.remainingSeconds);
    timerLabel.textContent = update.remainingSeconds <= 30 ? "Immediate action required" : "Scenario clock";
  }
}
