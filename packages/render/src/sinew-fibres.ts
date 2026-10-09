import { type SimConfig, type SinewState, sinewDecaying, sinewGone } from "@neon-spore/sim";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { CollarBox } from "./sinew-band.js";
import { paintCord, paintSheath } from "./sinew-flesh.js";
import { drawFray } from "./sinew-fray.js";
import { drawSinewPulse } from "./sinew-hold.js";
import type { Point } from "./sinew-shape.js";
import { sinewSum01 } from "./sinew-shape.js";
import { layVeiled } from "./sinew-veil.js";
import { splinePath } from "./spline.js";

/**
 * **The tendon**: a bundle of fibres hung in two runs — from the crown down
 * into the top of the strain band, and out of the band's foot down into the
 * mass (the owner, 2 October 2026: *the strings should not go from the very
 * top to the very bottom, but connect twice with the middle shape*). Each run
 * has its own translucent sheath, and its health is its silhouette.
 *
 * **One fibre is one stage.** There are `sinewFibres` of them and each one
 * parted is a stage the pair has won, so a fibre that parts is drawn as
 * curling stubs where both its runs were — off the crown, off the band's top
 * and foot, off the mass — and never drawn whole again. The tear itself is
 * `sinew-tear.ts`'s.
 *
 * The bundle parts **from the outside in**: the first fibre to go is the
 * leftmost, the second the rightmost, and so on toward the middle, so what
 * is left always reads as one thinner cord down the centre rather than as a
 * comb with gaps in it. The order is this file's and nothing in the
 * simulation cares which fibre is which — it counts them (`sim/sinew.ts`).
 * The next to go **frays** while the sum is held in the zone, and on every
 * beat of the hold a green pulse runs out along the others from the band —
 * up to the crown, down to the mass — which is the count (`sinew-fray.ts`,
 * `sinew-hold.ts`).
 *
 * The strain is on the line itself: slack, each fibre carries a slow wave;
 * as the sum climbs the wave flattens, the fibres straighten, thin and
 * brighten toward the rim colour, and the sheath pales.
 */

/** How far the fibres spread at the crown, in tiles; at the band, as a share of its
 * half-width; at the mass, as a share of its. */
const ROOT_SPREAD = 0.7;
const BAND_SPREAD = 0.75;
const FAN = 0.7;
/** The slack wave: its height in tiles and its speed. */
const WAVE = 0.1;
const WAVE_HZ = 1.8;
/** A stub: how far it hangs, as a share of its run and never more than this, in tiles. */
const STUB = 0.5;
const STUB_SHARE = 0.4;
const CURL = 0.22;
const SEGMENTS = 8;
/** A cord's width in tiles, slack; it thins by up to 0.6 of that under strain. */
const CORD = 0.05;

/** Which fibre goes `k`th: the outermost, alternating sides, toward the middle. */
export function partOrder(n: number): number[] {
  const order: number[] = [];
  for (let i = 0; i < n; i++) order.push(i % 2 === 0 ? i / 2 : n - 1 - (i - 1) / 2);
  return order;
}

/** Whether fibre `i` of `n` is still whole with `gone` parted. */
export function fibreWhole(i: number, n: number, gone: number): boolean {
  return partOrder(n).indexOf(i) >= gone;
}

/** Fibre `i` of `n` as a share of the bundle's width, -1 at the left to 1 at the right. */
function lane(i: number, n: number): number {
  return n <= 1 ? 0 : (i - (n - 1) / 2) / ((n - 1) / 2);
}

/** Where fibre `i` of `n`'s two runs start and end: crown, band top, band foot, mass. */
export interface FibreEnds {
  root: Point;
  top: Point;
  foot: Point;
  mass: Point;
}

export function fibreEnds(
  i: number,
  n: number,
  root: Point,
  box: CollarBox,
  mass: Point,
  rx: number,
  tile: number,
): FibreEnds {
  const u = lane(i, n);
  return {
    root: { x: root.x + u * ROOT_SPREAD * tile, y: root.y },
    top: { x: box.x + u * box.rx * BAND_SPREAD, y: box.y - box.ry },
    foot: { x: box.x + u * box.rx * BAND_SPREAD, y: box.y + box.ry },
    mass: { x: mass.x + u * rx * FAN, y: mass.y },
  };
}

/**
 * One run of one fibre, `a` to `b`, waving with the slack. Returns the
 * points it was drawn through, for the hold's pulse to run along.
 */
function whole(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  a: Point,
  b: Point,
  i: number,
  strain: number,
  time: number,
  hex: string,
): Point[] {
  const pts: Point[] = [];
  const amp = (1 - strain) * WAVE * l.tile;
  for (let k = 0; k <= SEGMENTS; k++) {
    const t = k / SEGMENTS;
    const belly = Math.sin(t * Math.PI);
    const wave = Math.sin(time * WAVE_HZ * Math.PI * 2 + t * Math.PI * 2 + i * 1.3) * amp * belly;
    pts.push({ x: a.x + (b.x - a.x) * t + wave, y: a.y + (b.y - a.y) * t });
  }
  paintCord(ctx, splinePath(pts, false), hex, l.tile * CORD * (1.4 - 0.6 * strain), l.tile);
  return pts;
}

