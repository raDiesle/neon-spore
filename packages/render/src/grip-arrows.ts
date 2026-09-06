import { type Creature, carryIsReady, clampSpanCol, spanOf, type World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE PUSH, said before it happens**: two arrows beside a held rock, one each
 * way, for as long as the hand may carry it.
 *
 * The mechanic shipped with no picture at all. A hand on a rock slowed it and
 * the ring said so; that the *same* hand could take the rock a lane was a fact
 * a pair could only meet by accident, because nothing on the field ever
 * suggested moving a thumb that was already down. So the body now wears the
 * two directions it can go, and they are the whole of the statement — not a
 * button, not a target, just the two ways out.
 *
 * **They go out while the body is standing still, and come back when it may
 * move again.** A carry costs the body `gripPushPauseBeats` of quiet
 * (`sim/grip-push.ts`), and that pause was the one thing about this gesture a
 * player could feel and not see — a second sweep in the same beat simply did
 * nothing. The arrows are that beat, drawn: they leave on the frame the column
 * changes and return on the frame the hand is allowed again, so the wait has a
 * length the eye can learn.
 *
 * **A direction with a wall behind it is not offered.** `clampSpanCol` is the
 * simulation's own refusal — a thumb pressed on into the edge of the field is
 * simply a thumb held on a body — and it is called rather than re-derived,
 * because an arrow pointing at a wall is the picture promising something the
 * rule will not do.
 *
 * **White, and it is the only white thing on the field.** Amber is the hand and
 * the pull, red and cyan are ammunition, and the rock's own grey is the body
 * these sit either side of. `PALETTE.text` is the game's neutral — what it uses
 * when a mark is an *instruction* to a player rather than a fact about the
 * world — and that is exactly what an arrow is here.
 */

/** How far outside the ring the arrow's near edge stands, in tiles. Outside
 * `RING_MUL`'s arcs, which are the hand: the arrows are what the hand may do
 * next, so they sit beyond it. */
const GAP_TILES = 0.34;
/** Half the arrow's height, and how far it reaches out — a chevron rather than
 * a triangle, so it reads as a direction at 26 px instead of as a lobe. */
const HALF_TILES = 0.2;
const REACH_TILES = 0.17;

/**
 * Both arrows for one held body, or nothing at all.
 *
 * Called only where a hand is a *brake* (`grip.ts`), so there is no kind test
 * in here: what this draws is the carry, and the carry is a rock's.
 */
export function drawCarryArrows(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  if (!carryIsReady(world, c)) return;
  const alpha = 0.62 + 0.22 * Math.sin(time * 4);
  for (const dir of [-1, 1] as const) {
    if (!carryHasRoom(world, c, dir)) continue;
    arrow(ctx, x + dir * (r + l.tile * GAP_TILES), y, dir, l.tile, alpha);
  }
}

/** Whether the field has a lane on that side for this body to step into.
 * `clampSpanCol` and `spanOf` are the simulation's, so a two-column rock is
 * offered exactly the lanes `carryGrips` would actually give it. */
function carryHasRoom(world: World, c: Creature, dir: -1 | 1): boolean {
  return clampSpanCol(c.col + dir, world.cfg.cols, spanOf(c)) !== c.col;
}

/** One chevron, pointing away from the body. Stroked rather than filled: a
 * filled head at this size is a dot, and a dot beside a rock is a spark. */
function arrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: -1 | 1,
  tile: number,
  alpha: number,
): void {
  const half = tile * HALF_TILES;
  const reach = tile * REACH_TILES;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = Math.max(1, tile * 0.055);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, y - half);
  ctx.lineTo(x + dir * reach, y);
  ctx.lineTo(x, y + half);
  ctx.stroke();
  ctx.restore();
}
