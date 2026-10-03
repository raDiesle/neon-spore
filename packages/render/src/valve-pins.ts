import type { Layout } from "./layout.js";
import { type Point, valveReach } from "./valve-shape.js";

/**
 * **Where THE VALVE's pins hang**: THE TITHE's plates under the drum, each
 * laid round the drum's own middle at the origin as the rest of its geometry
 * is (`valve-shape.ts`), and the slot each leaves once pulled. Cut from
 * `valve-shape.ts` when that page reached the length ceiling.
 */

/** The three pins: the span of the underside they hang across, the plate's top inside the rim, and how far a plate hangs below, in tiles. */
const PIN_SPAN = 1.5;
const PIN_TOP = 0.55;
const PIN_DROP = 0.5;

/**
 * Pin `i` of three, left to right: THE TITHE's plate, squared, its pad cut
 * off each side, hanging from inside the rim. `reach` is how far below the
 * rim it hangs, 1 at rest; `out` slides it straight down and away as it comes
 * free.
 */
export function valvePinPath(
  l: Layout,
  i: number,
  pins: number,
  reach: number,
  out: number,
): Path2D {
  const p = new Path2D();
  valvePinPoints(l, i, pins, reach, out).forEach((q, k) => {
    if (k === 0) p.moveTo(q.x, q.y);
    else p.lineTo(q.x, q.y);
  });
  p.closePath();
  return p;
}

/** Pin `i`'s four corners (`valvePinPath`), which a bolt meets (`valve-stop.ts`). */
export function valvePinPoints(
  l: Layout,
  i: number,
  pins: number,
  reach: number,
  out: number,
): Point[] {
  const { ry } = valveReach(l);
  const w = (PIN_SPAN * 2 * l.tile) / pins;
  const pad = w * 0.19;
  const xL = -PIN_SPAN * l.tile + i * w + pad;
  const xR = xL + w - pad * 2;
  const down = out * 2.4 * l.tile;
  const top = PIN_TOP * ry + down;
  const bottom = ry + PIN_DROP * reach * l.tile + down;
  return [
    { x: xL, y: top },
    { x: xR, y: top },
    { x: xR, y: bottom },
    { x: xL, y: bottom },
  ];
}

/** Where pin `i`'s plate hangs from, `out` of the way free: the middle of its top edge, inside the drum. */
export function valvePinTop(l: Layout, i: number, pins: number, out: number): Point {
  const { ry } = valveReach(l);
  const w = (PIN_SPAN * 2 * l.tile) / pins;
  return { x: -PIN_SPAN * l.tile + (i + 0.5) * w, y: PIN_TOP * ry + out * 2.4 * l.tile };
}

/** The middle of pin `i`'s plate at `reach`, still in, and half its height: where a thumb takes hold of it. */
export function valvePinCentre(
  l: Layout,
  i: number,
  pins: number,
  reach: number,
): Point & { r: number } {
  const top = valvePinTop(l, i, pins, 0);
  const bottom = valveReach(l).ry + PIN_DROP * reach * l.tile;
  return { x: top.x, y: (top.y + bottom) / 2, r: (bottom - top.y) / 2 };
}

/** The hole a spent pin leaves in the underside: a short dark slot where the plate went in. */
export function valveHolePath(l: Layout, i: number, pins: number): Path2D {
  const { ry } = valveReach(l);
  const w = (PIN_SPAN * 2 * l.tile) / pins;
  const pad = w * 0.19;
  const xL = -PIN_SPAN * l.tile + i * w + pad;
  const y = ry * 0.78;
  const p = new Path2D();
  p.rect(xL, y - l.tile * 0.08, w - pad * 2, l.tile * 0.16);
  return p;
}

/** The middle of the slot pin `i` leaves: where the jet blows from. */
export function valveHoleCentre(l: Layout, i: number, pins: number): Point {
  const { ry } = valveReach(l);
  const w = (PIN_SPAN * 2 * l.tile) / pins;
  return { x: -PIN_SPAN * l.tile + i * w + w / 2, y: ry * 0.78 };
}

/** How far a pin swings each way, in radians — about three degrees, the least a plate reads at. */
const SWAY = 0.05;
/** The rate in radians a second, off the drum's 0.4. */
const SWAY_RATE = 0.67;
/** How far each pin's swing is out of step with the one before. */
const SWAY_APART = 2.1;

/**
 * How a hung pin swings about the top of its plate: an angle for pin `i`,
 * `going` of the way free, at `time` seconds. Each still-hung pin sways on a
 * slow period, out of step with the next, and stops as it slides free — the
 * owner's pick on VERSUS `valve:pin`, 27 September 2026: *a little bit
 * better*. A record, so a second answer can stand beside it.
 */
export const VALVE_PIN: { sway: (i: number, going: number, time: number) => number } = {
  sway: (i, going, time) =>
    SWAY * (1 - Math.min(1, going)) * Math.sin(time * SWAY_RATE + i * SWAY_APART),
};
