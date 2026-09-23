import { type MechanicId, WAVES } from "@neon-spore/content";
import type { DemoRow } from "./demo-menu.js";
import { backButton, el, type MenuPage } from "./menu-parts.js";
import { waveMatches } from "./menu-wave-filter.js";

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
 * The level page was here too, between 15 September 2026 and later the same
 * day: it came out of `menu-view.ts` when the gear on a partner's row pushed
 * that file past its limit, and went when the gear did. A tempo is settled once
 * now, on the room screen while the game is being made (`join-room-step.ts`).
 */

export function buildWaves(
  show: (page: MenuPage) => void,
  onWave: (wave: number) => void,
  back: MenuPage,
): HTMLElement {
  const page = el("div", "page");
  page.append(backButton(show, back), el("h2", undefined, "JUMP TO WAVE"));

  // The director's own filter, asked for here too (`menu-wave-filter.ts`):
  // one field, above the list, the note under it only while it is filtering.
  const filter = el("input", "wave-filter") as HTMLInputElement;
  filter.type = "text";
  filter.placeholder = "a name, a boss, a word from its guide";
  filter.autocomplete = "off";
  filter.spellcheck = false;
  const note = el("p", "wave-filter-note");
  note.hidden = true;
  page.append(filter, note);

  const rows = WAVES.map((wave, i) => {
    const button = el("button", "wave");
    button.type = "button";
    button.append(el("span", "n", String(i + 1).padStart(2, "0")));
    const name = el("span", "label", wave.name);
    if (wave.boss) name.append(el("span", "boss", " ✦"));
    button.append(name, el("span", "s", wave.sentence));
    button.addEventListener("click", () => onWave(i));
    page.append(button);
    return button;
  });

  const refresh = (): void => {
    const query = filter.value;
    let matched = 0;
    rows.forEach((row, i) => {
      const on = waveMatches(i, query);
      row.hidden = !on;
      if (on) matched += 1;
    });
    note.hidden = query.trim() === "";
    note.textContent = matched === 0 ? "nothing matches" : `${matched} of ${rows.length}`;
  };
  filter.addEventListener("input", refresh);
  // Escape empties it rather than only blurring it, the way a search field
  // does everywhere else — the list comes straight back, so there is no
  // second step to undo a filter with.
  filter.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !filter.value) return;
    e.preventDefault();
    filter.value = "";
    refresh();
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
    const button = el("button", "wave demo");
    button.type = "button";
    button.append(el("span", "n", row.id));
    button.append(el("span", "label", row.waveName), el("span", "s", row.what));
    button.addEventListener("click", () => onDemo(row.id));
    page.append(button);
  }
  return page;
}
