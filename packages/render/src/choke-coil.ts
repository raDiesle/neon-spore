import type { Point } from "@neon-spore/content";
import { curve, tube } from "./gland-tube.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **The coil, which is THE CHOKE's one word said in two places.**
 *
 * On the field the choke is wound round the cannon's swelling; on player 1's
 * band it is wound round the strip's node — the same body on the same control
 * seen from the two sides of the hull, and it has to be recognisably one
 * thing, or the pilot tapping a dead rail and the navigator watching a
 * cannon walk would be looking at two different creatures. So the stack of
 * loops, how a loop loosens, and the two hooks at the strand's end are built
 * here once, and `choke.ts` and `choke-strip.ts` place them.
 *
 * **What a loop says.** The grip is `COILS` loops, and every fresh press
 * player 1 lands unwinds a little of one — the top loop first, then the one
 * under it — so how many are still tight *is* the count, read at a glance
 * from either seat, and the strand's loose end grows by exactly what has been
 * unwound. Nothing here counts: `loose` per loop is arithmetic on the world's
 * tap count over `cfg.chokeTaps`, handed in as one share.
 */

/** How many loops the grip is drawn as. `chokeTaps / COILS` presses each. */
export const COILS = 6;

export interface Coil {
  readonly x: number;
  readonly y: number;
  readonly rx: number;
  readonly ry: number;
  /** 0 tight, 1 fully unwound (and no longer drawn). */
  readonly loose: number;
}

/**
 * The loops round a swelling, base to top. `profile(u)` is the half-width of
 * the thing they are wound round at height `u` (0 base, 1 top), and `share`
 * is the tap count over the count needed — the top loop is the first to go.
 */
export function coilStack(
  cx: number,
  top: number,
  base: number,
  profile: (u: number) => number,
  ry: number,
  share: number,
): Coil[] {
  const out: Coil[] = [];
  for (let k = 0; k < COILS; k++) {
    const u = (k + 0.5) / COILS;
    const loose = Math.min(1, Math.max(0, share * COILS - (COILS - 1 - k)));
    out.push({
      x: cx,
      // A loosening loop slides up off the thing it held, and widens.
      y: base + (top - base) * u - loose * ry * 3,
      rx: profile(u) * (1 + loose * 0.5) + ry * 0.4,
      ry: ry * (1 + loose * 0.3),
      loose,
    });
  }
  return out;
}

/**
 * The loops, front halves over what they hold and back halves dim behind it.
 * The caller has already drawn the swelling, so the back half is a shadow the
 * eye completes rather than a line across the body.
 */
export function drawCoils(ctx: CanvasRenderingContext2D, coils: readonly Coil[], w: number): void {
  ctx.save();
  ctx.lineCap = "round";
  for (const c of coils) {
    if (c.loose >= 1) continue;
    const a = 1 - c.loose;
    ctx.lineWidth = w * (1 - c.loose * 0.4);
    ctx.strokeStyle = rgba(PALETTE.bileDeep, 0.55 * a);
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = rgba(PALETTE.bile, 0.95 * a);
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI);
    ctx.stroke();
    // The wet light along the top of each loop, the gloss every slime wears.
    ctx.lineWidth = w * 0.3;
    ctx.strokeStyle = rgba(PALETTE.bileRim, 0.6 * a);
    ctx.beginPath();
    ctx.ellipse(c.x, c.y - w * 0.22, c.rx, c.ry, 0, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The strand's loose end: a tapered tube from `from` out to `to`, bellied
 * toward `belly`, waving on `time`, with the two hooks on its end.
 */
export function drawTail(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  belly: Point,
  w: number,
  time: number,
  open: number,
): void {
  const sway = Math.sin(time * 2.3) * w * 0.6;
  const mid = curve(
    from,
    { x: to.x + sway, y: to.y },
    { x: belly.x, y: belly.y + sway * 0.5 },
    { x: to.x - sway, y: (belly.y + to.y) / 2 },
    12,
  );
  const body = new Path2D(tube(mid, (p) => w * (0.55 - 0.25 * p)));
  ctx.save();
  ctx.fillStyle = PALETTE.bile;
  ctx.fill(body);
  ctx.strokeStyle = rgba(PALETTE.bileRim, 0.7);
  ctx.lineWidth = Math.max(0.8, w * 0.12);
  ctx.stroke(body);
  const end = mid[mid.length - 1] as Point;
  const prev = mid[mid.length - 2] as Point;
  pincers(ctx, end, Math.atan2(end.y - prev.y, end.x - prev.x), w * 1.1, open);
  ctx.restore();
}

/**
 * Two hooks at the strand's end, either side of the way it points, opening
 * by `open` (0 closed to 1 wide): what a thing that takes a cannon by the
 * throat reaches with.
 */
export function pincers(
  ctx: CanvasRenderingContext2D,
  at: Point,
  heading: number,
  len: number,
  open: number,
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, len * 0.22);
  ctx.strokeStyle = PALETTE.bileRim;
  for (const side of [-1, 1]) {
    // Out and away from the heading, then the tip bent back in toward it:
    // the two halves of a pair of tongs.
    const a = heading + side * (0.5 + open * 0.8);
    const kx = at.x + Math.cos(a) * len * 0.75;
    const ky = at.y + Math.sin(a) * len * 0.75;
    const back = a - side * 1.1;
    ctx.beginPath();
    ctx.moveTo(at.x, at.y);
    ctx.quadraticCurveTo(
      kx,
      ky,
      kx + Math.cos(back) * len * 0.45,
      ky + Math.sin(back) * len * 0.45,
    );
    ctx.stroke();
  }
  ctx.restore();
}
