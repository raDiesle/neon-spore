import { type MechanicId, WAVES } from "@neon-spore/content";
import type { DemoRow } from "./demo-menu.js";
import { readLastWave } from "./last-wave.js";
import { backButton, el, type MenuPage } from "./menu-parts.js";
import { MARKS, type MarkId, marksMatch, waveMatches } from "./menu-wave-filter.js";

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

/** The waves page, and what to do each time it is shown: find the wave this
 * device last opened, mark it and bring it to the middle of `box`, the menu's
 * scrolling element. */
export interface WavesPage {
  page: HTMLElement;
  arrive: (box: HTMLElement) => void;
}

export function buildWaves(
  show: (page: MenuPage) => void,
  onWave: (wave: number) => void,
  back: MenuPage,
): WavesPage {
  const page = el("div", "page");
  page.append(backButton(show, back), el("h2", undefined, "JUMP TO WAVE"));

  // The director's own filter, asked for here too (`menu-wave-filter.ts`):
  // one field, above the list, the note under it only while it is filtering.
  const filter = el("input", "wave-filter") as HTMLInputElement;
  filter.type = "text";
  filter.placeholder = "a name, a boss, a word from its guide";
  filter.autocomplete = "off";
  filter.spellcheck = false;
  // The director's row of marks with it, pressed to narrow: ORed with each
  // other, ANDed with the field, so `✦` and `queen` is the boss waves that
  // say queen.
  const pressed = new Set<MarkId>();
  const marks = el("div", "wave-marks");
  for (const [id, glyph, word] of MARKS) {
    const toggle = el("button", "wave-mark", `${glyph} ${word}`);
    toggle.type = "button";
    toggle.setAttribute("aria-pressed", "false");
    toggle.addEventListener("click", () => {
      if (pressed.has(id)) pressed.delete(id);
      else pressed.add(id);
      toggle.setAttribute("aria-pressed", String(pressed.has(id)));
      refresh();
    });
    marks.append(toggle);
  }
  const note = el("p", "wave-filter-note");
  note.hidden = true;
  page.append(filter, marks, note);

  const rows = WAVES.map((wave, i) => {
    const button = el("button", "wave");
    button.type = "button";
    button.append(el("span", "n", String(i + 1).padStart(2, "0")));
    const name = el("span", "label", wave.name);
    if (wave.boss) name.append(el("span", "boss", " ✦"));
    button.append(name, el("span", "s last-note", "LAST PLAYED"));
    button.addEventListener("click", () => onWave(i));
    page.append(button);
    return button;
  });

  const refresh = (): void => {
    const query = filter.value;
    let matched = 0;
    rows.forEach((row, i) => {
      const on = waveMatches(i, query) && marksMatch(i, pressed);
      row.hidden = !on;
      if (on) matched += 1;
    });
    note.hidden = query.trim() === "" && pressed.size === 0;
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

  // The wave this device last opened (`last-wave.ts`), read on every showing
  // rather than once: it changes each time a wave is played from here.
  const arrive = (box: HTMLElement): void => {
    const last = readLastWave(rows.length);
    for (const [i, row] of rows.entries()) row.classList.toggle("last", i === last);
    const row = last === null ? undefined : rows[last];
    if (!row || row.hidden) return;
    const offset = row.getBoundingClientRect().top - box.getBoundingClientRect().top;
    box.scrollTop += offset - (box.clientHeight - row.offsetHeight) / 2;
  };

  return { page, arrive };
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
