import {
  beatPhase,
  type Creature,
  carryPauseLeft,
  clampSpanCol,
  spanOf,
  type World,
} from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE PUSH's pause, drawn**: two arrows beside a rock that has just been
 * carried, one each way, fading out over the beat it has to stand still.
 *
 * **Only the pause, never the offer.** They used to stand beside every held
 * rock for as long as it could be carried, and the owner took that half away
 * on 30 September 2026: the guide teaches the carry, and a player told once
 * does not need the field to say it again (`docs/controls-catalogue.md`, *Two
 * sets*). What the guide cannot teach is the wait. A carry costs the body
 * `gripPushPauseBeats` of quiet (`sim/grip-push.ts`), and a second sweep in
 * that beat simply does nothing — the one thing about this gesture a player
 * could feel and not see. So the arrows are that beat and nothing else: they
 * arrive on the frame the column changes and are gone on the frame the hand is
 * allowed again, so the wait has a length the eye can learn.
 *
 * **A direction with a wall behind it is not drawn.** `clampSpanCol` is the
 * simulation's own refusal, called rather than re-derived: the arrows are the
 * ways the body will be free to go when they have faded, and a way into a wall
 * is not one of them.
 *
 * **White, and it is the only white thing on the field.** Amber is the hand and
 * the pull, red and cyan are ammunition, and the rock's own grey is the body
 * these sit either side of. `PALETTE.text` is the game's neutral — what it uses
 * when a mark is an *instruction* to a player rather than a fact about the
 * world — and "not yet" is one.
 */

/** How far outside the ring the arrow's near edge stands, in tiles. Outside
 * `RING_MUL`'s arcs, which are the hand: the arrows are what the hand may do
 * next, so they sit beyond it. */
const GAP_TILES = 0.34;
/** Half the arrow's height, and how far it reaches out — a chevron rather than
 * a triangle, so it reads as a direction at 26 px instead of as a lobe. */
const HALF_TILES = 0.2;
const REACH_TILES = 0.17;

/** How bright the arrows are on the frame the carry lands, before they fade. */
const PEAK_ALPHA = 0.84;

/**
 * Both arrows for one held body while its carry is refused, or nothing at all.
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
): void {
  const left = pauseLeft(world, c);
  if (left <= 0) return;
  for (const dir of [-1, 1] as const) {
    if (!carryHasRoom(world, c, dir)) continue;
    arrow(ctx, x + dir * (r + l.tile * GAP_TILES), y, dir, l.tile, PEAK_ALPHA * left);
  }
}

/**
 * How much of the pause is still to run, 1 on the frame the carry lands down
 * to 0 when `carryIsReady` lets the hand carry again. `carryPauseLeft` is the
 * simulation's count in whole beats; the tick's place inside its beat
 * (`beatPhase`) makes the fade continuous rather than a step per beat.
 */
function pauseLeft(world: World, c: Creature): number {
  const beats = carryPauseLeft(world, c);
  if (beats === 0) return 0;
  const span = world.cfg.gripPushPauseBeats + 1;
  return Math.max(0, Math.min(1, (beats - beatPhase(world.cfg, world.tick)) / span));
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
