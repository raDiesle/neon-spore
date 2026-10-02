import { blobPoints } from "@neon-spore/content";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { paintMass } from "./sinew-flesh.js";
import type { Point } from "./sinew-shape.js";
import { splinePath } from "./spline.js";

/**
 * **The crown**: the body THE SINEW's tendon hangs from, flying over the top
 * of the field — the owner, 2 October 2026, asked first for *some body
 * visible which is attached to them, but it can be cut by the top of the
 * screen*, and then changed it: *i want not to cut. so strings are connected
 * to something top of the boss flying.*
 *
 * So it is whole: the same flesh as the mass (`paintMass`), seven-lobed where
 * the mass is five, and wider than it, hung just above the root and never
 * reaching the line the game's own chrome stops at (`top-chrome.ts`,
 * `boss-top.test.ts`). Where the field starts too high for that, the root
 * comes down to it instead (`sinewAnchor`), so the body is never cut.
 *
 * It flies on **FLOAT**, the free own-motion in the shape sheet's drafts
 * (`tools/shape-sheet/src/motions/offered.ts`): two slow drifts on periods
 * that share no common multiple, a lazy roll and a breathing squash, here at
 * twice the drafts' reach, because a boss is not held to a column's quarter
 * tile. **The strings' root rides it** (`sinewCrownRoot`), so they leave the
 * body where it is now and not where it rests; the strain band they run into
 * is hung off the resting root (`sinewCollarBox`) and holds still to be read.
 *
 * Every motion here is the wall clock's, and nothing a thumb is answered
 * against reads it: the handles rest off the mass, not the crown.
 */

/** Its half-sizes, in tiles, and how far above the root its centre rides. */
const CROWN_RX = 1.4;
const CROWN_RY = 0.75;
const CROWN_LIFT = 0.25;
/** The outline: lobe depth and wobble, as `blobPoints` takes them. */
const DEPTH = 0.1;
const WOBBLE = 0.04;
/** FLOAT's two drifts, in tiles, at twice the drafts' reach, on its periods. */
const WIDE = 0.32;
const TALL = 0.22;
const ACROSS = 0.317;
const DOWN = 0.211;
/** FLOAT's lazy roll, in radians, and the breath it squashes by. */
const ROLL = 0.13;
const ROLL_RATE = 0.139;
const BREATH = 0.045;
const BREATH_RATE = 0.263;
/** Clear air between its highest reach and the chrome's line, in tiles. */
const GAP = 0.1;

/**
 * How far above the root the crown can ever reach, in tiles: its lift, its
 * half-height at the fullest breath and lobe, the drift up, the roll's rise at
 * the tip, and the gap. `sinewAnchor` keeps the root this far under the
 * chrome's line, so the body is whole on every screen.
 */
export const CROWN_HEADROOM =
  CROWN_LIFT +
  CROWN_RY * (1 + DEPTH + WOBBLE) * (1 + BREATH) +
  TALL +
  CROWN_RX * (1 + DEPTH + WOBBLE) * Math.sin(ROLL) +
  GAP;

const TAU = Math.PI * 2;

/** Where FLOAT has the crown now, off its rest, in tiles. */
function drift(time: number): Point {
  return {
    x: Math.sin(time * ACROSS * TAU) * WIDE,
    y: Math.sin(time * DOWN * TAU + 1.1) * TALL,
  };
}

/** Where the strings leave the crown now: the resting root, flown by FLOAT. */
export function sinewCrownRoot(l: Layout, root: Point, time: number): Point {
  const d = drift(time);
  return { x: root.x + d.x * l.tile, y: root.y + d.y * l.tile };
}

/** The crown's outline around `root` — where the strings leave it now. */
export function sinewCrownPoints(l: Layout, root: Point, time: number): Point[] {
  const breath = Math.sin(time * BREATH_RATE * TAU);
  const roll = Math.sin(time * ROLL_RATE * TAU) * ROLL;
  const rx = CROWN_RX * l.tile * (1 + breath * BREATH);
  const ry = CROWN_RY * l.tile * (1 - breath * BREATH);
  const cx = root.x;
  const cy = root.y - CROWN_LIFT * l.tile;
  const cos = Math.cos(roll);
  const sin = Math.sin(roll);
  return blobPoints(0, 0, rx, ry, 7, DEPTH, WOBBLE, time * 0.25 + 1.7, 34).map((p) => ({
    x: cx + p.x * cos - p.y * sin,
    y: cy + p.x * sin + p.y * cos,
  }));
}

export function drawSinewCrown(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  root: Point,
  strain: number,
  time: number,
): void {
  const body = splinePath(sinewCrownPoints(l, root, time), true);
  const hex = mixHex(PALETTE.hull, PALETTE.hullRim, strain * 0.25);
  const m = {
    x: root.x,
    y: root.y - CROWN_LIFT * l.tile,
    rx: CROWN_RX * l.tile,
    ry: CROWN_RY * l.tile,
    tile: l.tile,
  };
  paintMass(ctx, body, m, hex, PALETTE.hullRim, strain, time);
}
