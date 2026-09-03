import { openSmoothPath, type Point } from "@neon-spore/content";
import { type Glide, glideTo } from "./glide.js";
import { strokeGlow } from "./glow.js";
import type { LobePositions } from "./hull.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawShieldFlashes } from "./shield-flash.js";
import { drawShieldSparks } from "./shield-spark.js";

/**
 * The shield, as a body rather than a plate.
 *
 * The simulation moves the shield a whole column at a time, and a single lobe
 * that slides across the hull reads as a lump being dragged. A worm does not
 * move like that: its head leaves first, the body strings out behind it and
 * gathers back up when the head stops. So the shield is a short chain — a head
 * that chases the column and three followers, each chasing the segment in front
 * of it a little more slowly.
 *
 * The chain is drawn as several bumps on the same membrane, so the skin of the
 * ship travels with the shield instead of the shield travelling over the skin.
 * All of it is render-only motion: nothing here is ever read back into a world.
 */

/** Head plus body. Four reads as a creature; more reads as a caterpillar. */
const SEGMENTS = 4;
/** Spring stiffness per segment, head first. Lower is a longer lag. */
const OMEGA = [21, 15, 11.5, 9];
/** Just under critical, so a segment settles without wobbling on arrival. */
const ZETA = 0.85;
/** Share of the shield's lift each segment carries, before normalising. */
const WEIGHT = [1, 0.62, 0.38, 0.22];
/** Half width of each segment, relative to the shield lobe's own. */
const HALF_MUL = [1, 0.92, 0.84, 0.74];
/** How far the peristaltic wave lifts and drops a segment, as a share of it. */
const UNDULATE = 0.34;
/** Phase between neighbouring segments. Their sum stays near zero at rest. */
const SEGMENT_PHASE = 1.6;
/** Crawl rate at a standstill, and how much travel adds to it, per second. */
const CRAWL_HZ = 0.45;
const CRAWL_PER_COLUMN = 1.1;

export interface ShieldSegment {
  /** Fractional column of this segment's centre. */
  col: number;
  /** Share of the shield's total lift. Sums to about 1, and breathes past it. */
  weight: number;
  /** Half width, relative to the shield lobe's own. */
  halfMul: number;
}

export class ShieldBody {
  private chain: Glide[] = Array.from({ length: SEGMENTS }, () => ({
    value: Number.NaN,
    velocity: 0,
  }));
  /** Phase of the peristaltic wave. Advanced by time *and* by travel. */
  private phase = 0;
  private out: ShieldSegment[] = [];

  update(targetCol: number, dt: number): void {
    const before = this.chain[0]!.value;
    for (let i = 0; i < this.chain.length; i++) {
      const target = i === 0 ? targetCol : this.chain[i - 1]!.value;
      glideTo(this.chain[i]!, target, dt, OMEGA[i]!, ZETA);
    }
    const travelled = Number.isFinite(before) ? Math.abs(this.chain[0]!.value - before) : 0;
    this.phase += dt * CRAWL_HZ * Math.PI * 2 + travelled * CRAWL_PER_COLUMN * Math.PI * 2;

    const total = WEIGHT.reduce((a, b) => a + b, 0);
    this.out.length = 0;
    for (let i = 0; i < this.chain.length; i++) {
      const wave = Math.sin(this.phase - i * SEGMENT_PHASE);
      this.out.push({
        col: this.chain[i]!.value,
        weight: (WEIGHT[i]! / total) * (1 + UNDULATE * wave),
        halfMul: HALF_MUL[i]!,
      });
    }
  }

  /**
   * Back to never-having-moved, so the next `update` puts the whole chain
   * straight onto its column instead of crawling there from wherever the
   * abandoned run left it (`glideTo` snaps a non-finite value). For a wave
   * restart — see `Canvas2DRenderer`'s `waveRestarted`.
   */
  reset(): void {
    for (const g of this.chain) {
      g.value = Number.NaN;
      g.velocity = 0;
    }
    this.phase = 0;
    this.out.length = 0;
  }

  /** Head first, tail last. Empty until the first `update`. */
  get segments(): readonly ShieldSegment[] {
    return this.out;
  }

  /** Where the head is, in fractional columns — the muzzle of the shield. */
  get head(): number {
    return this.chain[0]!.value;
  }

