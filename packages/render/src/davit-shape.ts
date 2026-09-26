import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE DAVIT's geometry**: a boom stowed pointing straight up off a mast over
 * the middle column, swung out toward whichever half the live lean points
 * into, with a slack chain hanging off its tip and a hook at the chain's end
 * — the pivot both cannons are asked to hit.
 *
 * **Adapts `tools/shape-sheet/src/drafts/bosses.ts`'s unclaimed `arm()`
 * form** (the "THE CONDUCTOR" draft): a pivoted open contour with a whipping
 * tip, here pivoted at the mast instead of walked, and given a second,
 * slack-hanging contour off its own tip for the chain (`CLAUDE.md`, "A new
 * shape is never one the game already draws").
 *
 * **The mast never moves**: only the boom's angle and the chain's sag do. Laid
 * out about the mast at the origin; the draw moves the canvas to plant it
 * there, the way THE SLING's crotch does.
 */

export interface Point {
  x: number;
  y: number;
}

/** The row the mast's foot sits at, in tiles below the grid's top. */
const ROW = 1.6;
/** How long the boom stands, mast to tip. */
const BOOM_LEN = 1.9;
/** How far the chain hangs from the tip when it sags all the way home. */
const CHAIN_LEN = 1.3;
/** The hook's radius, in tiles. */
const HOOK_R = 0.3;

/** The mast's foot: over the middle column, above the ship. */
export function davitMast(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** The boom's tip, swung to `angle` radians off stowed (0 straight up, positive to the right). */
export function davitTip(l: Layout, angle: number): Point {
  return {
    x: Math.sin(angle) * BOOM_LEN * l.tile,
    y: -Math.cos(angle) * BOOM_LEN * l.tile,
  };
}

/** The hook at the chain's end, hanging `sag` (0 drawn up under the tip, 1 all the way down). */
export function davitHook(l: Layout, angle: number, sag: number): Point {
  const tip = davitTip(l, angle);
  return { x: tip.x, y: tip.y + CHAIN_LEN * sag * l.tile };
}

/** The hook's radius, in pixels. */
export function davitHookRadius(l: Layout): number {
  return HOOK_R * l.tile;
}

/** The boom itself: a tapered spar from the mast to its tip, swung to `angle`, standing to `stand`. */
export function davitBoomPath(l: Layout, angle: number, stand: number): Path2D {
  const tip = davitTip(l, angle * stand);
  const width = 0.11 * l.tile;
  const nx = -tip.y;
  const ny = tip.x;
  const len = Math.hypot(nx, ny) || 1;
  const wx = (nx / len) * width;
  const wy = (ny / len) * width;
  const foot: Point = { x: 0, y: width * 0.6 };
  const tipA: Point = { x: tip.x - wx * 0.15, y: tip.y - wy * 0.15 };
  const tipB: Point = { x: tip.x + wx * 0.15, y: tip.y + wy * 0.15 };
  return splinePath([foot, tipB, tipA, foot], true);
}

/** The chain, tip to hook, a slack curve rather than a straight drop. */
export function davitChainPath(l: Layout, angle: number, sag: number): Path2D {
  const tip = davitTip(l, angle);
  const hook = davitHook(l, angle, sag);
  const mid: Point = {
    x: (tip.x + hook.x) / 2 + 0.18 * l.tile * sag,
    y: (tip.y + hook.y) / 2,
  };
  const p = new Path2D();
  p.moveTo(tip.x, tip.y);
  p.quadraticCurveTo(mid.x, mid.y, hook.x, hook.y);
  return p;
}

/** The hook: a small ring at the chain's end. */
export function davitHookPath(l: Layout, angle: number, sag: number): Path2D {
  const hook = davitHook(l, angle, sag);
  const r = davitHookRadius(l);
  const p = new Path2D();
  p.arc(hook.x, hook.y, r, 0, Math.PI * 2);
  return p;
}

/** The mast's own foot: a short socket the boom stands out of. */
export function davitMastPath(l: Layout): Path2D {
  const r = 0.22 * l.tile;
  const p = new Path2D();
  p.ellipse(0, -r * 0.2, r, r * 0.7, 0, 0, Math.PI * 2);
  return p;
}
