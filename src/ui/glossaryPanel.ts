import { createDrawerController, type DrawerController } from "./drawer";

export function createGlossaryPanelController(): DrawerController {
  return createDrawerController("#glossary-panel", "#close-glossary");
}