  /** Leftmost and rightmost segment centre, so the rim can span the body. */
  get span(): { from: number; to: number } {
    let from = Number.POSITIVE_INFINITY;
    let to = Number.NEGATIVE_INFINITY;
    for (const g of this.chain) {
      from = Math.min(from, g.value);
      to = Math.max(to, g.value);
    }
    return { from, to };
  }
}

/**
 * How the armed rim reads, as a record rather than as numbers typed into the
 * draw call.
 *
 * It was the second kind until this file was lifted. The ward is one of the
 * two things a player watches all game and it had exactly one answer, with
 * nowhere for a second one to sit — see `docs/versus.md` and
 * `tools/versus/candidates/shield-ward/`. Nothing here changes what the game
 * draws; the values are the ones the literals held.
 *
 * The shimmer is two sines rather than one so the band never settles into a
 * period an eye can predict, which is most of what stops a lit rim reading as
 * a painted stripe.
 */
export interface WardLook {
  /** Half width of the bright stretch beyond the outermost segment, in tiles. */
  halfMul: number;
  /** Resting brightness of the shimmer, and the two swings around it. */
  shimmerBase: number;
  shimmerA: number;
  shimmerHzA: number;
  shimmerB: number;
  shimmerHzB: number;
  /** Floor under `armed * shimmer`, so a passive rim is still a rim. */
  glowFloor: number;
  /** Opacity: a constant plus the glow's share of it. */
  alphaBase: number;
  alphaGlow: number;
  /** Stroke width at rest, and what a full arm adds. */
  widthBase: number;
  widthArmed: number;
  /** `strokeGlow` intensity at rest, and what a full arm adds. */
  intensityBase: number;
  intensityArmed: number;
}

export const WARD_LOOK: WardLook = {
  halfMul: 1.15,
  shimmerBase: 0.62,
  shimmerA: 0.26,
  shimmerHzA: 1.5,
  shimmerB: 0.16,
  shimmerHzB: 0.7,
  glowFloor: 0.22,
  alphaBase: 0.22,
  alphaGlow: 0.75,
  widthBase: 2,
  widthArmed: 11,
  intensityBase: 0.35,
  intensityArmed: 1.6,
};

/**
 * The rim-thickening variant on top of the plate: over the shield's segment the
 * edge of the membrane brightens and thickens. Armed and passive then differ in
 * both silhouette and light — docs/spec/systems.md 5.8. The bright stretch spans
 * the whole body, head to tail, so a shield in motion lights up as a long
 * moving band rather than a dot with a tail behind it.
 */
export function drawShieldRim(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  armed: number,
  time: number,
  at: LobePositions,
  surface: (x: number) => Point,
  resonance = 0,
): void {
  if (at.shield.length === 0) return;
  const w = WARD_LOOK;
  const shimmer =
    w.shimmerBase +
    w.shimmerA * Math.sin(time * w.shimmerHzA) +
    w.shimmerB * Math.sin(time * w.shimmerHzB + 1.7);
  const glow = Math.max(w.glowFloor, armed * shimmer);
  const cols = at.shield.map((s) => s.col);
  const half = l.tile * w.halfMul;
  // A loop rather than `Math.min(...cols)`: the spread built a fresh argument
  // list twice a frame, and a segmented shield is not a two-element array.
  let loCol = cols[0] ?? 0;
  let hiCol = loCol;
  for (const col of cols) {
    if (col < loCol) loCol = col;
    if (col > hiCol) hiCol = col;
  }
  const from = tileCX(l, loCol) - half;
  const to = tileCX(l, hiCol) + half;
  const pts: Point[] = [];
  const steps = 26;
  for (let i = 0; i <= steps; i++) pts.push(surface(from + (to - from) * (i / steps)));

  const seg = new Path2D(openSmoothPath(pts));
  ctx.globalAlpha = w.alphaBase + w.alphaGlow * glow;
  strokeGlow(
    ctx,
    seg,
    PALETTE.shieldRim,
    w.widthBase + w.widthArmed * armed,
    w.intensityBase + w.intensityArmed * armed,
  );
  ctx.globalAlpha = 1;
  // Presence, not the catch; `resonance` is the exception — `resonantLook`.
  drawShieldSparks(ctx, l, time, cols, surface, resonance);
  drawShieldFlashes(ctx, l, time, from, to, surface); // the rim's own span
}
