import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import * as look from "../../../../../packages/render/src/rime-draw.js";
import { rimeRadius } from "../../../../../packages/render/src/rime-shape.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * GLINT — offered 27 September 2026, from the queue's "THE RIME's pane has no
 * secondary motion outside its story". Outside a whiteout the frost is dead
 * still: the fog's three bands drift on `time * 0.4` only inside that step,
 * and the pane under it has the light's drift and nothing else. So a glint
 * crosses the ice on a period of its own: a line of light sweeps the pane on
 * a slant, and each of the seven sheets' edges catches it as it passes and
 * goes dull again, then the pane rests for most of the period.
 *
 * **Edges, not a band**: the fog is soft pale bands over the whole glass, and
 * the glint is the seams lit, with the sheet under them filled fainter than
 * the fog's 0.22 — so a whiteout is never mistaken for it. A pale fill alone
 * was tried first and vanished into the pale frost. **Only on what is still
 * frosted** — the seam is clipped to the frost, so a wiped patch is clear
 * glass the glint does not touch.
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

const glint: look.RimeGlint = (ctx, l, facet, sheet, time) => {
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
};

export const RIME_PANE_GLINT: Variant = {
  slot: "rime:pane",
  name: "glint",
  sentence:
    "glint — a faint line of light crosses THE RIME's frost on a slant every few seconds, each ice sheet's edges catching it as it passes, and never on a patch already wiped clear",
  dir: "tools/versus/candidates/rime-pane/glint",
  patches: [
    patch({
      target: look.RIME_GLINT,
      reached: () => look.RIME_GLINT,
      where: {
        file: "packages/render/src/rime-draw.ts",
        symbol: "RIME_GLINT",
        type: "{ paint: RimeGlint }",
      },
      fields: { paint: glint },
    }),
  ],
};
