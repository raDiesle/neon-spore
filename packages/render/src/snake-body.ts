import type { SnakeState } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";
import { drawSnakeHead } from "./snake-head.js";
import {
  backGradient,
  castShadow,
  clearShadow,
  drawScales,
  HEAD_HALF,
  litRibbon,
  ribbonSides,
  rimStroke,
  TAIL_HALF,
  traceRibbon,
} from "./snake-skin.js";

/**
 * The body: where it is *between* two tiles, and what it looks like.
 *
 * **It slides.** The simulation stores whole tiles and steps between them on a
 * tick, which is right and is not what a player should see: a body that jumped
 * a tile every half second read as a thing stuttering rather than a thing
 * moving. So the drawing carries an offset — how far through the current step
 * the world is — and every segment is drawn between where it is and where the
 * segment ahead of it is. Nothing about that is stored and nothing is guessed:
 * `world.tick` against the round's own `stepTick` is the whole of it, so two
 * devices draw the same body on the same tick and `Effects.reset` has nothing
 * to clear.
 *
 * **It tapers.** The owner asked for a snake rather than a tube, so the width
 * falls from behind the head to the tail and the spine carries a row of
 * markings — the two things that read as *snake* at tile size. The colours
 * stay the ship's violet and cyan: the body is the ship, and green is spent
 * elsewhere (`palette.ts`).
 */

/** Where a tile's centre is, in pixels. */
function centre(arena: Arena, col: number, row: number): { x: number; y: number } {
  return { x: arenaX(arena, col) + arena.tile / 2, y: arenaY(arena, row) + arena.tile / 2 };
}

/**
 * How far through the current step the body is, 0..1.
 *
 * Reads the world and nothing else. While the ship is still folding there is
 * no step to be part-way through, so it is 0 and the body sits on its tiles.
 */
export function snakeSlide(snake: SnakeState, tick: number): number {
  if (snake.phase !== "play") return 0;
  const round = snake.rounds[snake.round];
  if (!round || round.stepTicks <= 0) return 0;
  return Math.max(0, Math.min(1, (tick - snake.stepTick) / round.stepTicks));
}

/**
 * Every joint of the body, in pixels, slid forward by `t`.
 *
 * The head runs on ahead into the tile it is entering and every other segment
 * moves towards the one in front of it, which is what a snake does: the shape
 * flows along itself rather than every part of it jumping at once.
 */
function snakeJoints(arena: Arena, snake: SnakeState, t: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (const [i, tile] of snake.body.entries()) {
    const here = centre(arena, tile.col, tile.row);
    if (i === 0) {
      out.push({
        x: here.x + snake.dirCol * arena.tile * t,
        y: here.y + snake.dirRow * arena.tile * t,
      });
      continue;
    }
    const ahead = snake.body[i - 1];
    if (!ahead) continue;
    const to = centre(arena, ahead.col, ahead.row);
    out.push({ x: here.x + (to.x - here.x) * t, y: here.y + (to.y - here.y) * t });
  }
  return out;
}

/**
 * The body, head first.
 *
 * `showBody` is the middle of it. Without it player 2's screen is all there is
 * of the length and player 1 gets the two ends and nothing between them, which
 * is exactly what they are meant to have: a pair of landmarks to steer between
 * and no idea what is strung across.
 */
export function drawSnakeBody(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
  showBody: boolean,
  t: number,
  gape = 0,
): void {
  const joints = snakeJoints(arena, snake, t);
  const head = joints[0];
  if (!head) return;
  if (showBody && joints.length > 1) drawLength(ctx, arena, joints);
  else if (joints.length > 1) drawEnds(ctx, arena, joints);
  drawSnakeHead(ctx, arena, head, snake.dirCol, snake.dirRow, gape);
}

/**
 * The whole length, as a tapered ribbon.
 *
 * Built as one filled contour rather than a stroked path: a stroke is the same
 * width everywhere, and the taper is half of what makes this read as an animal
 * — the other half is the spine, drawn over it.
 *
 * Four passes over that one contour, in the order light arrives: a shadow on
 * the floor, the arena's own gradient as the fill, then the scales and the lit
 * side of the back **inside a clip of it**, then the rim. The clip is what
 * lets the highlight be a shape pushed towards the light rather than a shape
 * that has to know where the body's edge is (`snake-skin.ts`).
 */
function drawLength(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  joints: { x: number; y: number }[],
): void {
  const half = (i: number): number =>
    arena.tile * (HEAD_HALF + (TAIL_HALF - HEAD_HALF) * (i / Math.max(1, joints.length - 1)));
  const sides = ribbonSides(joints, half);

  castShadow(ctx, arena);
  traceRibbon(ctx, joints, sides);
  ctx.fillStyle = backGradient(ctx, arena);
  ctx.fill();
  clearShadow(ctx);

  ctx.save();
  traceRibbon(ctx, joints, sides);
  ctx.clip();
  drawScales(ctx, arena, joints, half);
  litRibbon(ctx, joints, half);
  ctx.restore();

  traceRibbon(ctx, joints, sides);
  rimStroke(ctx);
  drawSpine(ctx, arena, joints);
}

/**
 * The markings down the back — one diamond a segment, shrinking with the body.
 *
 * The cheapest thing that turns a shape into a creature at this size, and the
 * one the reference drawing spends the most ink on. They are drawn from the
 * joints rather than from the tiles, so they slide with everything else.
 */
function drawSpine(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  joints: { x: number; y: number }[],
): void {
  ctx.fillStyle = PALETTE.cyanRim;
  for (const [i, p] of joints.entries()) {
    if (i === 0) continue;
    const share = 1 - i / Math.max(1, joints.length - 1);
    const r = arena.tile * (0.06 + 0.06 * share);
    ctx.globalAlpha = 0.35 + 0.25 * share;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - r);
    ctx.lineTo(p.x + r, p.y);
    ctx.lineTo(p.x, p.y + r);
    ctx.lineTo(p.x - r, p.y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * The tail alone — player 1's half of the body. A short taper at the last
 * joint, so the end reads as an end and not as a segment that stopped.
 */
function drawEnds(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  joints: { x: number; y: number }[],
): void {
  const end = joints[joints.length - 1];
  const before = joints[joints.length - 2];
  if (!end || !before) return;
  const dx = end.x - before.x;
  const dy = end.y - before.y;
  const len = Math.hypot(dx, dy) || 1;
  const half = arena.tile * 0.22;
  const nx = -(dy / len) * half;
  const ny = (dx / len) * half;
  const trace = (): void => {
    ctx.beginPath();
    ctx.moveTo(before.x + nx, before.y + ny);
    ctx.lineTo(end.x + dx * 0.3, end.y + dy * 0.3);
    ctx.lineTo(before.x - nx, before.y - ny);
    ctx.closePath();
  };
  castShadow(ctx, arena);
  trace();
  ctx.fillStyle = backGradient(ctx, arena);
  ctx.fill();
  clearShadow(ctx);
  trace();
  rimStroke(ctx);
}
