import { createDrawerController, type DrawerController } from "./drawer";

export function createGuidePanelController(): DrawerController {
  return createDrawerController("#guide-panel", "#close-guide");
}
