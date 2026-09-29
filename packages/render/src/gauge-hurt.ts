import { blobRadiusMul, type Point } from "@neon-spore/content";
import type { Dial } from "./gauge.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **What the alien has taken**: one torn gash in its flesh for every mark the
 * pair has landed, and they stay for the round.
 *
 * The owner, 29 September 2026: *the dotted lives you should come up with some
 * cool other visuals, i suggest to show big wounds on the boss instead, so no
 * exact number visible what is left*. So the pips are gone and the count is on
 * the body: big, ember-lit, crowding the same two shoulders so that the later
 * ones tear into the earlier. A pair sees the alien getting worse and does not
 * count anything, which is the point — how many are left is not a number the
 * round shows any more.
 *
 * Ember and never an ammunition colour: red and cyan on this picture are only
 * ever the wound that asks to be hit (`gauge-alien.ts`), and a gash in either
 * would be a second place to aim at.
 */

/**
 * Where each gash tears, in order: the angle round the pivot (canvas degrees,
 * 180 is left and 270 straight up), the distance as a share of the dial's
 * radius, and the tilt of its long axis. Left and right shoulder by turns,
 * clear of the eyes (`gauge-face.ts`) and of the sides of a narrow phone; the
 * last is over the brow.
 */
const SLOTS: readonly (readonly [number, number, number])[] = [
  [212, 1.22, 0.5],
  [322, 1.26, -0.6],
  [226, 1.34, -0.3],
  [308, 1.14, 0.9],
  [204, 1.1, 1.2],
  [334, 1.12, -1.1],
  [224, 1.12, -0.9],
  [312, 1.38, 0.2],
  [270, 1.64, 0.1],
];

/** The gash's half-length and half-width, as shares of the dial's radius. */
const LONG = 0.2;
const WIDE = 0.075;
/** How many points round each gash. */
const N = 18;

const GOUGE = "#23070F";

/** The gashes for `marks` landed, over the alien's flesh and under the hull. */
export function drawGaugeHurt(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  marks: number,
  time: number,
): void {
  const n = Math.min(marks, SLOTS.length);
  if (n <= 0) return;
  ctx.save();
  ctx.lineJoin = "round";
  for (let k = 0; k < n; k++) {
    const slot = SLOTS[k];
    if (slot === undefined) continue;
    drawGash(ctx, dial, slot, k, time);
  }
  ctx.restore();
}

function drawGash(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  [deg, dist, tilt]: readonly [number, number, number],
  k: number,
  time: number,
): void {
  const a = (deg * Math.PI) / 180;
  const at: Point = {
    x: dial.cx + Math.cos(a) * dial.r * dist,
    y: dial.cy + Math.sin(a) * dial.r * dist,
  };
  // Each a little larger than the one before: the alien is getting worse.
  const grow = 1 + 0.06 * k;
  const long = dial.r * LONG * grow;
  const wide = dial.r * WIDE * grow;
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.1 + k * 1.7);

  const glow = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, long * 1.3);
  glow.addColorStop(0, rgba(PALETTE.ember, 0.3 + 0.12 * pulse));
  glow.addColorStop(1, rgba(PALETTE.ember, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(at.x - long * 1.3, at.y - long * 1.3, long * 2.6, long * 2.6);

  const path = splinePath(outline(at, long, wide, tilt, k), true);
  ctx.fillStyle = GOUGE;
  ctx.fill(path);
  ctx.strokeStyle = mixHex(PALETTE.ember, GOUGE, 0.25);
  ctx.lineWidth = 1.6;
  ctx.stroke(path);

  // The raw inside: a bright seam along the tear, breathing.
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  ctx.strokeStyle = rgba(PALETTE.emberRim, 0.55 + 0.35 * pulse);
  ctx.lineWidth = Math.max(1, wide * 0.35);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(at.x - cos * long * 0.6, at.y - sin * long * 0.6);
  ctx.quadraticCurveTo(
    at.x - sin * wide * 0.4,
    at.y + cos * wide * 0.4,
    at.x + cos * long * 0.6,
    at.y + sin * long * 0.6,
  );
  ctx.stroke();
}

/** A ragged, pointed slit: an ellipse pinched at both ends, its edge torn. */
function outline(at: Point, long: number, wide: number, tilt: number, k: number): Point[] {
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const torn = blobRadiusMul(t, 3, 0.12, 0.08, 0, 3.1 + k * 2.3);
    const u = Math.cos(t) * long;
    const v = Math.sin(t) * wide * torn * (0.55 + 0.45 * Math.abs(Math.sin(t)));
    pts.push({ x: at.x + u * cos - v * sin, y: at.y + u * sin + v * cos });
  }
  return pts;
}
