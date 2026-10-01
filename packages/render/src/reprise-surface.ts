import { limbX, type Pin } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { DEG } from "./idle-drift.js";
import { bodyLife } from "./motion-life.js";
import { OUTLINE_SEED, outlineYaw } from "./outline-drift.js";
import { PALETTE } from "./palette.js";
import type { RepriseFrame } from "./reprise-body.js";

/**
 * **THE REPRISE's veins, placed by longitude** (`docs/spec/living-bosses.md`
 * §1, `packages/content/src/surface.ts`): the silhouette is posed, the surface
 * is placed. The sac's outline leans and squashes on the outline tier
 * (`outline-drift.ts`); the veins on its skin are pinned to the body instead,
 * so a turn carries them across it — fast through the middle, crawling at the
 * rim — and takes the near ones over the edge while a far pair, behind the
 * rim at rest, comes round.
 *
 * Each vein is the quadratic the sac always drew, sampled, and every sample
 * pinned where it lies at rest: its height is its latitude, and its longitude
 * is read off the sac's own width at that height, so the rim is the limb: a
 * sample carried past it is dropped, and the run it ended is carried on to
 * the rim (`limbX`). The few samples the shipped curve put outside the sac, where its clip hid them, take a circle
 * of their own just past where they lie (`PAST`). At no turn every sample
 * lands on the curve, and a skin held still (`REPRISE_SURFACE.amount` 0,
 * as shipped) draws the curve itself, so the shipped field draws as it did.
 *
 * **The gloss is not here.** It is the key light's highlight, and the light
 * does not turn.
 */

export const REPRISE_SURFACE = {
  /** How much of the turn the skin takes: 0 still, as shipped; 1 the whole. */
  amount: 0,
  /** The widest turn, degrees, at the drift's widest yaw. */
  degrees: 40,
};

/** How far past a sample lying outside the sac its own circle reaches, so it is never pinned on the rim itself. */
const PAST = 1.02;
/** Samples along each vein. */
const SAMPLES = 10;
/** How far round the back the far pair sits from the inner veins, radians: just past the rim at rest. */
const FAR = 0.8;

/** The sac's half-width at height `y` of its half-height, in its half-width: `sacPoints`'s heavy bottom. */
function sacWidth(y: number): number {
  const s = Math.max(-1, Math.min(1, y));
  return Math.sqrt(1 - s * s) * (0.8 + 0.2 * s);
}

/** A vein's samples, pinned, in the sac's half-width and half-height about its middle. */
function pinVein(side: number, k: number, shift: number): Pin[] {
  const pins: Pin[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1);
    const u = 1 - t;
    const x = side * (u * u * k + 2 * u * t * (k + 0.12) + t * t * (k - 0.1));
    const y = u * u * -0.6 + t * t * 0.8;
    const r = Math.max(sacWidth(y), Math.abs(x) * PAST);
    const lon = Math.asin(Math.max(-1, Math.min(1, x / r))) + side * shift;
    pins.push({ lon, cosLat: Math.sqrt(1 - y * y), sinLat: y, k: r, cy: y });
  }
  return pins;
}

/** The two veins on each outer lobe, and one more on each that sits round the back. */
export const REPRISE_VEINS: readonly (readonly Pin[])[] = [-1, 1].flatMap((side) => [
  pinVein(side, 0.62, 0),
  pinVein(side, 0.8, 0),
  pinVein(side, 0.62, FAR),
]);

/** The skin's turn this frame, radians: the outline's own yaw, so the veins go the way it leans. */
export function repriseTurn(time: number, hush: number): number {
  const k = REPRISE_SURFACE.amount * hush * bodyLife();
  return outlineYaw(time, k, OUTLINE_SEED.reprise) * REPRISE_SURFACE.degrees * DEG;
}

/** A vein at turn `theta`, in the sac's units: each sample, and whether it faces us. */
export function veinAt(
  vein: readonly Pin[],
  theta: number,
): { x: number; y: number; near: boolean }[] {
  return vein.map((p) => {
    const a = p.lon + theta;
    const cos = Math.cos(a);
    return { x: limbX(p.k, Math.sin(a), cos), y: p.cy, near: cos > 0 };
  });
}

/**
 * The veins, faint, inside the sac's clip. Only the samples facing us are
 * drawn, each run carried on to the rim by the first sample past it, folded
 * there; a vein with none facing us is not stroked at all.
 */
export function drawVeins(ctx: CanvasRenderingContext2D, f: RepriseFrame, theta: number): void {
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(0.8, f.u * 0.04);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.12);
  if (REPRISE_SURFACE.amount === 0) {
    drawShipped(ctx, f);
    return;
  }
  for (const vein of REPRISE_VEINS) {
    const run = veinAt(vein, theta);
    if (!run.some((q) => q.near)) continue;
    ctx.beginPath();
    let open = false;
    run.forEach((q, i) => {
      const edge = !q.near && (run[i - 1]?.near === true || run[i + 1]?.near === true);
      if (!q.near && !edge) {
        open = false;
        return;
      }
      const x = f.x + q.x * f.rx;
      const y = f.cy + q.y * f.ry;
      if (open) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
      open = q.near || !open;
    });
    ctx.stroke();
  }
}

/** The veins as they shipped, one curve each and no far pair: what a still skin draws, to the pixel. */
function drawShipped(ctx: CanvasRenderingContext2D, f: RepriseFrame): void {
  for (const side of [-1, 1]) {
    for (const k of [0.62, 0.8]) {
      ctx.beginPath();
      ctx.moveTo(f.x + side * f.rx * k, f.cy - f.ry * 0.6);
      ctx.quadraticCurveTo(
        f.x + side * f.rx * (k + 0.12),
        f.cy,
        f.x + side * f.rx * (k - 0.1),
        f.cy + f.ry * 0.8,
      );
      ctx.stroke();
    }
  }
}
