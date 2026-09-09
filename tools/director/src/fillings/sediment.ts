import { pin } from "@neon-spore/content";
import type { Mounted } from "../skins/mounted.js";
import { SVG } from "../skins/types.js";
import { at, disc, inside, place, sacs, turning } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * SEDIMENT — something heavy has settled in the bottom of each sac.
 *
 * It was `creature:slick` / `sediment`, and the owner sent it here on
 * 9 September 2026 with the other three offered to that body.
 *
 * The other values on this axis fill the whole of a body. This one fills the
 * bottom of it and leaves the top clear, and that asymmetry is the whole idea:
 * a body with a **level** in it reads as a container of liquid, which is a
 * thing a player understands without being told, and it is the only value on
 * the row that says which way up the creature is.
 *
 * **The level is a chord, not a line across the body.** It is drawn as the
 * ellipse a circle of latitude projects to, so it foreshortens with the sac and
 * reads as the top of a volume rather than as a stripe painted on a surface.
 * That is the difference between a meniscus and a waterline sticker — and the
 * two numbers it needs, `k` across and `cy` down, are what a `Pin` already
 * holds, so it is the surface's own arithmetic rather than a second copy of it.
 *
 * **The grains do not move and the level does.** Sediment that jittered would
 * be a body in a shaker; a level that tilts a little is a body that is falling.
 * It is the smallest motion on the axis, on purpose.
 */

const GRAINS = 8;
/** Where the level sits, in radians of latitude, and how far it tilts. */
const LEVEL = -0.18;
const TILT = 0.1;
/** How fast it tilts, in radians per second of the page clock. */
const SLOSH = 0.8;
const GRAIN = 0.22;
const SPIN = 0.3;
const DIM = 0.32;
const REACH = 0.56;

/** Everything below the level, packed toward the floor rather than spread
 * evenly: a settled thing is denser at the bottom. */
const LAYOUT = Array.from({ length: GRAINS }, (_, i) => {
  const s = i / (GRAINS - 1);
  return { lon: i * 2.39, lat: LEVEL - 0.05 - s * s * 0.7 };
});

export const SEDIMENT: Filling<"sediment"> = {
  id: "sediment",
  label: "SEDIMENT",
  hint: "grains settled in the bottom of each sac under a level that tilts — the one value that says which way up the body is",
  build(ctx: FillingContext) {
    const g = inside(ctx, "sediment");
    const reach = (ctx.extent.h / 2) * REACH;
    const lips: SVGEllipseElement[] = [];
    const clusters = sacs(ctx).map((cx, side) => {
      const marks: Mounted[] = [];
      const sac = at(cx);
      for (const q of LAYOUT) {
        const el = disc(reach * GRAIN * Math.cos(q.lat), ctx.colour, 0.5);
        sac.appendChild(el);
        marks.push(place(el, q.lon, q.lat, reach, DIM));
      }
      const lip = document.createElementNS(SVG, "ellipse");
      lip.setAttribute("fill", "none");
      lip.setAttribute("stroke", ctx.colour);
      lip.setAttribute("stroke-opacity", "0.75");
      lip.setAttribute("stroke-width", Math.max(0.3, reach * 0.05).toFixed(2));
      sac.appendChild(lip);
      lips.push(lip);
      g.appendChild(sac);
      return { marks, offset: side === 0 ? 0 : Math.PI };
    });
    turning(ctx, SPIN, clusters);

    // The meniscus, on its own clock and not the surface's: the grains turn and
    // the level tilts, which are two different facts about a falling body.
    const level = (t: number): void => {
      const p = pin(0, LEVEL + Math.sin(t * SLOSH) * TILT, reach);
      for (const lip of lips) {
        lip.setAttribute("cy", p.cy.toFixed(2));
        lip.setAttribute("rx", Math.max(0.4, p.k).toFixed(2));
        lip.setAttribute("ry", Math.max(0.4, p.k * 0.26).toFixed(2));
      }
    };
    level(0);
    ctx.onFrame(({ t }) => level(t));
  },
};
