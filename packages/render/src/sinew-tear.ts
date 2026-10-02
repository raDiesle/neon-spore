import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { CollarBox } from "./sinew-band.js";
import { fibreEnds, partOrder } from "./sinew-fibres.js";
import type { Point } from "./sinew-shape.js";

/**
 * **A fibre torn: the stage won, said so nobody can miss it** — the owner,
 * 2 October 2026: *every time the players succeed, the success visual must
 * be clear and one string will be torn.*
 *
 * Kept by `SinewFx` from the `sinewPart` that says which stage it was, for
 * `TEAR_BEATS`, because the world a frame later only knows the fibre is gone.
 * Three things at once, all in the zone's green: the band **flashes**, a
 * **ring** goes out from it, and the torn fibre's two runs **whip back** —
 * the upper one recoiling up into the crown and the lower one down into the
 * mass, bright, shrinking to the stubs the tendon draws from then on
 * (`sinew-fibres.ts`). THE SLOW is open over the same beats
 * (`sinewPartSlowBeats`), so the moment is watched at the slow rate.
 */

/** How long the tear is drawn, in beats. */
export const TEAR_BEATS = 1.5;
/** How far the ring goes out, in tiles, and how thick it starts. */
const RING_OUT = 2.6;
const RING_W = 0.16;

export interface Tear {
  /** The fibre that went, by its place in the bundle. */
  fibre: number;
  /** 0 at the tear to 1 when it is over. */
  k: number;
}

/** Which fibre went, from the count left after it. */
export function tornFibre(n: number, fibresLeft: number): number {
  const order = partOrder(n);
  return order[Math.max(0, Math.min(n - 1, n - fibresLeft - 1))] ?? 0;
}

/** A run whipping back: from `fixed`, `left` of its length still out toward `free`. */
function recoil(
  ctx: CanvasRenderingContext2D,
  fixed: Point,
  free: Point,
  left: number,
  width: number,
  alpha: number,
): void {
  const p = new Path2D();
  p.moveTo(fixed.x, fixed.y);
  const wob = (1 - left) * (free.x - fixed.x >= 0 ? 1 : -1) * width * 6;
  p.quadraticCurveTo(
    fixed.x + (free.x - fixed.x) * left * 0.5 + wob,
    fixed.y + (free.y - fixed.y) * left * 0.5,
    fixed.x + (free.x - fixed.x) * left,
    fixed.y + (free.y - fixed.y) * left,
  );
  strokeGlow(ctx, p, PALETTE.goodRim, width, 1.2, alpha);
}

export function drawSinewTear(
  ctx: CanvasRenderingContext2D,
  tear: Tear,
  n: number,
  root: Point,
  box: CollarBox,
  mass: Point,
  rx: number,
  tile: number,
): void {
  const { k } = tear;
  if (k >= 1) return;
  const fade = 1 - k;
  ctx.save();
  ctx.lineCap = "round";
  // The band flashes the zone's green, brightest at the instant.
  const glass = new Path2D();
  glass.roundRect(box.x - box.rx, box.y - box.ry, box.rx * 2, box.ry * 2, box.rx * 0.35);
  ctx.fillStyle = rgba(PALETTE.good, 0.55 * fade * fade);
  ctx.fill(glass);
  // The ring, going out from the band.
  const ring = new Path2D();
  const grow = 1 - (1 - k) * (1 - k);
  ring.ellipse(
    box.x,
    box.y,
    box.rx + grow * RING_OUT * tile,
    box.ry + grow * RING_OUT * tile,
    0,
    0,
    Math.PI * 2,
  );
  strokeGlow(ctx, ring, PALETTE.good, RING_W * tile * fade, 1, fade);
  // The torn fibre's runs, whipping back to their stubs.
  const ends = fibreEnds(tear.fibre, n, root, box, mass, rx, tile);
  const left = Math.max(0, 1 - k * 2.2);
  if (left > 0) {
    const w = tile * 0.07;
    recoil(ctx, ends.root, ends.top, left * 0.5, w, fade);
    recoil(ctx, ends.top, ends.root, left * 0.5, w, fade);
    recoil(ctx, ends.foot, ends.mass, left * 0.5, w, fade);
    recoil(ctx, ends.mass, ends.foot, left * 0.5, w, fade);
  }
  ctx.restore();
}
