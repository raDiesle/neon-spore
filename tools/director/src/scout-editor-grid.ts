import { AUTHORED_COL_MAX } from "@neon-spore/content";
import { DEFAULT_CONFIG, type ScoutArena, type ScoutPoint, scoutHome } from "@neon-spore/sim";
import { button, el } from "./dom.js";

/**
 * THE SCOUT's arena as the editor paints it: the cells, what a press does to
 * one, and what makes a level one the pair cannot win. The panel round it —
 * the levels, the speeds, the clock — is `scout-editor.ts`.
 *
 * **The grid is whole tiles of the seven-column arena every wave is authored
 * against**, and a piece belongs to the tile it stands in. A piece placed here
 * stands in the middle of its tile; one written by hand off the middle keeps
 * its exact place until a press moves it on, so opening a level never moves
 * anything. The mouth and the tile over it, where the ship is let go, are not
 * cells: nothing may be put there.
 */

type Kind = "mote" | "right" | "left";

/** What a cell is drawn as, with PINBALL's classes: a gold mote, a cyan hazard. */
const LOOK: Record<Kind, { mark: string; name: string; cls: string }> = {
  mote: { mark: "o", name: "mote — a power-up to fetch", cls: "mPegLit" },
  right: { mark: "→", name: "hazard, sweeping right", cls: "mBlock" },
  left: { mark: "←", name: "hazard, sweeping left", cls: "mBlock" },
};

export const SCOUT_COLS = AUTHORED_COL_MAX + 1;
const ROWS = DEFAULT_CONFIG.rows;
/** A new hazard's speed, in thousandths of a tile a beat: the first level's. */
const SPEED = 3_000;
const HOME = scoutHome(SCOUT_COLS, ROWS);

/** What makes a level one the pair cannot win, or null. */
export function scoutArenaFault(arena: ScoutArena): string | null {
  if (arena.motes.length === 0) return "there is no mote to fetch";
  if (arena.motes.some((m) => reserved(tileOf(m)))) return "a mote is on the mouth";
  return null;
}

export function scoutGrid(arena: ScoutArena, redraw: () => void): HTMLElement {
  const board = el("div", "pin-grid");
  board.style.gridTemplateColumns = `repeat(${SCOUT_COLS}, 1fr)`;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < SCOUT_COLS; c++) board.appendChild(cell(arena, c, r, redraw));
  }
  return board;
}

function cell(arena: ScoutArena, c: number, r: number, redraw: () => void): HTMLElement {
  if (reserved({ c, r })) {
    const home = button(r === tileOf(HOME).r ? "⌂" : "↑", "pin-cell mHome");
    home.title = r === tileOf(HOME).r ? "the mouth" : "where the ship is let go";
    home.disabled = true;
    return home;
  }
  const kind = kindAt(arena, c, r);
  const look = kind === null ? null : LOOK[kind];
  const b = button(look?.mark ?? "", `pin-cell ${look?.cls ?? "mEmpty"}`);
  b.title = look?.name ?? "empty";
  b.addEventListener("click", () => {
    press(arena, c, r, kind);
    redraw();
  });
  return b;
}

/** Walk a cell on: nothing → mote → hazard right → hazard left → nothing. */
export function press(arena: ScoutArena, c: number, r: number, kind = kindAt(arena, c, r)): void {
  const centre = { colMilli: c * 1000 + 500, rowMilli: r * 1000 + 500 };
  const inTile = (p: ScoutPoint) => sameTile(tileOf(p), { c, r });
  if (kind === null) {
    arena.motes = [...arena.motes, centre];
  } else if (kind === "mote") {
    const mote = arena.motes.find(inTile) ?? centre;
    arena.motes = arena.motes.filter((m) => m !== mote);
    arena.hazards = [...arena.hazards, { ...mote, vColMilli: SPEED, vRowMilli: 0 }];
  } else if (kind === "right") {
    arena.hazards = arena.hazards.map((h) =>
      inTile(h) ? { ...h, vColMilli: -h.vColMilli, vRowMilli: -h.vRowMilli } : h,
    );
  } else {
    arena.hazards = arena.hazards.filter((h) => !inTile(h));
  }
}

/** What stands in a tile: a mote first, then a hazard by the way it is going. */
export function kindAt(arena: ScoutArena, c: number, r: number): Kind | null {
  if (arena.motes.some((m) => sameTile(tileOf(m), { c, r }))) return "mote";
  const h = arena.hazards.find((p) => sameTile(tileOf(p), { c, r }));
  if (h === undefined) return null;
  return h.vColMilli > 0 || (h.vColMilli === 0 && h.vRowMilli > 0) ? "right" : "left";
}

interface Tile {
  c: number;
  r: number;
}

function tileOf(p: ScoutPoint): Tile {
  return { c: Math.floor(p.colMilli / 1000), r: Math.floor(p.rowMilli / 1000) };
}

function sameTile(a: Tile, b: Tile): boolean {
  return a.c === b.c && a.r === b.r;
}

/** The mouth's tile and the one over it, where the ship is let go. */
function reserved(t: Tile): boolean {
  const home = tileOf(HOME);
  return t.c === home.c && (t.r === home.r || t.r === home.r - 1);
}
