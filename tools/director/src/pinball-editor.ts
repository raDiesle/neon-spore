import { PIN_COLS, pinBoard, pinBoardRows, pinPicture } from "@neon-spore/content";
import { DEFAULT_CONFIG, type PinballEntry, pinballFault } from "@neon-spore/sim";
import { button, el } from "./dom.js";

/**
 * PINBALL's boards, painted on the grid the round is played on.
 *
 * The second boss the director *edits* rather than documents, and it is here
 * for `fleet-editor.ts`' reason word for word: where the pieces are **is** the
 * fight — whether there is a lane back down the middle, how far a target is
 * from a wall the ball can bank off — and none of that is legible as forty
 * rows of `{ kind, xMilli, yMilli }`.
 *
 * **One gesture and no modes.** A press on a cell walks it through the five
 * things a cell can be, in the order an author wants them: nothing, peg,
 * target peg, block, target block, nothing again. There is no brush to pick up
 * and put down, so there is nothing to be holding by mistake — the same
 * property the fleet's two gestures have, arrived at from the other end.
 *
 * **The grid is exactly the board `pinBoard` reads**, and its size is asked of
 * `pinBoardRows` rather than written down here, so an author cannot paint a
 * board the game would refuse. `pinballFault` says the rest under the grid.
 */

/** What a cell can be, in the order a press walks through them. */
const MARKS = [".", "o", "O", "=", "#"] as const;

/** What each is called, and the class it is drawn with. Two marks are not
 * legal in a CSS identifier, so the class is a word rather than the mark. */
const MARK_LOOK: Record<string, { name: string; cls: string }> = {
  ".": { name: "empty", cls: "mEmpty" },
  o: { name: "peg", cls: "mPeg" },
  O: { name: "target peg — one of the lit ones a round has to clear", cls: "mPegLit" },
  "=": { name: "block", cls: "mBlock" },
  "#": { name: "target block", cls: "mBlockLit" },
};

/** Which board is being painted, kept across the re-render every press causes. */
const SHOWN: WeakMap<PinballEntry, number> = new WeakMap();

export function renderPinballEditor(
  panel: HTMLElement,
  boss: PinballEntry,
  onEdit: () => void,
): void {
  const at = Math.min(SHOWN.get(boss) ?? 0, boss.rounds.length - 1);
  const round = boss.rounds[at];
  if (round === undefined) return;
  const redraw = (): void => {
    SHOWN.set(boss, at);
    onEdit();
  };

  panel.appendChild(
    el(
      "p",
      "note",
      "The ship folds into a bucket that fires the ball and has to catch it " +
        "again. Press a cell to walk it through empty, peg, target peg, block, " +
        "target block. Only the target pieces have to go for a board to be " +
        "cleared — the rest is scenery that still bounces.",
    ),
  );

  panel.appendChild(tabs(boss, at, redraw));
  panel.appendChild(grid(round.pieces, redraw));
  panel.appendChild(clock(round, redraw));

  const fault = pinballFault(round.pieces, DEFAULT_CONFIG);
  if (fault === null) return;
  panel.appendChild(el("p", "note fleet-fault", `this is not a table yet: ${fault}`));
}

/** One button per board, and the two that add and remove one. */
function tabs(boss: PinballEntry, at: number, redraw: () => void): HTMLElement {
  const row = el("div", "pin-tabs");
  boss.rounds.forEach((_, i) => {
    const tab = button(`TABLE ${i + 1}`, i === at ? "pin-tab on" : "pin-tab");
    tab.addEventListener("click", () => {
      SHOWN.set(boss, i);
      redraw();
    });
    row.appendChild(tab);
  });

  const add = button("+", "pin-tab");
  add.addEventListener("click", () => {
    const last = boss.rounds[boss.rounds.length - 1];
    boss.rounds.push({
      beats: last?.beats ?? 44,
      // A copy of the one before rather than an empty grid: a board is edited
      // out of a board, and a blank table is a `pinballFault` an author has to
      // clear before they can see anything at all.
      pieces: (last?.pieces ?? []).map((p) => ({ ...p })),
    });
    SHOWN.set(boss, boss.rounds.length - 1);
    redraw();
  });
  row.appendChild(add);

  const drop = button("REMOVE", "pin-tab");
  drop.disabled = boss.rounds.length <= 1;
  drop.addEventListener("click", () => {
    boss.rounds.splice(at, 1);
    SHOWN.set(boss, Math.max(0, Math.min(at, boss.rounds.length - 1)));
    redraw();
  });
  row.appendChild(drop);
  return row;
}

/** The board, as the picture `pinBoard` reads and `pinPicture` writes. */
function grid(pieces: PinballEntry["rounds"][number]["pieces"], redraw: () => void): HTMLElement {
  const rows = pinPicture(pieces).split("\n");
  const board = el("div", "pin-grid");
  board.style.gridTemplateColumns = `repeat(${PIN_COLS}, 1fr)`;
  for (let r = 0; r < pinBoardRows(); r++) {
    for (let c = 0; c < PIN_COLS; c++) {
      board.appendChild(cell(pieces, rows, r, c, redraw));
    }
  }
  return board;
}

/** One cell. A press walks it to the next mark and rebuilds the board. */
function cell(
  pieces: PinballEntry["rounds"][number]["pieces"],
  rows: readonly string[],
  r: number,
  c: number,
  redraw: () => void,
): HTMLElement {
  const mark = rows[r]?.[c] ?? ".";
  const look = MARK_LOOK[mark] ?? { name: mark, cls: "mEmpty" };
  const cellEl = button(mark === "." ? "" : mark, `pin-cell ${look.cls}`);
  cellEl.title = look.name;
  cellEl.addEventListener("click", () => {
    const next = MARKS[(MARKS.indexOf(mark as (typeof MARKS)[number]) + 1) % MARKS.length] ?? ".";
    const lines = rows.map((line, i) =>
      i === r ? line.slice(0, c) + next + line.slice(c + 1) : line,
    );
    // Rebuilt through `pinBoard` rather than edited in place: the picture is
    // the authored thing and the pieces are what it compiles to, so an edit
    // that touched the pieces would be an edit the file could not carry.
    pieces.length = 0;
    pieces.push(...pinBoard(lines.join("\n")));
    redraw();
  });
  return cellEl;
}

/** How long this board lasts, in beats. The only number a board has. */
function clock(round: PinballEntry["rounds"][number], redraw: () => void): HTMLElement {
  const row = el("div", "pin-clock");
  row.appendChild(el("span", "note", `${round.beats} beats`));
  for (const [label, by] of [
    ["−4", -4],
    ["+4", 4],
  ] as const) {
    const step = button(label, "fleet-len");
    step.addEventListener("click", () => {
      round.beats = Math.max(8, Math.min(200, round.beats + by));
      redraw();
    });
    row.appendChild(step);
  }
  return row;
}
