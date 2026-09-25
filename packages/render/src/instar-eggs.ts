import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { faded } from "./instar-draw.js";
import { type Figure, instarAt, type Point } from "./instar-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE INSTAR's clutch, and the eggs the pair swipe off it.**
 *
 * The owner, 24 September 2026: *when swiping down, an egg should be dragged
 * away from the nest of the boss to fall down to ship*. So the clutch holds
 * one egg per swipe the mark needs (`CLUTCH`, held to the script by
 * `test/instar-eggs.test.ts`), every counted swipe takes one off it, and the
 * one taken falls from the clutch straight down to the hull — the way the
 * thumb went — and breaks there. The gesture and the picture say the same
 * direction.
 *
 * The falling egg outlives the frame that counted it, so it is kept here and
 * held by `InstarFx`, and cleared with it (`restart.test.ts`). The clutch is
 * drawn off the figure every frame (`instar-limbs.ts`).
 */

/** Where the clutch's eggs sit round its middle, in head radii: two over three. */
const SPOTS: readonly (readonly [number, number])[] = [
  [-0.1, -0.16],
  [0.1, -0.16],
  [-0.2, 0.08],
  [0.2, 0.08],
  [0, 0.12],
];

/** How many eggs a full clutch holds: one per swipe the eggs mark needs. */
export const CLUTCH = SPOTS.length;

/** An egg's half-width and half-height, in head radii. */
const EGG_W = 0.12;
const EGG_H = 0.15;
/** How long an egg takes from the clutch to the hull, in seconds. */
const FALL_SECONDS = 0.55;
/** How long the broken egg stays on the hull, in seconds. */
const SPLAT_SECONDS = 0.3;

/** One egg: a bile oval, rimmed. */
function drawEgg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  tilt: number,
  fade: number,
): void {
  const p = new Path2D();
  p.ellipse(x, y, r * EGG_W, r * EGG_H, tilt, 0, Math.PI * 2);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.bile, fade, 0.8);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.bileRim, fade), STROKE.inner, 0.6 * fade);
}

/** The clutch on the flank: up to `CLUTCH` eggs, pulsing, one fewer per swipe. */
export function drawClutch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  f: Figure,
  r: number,
  time: number,
  fade: number,
): void {
  const n = Math.round(f.eggs * CLUTCH);
  if (n <= 0) return;
  const at = instarAt(l, f.eggsX, f.eggsY);
  const pulse = 1 + 0.05 * Math.sin(time * 4);
  for (const [dx, dy] of SPOTS.slice(0, n)) {
    drawEgg(ctx, at.x + dx * r, at.y + dy * r, r * pulse, 0, fade);
  }
}

interface Falling {
  from: Point;
  hullY: number;
  r: number;
  age: number;
}

/** The eggs on their way down, and the ones broken on the hull. */
export class FallingEggs {
  private eggs: Falling[] = [];

  /** An egg off the clutch at `from`, falling to `hullY`; `r` is the head's radius. */
  drop(from: Point, hullY: number, r: number): void {
    this.eggs.push({ from, hullY, r, age: 0 });
  }

  get count(): number {
    return this.eggs.length;
  }

  update(dt: number): void {
    for (const e of this.eggs) e.age += dt;
    this.eggs = this.eggs.filter((e) => e.age < FALL_SECONDS + SPLAT_SECONDS);
  }

  /** Falling, it tumbles and speeds up; on the hull, a flat ring spreading and fading. */
  draw(ctx: CanvasRenderingContext2D): void {
    for (const e of this.eggs) {
      const t = e.age / FALL_SECONDS;
      if (t < 1) {
        const y = e.from.y + (e.hullY - e.from.y) * t * t;
        drawEgg(ctx, e.from.x, y, e.r, t * 2.4, 1);
        continue;
      }
      const s = (e.age - FALL_SECONDS) / SPLAT_SECONDS;
      ctx.save();
      ctx.strokeStyle = rgba(PALETTE.bileRim, 1 - s);
      ctx.lineWidth = STROKE.outline;
      ctx.beginPath();
      const w = e.r * (EGG_W + 0.35 * s);
      ctx.ellipse(e.from.x, e.hullY, w, w * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  clear(): void {
    this.eggs = [];
  }
}
