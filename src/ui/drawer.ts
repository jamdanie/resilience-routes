import { requiredElement } from "./dom";

export interface DrawerController {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function createDrawerController(
  panelSelector: string,
  closeSelector: string
): DrawerController {
  const panel = requiredElement<HTMLElement>(panelSelector);
  const closeButton = requiredElement<HTMLButtonElement>(closeSelector);

  const open = (): void => {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    closeButton.focus();
  };

  const close = (): void => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".drawer.open")) {
      document.body.classList.remove("drawer-open");
    }
  };

  const toggle = (): void => {
    if (panel.classList.contains("open")) close();
    else open();
  };

  closeButton.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("open")) close();
  });

  return { open, close, toggle };
}
