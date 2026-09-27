import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { rimeRadius } from "./rime-shape.js";

/**
 * **THE RIME's frost glints** — the owner's pick on VERSUS `rime:pane`, 27
 * September 2026: *a little bit better but barely visible*. Outside a
 * whiteout the frost was dead still: the fog's three bands drift on
 * `time * 0.4` only inside that step. So a glint crosses the ice on a period
 * of its own: a line of light sweeps the pane on a slant, and each of the
 * seven sheets' edges catches it as it passes and goes dull again, then the
 * pane rests for most of the period.
 *
 * **Edges, not a band**: the fog is soft pale bands over the whole glass, and
 * the glint is the seams lit, with the sheet under them filled fainter than
 * the fog's 0.22 — so a whiteout is never mistaken for it. **Only on what is
 * still frosted** — `rime-draw.ts` clips it to the frost, so a wiped patch is
 * clear glass the glint does not touch.
 */

/** A sheet's fill at the glint's brightest, against the fog's 0.22. */
const GLINT = 0.12;
/** Its edges at the glint's brightest. */
const EDGE = 0.7;
/** One crossing and its rest, in seconds — off the fog's 15.7 and the light's 12.6. */
const PERIOD = 6.7;
/** How much of the period the crossing takes; the rest is dark. */
const CROSSING = 0.35;
/** How wide the line of light is, as a fraction of the pane's half-width. */
const WIDTH = 0.45;

/**
 * What a frosted sheet carries beyond its seam, drawn with the context at the
 * sheet's centre and clipped to what is still frosted: `sheet` is where it
 * stands on the pane, `facet` its outline.
 */
export type RimeGlint = (
  ctx: CanvasRenderingContext2D,
  l: Layout,
  facet: Path2D,
  sheet: { x: number; y: number; r: number },
  time: number,
) => void;

/** The glint as a record, so a second answer can stand beside it on VERSUS (`docs/versus.md`). */
export const RIME_GLINT: { paint: RimeGlint } = { paint: drawGlint };

function drawGlint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  facet: Path2D,
  sheet: { x: number; y: number; r: number },
  time: number,
): void {
  const { rx, ry } = rimeRadius(l);
  const through = (time / PERIOD - Math.floor(time / PERIOD)) / CROSSING;
  if (through >= 1) return;
  // The line runs corner to corner on a slant, from upper left to lower right.
  const at = (2 * through - 1) * 1.4;
  const along = (sheet.x / rx) * 0.8 + (sheet.y / ry) * 0.6;
  const near = Math.max(0, 1 - Math.abs(along - at) / WIDTH);
  if (near <= 0) return;
  const lit = near * near;
  ctx.fillStyle = rgba(PALETTE.hullRim, GLINT * lit);
  ctx.fill(facet);
  ctx.lineWidth = STROKE.inner * 1.5;
  ctx.strokeStyle = rgba(PALETTE.hullRim, EDGE * lit);
  ctx.stroke(facet);
}
