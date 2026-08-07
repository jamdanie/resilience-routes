import { requiredElement } from "./dom";

export type CommandId =
  | "pause"
  | "focus"
  | "map"
  | "labels"
  | "lens"
  | "zoom-in"
  | "zoom-out"
  | "zoom-reset"
  | "reference"
  | "glossary";

export interface CommandPaletteController {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
}

export function createCommandPaletteController(
  runCommand: (command: CommandId) => void
): CommandPaletteController {
  const backdrop = requiredElement<HTMLElement>("#command-palette");
  const input = requiredElement<HTMLInputElement>("#command-search");
  const list = requiredElement<HTMLElement>("#command-list");
  const empty = requiredElement<HTMLElement>("#command-empty");
  const closeButton = requiredElement<HTMLButtonElement>("#close-command-palette");
  const buttons = [...list.querySelectorAll<HTMLButtonElement>("[data-command]")];
  let visibleButtons = [...buttons];
  let activeIndex = 0;

  const setActive = (index: number): void => {
    if (visibleButtons.length === 0) return;
    activeIndex = (index + visibleButtons.length) % visibleButtons.length;
    buttons.forEach((button) => button.removeAttribute("data-active"));
    const active = visibleButtons[activeIndex];
    active.dataset.active = "true";
    active.scrollIntoView({ block: "nearest" });
  };

  const filter = (): void => {
    const query = input.value.trim().toLowerCase();
    visibleButtons = buttons.filter((button) => {
      const matches = button.textContent?.toLowerCase().includes(query) ?? false;
      button.classList.toggle("hidden", !matches);
      return matches;
    });
    empty.classList.toggle("hidden", visibleButtons.length > 0);
    activeIndex = 0;
    setActive(0);
  };

  const open = (): void => {
    backdrop.classList.remove("hidden");
    backdrop.setAttribute("aria-hidden", "false");
    input.value = "";
    filter();
    window.requestAnimationFrame(() => input.focus());
  };

  const close = (): void => {
    backdrop.classList.add("hidden");
    backdrop.setAttribute("aria-hidden", "true");
  };

  const execute = (button: HTMLButtonElement): void => {
    const command = button.dataset.command as CommandId | undefined;
    if (!command) return;
    close();
    runCommand(command);
  };

  input.addEventListener("input", filter);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(activeIndex - 1);
    } else if (event.key === "Enter" && visibleButtons[activeIndex]) {
      event.preventDefault();
      execute(visibleButtons[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });

  list.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-command]");
    if (button) execute(button);
  });
  list.addEventListener("mousemove", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-command]");
    const index = button ? visibleButtons.indexOf(button) : -1;
    if (index >= 0) setActive(index);
  });
  closeButton.addEventListener("click", close);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });

  return {
    open,
    close,
    toggle: () => (backdrop.classList.contains("hidden") ? open() : close()),
    isOpen: () => !backdrop.classList.contains("hidden")
  };
}
