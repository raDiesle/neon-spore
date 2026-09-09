import { facet, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { SVG } from "../skins/types.js";
import { at, disc, inside, sacs } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * BLOOM — a nucleus that sends something out along its veins.
 *
 * **This is the game.** `packages/render/src/body-bloom.ts` is what a slick
 * wears on the field, taken there on 9 September 2026 out of the same set of
 * five the rest of this axis came from, and it is on the row as a **control**
 * for `spores.ts`'s reason.
 *
 * Nine veins run out from a core in each sac, and a bright travels along them,
 * out from the middle and away, over and over. The other four answers offered
 * to that body were all *structure* — what it is made of and how it is put
 * together — and this one is **state**, which is why it is the one that
 * shipped: a slick stops being an object and starts being a thing that is
 * doing something.
 *
 * **The travelling light is a share of the vein's own length**, so it
 * foreshortens with the vein: a vein pointing away is short, and the bright on
 * it moves a short distance. That is what keeps it from reading as a marquee.
 *
 * **What it risks, and the row is the place to weigh it.** A creature that
 * pulses is a creature that looks shootable at a particular moment. Everything
 * else that flashes in this game is a cue, and a body flickering for no reason
 * is a pair waiting for a window that does not exist.
 */

const VEINS = 9;
/** How long the travelling bright is, as a share of a vein, and how fast it
 * goes — in shares of a vein per second of the page clock. */
const BEAD = 0.3;
const RATE = 1.1;
const SPIN = 0.35;
const DIM = 0.24;
const REACH = 0.56;
/** How thick a vein is against the reach, and how much brighter the bead is. */
const VEIN = 0.1;
const BEAD_LIFT = 0.9;

const PINS: Pin[] = Array.from({ length: VEINS }, (_, i) =>
  pin(i * 2.39, ((i / (VEINS - 1)) * 2 - 1) * 0.75, 1),
);

interface Sac {
  readonly veins: SVGPathElement;
  readonly beads: SVGPathElement;
  readonly offset: number;
}

function ray(colour: string, width: number, alpha: number): SVGPathElement {
  const p = document.createElementNS(SVG, "path");
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", colour);
  p.setAttribute("stroke-opacity", alpha.toFixed(3));
  p.setAttribute("stroke-width", Math.max(0.3, width).toFixed(2));
  p.setAttribute("stroke-linecap", "round");
  return p;
}

export const BLOOM: Filling<"bloom"> = {
  id: "bloom",
  label: "BLOOM",
  shipped: "THE SLICK's interior — `packages/render/src/body-bloom.ts`",
  hint: "a core in each sac with nine veins, and a bright running out along them over and over",
  build(ctx: FillingContext) {
    const g = inside(ctx, "bloom");
    const reach = (ctx.extent.h / 2) * REACH;
    const width = reach * VEIN;

    const parts: Sac[] = sacs(ctx).map((cx, side) => {
      const sac = at(cx);
      // Two paths a sac rather than two per vein: every vein is one weight and
      // one colour, so the whole fan is a stroke — `eye-iris.ts`'s argument
      // about six spokes, which is why this was cheap enough to ship.
      const veins = ray(ctx.colour, width, 0.45);
      const beads = ray(ctx.colour, width, BEAD_LIFT);
      sac.appendChild(veins);
      sac.appendChild(beads);
      sac.appendChild(disc(reach * 0.16, ctx.colour, 0.9));
      g.appendChild(sac);
      return { veins, beads, offset: side === 0 ? 0 : 1 };
    });

    const step = (t: number): void => {
      for (const s of parts) {
        let fan = "";
        let bright = "";
        for (let i = 0; i < VEINS; i++) {
          const q = PINS[i];
          if (!q) continue;
          const f = facet(q, t * SPIN + s.offset);
          if (!f.near) continue;
          const tipX = f.x * reach;
          const tipY = f.y * reach;
          fan += `M0 0L${tipX.toFixed(2)} ${tipY.toFixed(2)}`;
          // Each vein on its own offset, so the body flickers rather than
          // beating as one lamp.
          const to = (t * RATE + i * 0.19) % 1;
          const from = Math.max(0, to - BEAD);
          bright += `M${(tipX * from).toFixed(2)} ${(tipY * from).toFixed(2)}L${(tipX * to).toFixed(2)} ${(tipY * to).toFixed(2)}`;
        }
        s.veins.setAttribute("d", fan);
        s.beads.setAttribute("d", bright);
        // One dimming for the whole fan: the veins are a mechanism rather than
        // a population, and the alternative is nine strokes a sac.
        s.veins.setAttribute("stroke-opacity", surfaceDim(DIM, 0.6).toFixed(3));
      }
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
