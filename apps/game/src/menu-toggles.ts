import { atADesk } from "./at-a-desk.js";
import { canFullscreen, leaveFullscreen } from "./fullscreen.js";
import { canVibrate } from "./haptics.js";
import { el } from "./menu-parts.js";
import type { SettingsHooks } from "./menu-settings.js";
import { readSettings, type Settings, updateSettings } from "./settings.js";

/**
 * SETTINGS' switches: the things about this device a person may turn on and
 * off, and the one row shape all of them are drawn as.
 *
 * Here rather than on the page itself because the page is a list of rows of
 * several kinds — two that open something, a name, a sign-in, an install, a
 * way out — and the switches are the only kind there are several of. Splitting
 * on the kind with the table keeps `menu-settings.ts` the order of the page
 * and this file the switches themselves, which is the seam CLAUDE.md's line
 * limit asked for the day the WHAT THIS IS row arrived.
 *
 * A switch says what it means **in both positions** (`on`, `off`) rather than
 * naming itself twice, for the reason BUZZ's own comment gives.
 */

export interface ToggleRow {
  key: keyof Settings;
  label: string;
  /** What it means when it is on, in one line. */
  on: string;
  /** What it means when it is off. */
  off: string;
  /** Whether this device can offer it at all. */
  available?: () => boolean;
  apply: (hooks: SettingsHooks, value: boolean) => void;
}

export const TOGGLES: ToggleRow[] = [
  {
    key: "sound",
    label: "SOUND",
    on: "The mixer is playing.",
    off: "Silent. The wave still says everything it says on screen.",
    apply: (hooks, value) => hooks.setSound(value),
  },
  {
    key: "motion",
    label: "MOTION",
    on: "The menu animates.",
    off: "Still. Nothing on the menu moves on its own.",
    apply: (hooks, value) => hooks.setMotion(value),
  },
  {
    key: "haptics",
    label: "BUZZ",
    // The two events, named, because a toggle whose effect is a surprise is a
    // toggle people leave alone. See `haptics.ts`.
    on: "A short buzz for a shot in the wrong colour, a long one for the hull.",
    off: "The phone stays still.",
    // Absent on desktop and on iOS: a switch that turns nothing on is worse
    // than no switch.
    available: canVibrate,
    apply: () => {},
  },
  {
    key: "fullscreen",
    label: "FULL SCREEN",
    on: "The field takes the whole screen and stays portrait.",
    off: "The browser keeps its address bar and its buttons.",
    // Absent where there is no element fullscreen to ask for, and absent at a
    // desk — where the request is never made either (`fullscreen.ts`), and a
    // switch that turns nothing on is worse than no switch.
    available: () => canFullscreen() && !atADesk(),
    // Turning it off is the way back out for a player who cannot find the
    // platform's own, so it acts on the spot. Turning it on does not take the
    // screen from under the menu: the press it belongs to is the one onto the
    // field.
    apply: (_hooks, value) => {
      if (!value) leaveFullscreen();
    },
  },
  {
    key: "shipTouch",
    label: "TOUCH THE SHIP",
    on: "Drag the cannon and the shield on the ship itself, or use the panel.",
    off: "Only the panel moves the cannon and the shield.",
    // Read by the field on every press (`field-input.ts`), so it takes hold
    // on the next one and has nothing to do here.
    apply: () => {},
  },
];

export function toggleRow(row: ToggleRow, hooks: SettingsHooks): HTMLElement {
  const block = el("div", "setting");
  const button = el("button", "switch");
  button.type = "button";
  const what = el("span", "s");

  const paint = (): void => {
    const value = readSettings()[row.key];
    button.textContent = `${row.label}  ${value ? "ON" : "OFF"}`;
    button.classList.toggle("on", value);
    what.textContent = value ? row.on : row.off;
  };

  button.addEventListener("click", () => {
    const next = !readSettings()[row.key];
    updateSettings((held) => ({ ...held, [row.key]: next }));
    row.apply(hooks, next);
    paint();
  });

  paint();
  block.append(button, what);
  return block;
}