/** A stub hanging off `from` toward `to`, curling out to `side`. */
function stub(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: Point,
  to: Point,
  side: number,
  time: number,
): void {
  const run = Math.hypot(to.x - from.x, to.y - from.y);
  const len = Math.min(STUB * l.tile, run * STUB_SHARE);
  const dir = Math.sign(to.y - from.y) || 1;
  const sway = Math.sin(time * 1.1 + from.x) * 0.06 * l.tile;
  const path = splinePath(
    [
      from,
      { x: from.x + sway, y: from.y + dir * len * 0.6 },
      { x: from.x + side * CURL * l.tile, y: from.y + dir * len },
    ],
    false,
  );
  paintCord(ctx, path, PALETTE.dim, l.tile * CORD, l.tile);
}

/** A run's sheath: a band from `a` to `b`, `wa` and `wb` half-wide at its ends. */
function sheath(
  ctx: CanvasRenderingContext2D,
  a: Point,
  b: Point,
  wa: number,
  wb: number,
  strain: number,
): void {
  const path = new Path2D();
  path.moveTo(a.x - wa, a.y);
  path.lineTo(a.x + wa, a.y);
  path.lineTo(b.x + wb, b.y);
  path.lineTo(b.x - wb, b.y);
  path.closePath();
  const tint = mixHex(PALETTE.hull, PALETTE.hullRim, strain * 0.5);
  const left = Math.min(a.x - wa, b.x - wb);
  const right = Math.max(a.x + wa, b.x + wb);
  paintSheath(ctx, path, left, right, tint, 0.1 + 0.12 * strain);
}

/**
 * **How the fibres are laid on the frame, as a record**, so VERSUS can offer
 * another answer beside it (`tools/versus/`): `slow` is whether THE SLOW is
 * open this beat, and `paint` draws them on the context it is handed. The game
 * veils them while the window is open (`sinew-veil.ts`).
 */
export interface FibreLook {
  lay: (
    ctx: CanvasRenderingContext2D,
    slow: boolean,
    paint: (on: CanvasRenderingContext2D) => void,
  ) => void;
}

export const FIBRE_LOOK: FibreLook = { lay: layVeiled };

export function drawSinewFibres(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  root: Point,
  box: CollarBox,
  mass: Point,
  rx: number,
  /** How far the hold has counted, 0..1; `-1` while the sum is not held in the zone. */
  hold: number,
  time: number,
): void {
  const n = Math.max(1, cfg.sinewFibres);
  const gone = sinewGone(s, cfg);
  const strain = sinewSum01(s, cfg);
  const fraying = hold >= 0 && s.fibres > 0 ? partOrder(n)[gone] : -1;
  // How far through the hold's current beat, for the pulse; `-1` with no hold.
  const holds = Math.max(1, cfg.sinewHoldBeats);
  const beatPhase = hold >= 0 && hold < 1 ? (hold * holds) % 1 : -1;
  // A tendon going slack under a hand is drawn greying: the pull is leaking.
  const hex = sinewDecaying(s, cfg)
    ? mixHex(PALETTE.hull, PALETTE.dim, 0.4)
    : mixHex(PALETTE.hull, PALETTE.hullRim, strain * 0.8);
  const top = { x: box.x, y: box.y - box.ry };
  const foot = { x: box.x, y: box.y + box.ry };
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (s.fibres > 0) {
    const share = s.fibres / n;
    const wBand = box.rx * BAND_SPREAD * share + l.tile * 0.08;
    sheath(ctx, root, top, l.tile * ROOT_SPREAD * share + l.tile * 0.08, wBand, strain);
    sheath(ctx, foot, mass, wBand, rx * FAN * share + l.tile * 0.08, strain);
  }
  for (let i = 0; i < n; i++) {
    const u = lane(i, n);
    const { root: r, top: t, foot: f, mass: m } = fibreEnds(i, n, root, box, mass, rx, l.tile);
    if (i === fraying) {
      drawFray(ctx, r, t, hold, l.tile, time, i);
      drawFray(ctx, f, m, hold, l.tile, time, i + 7);
    } else if (fibreWhole(i, n, gone)) {
      const up = whole(ctx, l, r, t, i, strain, time, hex);
      const down = whole(ctx, l, f, m, i + 3, strain, time, hex);
      // The hold's beat, leaving the band both ways (`sinew-hold.ts`).
      if (beatPhase >= 0) {
        drawSinewPulse(ctx, up.reverse(), beatPhase, l.tile);
        drawSinewPulse(ctx, down, beatPhase, l.tile);
      }
    } else {
      const side = u === 0 ? 1 : Math.sign(u);
      stub(ctx, l, r, t, side, time);
      stub(ctx, l, t, r, side, time);
      stub(ctx, l, f, m, side, time);
      stub(ctx, l, m, f, side, time);
    }
  }
  ctx.restore();
}
