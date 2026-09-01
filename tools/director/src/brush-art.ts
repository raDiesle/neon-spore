import { brushSpecimen } from "./brush-poses.js";
import type { Brush } from "./brushes.js";

/**
 * A brush's own picture, kept: the body it paints, drawn by the shipping
 * renderer, on nothing.
 *
 * `silhouette.ts`'s plain contour told a wave author which shape a brush was;
 * it never told them what colour it fills, what it glows, or what a shield or
 * a plate looks like laid over it. So these are real frames — the same
 * `Canvas2DRenderer` the phone runs, against a real `World` (`brush-poses.ts`).
 *
 * Built once per brush and kept as a data URL: a settled frame costs dozens of
 * simulation ticks and a full render pass, and the same picture is wanted in
 * three places at three sizes — the palette, the map's cells and the hover
 * card — where one canvas element cannot be in two of them at once.
 */

/** `ERASE` paints nothing, so there is nothing to draw a picture of. It is the
 * only one: `THROB` used to be skipped too, on the grounds that its settled
 * shape said less than its outline did — which was true of a crop of the field
 * with a dim body somewhere in it, and is not true of the body drawn bare and
 * filling the frame. */
const SKIP: ReadonlySet<Brush> = new Set(["erase"]);

const cache = new Map<Brush, string | null>();

/**
 * A brush's picture as a data URL, or null when there is none — `erase`, or a
 * kind whose pose could not be built. `palette.ts` is what falls back to the
 * plain contour.
 */
export function brushArtUrl(brush: Brush): string | null {
  if (SKIP.has(brush)) return null;
  if (!cache.has(brush)) {
    let url: string | null = null;
    try {
      const canvas = brushSpecimen(brush);
      url = canvas ? canvas.toDataURL("image/png") : null;
    } catch {
      // A pose that cannot be built (a future kind this module has not been
      // taught yet) falls back to the plain contour rather than breaking the
      // palette that shows it.
      url = null;
    }
    cache.set(brush, url);
  }
  return cache.get(brush) ?? null;
}

/**
 * The same picture as an element, at whatever size the caller has room for —
 * the palette's chip, a map cell, the hover card. An `<img>` rather than the
 * canvas itself: one canvas cannot hang in three places at once, and the three
 * want three sizes of the one drawing.
 */
export function brushArtImage(brush: Brush, px: number): HTMLImageElement | null {
  const url = brushArtUrl(brush);
  if (!url) return null;
  const img = new Image();
  img.src = url;
  img.width = px;
  img.height = px;
  img.className = "brush-art";
  img.alt = "";
  return img;
}
