import { facet, type Pin, pin } from "@neon-spore/content";
import { SVG } from "../skins/types.js";
import { inside } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * FILAMENT — one thread wound round the inside.
 *
 * It was `creature:bulb` / `filament`, and the owner sent it here on
 * 9 September 2026 with the other three offered to that body.
 *
 * A single line, wound from pole to pole round the inner wall, so the body is a
 * ball of yarn seen through a skin. It is the only value on this axis with no
 * discrete parts in it at all: nothing to count, nothing to mistake for a mark,
 * just a continuous thing that goes round and comes back.
 *
 * **A turn and a fifth, not three and a half.** The candidate's first cut wound
 * tightly, and a tight winding photographed at true size is three horizontal
 * hairlines — which is what a crack in a hull looks like in this game, and the
 * exact failure its own argument had predicted for itself. A slow pitch crosses
 * the body diagonally and reads as one thread.
 *
 * **The winding is what carries the turn.** The near half of the thread is
 * drawn and the far half is not, so as the body turns the visible arc slides
 * across it — the reveal, the cue an affine cannot produce at any setting
 * (`docs/dimensional.md`).
 *
 * **A stroke, broken at the limb**, and not a row of dots: a run of dots is
 * SPORES's answer two places along the row, and the two must not converge.
 */

const STEPS = 34;
/** How many times the thread goes round while it climbs from pole to pole. */
const WINDS = 1.2;
const REACH = 0.66;
const SPIN = 0.38;
const THREAD = 0.1;

const PINS: Pin[] = Array.from({ length: STEPS }, (_, i) => {
  const s = i / (STEPS - 1);
  return pin(s * WINDS * Math.PI * 2, (s * 2 - 1) * 0.82, 1);
});

export const FILAMENT: Filling<"filament"> = {
  id: "filament",
  label: "FILAMENT",
  hint: "one thread wound pole to pole round the inner wall, present only on the near half",
  build(ctx: FillingContext) {
    const g = inside(ctx, "filament");
    const reach = Math.min(ctx.extent.w, ctx.extent.h) * 0.5 * REACH;

    const thread = document.createElementNS(SVG, "path");
    thread.setAttribute("fill", "none");
    thread.setAttribute("stroke", ctx.colour);
    thread.setAttribute("stroke-opacity", "0.6");
    thread.setAttribute("stroke-width", Math.max(0.3, reach * THREAD).toFixed(2));
    thread.setAttribute("stroke-linecap", "round");
    thread.setAttribute("stroke-linejoin", "round");
    g.appendChild(thread);

    // One string a frame and no element made in the loop, which is the rule a
    // rebuilt path works under (`mounted.ts`, `Plate`). Every unbroken run of
    // near samples is its own subpath; where the winding goes round the back
    // the run simply stops.
    const step = (t: number): void => {
      const theta = t * SPIN;
      let d = "";
      let open = false;
      for (const q of PINS) {
        const f = facet(q, theta);
        if (!f.near) {
          open = false;
          continue;
        }
        const x = (f.x * reach).toFixed(2);
        const y = (f.y * reach).toFixed(2);
        d += open ? `L${x} ${y}` : `M${x} ${y}`;
        open = true;
      }
      thread.setAttribute("d", d);
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
