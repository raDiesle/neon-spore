import { DEFAULT_CONFIG, type SnakeEntry, type SnakeRound, type SnakeTile } from "@neon-spore/sim";
import { button, el } from "./dom.js";

/**
 * SNAKE's arena, edited on the grid the pair will play it on.
 *
 * The second boss authored as a picture rather than as numbers, and for THE
 * FLEET's reason: where a thing stands *is* the fight. An enemy four tiles up
 * the body's opening column is four seconds for player 1 to see it and say so;
 * the same enemy in a corner is a detour the pair has to plan. None of that is
 * legible as a list of `col`/`row` pairs, so it is a map.
 *
 * **One gesture and no modes.** A press cycles the square: empty → enemy →
 * point → meteor → empty. There is no brush to arm and nothing to put down
 * first, which is what keeps it usable on a phone — the same standard
 * `fleet-editor.ts` set, arrived at from the other end (a fleet has one kind
 * of thing in five sizes; this has three kinds and one size).
 *
 * **One map per round**, and the rounds are a row of tabs: what makes the
 * fight is as much the order of the three as any one of them, and an author
 * has to be able to step along it. The clock and the step live beside the map
 * they belong to for the same reason.
 */

/** Which round of the boss is open, kept across re-renders. */
const OPEN: WeakMap<SnakeEntry, number> = new WeakMap();

export function renderSnakeEditor(panel: HTMLElement, boss: SnakeEntry, onEdit: () => void): void {
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
      "The ship shrinks into a snake that never stops. Player 2 turns it a " +
        "quarter turn at a time and sees none of this; player 1 sees all of it " +
        "and can only shoot and open the mouth. Press a square to cycle it: " +
        "empty, enemy, point, meteor — and a meteor is the one nobody can do " +
        "anything about but steer around.",
    ),
  );
  panel.appendChild(tabs(boss, at, redraw));
  if (!round) return;
  panel.appendChild(grid(round, redraw));
  panel.appendChild(numbers(round, redraw));
  panel.appendChild(
    el(
      "p",
      "note",
      `${round.enemies.length} to shoot · ${round.points.length} to swallow · ` +
        `${round.rocks.length} to go round · ${round.beats} beats · ` +
        `a step every ${round.stepTicks} ticks`,
    ),
  );
}

/** One button per round, plus the two that add and remove one. */
function tabs(boss: SnakeEntry, at: number, redraw: (next?: number) => void): HTMLElement {
  const bar = el("div", "snake-tabs");
  boss.rounds.forEach((_, i) => {
    const tab = button(`ROUND ${i + 1}`, i === at ? "snake-tab on" : "snake-tab");
    tab.addEventListener("click", () => redraw(i));
    bar.appendChild(tab);
  });

  const add = button("+", "snake-tab");
  add.addEventListener("click", () => {
    // A new round is empty and slightly faster than the last, which is the
    // shape every snake wave has had so far — an author who wants otherwise
    // types over it, and an author who wants the usual thing types nothing.
    const last = boss.rounds[boss.rounds.length - 1];
    boss.rounds.push({
      enemies: [],
      points: [],
      rocks: [],
      beats: last ? last.beats : 40,
      stepTicks: Math.max(20, (last ? last.stepTicks : 90) - 20),
    });
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

/** The arena, as a grid of buttons — the same tiles the round is played on. */
function grid(round: SnakeRound, redraw: () => void): HTMLElement {
  const cfg = DEFAULT_CONFIG;
  const wrap = el("div", "snake-grid");
  wrap.style.gridTemplateColumns = `repeat(${cfg.snakeCols}, 1fr)`;
  for (let row = 0; row < cfg.snakeRows; row++) {
    for (let col = 0; col < cfg.snakeCols; col++) {
      wrap.appendChild(square(round, col, row, redraw));
    }
  }
  return wrap;
}

/** Where the body opens: the middle column, at the bottom, pointing up. */
function isStart(col: number, row: number): boolean {
  const cfg = DEFAULT_CONFIG;
  return col === Math.floor(cfg.snakeCols / 2) && row >= cfg.snakeRows - cfg.snakeStartTiles;
}

/** One tile of the arena, and the one gesture that edits it. */
function square(round: SnakeRound, col: number, row: number, redraw: () => void): HTMLElement {
  const enemy = index(round.enemies, col, row);
  const point = index(round.points, col, row);
  const rock = index(round.rocks, col, row);
  const cell = button("", "snake-cell");
  if (enemy !== -1) cell.classList.add("enemy");
  if (point !== -1) cell.classList.add("point");
  if (rock !== -1) cell.classList.add("rock");
  // The three tiles the body already fills are marked rather than forbidden:
  // an author may want a point one step off the start, and the only thing that
  // would actually be unplayable is a thing *under* the opening body.
  if (isStart(col, row)) cell.classList.add("start");
  cell.title = `${col},${row}${isStart(col, row) ? " — the body starts here" : ""}`;
  cell.addEventListener("click", () => {
    if (enemy !== -1) {
      round.enemies.splice(enemy, 1);
      round.points.push({ col, row });
    } else if (point !== -1) {
      round.points.splice(point, 1);
      round.rocks.push({ col, row });
    } else if (rock !== -1) {
      round.rocks.splice(rock, 1);
    } else {
      round.enemies.push({ col, row });
    }
    redraw();
  });
  return cell;
}

function index(list: readonly SnakeTile[], col: number, row: number): number {
  return list.findIndex((t) => t.col === col && t.row === row);
}

/** The attempt's clock and the body's speed, beside the map they belong to. */
function numbers(round: SnakeRound, redraw: () => void): HTMLElement {
  const fields = el("div", "boss-fields");
  fields.append(
    numberField("beats in an attempt", 8, 200, round.beats, (v) => {
      round.beats = v;
      redraw();
    }),
    numberField("ticks a step", 20, 240, round.stepTicks, (v) => {
      round.stepTicks = v;
      redraw();
    }),
  );
  return fields;
}

/**
 * One labelled number. `boss-cycles.ts` has the same helper and this one is
 * deliberately not imported from it: that file is the two rendered cycles, and
 * a map editor reaching into it for an input would be the first thread of a
 * knot. Six lines is cheaper than the coupling.
 */
function numberField(
  label: string,
  min: number,
  max: number,
  value: number,
  onChange: (v: number) => void,
): HTMLElement {
  const wrap = el("label", "boss-field");
  wrap.appendChild(el("span", "", label));
  const input = document.createElement("input");
  input.type = "number";
  input.min = String(min);
  input.max = String(max);
  input.value = String(value);
  input.addEventListener("change", () => {
    const next = Number(input.value);
    if (!Number.isFinite(next)) return;
    onChange(Math.max(min, Math.min(max, Math.round(next))));
  });
  wrap.appendChild(input);
  return wrap;
}
