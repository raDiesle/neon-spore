import { facet, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { SVG } from "../skins/types.js";
import { at, disc, inside, sacs } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * LATTICE — a rigid frame inside a soft body.
 *
 * It was `creature:slick` / `lattice`, and the owner sent it here on
 * 9 September 2026 with the other three offered to that body.
 *
 * ROE and GUT both say the body is wet all the way through. This says it is
 * not: there is a skeleton in there, six struts meeting at a hub, and the
 * membrane is stretched over it. It is the value on the row that changes what
 * the creature *is* rather than what it contains — a seed pod rather than an
 * animal — and it is here because a set of answers that all agree about the
 * material is one answer offered several times.
 *
 * **Straight lines are what a lattice is, and they are the risk.** Everything
 * else in this game is a closed contour with lobes; a set of chords is the one
 * shape that could read as a different game. That is the thing to look at.
 *
 * **Placed, not posed.** Each vertex is a pin and each strut is drawn between
 * two facets, so a strut going round the back shortens and disappears at the
 * limb rather than shrinking uniformly. A strut with one end behind the body is
 * drawn to the hub instead of to its partner — half a chord is a line stopping
 * in mid-air, and the hub is where it would have gone.
 */

const SPOKES = 6;
/** How far out the vertices sit, and how thick a strut is, against the reach. */
const RIB = 0.24;
const SPIN = 0.4;
const DIM = 0.38;
const REACH = 0.54;

/** Alternating high and low, so the frame is a solid rather than a wheel: a
 * ring at one latitude is the shape `surface.ts` says folds to a line. */
const PINS: Pin[] = Array.from({ length: SPOKES }, (_, i) =>
  pin((i / SPOKES) * Math.PI * 2, i % 2 === 0 ? 0.6 : -0.6, 1),
);

export const LATTICE: Filling<"lattice"> = {
  id: "lattice",
  label: "LATTICE",
  hint: "six struts meeting at a hub in each sac — a skeleton, where every other value here is wet",
  build(ctx: FillingContext) {
    const g = inside(ctx, "lattice");
    const reach = (ctx.extent.h / 2) * REACH;
    const width = Math.max(0.3, reach * RIB * 0.45);

    const sides = sacs(ctx).map((cx, side) => {
      const sac = at(cx);
      const struts: SVGLineElement[] = [];
      const knots: SVGGElement[] = [];
      for (let i = 0; i < SPOKES; i++) {
        const l = document.createElementNS(SVG, "line");
        l.setAttribute("stroke", ctx.colour);
        l.setAttribute("stroke-width", width.toFixed(2));
        l.setAttribute("stroke-linecap", "round");
        sac.appendChild(l);
        struts.push(l);
      }
      for (let i = 0; i < SPOKES; i++) {
        const k = disc(reach * RIB * 0.5, ctx.colour, 0.7);
        sac.appendChild(k);
        knots.push(k);
      }
      // The hub, over the struts that meet at it and never moving: it is the
      // middle of the frame, which is the one point a turn does not touch.
      sac.appendChild(disc(reach * RIB * 0.7, ctx.colour, 0.85));
      g.appendChild(sac);
      return { struts, knots, offset: side === 0 ? 0 : Math.PI };
    });

    const step = (t: number): void => {
      for (const s of sides) {
        const seen = PINS.map((q) => facet(q, t * SPIN + s.offset));
        for (let i = 0; i < SPOKES; i++) {
          const a = seen[i];
          const b = seen[(i + 1) % SPOKES];
          const strut = s.struts[i];
          const knot = s.knots[i];
          if (!a || !b || !strut || !knot) continue;
          strut.setAttribute("x1", (a.x * reach).toFixed(2));
          strut.setAttribute("y1", (a.y * reach).toFixed(2));
          strut.setAttribute("x2", (a.near && b.near ? b.x * reach : 0).toFixed(2));
          strut.setAttribute("y2", (a.near && b.near ? b.y * reach : 0).toFixed(2));
          strut.setAttribute("stroke-opacity", surfaceDim(DIM, (a.lit + b.lit) / 2).toFixed(3));
          if (a.near) {
            knot.removeAttribute("display");
            knot.setAttribute(
              "transform",
              `translate(${(a.x * reach).toFixed(2)} ${(a.y * reach).toFixed(2)})`,
            );
            knot.setAttribute("opacity", surfaceDim(DIM, a.lit).toFixed(3));
          } else knot.setAttribute("display", "none");
        }
      }
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
