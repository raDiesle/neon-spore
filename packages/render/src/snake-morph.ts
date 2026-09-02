import { hullPercent, type SnakeState } from "@neon-spore/sim";
import { drawHull } from "./hull.js";
import type { Layout } from "./layout.js";
import type { ViewState } from "./renderer.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";

/**
 * The ship becoming the snake, and it is **the ship**.
 *
 * This used to be three rounded bars closing onto three tiles, and the owner
 * said what was wrong with it in one sentence: that is not the thing they
 * steer on every other wave. So the fold draws the real hull — `drawHull`, the
 * same call `frame-passes.ts` makes on the field, with the run's own scars on
 * it — and simply *shrinks* it: at the first beat of the round the ship is
 * exactly where it always is, full width along the bottom, and by the last it
 * is one tile wide sitting on the snake's head.
 *
 * Nothing about it is stored. The whole animation is one number read off the
 * round's phase beat (`morph01`), so a restart cannot bring half a fold into
 * the next run and `Effects.reset` has nothing of it to clear — the rule
 * `restart.test.ts` holds this package to.
 *
 * **A transform and not a second drawing.** Scaling the finished hull is what
 * makes it the same ship rather than a copy of one that will drift the first
 * time somebody changes a lobe. The clip `drawHull` sets is inside the
 * transform with it, so the ship crops to its own shrinking window rather than
 * to the field's.
 */

/** How small the ship gets before it hands over: about one tile across. */
function endScale(l: Layout, arena: Arena): number {
  return Math.max(0.02, arena.tile / Math.max(1, l.gridWidth));
}

/** Ease so it hangs at full size for a moment, then goes quickly. */
function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * How much of the body is drawn under the ship: nothing until the ship is
 * mostly gone, then all of it. The two never share the frame equally — a
 * half-transparent snake under a half-transparent ship reads as neither.
 */
export function morphBodyAlpha(morph01: number): number {
  return Math.max(0, Math.min(1, (morph01 - 0.55) / 0.35));
}

export function drawSnakeMorph(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  arena: Arena,
  view: ViewState,
  snake: SnakeState,
  morph01: number,
): void {
  const head = snake.body[0];
  if (!head) return;
  const e = ease(Math.max(0, Math.min(1, morph01)));
  const s = 1 + (endScale(l, arena) - 1) * e;

  // Where the ship is anchored on the field, and where it is going: the middle
  // of the hull's own surface, and the tile the head starts on.
  const fromX = l.gridLeft + l.gridWidth / 2;
  const fromY = l.hullY;
  const toX = arenaX(arena, head.col) + arena.tile / 2;
  const toY = arenaY(arena, head.row) + arena.tile / 2;

  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - morphBodyAlpha(morph01));
  ctx.translate(fromX + (toX - fromX) * e, fromY + (toY - fromY) * e);
  ctx.scale(s, s);
  ctx.translate(-fromX, -fromY);
  drawHull(
    ctx,
    l,
    view.world.scars,
    view.time,
    { armed: 0, intake: 0, chew: 0, charge: 0 },
    hullPercent(view.world),
    // Both lobes in the middle, still: the round put them there when it
    // started (`startWave`), and a ship folding up is not a ship being flown.
    {
      cannon: Math.floor(view.world.cfg.cols / 2),
      shield: [{ col: mid(view), weight: 1, halfMul: 1 }],
    },
  );
  ctx.restore();
}

function mid(view: ViewState): number {
  return Math.floor(view.world.cfg.cols / 2);
}
