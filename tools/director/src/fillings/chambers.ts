import { facet, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { SVG } from "../skins/types.js";
import { at, disc, inside } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * CHAMBERS — the lobes are rooms.
 *
 * It was `creature:bulb` / `chambers`, and the owner sent it here on
 * 9 September 2026 with the other three offered to that body.
 *
 * The bulb's contour carries six lobes deep enough to be counted, and its
 * interior never said anything about them: one dot in the middle, and the lobes
 * might as well have been a texture on the rim. This says they are the *shape
 * of the inside* — six chambers, each under its own lobe, each on a short neck
 * to a small hub. Look at the outline and you have already been told how many
 * there are.
 *
 * On the axis it is the value that argues the interior should **agree with the
 * silhouette**, which is a claim about any lobed body and not only about a
 * bulb. Try it on a body whose lobe count is not six and the claim is what
 * fails first.
 *
 * **Six longitudes tilted alternately above and below the equator.** A ring at
 * one latitude folds to a line when it turns — the shape `surface.ts` warns
 * about — and six rooms in a line is a comb.
 *
 * **`facet` per frame rather than `mount`/`spin`**, because a chamber and its
 * neck have to move together: a neck drawn from a fixed hub to a mark carried
 * by its own transform would stretch and snap. Two attributes on a line and one
 * on a group, and nothing allocated in the loop — `mounted.ts`'s rule, reached
 * by hand where its helper does not fit.
 */

const ROOMS = 6;
/** How big a chamber is, how far out it sits, and how thick its neck is. */
const ROOM = 0.3;
const REACH = 0.6;
const NECK = 0.09;
const SPIN = 0.4;
const DIM = 0.26;

const PINS: Pin[] = Array.from({ length: ROOMS }, (_, i) =>
  pin((i / ROOMS) * Math.PI * 2, i % 2 === 0 ? 0.35 : -0.35, 1),
);

export const CHAMBERS: Filling<"chambers"> = {
  id: "chambers",
  label: "CHAMBERS",
  hint: "six rooms on short necks to a hub, one under each lobe — the inside agreeing with the outline",
  build(ctx: FillingContext) {
    const g = inside(ctx, "chambers");
    const reach = Math.min(ctx.extent.w, ctx.extent.h) * 0.5 * REACH;
    const body = at(0);

    // The necks first, so a chamber sits over the one that reaches it.
    const necks = PINS.map(() => {
      const l = document.createElementNS(SVG, "line");
      l.setAttribute("x1", "0");
      l.setAttribute("y1", "0");
      l.setAttribute("stroke", ctx.colour);
      l.setAttribute("stroke-width", Math.max(0.3, reach * NECK).toFixed(2));
      l.setAttribute("stroke-linecap", "round");
      body.appendChild(l);
      return l;
    });
    const rooms = PINS.map((q) => {
      // Its own circle of latitude's radius, so a room near a pole is a
      // smaller thing on the ball and the transform only foreshortens it.
      const el = disc(reach * ROOM * q.cosLat, ctx.colour, 0.6);
      body.appendChild(el);
      return el;
    });
    // The hub, over everything and never moving — the one point a turn about
    // the body's own axis does not touch.
    body.appendChild(disc(reach * 0.18, ctx.colour, 0.75));
    g.appendChild(body);

    const step = (t: number): void => {
      for (let i = 0; i < ROOMS; i++) {
        const q = PINS[i];
        const line = necks[i];
        const room = rooms[i];
        if (!q || !line || !room) continue;
        const f = facet(q, t * SPIN);
        if (!f.near) {
          line.setAttribute("display", "none");
          room.setAttribute("display", "none");
          continue;
        }
        line.removeAttribute("display");
        room.removeAttribute("display");
        const x = f.x * reach;
        const y = f.y * reach;
        const lit = surfaceDim(DIM, f.lit);
        line.setAttribute("x2", x.toFixed(2));
        line.setAttribute("y2", y.toFixed(2));
        line.setAttribute("stroke-opacity", (lit * 0.6).toFixed(3));
        // `scale(sx, 1)` is the tangent plane's own map across: a chamber near
        // the limb is seen edge-on and is a sliver, not a smaller circle.
        room.setAttribute(
          "transform",
          `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${f.sx.toFixed(4)} 1)`,
        );
        room.setAttribute("opacity", lit.toFixed(3));
      }
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
