import { type SnakeState, snakeResting, type World } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { PALETTE } from "./palette.js";
import { drawSnakePoint } from "./snake-items.js";
import { drawSnakeProfile } from "./snake-profile.js";

/**
 * Player 1's two faces, **as the act and not as a word**: the owner, 10
 * October 2026 — *remove text from control set buttons and make the buttons
 * look like what its doing (spit poison and eating by opening mouth).*
 *
 * Both are the head side on (`snake-profile.ts`), looking up across the face,
 * and both move in a loop read off `world.tick` — no stored phase, so two phones
 * are at the same point of the same spit and the same bite.
 *
 * - **SHOOT spits**: the jaws stand open and venom globs leave the snout one
 *   after another, up and out of the face. While the trigger rests the
 *   mouth shuts and the globs thin out with the rest, so a press that will be
 *   refused shows a snake that is not spitting.
 * - **EAT bites**: the jaws swing open, the field's own pod drifts into the
 *   mouth and the jaws snap shut on it, and the pod comes back. While the real
 *   mouth stands open the face is lit and the jaws stand at the arena's gape.
 */

/** The head's unit on a button, in radii (`snake-profile.ts` draws in it). */
const HEAD = 0.78;

/** Where the hinge stands in the face, in radii from its middle: low and to
 * the left, so the head looks up and to the right across the face and what
 * it does — the spit, the bite — has the upper right to happen in. */
const HINGE = { x: -0.62, y: 0.42 };

/** Which way the head looks: up and to the right. */
const FACING = -0.62;

/** Where the snout's tip is along the facing, in head units. */
const SNOUT = 1.08;

/** Ticks in one spit, and globs in the air at once. */
const SPIT_TICKS = 48;
const GLOBS = 3;

/** Ticks in one bite: open with the pod coming in, snap, shut, and again. */
const BITE_TICKS = 84;

/** Into the head's frame: the hinge at the origin, the facing along +x, and
 * everything clipped to the face so the neck goes out under its rim. */
function headFrame(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(x + r * HINGE.x, y + r * HINGE.y);
  ctx.rotate(FACING);
}

export function drawSpitFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  world: World,
  round: SnakeState | null,
): void {
  const strength = round === null ? 1 : 1 - restLeft(world, round);
  const s = r * HEAD;
  headFrame(ctx, x, y, r);
  drawGlobs(ctx, s * SNOUT, r, world.tick, strength);
  drawSnakeProfile(ctx, s, 0.7 * strength);
  ctx.restore();
}

export function drawBiteFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  world: World,
  open: number,
): void {
  const s = r * HEAD;
  headFrame(ctx, x, y, r);
  if (open > 0) {
    drawSnakeProfile(ctx, s, open);
    ctx.restore();
    return;
  }
  const c = (world.tick % BITE_TICKS) / BITE_TICKS;
  // Opening over the first half with the pod coming in; snapping shut over
  // the next sixth, the pod gone the instant the jaws meet; shut for the rest
  // while the next pod swells in where it starts.
  const gape = c < 0.5 ? smoothstep(c / 0.5) : c < 0.66 ? 1 - (c - 0.5) / 0.16 : 0;
  const mouth = s * 0.62;
  const far = s * SNOUT + r * 0.42;
  if (c < 0.6) {
    const inward = c < 0.5 ? smoothstep(c / 0.5) : 1;
    drawPod(ctx, far + (mouth - far) * inward, 0, r * (0.62 - 0.14 * inward));
  } else if (c > 0.8) {
    drawPod(ctx, far, 0, r * 0.62 * ((c - 0.8) / 0.2));
  }
  drawSnakeProfile(ctx, s, gape);
  ctx.restore();
}

/** The field's pod, at a size: a one-tile arena whose tile is centred here. */
function drawPod(ctx: CanvasRenderingContext2D, x: number, y: number, tile: number): void {
  if (tile < 1) return;
  drawSnakePoint(ctx, { x: x - tile / 2, y: y - tile / 2, tile, cols: 1, rows: 1 }, 0, 0, 0.5);
}

/** How much of the trigger's rest is still to run, 0 ready to 1 just fired. */
function restLeft(world: World, round: SnakeState): number {
  if (!snakeResting(world, round)) return 0;
  const since = world.beat - round.shotBeat;
  return Math.max(0, Math.min(1, 1 - since / world.cfg.snakeFireRestBeats));
}

/**
 * The spit: globs of venom leaving the snout one after another, each a drop
 * with its tail back toward the mouth, shrinking and fading as it flies and
 * swaying a little either side, so the stream reads as a spray thrown rather
 * than a line drawn. In the head's frame, so `snout` is a distance along +x.
 * `strength` thins them while the trigger rests.
 */
function drawGlobs(
  ctx: CanvasRenderingContext2D,
  snout: number,
  r: number,
  tick: number,
  strength: number,
): void {
  if (strength <= 0.02) return;
  const reach = r * 0.7;
  ctx.save();
  ctx.fillStyle = PALETTE.venom;
  for (let i = 0; i < GLOBS; i++) {
    const u = (tick / SPIT_TICKS + i / GLOBS) % 1;
    const cx = snout + reach * u;
    const cy = Math.sin((u + i * 0.37) * Math.PI * 2) * r * 0.06 * u;
    const g = r * (0.15 - 0.06 * u);
    ctx.globalAlpha = strength * (u < 0.1 ? u / 0.1 : 1 - (u - 0.1) / 0.9);
    ctx.beginPath();
    // Round at the front, the tail back toward the mouth.
    ctx.arc(cx, cy, g, Math.PI * 0.8, Math.PI * 1.2, true);
    ctx.lineTo(cx - g * 2.2, cy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
