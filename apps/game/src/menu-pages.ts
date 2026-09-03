import { type MechanicId, WAVES } from "@neon-spore/content";
import type { DemoRow } from "./demo-menu.js";
import { backButton, el, type MenuPage } from "./menu-parts.js";

/**
 * The menu's three lists.
 *
 * Two of them already exist elsewhere — the authored waves and the keys
 * `input.ts` binds — and a hand-typed copy of either in markup is a copy that
 * drifts, so both are read off their source. The third is the demonstrations,
 * which `demo-menu.ts` reads off the mechanic registry for the same reason.
 */

/** Read off `bindControls`. One row per key a tester actually presses. */
const KEYS: [string, string][] = [
  ["A / D", "The cannon, and the shield along with it."],
  ["J / L", "The shield on its own."],
  ["I", "The guard trigger."],
  ["S", "The maw, to take a loose pod in."],
  ["F", "Hold the lance. Three beats with the cannon still, then one shot goes through three."],
  ["W", "Fire red — and guard in the same press."],
  ["E", "Fire cyan."],
  ["G", "Hold the nearest creature — the grip, as the other player."],
  ["← / →", "The previous and the next wave."],
  ["P", "Pause."],
  ["ESC", "This menu. It pauses the game while it is up, when you are playing alone."],
];

export function buildWaves(
  show: (page: MenuPage) => void,
  onWave: (wave: number) => void,
): HTMLElement {
  const page = el("div", "page");
  page.append(backButton(show), el("h2", undefined, "WAVES"));
  WAVES.forEach((wave, i) => {
    const button = el("button", "wave");
    button.type = "button";
    button.append(el("span", "n", String(i + 1).padStart(2, "0")));
    const name = el("span", "label", wave.name);
    if (wave.boss) name.append(el("span", "boss", " ✦"));
    button.append(name, el("span", "s", wave.sentence));
    button.addEventListener("click", () => onWave(i));
    page.append(button);
  });
  return page;
}

export function buildDemos(
  show: (page: MenuPage) => void,
  demos: DemoRow[],
  onDemo: (id: MechanicId) => void,
): HTMLElement {
  const page = el("div", "page");
  page.append(backButton(show), el("h2", undefined, "DEMOS"));
  for (const row of demos) {
    const button = el("button", "wave");
    button.type = "button";
    button.append(el("span", "n", row.id));
    button.append(el("span", "label", row.waveName), el("span", "s", row.what));
    button.addEventListener("click", () => onDemo(row.id));
    page.append(button);
  }
  return page;
}

export function buildKeys(show: (page: MenuPage) => void): HTMLElement {
  const page = el("div", "page");
  page.append(backButton(show), el("h2", undefined, "CONTROLS AT A DESK"));
  const table = el("table", "keys");
  for (const [key, what] of KEYS) {
    const row = el("tr");
    row.append(el("td", undefined, key), el("td", undefined, what));
    table.append(row);
  }
  page.append(table);
  page.append(
    el(
      "p",
      "foot",
      "On a phone the two strips answer separate thumbs — the keys are for one person at a desk playing both seats.",
    ),
    // The one control that is on neither strip, so a list of the strips
    // would never mention it.
    el(
      "p",
      "foot",
      "Either of you can press and hold anything falling: it drags at it and slows it, for as long as the finger stays. Both screens are told whose hand it is.",
    ),
  );
  return page;
}
