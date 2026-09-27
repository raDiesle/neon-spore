import type { Point } from "@neon-spore/content";
import { CURTAIN_COLS } from "@neon-spore/sim";
import type { Layout } from "./layout.js";

/**
 * **THE CURTAIN's membrane as an outline**: the rail, the right edge and the
 * hem, a scallop a column, each scallop a piece with the joint it hangs from.
 * Cut off `curtain-sheet.ts`, which paints the cloth this lays, when the hem
 * was split into pieces (`docs/spec/living-bosses.md`, the part map).
 */

/** How far below the row's centre the hem hangs, in tiles. */
const HEM_DROP = 0.42;
/** How far above it the rail is. */
const RAIL_RISE = 0.5;
/** Both of them again for `curtain-grip.ts`, which has to know how far the hem
 * may be carried before it is at the rail: the ring rides the edge this file
 * draws, and a reach worked out from a second copy of these would be a handle
 * that parted company with the cloth under it. */
export const CURTAIN_HEM_DROP = HEM_DROP;
export const CURTAIN_RAIL_RISE = RAIL_RISE;
/** How far the hem lifts where a lobe is gone, in tiles. */
const HEM_LIFT = 0.16;

/**
 * **One scallop of the hem, as its own piece**: the curve under one column,
 * from where the scallop to its right ended, through `bend`, to `to` — and
 * the `joint` it hangs from, the middle of its chord on the hem's line
 * (`docs/spec/living-bosses.md`, the part map). Lifted where the column's
 * lobe has come off and nothing weighs it.
 *
 * **A piece of the membrane's outline, not a shape of its own**, for THE
 * HIVE's reason (`hive-shape.ts`): the fabric is translucent, so a scallop
 * filled apart would double the cloth where it meets the rest.
 * `curtainSheetPath` lays each into the one outline. Right to left.
 */
export interface CurtainScallop {
  joint: Point;
  bend: Point;
  to: Point;
}

/**
 * The hem's scallops, right to left, the sheet's left edge at `x0` and its
 * row's centre at `cy`. `sway` is the draught's swing (`curtain-sway.ts`):
 * every joint takes it, but only the edge it swings toward reaches out — the
 * trailing edge stays over its column, so a core under the end column is
 * never uncovered by the wind.
 */
export function curtainHem(
  l: Layout,
  x0: number,
  cy: number,
  lobes: readonly boolean[],
  lag: number,
  lift: number,
  time: number,
  sway = 0,
): CurtainScallop[] {
  const t = l.tile;
  const hemY = cy + t * HEM_DROP - lift;
  const out: CurtainScallop[] = [];
  for (let i = CURTAIN_COLS - 1; i >= 0; i--) {
    const y = hemY - ((lobes[i] ?? false) ? 0 : t * HEM_LIFT) + Math.sin(time * 1.7 + i) * t * 0.02;
    const xr = x0 + (i + 1) * t + lag + (i === CURTAIN_COLS - 1 ? Math.max(0, sway) : sway);
    const xl = x0 + i * t + lag + (i === 0 ? Math.min(0, sway) : sway);
    const mid = (xl + xr) / 2;
    out.push({ joint: { x: mid, y }, bend: { x: mid, y: y + t * 0.12 }, to: { x: xl, y } });
  }
  return out;
}

/**
 * The membrane: straight along the rail, down the right edge, then back along
 * the hem a scallop at a time (`curtainHem`).
 */
export function curtainSheetPath(
  l: Layout,
  x0: number,
  cy: number,
  lobes: readonly boolean[],
  lag: number,
  lift: number,
  time: number,
  sway = 0,
): Path2D {
  const railY = cy - l.tile * RAIL_RISE;
  const x1 = x0 + CURTAIN_COLS * l.tile;
  const hem = curtainHem(l, x0, cy, lobes, lag, lift, time, sway);
  const path = new Path2D();
  path.moveTo(x0, railY);
  path.lineTo(x1, railY);
  path.lineTo(x1 + lag + Math.max(0, sway), hem[0]?.to.y ?? railY);
  for (const b of hem) path.quadraticCurveTo(b.bend.x, b.bend.y, b.to.x, b.to.y);
  path.closePath();
  return path;
}
