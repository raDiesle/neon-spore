import { LAT_LIMIT } from "@neon-spore/content";
import { at, disc, GYRE_TURN, inside, nucleus, organelle, place, turning } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * YOLK — nine granules suspended in a lit mass, carried round by the turn, and
 * a pale nucleus that does not move.
 *
 * It is what THE GYRE's organelle was on the field from 9 September 2026,
 * when the owner took it out of VERSUS, until 11 September, when he took ORBIT
 * in its place — and said he liked the current one as well and wanted it kept
 * on this page *to create new upcoming enemies with this inside effect*. So it
 * is here, beside the three answers offered against it, as an interior to
 * build from.
 *
 * ## What it says
 *
 * That an inside is a *population*: loose things in a fluid, none of them
 * important, all of them going round together at the rate the body is truly
 * turning. Each is pinned to a longitude and a latitude, spread by the golden
 * angle so no two share a meridian, foreshortened by its own tangent plane and
 * dimmed toward the terminator — but generously, because the mass is lit from
 * inside too and a granule that went black would read as a hole. The ones at
 * the back come into view as the ones at the front go away, which is the
 * reveal no pose can produce.
 *
 * The nucleus is the one hard edge, and the one thing that stays put.
 *
 * ## Against the other three
 *
 * ORBIT makes the contents one continuous ring; HELIX makes them one strand
 * that creeps; VORTEX makes the middle a hole. This is the quietest of the
 * four and the one the eye lands on last, which for a body that is not meant
 * to be looked at may be the point.
 */

const GRAINS = 9;
const REACH = 0.58;
const GRAIN = 0.16;
/** What a granule keeps in full shadow. Generous, for the reason above. */
const FLOOR = 0.42;
const NUCLEUS = 0.19;

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

export const YOLK: Filling<"yolk"> = {
  id: "yolk",
  label: "YOLK",
  hint: "nine granules suspended in the mass and carried round by the turn — the ones at the back coming into view — round a pale nucleus that stays put",
  build(ctx: FillingContext) {
    const g = inside(ctx, "yolk");
    const r = organelle(ctx);
    const reach = r * REACH;
    const body = at(ctx.centre.x, ctx.centre.y);
    g.appendChild(body);
    const marks = Array.from({ length: GRAINS }, (_, i) => {
      const lat = Math.sin(i * 1.9) * LAT_LIMIT * 0.66;
      const el = disc(r * GRAIN * Math.cos(lat), ctx.colour, 0.55);
      body.appendChild(el);
      return place(el, i * GOLDEN, lat, reach, FLOOR);
    });
    turning(ctx, GYRE_TURN, [{ marks, offset: 0 }]);
    body.appendChild(nucleus(ctx, r, NUCLEUS));
  },
};
