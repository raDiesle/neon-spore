import { type SpliceEntry, spliceStraws } from "@neon-spore/sim";
import { button, el } from "./dom.js";

/**
 * THE SPLICE's rounds, which are one number each.
 *
 * The shortest editor in the director, and it is short because the fight is:
 * the straws are laid from the seeded rng at the moment a round opens
 * (`sim/splice-tangle.ts`) and how many there are follows from the round index
 * (`spliceStraws`), so there is no board to paint and nothing to place. What
 * an author decides is how long the pair has, round by round — and how many
 * rounds there are, which is how hard the last one gets.
 *
 * So it is `snake-editor.ts` with the map taken out: the same row of tabs, for
 * the same reason — what makes the fight is as much the order of the rounds as
 * any one of them — and a beat clock under it instead of a grid. The straw
 * count is shown beside the clock rather than offered, because it is not an
 * author's to set; showing it is what makes the tabs legible, since ROUND 3 is
 * the four-straw one and nothing else on the panel would say so.
 */

/** Which round of the boss is open, kept across re-renders. */
const OPEN: WeakMap<SpliceEntry, number> = new WeakMap();

export function renderSpliceEditor(
  panel: HTMLElement,
  boss: SpliceEntry,
  onEdit: () => void,
): void {
  const at = Math.min(OPEN.get(boss) ?? 0, Math.max(0, boss.rounds.length - 1));
  const round = boss.rounds[at];
  const redraw = (next = at): void => {
    OPEN.set(boss, next);
    onEdit();
  };

  panel.appendChild(
    el(
      "p",
      "note",
      "A row of mouths over the plating, and a straw out of each running the " +
        "height of the field with a number at its far end. Player 2 sees the " +
        "tangle and the numbers and has no buttons; player 1 has the cannon " +
        "and the maw and sees the mouths only. The straws are laid from the " +
        "run's own seed, so there is nothing here to place — a round is how " +
        "long they have.",
    ),
  );
  panel.appendChild(tabs(boss, at, redraw));
  if (!round) return;
  panel.appendChild(clock(boss, at, redraw));
  const straws = spliceStraws(at);
  panel.appendChild(
    el(
      "p",
      "note",
      `${straws} straws · ${round.beats} beats · ` +
        `about ${Math.floor(round.beats / straws)} beats a feed, two of them spent watching`,
    ),
  );
}

/** One button per round, plus the two that add and remove one. */
function tabs(boss: SpliceEntry, at: number, redraw: (next?: number) => void): HTMLElement {
  const bar = el("div", "snake-tabs");
  boss.rounds.forEach((_, i) => {
    const tab = button(`ROUND ${i + 1}`, i === at ? "snake-tab on" : "snake-tab");
    tab.addEventListener("click", () => redraw(i));
    bar.appendChild(tab);
  });

  const add = button("+", "snake-tab");
  add.addEventListener("click", () => {
    // A new round carries one more straw than the last whether anybody asks or
    // not, so its clock opens eight beats longer — the six a feed costs plus
    // the slack the extra straw takes to trace. An author who wants otherwise
    // types over it; an author who wants the usual thing types nothing.
    const last = boss.rounds[boss.rounds.length - 1];
    boss.rounds.push({ beats: (last ? last.beats : 16) + 8 });
    redraw(boss.rounds.length - 1);
  });
  bar.appendChild(add);

  const drop = button("−", "snake-tab");
  drop.disabled = boss.rounds.length <= 1;
  drop.addEventListener("click", () => {
    boss.rounds.splice(at, 1);
    redraw(Math.max(0, at - 1));
  });
  bar.appendChild(drop);
  return bar;
}

/** The one authored number, as a row of steps rather than a text field. */
function clock(boss: SpliceEntry, at: number, redraw: () => void): HTMLElement {
  const row = el("div", "boss-fields");
  const set = (beats: number): void => {
    const round = boss.rounds[at];
    if (!round) return;
    round.beats = Math.max(4, Math.min(120, beats));
    redraw();
  };
  const less = button("−4", "snake-tab");
  less.addEventListener("click", () => set((boss.rounds[at]?.beats ?? 16) - 4));
  const more = button("+4", "snake-tab");
  more.addEventListener("click", () => set((boss.rounds[at]?.beats ?? 16) + 4));
  row.append(less, el("span", "note", `${boss.rounds[at]?.beats ?? 16} beats`), more);
  return row;
}
