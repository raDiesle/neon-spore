import type { Point } from "@neon-spore/content";
import type { SimConfig, UndertowLobe, UndertowState } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { withOutlinePose } from "./outline-drift.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";
import { lobePose } from "./undertow-drift.js";
import { paintLobe } from "./undertow-flesh.js";
import { lobeHeight } from "./undertow-shape.js";

/**
 * THE UNDERTOW's lobes — the half of the boss that is *above* the hull line.
 *
 * **A bump of the ship, the way the cannon is one.** Wide where it leaves the
 * skin and narrowing to a rounded crown, so it reads as the hull pushed up
 * from under rather than a thing stood on it; its base is set below the skin
 * and the hull pass paints over it, so where it came from is never seen. Drawn
 * with the field, under the ship, for that reason (`undertow-draw.ts` is the
 * plating, drawn over it).
 *
 * **Its colour is its answer** (`undertow-flesh.ts`): yellow the maw's, cyan
 * the shield's. A tall lobe is twice a standing one and carries the colour
 * down the whole of its wall.
 *
 * **It dances and shakes.** The lean is the outline tier's
 * (`undertow-drift.ts`); the shake is a quick sideways tremor on top of it,
 * harder on a tall lobe, which is the one about to go. Both are drawing only
 * — the answer and the tap are judged by column.
 *
 * Nothing here is held between frames. The blow of a lobe taken is handed in
 * — how hard it still shows, and the sideways shake it puts through every lobe
 * still standing (`undertow-fx.ts`).
 */

/** Half a lobe's width where it leaves the skin, in tiles: the column and a shoulder. */
const BASE_HALF = 0.5;
/** Half its width at the crown, in tiles. */
const CROWN_HALF = 0.32;
/** How far below the skin the base is set, so the hull hides where it comes from. */
const BURIED = 0.5;
/** The tremor, in tiles each way, standing and tall, and how fast it runs, per second. */
const SHAKE_TILES = 0.035;
const TALL_SHAKE_TILES = 0.08;
const SHAKE_RATE = 23;

/** The colour that answers a lobe: the pod's yellow for the maw, the dome's cyan for the shield. */
export function lobeColour(b: UndertowLobe): string {
  return b.answer === "maw" ? PALETTE.pod : PALETTE.shield;
}

/** The tremor's sideways offset at `time`, in pixels, seeded by column so two do not shake as one. */
export function lobeShake(b: UndertowLobe, tile: number, time: number): number {
  const reach = b.stage === "tall" ? TALL_SHAKE_TILES : SHAKE_TILES;
  const t = time * SHAKE_RATE + b.col * 1.9;
  return tile * reach * (Math.sin(t) * 0.7 + Math.sin(t * 1.7 + 0.4) * 0.3);
}

export function drawUndertowLobes(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  u: UndertowState,
  beat: number,
  beatPhase: number,
  time: number,
  skinY: SurfaceY,
  hurt = 0,
  shake = 0,
): void {
  for (const b of u.lobes) {
    const h = lobeHeight(cfg, u, b, beat, beatPhase);
    if (h <= 0) continue;
    const x = tileCX(l, b.col);
    // Each leans about where it crosses the skin (`undertow-drift.ts`).
    const root = { x: x + shake + lobeShake(b, l.tile, time), y: skinY(x) };
    withOutlinePose(ctx, lobePose(cfg, b.col, h, l.tile, beat, beatPhase), root, () =>
      drawLobe(ctx, l, root.x, root.y, h, b, time, hurt),
    );
  }
}

/** One lobe: a bump wide at the skin and round at the crown, breathing at its rim. */
function drawLobe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  skin: number,
  tiles: number,
  b: UndertowLobe,
  time: number,
  hurt: number,
): void {
  const t = l.tile;
  const top = skin - tiles * t;
  const base = skin + BURIED * t;
  const H = tiles * t;
  const breathe = 1 + 0.04 * Math.sin(time * 2.1 + b.col);
  const crown = CROWN_HALF * t * breathe;
  const foot = BASE_HALF * t;
  const side = (s: number): Point[] => [
    { x: x + s * foot * 1.05, y: base },
    { x: x + s * foot, y: skin },
    { x: x + s * (foot * 0.55 + crown * 0.45), y: skin - H * 0.45 },
    { x: x + s * crown, y: top + Math.min(H * 0.3, crown) },
  ];
  const path = splinePath([...side(-1), { x, y: top }, ...side(1).reverse()], true);
  paintLobe(ctx, path, { x, top, skin, hw: foot, tile: t }, lobeColour(b), b.stage === "tall");
  drawHurt(ctx, path, hurt);
}
