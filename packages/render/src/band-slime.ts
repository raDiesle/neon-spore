import { hash01 } from "./backdrop.js";
import { seamRise, seamTop, seamY } from "./band-seam.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { Circle, Layout } from "./layout.js";
import { P1_SKIN, type SeatSkin } from "./seat-skin.js";

/**
 * WHAT RUNS OFF THE MEMBRANE.
 *
 * The owner's own sentence — *some slime from ship flowing down a little bit
 * into the control set*. Slime hangs off the seam into the chamber, so nothing
 * down here is sitting on the ship.
 *
 * Split out of `band-seam.ts` when that file went over its limit, along the
 * line already in it: next door is the *edge* — where the membrane is and what
 * it is lit like — and this is what hangs off it. Both are pure functions of
 * `time`, which is what makes them restart-safe by construction rather than by
 * remembering to clear anything (`restart.test.ts`).
 *
 * **The other thing that used to be here has moved.** A feeder running from the
 * membrane to each control is now one half of `band-join.ts`’s record, because
 * it is exactly what a candidate arguing that the buttons are organs of the
 * ship would replace; the paint went with it, unchanged.
 */

/**
 * One pendant of slime, as numbers. `stretch` is 0..1 of its full reach and
 * `bead` is how far a released drop has fallen past the tip, or null.
 */
interface Drip {
  x: number;
  /** Where the membrane is above it — the drip hangs from the contour. */
  top: number;
  width: number;
  length: number;
  bead: { y: number; r: number; alpha: number } | null;
}

/** How many hang off the seam, and how far apart. Fewer on a narrow screen. */
function dripCount(l: Layout): number {
  return Math.max(2, Math.min(4, Math.round(l.width / 130)));
}

function drips(l: Layout, time: number, lobes: readonly Circle[]): Drip[] {
  const n = dripCount(l);
  const reach = seamRise(l) * 3.6;
  const out: Drip[] = [];
  for (let i = 0; i < n; i++) {
    const x = l.width * ((i + 0.5) / n + (hash01(i * 17 + 3) - 0.5) * (0.55 / n));
    const rate = 0.035 + hash01(i * 29 + 7) * 0.03;
    const u = (time * rate + hash01(i * 43 + 11)) % 1;
    // Most of them only breathe. Two in five gather, neck and let a bead go —
    // the panel should be alive, not raining.
    const falls = hash01(i * 61 + 5) < 0.4;
    const swell = falls ? gather(u) : 0.55 + 0.3 * Math.sin(u * Math.PI * 2);
    const length = reach * (0.5 + 0.75 * swell) * (0.6 + hash01(i * 71 + 13) * 0.8);
    const width = seamRise(l) * (0.13 + hash01(i * 83 + 19) * 0.13);
    out.push({
      x,
      top: seamY(l, x, time, lobes),
      width,
      length,
      bead: falls && u > 0.78 ? bead(u, length, width, l) : null,
    });
  }
  return out;
}

/** 0..1 and back: slow to gather, quick to let go. */
function gather(u: number): number {
  return u < 0.78 ? (u / 0.78) ** 1.6 : Math.max(0, 1 - (u - 0.78) / 0.1);
}

function bead(
  u: number,
  length: number,
  width: number,
  l: Layout,
): { y: number; r: number; alpha: number } {
  const fell = (u - 0.78) / 0.22;
  return {
    y: length + fell * fell * l.bandHeight * 0.42,
    r: width * 0.8,
    alpha: Math.max(0, 1 - fell) * 0.9,
  };
}

/**
 * All of the slime in one fill and one stroke.
 *
 * Seven pendants drawn one at a time would be seven paths, seven fills and
 * seven strokes of a frame's budget for a thing nobody looks straight at
 * (`frame-budget.test.ts`). They are one path instead; the beads are a second.
 */
export function drawDrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  skin: SeatSkin = P1_SKIN,
  /** The controls, so a drip hangs off whatever roof the join has shaped over
   * them rather than off a second copy of the shipped one. */
  lobes: readonly Circle[] = [],
): void {
  const all = drips(l, time, lobes);
  const body = new Path2D();
  const beads = new Path2D();
  let deepest = l.bandTop;
  for (const d of all) {
    pendant(body, d);
    deepest = Math.max(deepest, d.top + d.length);
    if (d.bead) beads.ellipse(d.x, d.top + d.bead.y, d.bead.r, d.bead.r * 1.25, 0, 0, Math.PI * 2);
  }

  // Every colour of it is the seat’s: this is the ship’s own fluid, and a
  // violet drip off a golden hull was the loudest thing left on player two’s
  // panel saying the two halves were built at different times.
  const grad = ctx.createLinearGradient(0, seamTop(l), 0, deepest);
  grad.addColorStop(0, rgba(skin.flesh[0], 0.62));
  grad.addColorStop(0.5, rgba(skin.flesh[1], 0.5));
  grad.addColorStop(1, rgba(skin.tint, 0.6));
  ctx.fillStyle = grad;
  ctx.fill(body);
  ctx.strokeStyle = rgba(skin.rim, 0.22);
  ctx.lineWidth = 0.7;
  ctx.stroke(body);

  ctx.fillStyle = rgba(skin.tint, 0.7);
  ctx.fill(beads);
  for (const d of all) {
    if (d.bead) halo(ctx, d.x, d.top + d.bead.y, d.bead.r * 3, skin.tint, d.bead.alpha * 0.35);
  }
}

/**
 * A thread of slime hanging off the membrane: wide where it leaves the skin,
 * pinched to a neck, and swelling into a bead at the end — the shape something
 * viscous actually hangs in. A teardrop with a flat bulb reads as a tooth,
 * which is what the first pass of this drew.
 */
function pendant(path: Path2D, d: Drip): void {
  const { x, top: y, width: w, length: len } = d;
  const neck = w * 0.34;
  const bulb = w * 0.8;
  const waist = y + len * 0.5;
  path.moveTo(x - w * 1.6, y - 1);
  path.bezierCurveTo(x - w * 1.3, y + len * 0.18, x - neck, y + len * 0.32, x - neck, waist);
  path.bezierCurveTo(x - bulb, y + len * 0.78, x - bulb, y + len * 0.95, x, y + len);
  path.bezierCurveTo(x + bulb, y + len * 0.95, x + bulb, y + len * 0.78, x + neck, waist);
  path.bezierCurveTo(x + neck, y + len * 0.32, x + w * 1.3, y + len * 0.18, x + w * 1.6, y - 1);
  path.closePath();
}
