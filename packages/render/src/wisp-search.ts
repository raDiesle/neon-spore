import type { SimConfig } from "@neon-spore/sim";
import { wispRows } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * THE WISP's search: the box that walks the field on the screen that cannot
 * see the body.
 *
 * **Player 1 had a grid, a siren and a pip, and nothing on the field itself.**
 * The lattice gave them somewhere to put a word, the corner light said
 * somebody had one and the pip said the last one had expired — three true
 * things, all of them at the edges of the picture. The field in the middle was
 * an empty grid, which is what a field with nothing on it looks like, and this
 * wave is the one where the field is not empty. So the seat holding the cannon
 * was being asked to stare at a plausible nothing.
 *
 * What it has now is an instrument visibly *looking*: one target-lock frame
 * that settles on a tile, sits a moment, and slides to another one somewhere
 * else. It is the seat's own scanner sweeping the grid, and it says the one
 * thing that is both true and safe — *something is out there and this machine
 * has not found it*.
 *
 * **It knows nothing about where the wisp is, and that is enforced by the
 * signature rather than by care.** Nothing in this file takes a `Creature`, a
 * column or a row. The path comes off the wall clock and a fixed hash and
 * nothing else, so there is no expression anywhere here that *could* be
 * derived from the body's tile. A leak in this file would hand the pilot the
 * whole creature, so the way to not leak is to have nothing to leak from.
 *
 * It will pass over the wisp's tile now and then, which is a coincidence and
 * costs nothing: a pilot who fires at the box learns inside one wave that the
 * box is not an answer, and the pair goes back to the only thing that is —
 * the navigator saying a square out loud.
 *
 * **Searching is the target lock's second state, not a fifth picture.**
 * `target-lock.ts` says the frame means *an instrument has picked this body
 * out*; this is the same instrument before it has. What separates the two is
 * what an instrument panel already separates them by and what the file's own
 * argument asks for — the frame stays the frame, and everything inside and
 * around it says which state it is in. A lock is at full strength, in the
 * colour of the thing it found, and does not move off it. This is at half,
 * violet — the wisp's own colour, which nothing else on this field is drawn in
 * and which the siren in the corner is already lit with — and never at rest.
 *
 * **One box for the whole field, however many wisps are on it.** The same
 * argument `beat.ts` makes for pushing one `wispHop` event rather than one per
 * body: this is the seat's scanner and there is one of those. Two boxes would
 * say a count, and a count is a fact about the field that the navigator is
 * supposed to be telling them.
 */

/**
 * Whether this screen draws the search. The mirror of `showsWisp`: the seat
 * that can see the body has no use for a machine hunting for it, and would be
 * reading a second moving square on the one screen where a square means a
 * tile. `test` draws it beside the bodies, because it is both halves at once.
 */
export function showsWispSearch(l: Layout): boolean {
  return l.role !== "p2";
}

/** Seconds one search step takes, and the share of it spent sitting still. A
 * box that never settled would be a thing floating; one that teleported would
 * be a thing blinking. It stops, looks, and moves on. */
const STEP_SECONDS = 1.25;
const HOLD = 0.6;

/** How bright the frame gets while it is settled, and while it is travelling.
 * Both well under a real lock's: this instrument has found nothing, and a mark
 * at full strength saying nothing is a mark the pilot learns to distrust and
 * then cannot read when it means something. */
const SETTLED_ALPHA = 0.5;
const MOVING_ALPHA = 0.22;

/**
 * A repeatable 0..1 off one number — `target-lock.ts`'s own `noise`, which is
 * private to that file. Copied rather than exported for once, and the reason
 * is the subject of this file: what a marking jitters by and where a scanner
 * looks are two different questions, and a shared helper between them is an
 * invitation to pass a position into one of them.
 */
function hash(n: number): number {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * The tile the search is on at step `k` — a column and a row, off the hash and
 * nothing else.
 *
 * Rows come from `wispRows`, the simulation's own rule for where a wisp may
 * stand, so the scanner looks in the region a body could actually be in rather
 * than over the hull. That is a rule and not a position: it says the same
 * thing whether or not anything is on the field, which is exactly the test a
 * mark on this screen has to pass.
 */
export function wispSearchTile(
  l: Layout,
  cfg: SimConfig,
  step: number,
): { col: number; row: number } {
  const rows = Math.max(1, Math.min(l.rows, wispRows(cfg)));
  return {
    col: Math.min(l.cols - 1, Math.floor(hash(step * 1.37 + 0.11) * l.cols)),
    row: Math.min(rows - 1, Math.floor(hash(step * 2.71 + 0.53) * rows)),
  };
}

/**
 * The frame, wherever the sweep has it this frame.
 *
 * Smoothstepped between two tiles rather than linear, which is the one place
 * this file deliberately does *not* copy how a body moves: every creature in
 * the game glides at a flat rate so that "it lands on the four" is a statement
 * both players can act on, and this is not a creature. It is a machine head
 * moving between two places it wants to look at, and a machine head eases.
 */
export function drawWispSearch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  time: number,
): void {
  const u = time / STEP_SECONDS;
  const step = Math.floor(u);
  const f = u - step;
  const move = f <= HOLD ? 0 : (f - HOLD) / (1 - HOLD);
  const e = move * move * (3 - 2 * move);

  const from = wispSearchTile(l, cfg, step);
  const to = wispSearchTile(l, cfg, step + 1);
  const x = tileCX(l, from.col + (to.col - from.col) * e);
  const y = tileCY(l, from.row + (to.row - from.row) * e);

  // Brightest sitting still and faint on the way, so an eye reads the *stops*
  // rather than the travel — a scanner is a sequence of places it looked.
  const alpha = MOVING_ALPHA + (SETTLED_ALPHA - MOVING_ALPHA) * (1 - Math.sin(e * Math.PI));
  const half = l.tile * 0.42;
  drawTargetLock(ctx, x, y, half, half, PALETTE.wisp, time, alpha, 3);
}
