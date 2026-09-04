import { type MechanicId, WAVES } from "@neon-spore/content";
import type { DemoRow } from "./demo-menu.js";
import { backButton, el, type MenuPage } from "./menu-parts.js";

/**
 * The menu's two jump lists, and the page a pair reads first.
 *
 * The waves already exist elsewhere and a hand-typed copy of them in markup is
 * a copy that drifts, so they are read off their source; the demonstrations
 * are `demo-menu.ts`'s reading of the mechanic registry, for the same reason.
 * The controls were a third list here and are `menu-controls.ts` now — that
 * page grew a phone's half, which is most of it.
 *
 * Both lists are opened from TESTING rather than from the front page, so both
 * take where BACK goes: a page reached one floor down must not put the reader
 * two floors up.
 */

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

/**
 * The pair's first thirty seconds, before a wave's own briefing reaches them.
 *
 * Description rather than persuasion: what the two seats are, what each one
 * holds, that nothing either of them controls travels, and the one rule that
 * is the whole game. It says the same words the rest of the game says — hull,
 * cannon, shield, guard, maw, pod, column — because the pair has to be able to
 * repeat them to each other across a voice delay.
 */
export function buildHowTo(show: (page: MenuPage) => void): HTMLElement {
  const page = el("div", "page");
  page.append(backButton(show), el("h2", undefined, "HOW TO PLAY"));
  page.append(
    el(
      "p",
      "lead",
      "There are two of you, on two devices, and you are given different jobs. Neither screen shows what the other one shows.",
    ),
  );
  for (const [seat, name, what] of SEAT_JOBS) {
    const block = el("div", "job");
    block.append(el("span", "tag", seat), el("span", "name", name), el("span", "s", what));
    page.append(block);
  }
  page.append(
    el(
      "p",
      "lead",
      "Nothing you control travels. The hull runs the width of the field, the cannon slides along it, the shield slides in front of it — there is no flying, no dodging and nowhere to go. What moves is what is coming down the columns at you.",
    ),
    // The one rule that is the whole game, so it is not a footnote: `.foot` is
    // for an aside, and this page exists to say this sentence.
    el(
      "p",
      "rule",
      "So talking to each other is the control scheme. One of you can see what the other one has to answer, and a column is the word you both have.",
    ),
  );
  return page;
}

/** The two seats, in the words the seat cards on the front page use. */
const SEAT_JOBS: [string, string, string][] = [
  ["P1", "PILOT", "Slides the cannon, opens the maw for a loose pod, triggers the guard."],
  ["P2", "NAVIGATOR", "Slides the shield, fires red and cyan."],
];
