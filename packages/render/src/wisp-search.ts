import type { SimConfig } from "@neon-spore/sim";
import { wispRows } from "@neon-spore/sim";
import { sinHash } from "./hash.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * THE WISP's search: the box that blinks across the field on the screen that
 * cannot see the body.
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
 * that strikes somewhere on the grid, holds for a fraction of a second and is
 * gone, over and over, never twice in the same place in a row for any reason
 * an eye can follow. It is the seat's own scanner, and it says the one thing
 * that is both true and safe — *something is out there and this machine has
 * not found it*.
 *
 * **It used to sweep, and the owner asked for a blink instead.** The sweep was
 * two sines at unrelated rates, on the argument that a box which stopped
 * anywhere would be read as *the enemy is on that tile*. A box crossing the
 * grid turned out to read as a thing being tracked — the pilot's eye followed
 * the head the way it follows a body, which is the same misreading arriving by
 * a slower road. A strike that is over before it can be followed cannot be
 * tracked at all.
 *
 * **What keeps a still box from meaning a tile is where it lands, not that it
 * moves.** Every strike is on a *crossing* of the grid — dead between four
 * tiles on both axes, half a tile off every square in the field
 * (`SEARCH_OFFSET`). There is no tile it can be pointing at, at any moment,
 * and the frame is drawn at four corner brackets rather than closed sides
 * (`target-lock.ts`), so what is on the screen never becomes a rectangle
 * around a square either.
 *
 * **It knows nothing about where the wisp is, and that is enforced by the
 * signature rather than by care.** Nothing in this file takes a `Creature`, a
 * column or a row. The place comes off the wall clock and a fixed hash and
 * nothing else, so there is no expression anywhere here that *could* be
 * derived from the body's tile. A leak in this file would hand the pilot the
 * whole creature, so the way to not leak is to have nothing to leak from.
 *
 * It will strike beside the wisp now and then, which is a coincidence and
 * costs nothing: a pilot who fires under the box learns inside one wave that
 * the box is not an answer, and the pair goes back to the only thing that is —
 * the navigator saying a square out loud.
 *
 * **Searching is the target lock's second state, not a fifth picture.**
 * `target-lock.ts` says the frame means *an instrument has picked this body
 * out*; this is the same instrument before it has. What separates the two is
 * what an instrument panel already separates them by and what the file's own
 * argument asks for — the frame stays the frame, and everything inside and
 * around it says which state it is in. A lock is at full strength, in the
 * colour of the thing it found, steady, and does not move off it. This is at
 * half, violet — the wisp's own colour, which nothing else on this field is
 * drawn in and which the siren in the corner is already lit with — on a square
 * that is not a square, and gone as soon as it is there.
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

/**
 * Seconds one strike owns, and the share of that it is lit for.
 *
 * Short enough that the eye cannot follow one box to the next — about eight a
 * second, which is faster than a saccade can chase — and dark for nearly half
 * of every step, so what is read is a machine sampling the field rather than a
 * marker being carried around it.
 */
const BLINK_SECONDS = 0.125;
const LIT = 0.56;

/** Half a tile, which is the whole of why a still box is safe here: it is what
 * puts every strike on a crossing instead of on a square. */
const SEARCH_OFFSET = 0.5;

/** How bright the frame is. Well under a real lock's: this instrument has
 * found nothing, and a mark at full strength saying nothing is a mark the
 * pilot learns to distrust and then cannot read when it means something. */
const ALPHA = 0.42;

/**
 * Where the box is this instant and whether it is lit, in tile coordinates.
 *
 * Both coordinates are half-integers by construction — a whole number of tiles
 * plus `SEARCH_OFFSET` — so no strike is ever on a tile and none is ever off
 * the grid either, the first and last crossings being half a tile inside both
 * edges.
 *
 * It is also, still, the reason this mark is safe: the only inputs are the
 * wall clock and the layout. Nothing here takes a creature, a column or a row,
 * so there is no expression that *could* be derived from where the body is.
 */
export function wispSearchAt(
  l: Layout,
  cfg: SimConfig,
  time: number,
): { col: number; row: number; on: boolean } {
  // The rows a wisp may stand on — the simulation's own rule, which says the
  // same thing whether or not anything is on the field. The scanner looks
  // where a body could be and not over the hull.
  const rows = Math.max(1, Math.min(l.rows, wispRows(cfg)));
  const step = Math.floor(time / BLINK_SECONDS);
  return {
    col: crossing(l.cols, sinHash(step * 1.19 + 4.7)),
    row: crossing(rows, sinHash(step * 2.71 + 19.3)),
    on: time / BLINK_SECONDS - step < LIT,
  };
}

/** A 0..1 draw onto one of the crossings between `count` tiles. A run of one
 * tile has no crossing in it, and the middle of that tile is the honest answer
 * rather than a place off the grid. */
function crossing(count: number, pick: number): number {
  if (count < 2) return (count - 1) / 2;
  return Math.min(count - 2, Math.floor(pick * (count - 1))) + SEARCH_OFFSET;
}

/**
 * The frame, wherever the scanner has struck this frame — and nothing at all
 * on the dark half of a step.
 */
export function drawWispSearch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  time: number,
): void {
  const at = wispSearchAt(l, cfg, time);
  if (!at.on) return;
  const half = l.tile * 0.42;
  drawTargetLock(
    ctx,
    tileCX(l, at.col),
    tileCY(l, at.row),
    half,
    half,
    PALETTE.wisp,
    time,
    ALPHA,
    3,
  );
}
