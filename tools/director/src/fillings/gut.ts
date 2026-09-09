import { facet, type Pin, pin } from "@neon-spore/content";
import { SVG } from "../skins/types.js";
import { inside, sacs } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * GUT — one tube, coiled, threaded through both sacs.
 *
 * It was `creature:slick` / `gut`, and the owner sent it here on 9 September
 * 2026 with the other three offered to that body.
 *
 * The shipped slick had two dots in it. This says the body is one animal rather
 * than two bags: a single tube runs from one sac into the other, and the pinch
 * at the waist is where it passes through. It is the opposite answer to ROE's —
 * ROE says *contents*, this says *anatomy* — and at twenty-six pixels the two
 * should be tellable apart instantly, which is the whole reason both are on the
 * row.
 *
 * **A path rebuilt each frame rather than a row of mounted discs**, and that is
 * the one place this differs from ROE and SEDIMENT beside it. A coil going
 * round the back has no single tangent plane, so it cannot be one element with
 * a transform on it; each sample is placed by `facet` and the run is **broken
 * at the limb**, so the far half is absent rather than drawn across the body.
 * That is `mounted.ts`'s `Plate` argument arrived at from the other side: a
 * string a frame, and no element made in the loop.
 *
 * A run of discs would read as beads, which is ROE's answer, and the two must
 * not converge.
 */

/** How many samples make the coil, and how thick it is against the sac's reach. */
const STEPS = 22;
const THICK = 0.28;
/** How many turns the coil makes through one sac, and how far it climbs while
 * it does. */
const TURNS = 2.4;
const CLIMB = 0.7;
const SPIN = 0.45;
const REACH = 0.56;

const PINS: Pin[] = Array.from({ length: STEPS }, (_, i) => {
  const s = i / (STEPS - 1);
  return pin(s * TURNS * Math.PI * 2, (s * 2 - 1) * CLIMB, 1);
});

/** The coil's `d` at one angle: every unbroken run of near samples as its own
 * subpath, and nothing at all where it has gone round the back. */
function coil(cx: number, reach: number, theta: number): string {
  let d = "";
  let open = false;
  for (const q of PINS) {
    const f = facet(q, theta);
    if (!f.near) {
      open = false;
      continue;
    }
    const x = (cx + f.x * reach).toFixed(2);
    const y = (f.y * reach).toFixed(2);
    d += open ? `L${x} ${y}` : `M${x} ${y}`;
    open = true;
  }
  return d;
}

export const GUT: Filling<"gut"> = {
  id: "gut",
  label: "GUT",
  hint: "one tube coiled through both sacs and across the waist — anatomy, where ROE is contents",
  build(ctx: FillingContext) {
    const g = inside(ctx, "gut");
    const reach = (ctx.extent.h / 2) * REACH;
    const width = Math.max(0.3, reach * THICK);
    const [left, right] = sacs(ctx);

    const tube = document.createElementNS(SVG, "path");
    tube.setAttribute("fill", "none");
    tube.setAttribute("stroke", ctx.colour);
    tube.setAttribute("stroke-opacity", "0.6");
    tube.setAttribute("stroke-width", width.toFixed(2));
    tube.setAttribute("stroke-linecap", "round");
    tube.setAttribute("stroke-linejoin", "round");
    g.appendChild(tube);

    // The one thing that makes it a single tube and not two coils: a short
    // segment across the waist, at the height the two coils meet. Drawn flat,
    // because the waist is the one part of a slick that is not a sac — so it is
    // a static element rather than part of the string rebuilt every frame.
    const waist = document.createElementNS(SVG, "line");
    waist.setAttribute("x1", left.toFixed(2));
    waist.setAttribute("y1", "0");
    waist.setAttribute("x2", right.toFixed(2));
    waist.setAttribute("y2", "0");
    waist.setAttribute("stroke", ctx.colour);
    waist.setAttribute("stroke-opacity", "0.45");
    waist.setAttribute("stroke-width", width.toFixed(2));
    waist.setAttribute("stroke-linecap", "round");
    g.appendChild(waist);

    const step = (t: number): void => {
      const a = t * SPIN;
      // Two turns apart, so the far half of one coil is never the far half of
      // the other and the body always has something to show.
      tube.setAttribute("d", coil(left, reach, a) + coil(right, reach, a + 2));
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
