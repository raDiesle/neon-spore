import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { SPOTS, SPOTS_NEST } from "./instar-egg-spots.js";
import { drawGlint } from "./instar-hide.js";
import { faded, type Look } from "./instar-plate.js";
import { instarAt, type Point } from "./instar-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE INSTAR's two nests, and the eggs the pair swipe off one.**
 *
 * The owner, 25 September 2026: *the eggs we see on his back like a cocoon
 * of spiders, which are rumbling like mini dragons are going to crouch out of
 * egg … the other player also has eggs, but he has to tap it to squash them
 * to dead*. So there are two nests on the back, each a mound of silk with the
 * eggs half out of it, each egg with a hatchling curled dark inside, and the
 * eggs shiver — harder as the window runs (`instarThreat`) — until the pair
 * clear them or they hatch (`instar-strike.ts`).
 *
 * One nest is squashed: it holds one egg per tap its mark needs (`NEST`), and
 * each counted tap bursts one where it lies (`instar-fx.ts`). The other is
 * swiped, and holds one egg per swipe (`CLUTCH`); the owner, 24 September
 * 2026: *when swiping down, an egg should be dragged away from the nest of
 * the boss to fall down to ship*. So every counted swipe takes one off it and
 * the one taken falls from the nest straight down to the hull — the way the
 * thumb went — and breaks there. Both counts are held to the script by
 * `test/instar-eggs.test.ts`.
 *
 * The falling egg outlives the frame that counted it, so it is kept here and
 * held by `InstarFx`, and cleared with it (`restart.test.ts`). The nests are
 * drawn off the figure every frame (`instar-profile.ts`).
 */

/** How many eggs the swiped nest holds: one per swipe its mark needs. */
export const CLUTCH = SPOTS.length;

/** How many eggs the squashed nest holds: one per tap its mark needs. */
export const NEST = SPOTS_NEST.length;

/** An egg's half-width and half-height, in head radii. */
const EGG_W = 0.1;
const EGG_H = 0.13;
/** How long an egg takes from the nest to the hull, in seconds. */
const FALL_SECONDS = 0.55;
/** How long the broken egg stays on the hull, in seconds. */
const SPLAT_SECONDS = 0.3;

/** One egg: a bile oval, rimmed, a hatchling curled dark inside it. */
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
  // A shell thin enough to see into: lit through on the key's side, the
  // yolk gone deep toward the far one.
  ctx.save();
  ctx.clip(p);
  const w = r * EGG_W;
  const shell = ctx.createRadialGradient(x - w * 0.35, y - w * 0.4, 0, x, y, r * EGG_H * 1.1);
  shell.addColorStop(0, faded(PALETTE.bileRim, fade, 0.55));
  shell.addColorStop(0.5, faded(PALETTE.bile, fade, 0));
  shell.addColorStop(1, faded(PALETTE.bileDeep, fade, 0.7));
  ctx.fillStyle = shell;
  ctx.fillRect(x - w * 1.5, y - w * 1.8, w * 3, w * 3.6);
  ctx.restore();
  ctx.strokeStyle = faded(PALETTE.bileDeep, fade, 0.9);
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y + r * 0.01, r * EGG_W * 0.5, tilt - 0.6, tilt + 3.6);
  ctx.stroke();
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.bileRim, fade), STROKE.inner, 0.6 * fade);
  drawGlint(ctx, { x: x - r * EGG_W * 0.35, y: y - r * EGG_H * 0.45 }, r * 0.022, fade, 0.7);
}

/** The two nests on the back, each shivering with the window, one egg
 * fewer for every tap and every swipe. */
export function drawNests(ctx: CanvasRenderingContext2D, l: Layout, look: Look): void {
  const { f } = look;
  drawNest(ctx, look, instarAt(l, f.nestX, f.nestY), Math.round(f.nest * NEST), SPOTS_NEST, 3);
  drawNest(ctx, look, instarAt(l, f.eggsX, f.eggsY), Math.round(f.eggs * CLUTCH), SPOTS, 7);
}

function drawNest(
  ctx: CanvasRenderingContext2D,
  look: Look,
  at: Point,
  n: number,
  spots: readonly (readonly [number, number])[],
  seed: number,
): void {
  if (n <= 0) return;
  const { r, time, fade, threat } = look;
  // The slime the nest sits in, pooled on the back and glistening; then the
  // silk: a low mound, and threads crossing over it.
  ctx.save();
  ctx.fillStyle = faded(PALETTE.venom, fade, 0.22);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y + r * 0.06, r * 0.62, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  const silk = new Path2D();
  silk.ellipse(at.x, at.y + r * 0.05, r * 0.5, r * 0.26, 0, Math.PI, Math.PI * 2);
  silk.closePath();
  const sheen = ctx.createLinearGradient(
    at.x - r * 0.3,
    at.y - r * 0.25,
    at.x + r * 0.3,
    at.y + r * 0.05,
  );
  sheen.addColorStop(0, faded(PALETTE.text, fade, 0.24));
  sheen.addColorStop(1, faded(PALETTE.text, fade, 0.06));
  ctx.fillStyle = sheen;
  ctx.fill(silk);
  ctx.restore();
  drawGlint(ctx, { x: at.x - r * 0.4, y: at.y + r * 0.05 }, r * 0.018, fade, 0.5);
  const rumble = 0.25 + 0.75 * threat;
  spots.slice(0, n).forEach(([dx, dy], i) => {
    const k = time * (24 + i) + i * 2.1 + seed;
    const jx = Math.sin(k) * r * 0.03 * rumble;
    const jy = Math.cos(k * 1.3) * r * 0.02 * rumble;
    drawEgg(ctx, at.x + dx * r + jx, at.y + dy * r + jy, r, Math.sin(k * 0.5) * 0.2 * rumble, fade);
  });
  ctx.save();
  ctx.strokeStyle = faded(PALETTE.text, fade, 0.3);
  ctx.lineWidth = STROKE.inner;
  for (let i = 0; i < 4; i++) {
    const x = at.x + (i - 1.5) * r * 0.26;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.2, at.y + r * 0.05);
    ctx.quadraticCurveTo(x, at.y - r * 0.42, x + r * 0.22, at.y + r * 0.05);
    ctx.stroke();
  }
  ctx.restore();
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

  /** An egg off the nest at `from`, falling to `hullY`; `r` is the head's radius. */
  drop(from: Point, hullY: number, r: number): void {
    this.eggs.push({ from, hullY, r, age: 0 });
  }

  /** A tapped egg burst where it lay: the splat alone, at `at`. */
  squash(at: Point, r: number): void {
    this.eggs.push({ from: at, hullY: at.y, r, age: FALL_SECONDS });
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
