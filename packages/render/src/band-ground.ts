import { bakedCache } from "./baked.js";
import type { Layout } from "./layout.js";
import { P1_SKIN, type SeatSkin } from "./seat-skin.js";
import { floor } from "./ship-gland.js";

/**
 * WHAT THE CONTROL PANEL IS MADE OF.
 *
 * The band used to be `fillRect` in `#0E0A22` with a ruled line along the top.
 * It is the ship seen from inside now: the chamber under the hull, wet and lit
 * from the seam above it, with big lenses of fluid lying along its floor. The
 * owner asked for that in those words — neon, fluid, living, slime, and part
 * of the ship rather than a box bolted under it — and on 11 September 2026
 * took GLAND's floor out of `ship:body` in place of the veined, celled tissue
 * that had been here.
 *
 * **It is painted once and blitted.** A sheet this layered — a ground, nine
 * lenses each with its own light — is past what a frame may spend, and none
 * of it moves: it depends on the size of the panel and nothing else. So it is baked into an offscreen canvas the first time a
 * size is asked for and drawn with a single `drawImage` after that, which is
 * the same bargain `haloSprite` already makes in `glow.ts`. That is also why
 * this can afford to be as detailed as a painted texture would be, without an
 * asset to fetch, a decode to wait for, or a fixed resolution to be soft at:
 * it is baked at `l.dpr`, so it is sharp on a phone and on a desk.
 *
 * Everything in it comes from `hash01`, so one size always bakes the same
 * sheet — a background that reshuffled itself on a resize would be the one
 * thing in the picture that noticed the window.
 *
 * **What colour it is, is the seat’s.** Every hue in here used to be a violet
 * literal, which made player two a golden ship bolted to a violet chamber. It
 * comes off `SeatSkin` now, so the panel is the same flesh as the hull above
 * it on either device (`seat-skin.ts`).
 */

const sheets = bakedCache<string, HTMLCanvasElement>();

/**
 * WHAT THE TISSUE IS, AS A RECORD.
 *
 * The owner asked on 10 September 2026 for a whole new ship, and the panel is
 * the inside of it — so the painter is a record, the way the hull's material
 * is (`hull-sheen.ts`), and `paint` below is what it ships as.
 *
 * `name` is in the bake key. The sheet is drawn once per size and seat and
 * blitted from then on, so a candidate that swapped `paint` alone would be
 * handed the shipped sheet from the cache on every frame after the first —
 * two pictures that agree, which is the one failure VERSUS exists to prevent.
 */
export interface BandGround {
  readonly name: string;
  paint(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void;
}

/**
 * The sheet for a panel this size, baked once. Keyed on the pixel size it will
 * be blitted at **and on the seat**, and cleared past a handful of entries — a
 * window being dragged wider walks through every width on the way. The seat is
 * in the key for the reason the socket sprite’s is: two seats at one size are
 * two different sheets, and a cache that only remembered sizes would hand
 * player two whichever one was baked first.
 */
export function groundSheet(
  width: number,
  height: number,
  dpr: number,
  skin: SeatSkin = P1_SKIN,
): HTMLCanvasElement {
  const w = Math.max(1, Math.round(width * dpr));
  const h = Math.max(1, Math.round(height * dpr));
  const key = `${BAND_GROUND.name}:${w}x${h}:${skin.ground[0]}`;
  const held = sheets.get(key);
  if (held) return held;
  if (sheets.size > 4) sheets.clear();
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (g) BAND_GROUND.paint(g, w, h, skin);
  sheets.set(key, canvas);
  return canvas;
}

/** GLAND's floor since 11 September 2026: the seat's ground with big lenses
 * of fluid lying along the bottom of it (`gland-fluid.ts`, tuned in
 * `ship-gland.ts`). It replaced the wet, veined, celled tissue. */
export const BAND_GROUND: BandGround = { name: "gland", paint: floor };

/**
 * The sheet, put down under the panel — one clip and one blit, whatever is in
 * the picture. `top` is the highest the seam reaches, so the sheet covers
 * every part of the panel the membrane above it can expose.
 */
export function drawBandGround(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  top: number,
  skin: SeatSkin = P1_SKIN,
): void {
  const height = l.bandTop + l.bandHeight - top;
  ctx.drawImage(groundSheet(l.width, height, l.dpr, skin), 0, top, l.width, height);
}
