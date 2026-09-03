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
 * crossing the grid on two sweeps that share no period, so it never stops,
 * never lines up with a row or a column, and is between tiles almost all of
 * the time. It is the seat's own scanner, and it says the one thing that is
 * both true and safe — *something is out there and this machine has not found
 * it*.
 *
 * **It used to settle on tiles, and that was the bug.** A box that stopped
 * square on a square is a box saying *here*, and the pilot reads it as the
 * enemy's tile and fires at it — which is the one thing this mark must never
 * be able to mean, since it knows nothing. Continuous diagonal motion cannot
 * be misread that way: nothing about it ever picks a square out.
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

/**
 * How fast the head crosses the field, in sweeps per second on each axis.
 *
 * **Two frequencies with no common period, and that is the whole of the
 * design.** Equal or related rates would trace a straight line or a closed
 * figure and either one is a shape an eye learns; these never repeat, so the
 * head is always somewhere between tiles, always moving, and almost never
 * moving along a row or a column. Which matters more than it sounds: a box
 * that stopped square on a tile would be read as *the enemy is on that tile*,
 * and the pilot would fire at it. A head that never stops and never lines up
 * with the grid cannot be read that way at all — it is plainly a thing
 * sweeping, and the only thing that names a square is still the navigator.
 *
 * Sideways is the faster of the two because the field is wider than it is
 * tall in tiles the pilot cares about, and because the cannon slides sideways:
 * a scanner that agreed with the axis the seat's own hand moves along reads as
 * the instrument that hand is attached to.
 */
const SWEEP_X_HZ = 0.147;
const SWEEP_Y_HZ = 0.0911;

/** How far in from the edge the head turns, in tiles, so the frame never hangs
 * half off the grid. */
const MARGIN = 0.55;

/** How bright the frame is. Well under a real lock's: this instrument has
 * found nothing, and a mark at full strength saying nothing is a mark the
 * pilot learns to distrust and then cannot read when it means something. */
const ALPHA = 0.42;

/**
 * Where the head is, in tile coordinates, at `time`.
 *
 * Continuous and never on a step: there is no tile index anywhere in here and
 * nothing rounds. The two sines are read at rates that share no period, so the
 * head is between tiles for all but an instant at a time, and the only moments
 * either axis is still are the turns — which never coincide, so the head
 * itself never stops.
 *
 * It is also, still, the reason this mark is safe: the only inputs are the
 * wall clock and the layout. Nothing here takes a creature, a column or a row,
 * so there is no expression that *could* be derived from where the body is.
 */
export function wispSearchAt(
  l: Layout,
  cfg: SimConfig,
  time: number,
): { col: number; row: number } {
  // The rows a wisp may stand on — the simulation's own rule, which says the
  // same thing whether or not anything is on the field. The scanner looks
  // where a body could be and not over the hull.
  const rows = Math.max(1, Math.min(l.rows, wispRows(cfg)));
  return {
    col: span(l.cols, Math.sin(time * SWEEP_X_HZ * TAU + 1.31)),
    row: span(rows, Math.sin(time * SWEEP_Y_HZ * TAU + 0.42)),
  };
}

/** A −1..1 swing onto a run of tiles, inset by `MARGIN` at both ends. */
function span(count: number, wave: number): number {
  const half = Math.max(0, (count - 1) / 2 - MARGIN);
  return (count - 1) / 2 + wave * half;
}

const TAU = Math.PI * 2;

/**
 * The frame, wherever the sweep has it this frame.
 */
export function drawWispSearch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  time: number,
): void {
  const at = wispSearchAt(l, cfg, time);
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
