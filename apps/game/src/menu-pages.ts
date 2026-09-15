import { type MechanicId, WAVES } from "@neon-spore/content";
import type { DemoRow } from "./demo-menu.js";
import { backButton, el, type MenuPage } from "./menu-parts.js";

/**
 * The menu's two jump lists.
 *
 * The waves already exist elsewhere and a hand-typed copy of them in markup is
 * a copy that drifts, so they are read off their source; the demonstrations
 * are `demo-menu.ts`'s reading of the mechanic registry, for the same reason.
 * The controls were a third list here and are `menu-controls.ts` now — that
 * page grew a phone's half, which is most of it. HOW TO PLAY was a fourth, and
 * on 14 September 2026 the owner took it off the menu: its two paragraphs and
 * its two seat cards described in prose what the intro scene now shows, and a
 * page nobody reaches is a page that drifts (`intro.ts`).
 *
 * Both lists are opened from TESTING rather than from the front page, so both
 * take where BACK goes: a page reached one floor down must not put the reader
 * two floors up.
 *
 * The level page is here too and is not a jump list. It came out of
 * `menu-view.ts` on 15 September 2026, when that file passed its limit under
 * the gear on a partner's row: the page learned to stand for two things — this
 * device's tempo and a pair's — and the heading and the closing sentence that
 * say which are more markup than the one that builds every page can hold.
 */

/**
 * **The three difficulties, and whose they are.**
 *
 * The rows themselves are a list like any other and are drawn by the caller;
 * what this holds is the frame around them and `setFor`, which is the only
 * thing on the page saying whether a press changes this device's tempo or the
 * tempo two people play at. `""` is the device's own.
 */
export interface LevelPage {
  page: HTMLElement;
  /** Drawn between the heading and `close`, by whoever owns the rows. */
  close: HTMLElement;
  setFor: (name: string) => void;
}

const TEMPO = "Only the speed changes: everything falls a tile a beat, so the setting is the beat.";

export function buildLevels(show: (page: MenuPage) => void): LevelPage {
  const page = el("div", "page");
  const head = el("h2", undefined, "DIFFICULTY");
  const close = el("p", "foot");
  // Back to PLAY and not to the front page: a page reached one floor down must
  // not put the reader two floors up (`menu-parts.ts`).
  page.append(backButton(show, "play"), head);
  const setFor = (name: string): void => {
    const who = name.trim().toUpperCase();
    head.textContent = who === "" ? "DIFFICULTY" : `TEMPO WITH ${who}`;
    close.textContent =
      who === ""
        ? `${TEMPO} Changing it starts the run again from the first wave.`
        : `${TEMPO} The room the two of you share is told the next time either of you goes in, and ${who} sees it there.`;
  };
  setFor("");
  return { page, close, setFor };
}

export function buildWaves(
  show: (page: MenuPage) => void,
  onWave: (wave: number) => void,
  back: MenuPage,
): HTMLElement {
  const page = el("div", "page");
  page.append(backButton(show, back), el("h2", undefined, "JUMP TO WAVE"));
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
  back: MenuPage,
): HTMLElement {
  const page = el("div", "page");
  page.append(backButton(show, back), el("h2", undefined, "JUMP TO ENEMY TYPE WAVE"));
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
