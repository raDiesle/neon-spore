import { CRAWLER } from "../../../../packages/content/src/index.js";
import type { CrawlerLinkDraw } from "../../../../packages/render/src/crawler-look.js";
import { mixHex, rgba } from "../../../../packages/render/src/hex.js";

/**
 * What the three `creature:crawler` answers of 19 October 2026 share: the
 * ring's radii once the contraction has narrowed it, the ink the caller filled
 * it with, a per-ring number that is the same every frame, and the volume pass
 * every one of them starts from.
 *
 * The owner's complaint was that the worm reads as *mathematical shapes*: every
 * ring the same flat ellipse under the same soft light. A real larva is none of
 * that — it is lit through, it is dark where it is thick, no two of its rings
 * carry quite the same marks, and its parts move. Each candidate takes a
 * different animal for its reference; this is only what they agree about.
 */

/** A shadow is cool and never black — `docs/style-guide.md`. */
export const SHADOW = "#0B1024";

/** The ring's own radii once the squeeze has narrowed it and made it taller —
 * `crawlerOutline`'s two lines, so a mark placed on these lands on the
 * contour the caller filled. */
export function contracted(d: CrawlerLinkDraw): { ax: number; ay: number } {
  return {
    ax: d.rx * (1 - CRAWLER.pulse * d.squeeze),
    ay: d.ry * (1 + CRAWLER.pulse * d.squeeze),
  };
}

/**
 * The colour the caller filled this ring with, read back off the context.
 *
 * `crawler.ts` sets `fillStyle` to the hazed ink and fills the ring the line
 * before it calls the look, so a candidate that wants the ring's own colour —
 * a leg the same flesh as its ring — has it without the record growing a
 * field. A browser hands it back as `#rrggbb`; anything else falls back to
 * the plate grey, which is what a ring with no colour is.
 */
export function inkOf(ctx: CanvasRenderingContext2D): string {
  const s = ctx.fillStyle;
  return typeof s === "string" && /^#[0-9a-fA-F]{6}$/.test(s) ? s : "#23222C";
}

/** A number in 0..1 for this ring and this purpose, the same on every frame
 * and on both phones. Integer hashing rather than a sine, so neighbouring
 * rings do not drift through a visible pattern. */
export function hash(order: number, salt: number): number {
  let h = (order * 374761393 + salt * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * The volume of a thick, soft body: dark where the flesh is deepest — the
 * belly and the far limb — and a little lit through at the core, so a ring
 * reads as a sausage of meat rather than a disc with a gradient on it. The
 * caller has clipped to the body.
 */
export function volume(ctx: CanvasRenderingContext2D, ax: number, ay: number, depth: number): void {
  const r = Math.max(ax, ay);
  const edge = ctx.createRadialGradient(-ax * 0.12, -ay * 0.28, r * 0.15, 0, 0, r * 1.05);
  edge.addColorStop(0, rgba(SHADOW, 0));
  edge.addColorStop(0.55, rgba(SHADOW, depth * 0.25));
  edge.addColorStop(1, rgba(SHADOW, depth));
  ctx.fillStyle = edge;
  ctx.fillRect(-ax * 1.2, -ay * 1.6, ax * 2.4, ay * 3.2);
  // The belly: the underside away from the key is the thickest flesh and the
  // deepest shadow, a band and not a ring.
  const belly = ctx.createLinearGradient(0, ay * 0.2, 0, ay * 1.3);
  belly.addColorStop(0, rgba(SHADOW, 0));
  belly.addColorStop(1, rgba(SHADOW, depth * 0.9));
  ctx.fillStyle = belly;
  ctx.fillRect(-ax * 1.2, ay * 0.2, ax * 2.4, ay * 1.2);
}

/**
 * Where one ring tucks under the next: the ring in front lies over this one's
 * leading end, and flesh pressed against flesh is dark in the crease. Without
 * it the rings read as cut-outs laid on each other; with it they read as
 * folds of one body. The head has nothing in front of it and gets none. The
 * caller has clipped to the body.
 */
export function crease(
  ctx: CanvasRenderingContext2D,
  d: CrawlerLinkDraw,
  ax: number,
  ay: number,
  k: number,
): void {
  if (d.order === 0) return;
  const g = ctx.createLinearGradient(-d.dir * ax * 0.4, 0, d.dir * ax * 0.18, 0);
  g.addColorStop(0, rgba(SHADOW, 0));
  g.addColorStop(1, rgba(SHADOW, k));
  ctx.fillStyle = g;
  ctx.fillRect(-ax * 1.2, -ay * 1.6, ax * 2.4, ay * 3.2);
}

/**
 * The trailing tip lit through: the thin end of a soft body, where it laps
 * over the ring behind, lets the light through and glows its own colour. The
 * caller has clipped to the body; `ink` is the ring's fill.
 */
export function litThrough(
  ctx: CanvasRenderingContext2D,
  d: CrawlerLinkDraw,
  ink: string,
  ax: number,
  ay: number,
  k: number,
): void {
  const g = ctx.createRadialGradient(-d.dir * ax, -ay * 0.1, 0, -d.dir * ax, -ay * 0.1, ax * 0.75);
  g.addColorStop(0, rgba(mixHex(ink, "#FFFFFF", 0.35), k));
  g.addColorStop(1, rgba(ink, 0));
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.fillRect(-ax * 1.2, -ay * 1.6, ax * 2.4, ay * 3.2);
  ctx.globalCompositeOperation = prev;
}

/**
 * A dark part with a pale edge, so it reads on both materials: a face drawn
 * dark on a red or cyan head vanishes on the plate grey every head can wear.
 * Strokes the current path wide in pale, then narrow in the dark.
 */
export function edged(ctx: CanvasRenderingContext2D, width: number, dark: string): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = rgba("#F2E9DC", 0.55);
  ctx.lineWidth = width * 1.8;
  ctx.stroke();
  ctx.strokeStyle = dark;
  ctx.lineWidth = width;
  ctx.stroke();
}
