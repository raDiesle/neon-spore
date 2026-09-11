import { facet, KEY, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { stops } from "../skins/mounted.js";
import { SVG } from "../skins/types.js";
import { at, inside } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * HOLLOW — the body is a bell of glass, lit on the inside of its far wall,
 * with a heart hanging inside it.
 *
 * It was `creature:ghost` / `hollow` on VERSUS. The owner took SWARM for the
 * ghost on 10 September 2026 and asked for the others to come to the SHAPES
 * page; this is an interior — what a body *has in it* rather than what its
 * wall is — so it is a filling, beside the eight that came the same way.
 *
 * ## The inversion is the whole cue
 *
 * A lit solid is bright toward the light. A lit *hollow* is bright away from
 * it, because what is being looked at is the far inner wall, where the light
 * that came in through the near wall lands. So the far wall's gradient is
 * centred down and to the right, opposite `KEY`, and goes to the card's own
 * dark toward the upper left where the near wall shadows it. Three layers,
 * back to front: the wall's thickness, as a dark tint over the whole body that
 * is left showing as a ring round the far wall; the far wall itself, the
 * contour again at four fifths and dropped a little; and a thin band of the
 * body's colour along the upper-left edge, the near wall's outer face catching
 * the key — the one place on this body lit the way a solid would be.
 *
 * ## The heart
 *
 * A small hot core pinned inside the bell and carried round on the turn.
 * Unlike every other mark on this axis it is drawn on the **far half** too,
 * faint but never gone, because there is nothing opaque to hide it — the glass
 * is the argument, and a heart that vanished behind the middle would say the
 * body was solid after all.
 *
 * ## Where it can lose
 *
 * Two outlines where there was one. The far wall is a second contour at four
 * fifths, and on a small body it can read as a small one inside a big one. The
 * skin's own passes go over none of this — a filling is under the glows and
 * over the skin — so judge it with MEMBRANE, which puts the least between.
 */

/** The card's own dark, the one every gradient on the page falls toward. */
const DARK = "#07060F";

/** How much of the body's colour the glass carries, and how dark it is. A
 * wall the same dark as the inside it surrounds has no thickness to see. */
const GLASS_TINT = 0.16;
const GLASS_DARK = 0.5;

/** The far wall's size against the contour, and how far down it sits: the
 * inside of a dome seen from above its middle is lower than its rim. */
const WALL = 0.8;
const WALL_DROP = 0.08;

/** How far *away* from the key the far wall's light is centred, in bounding
 * box units, and how wide the lit patch is. */
const INNER_OFFSET = 0.22;
const INNER_REACH = 0.62;

/** The near wall's lit edge: width in line weights, and how far away from
 * the key the contour is shifted, as a share of the body's half-width. */
const EDGE_WIDTH = 2.2;
const EDGE_SHIFT = 0.07;

/** The heart: where it hangs, how fast it goes round (the ghost's own turn,
 * `GHOST_SPIN` in radians), what it keeps facing away from the key and what it
 * keeps when it is behind the middle. */
const HEART_PIN: Pin = pin(0, -0.1, 1);
const HEART_REACH = 0.42;
const SPIN = 0.11 * Math.PI * 2;
const HEART_DIM = 0.6;
const HEART_BEHIND = 0.45;
const HEART = 0.55;
const HEART_CORE = 0.16;

export const HOLLOW: Filling<"hollow"> = {
  id: "hollow",
  label: "HOLLOW",
  hint: "a bell of glass — lit on the inside of its far wall, away from the key, with a heart hanging inside that is seen through the body when it is behind",
  build(ctx: FillingContext) {
    const g = inside(ctx, "hollow");
    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    const reach = Math.min(rx, ry) * HEART_REACH;

    // The wall's thickness: the whole body in the glass's tint, dark first
    // and the colour over it, so the ring left round the far wall below is
    // the shell seen edge-on.
    for (const [colour, alpha] of [
      [DARK, GLASS_DARK],
      [ctx.colour, GLASS_TINT],
    ] as const) {
      const p = ctx.contourPath();
      p.setAttribute("fill", colour);
      p.setAttribute("fill-opacity", alpha.toFixed(3));
      p.setAttribute("stroke", "none");
      g.appendChild(p);
    }

    // The far wall, lit from where the light lands rather than from where it
    // comes: the gradient's focus sits opposite the key.
    const grad = document.createElementNS(SVG, "radialGradient");
    grad.setAttribute("id", `${ctx.uid}-hollow-wall`);
    grad.setAttribute("cx", (0.5 - KEY.x * INNER_OFFSET).toFixed(4));
    grad.setAttribute("cy", (0.5 - KEY.y * INNER_OFFSET).toFixed(4));
    grad.setAttribute("r", String(INNER_REACH));
    stops(grad, [
      [0, ctx.colour, 0.62],
      [0.5, ctx.colour, 0.16],
      [1, DARK, 0.75],
    ]);
    ctx.defs.appendChild(grad);
    const wall = ctx.contourPath();
    wall.setAttribute("fill", `url(#${ctx.uid}-hollow-wall)`);
    wall.setAttribute("stroke", "none");
    wall.setAttribute(
      "transform",
      `translate(${ctx.centre.x.toFixed(2)} ${(ctx.centre.y + WALL_DROP * ry).toFixed(2)}) scale(${WALL}) translate(${(-ctx.centre.x).toFixed(2)} ${(-ctx.centre.y).toFixed(2)})`,
    );
    g.appendChild(wall);

    // The near wall's outer face catching the key: the contour again, pushed
    // away from the light, so the shifted shape's key-side edge is the part
    // of the stroke left inside the clip.
    const edge = ctx.contourPath();
    edge.setAttribute("fill", "none");
    edge.setAttribute("stroke", ctx.colour);
    edge.setAttribute("stroke-opacity", "0.4");
    edge.setAttribute("stroke-width", (ctx.weight * EDGE_WIDTH).toFixed(3));
    edge.setAttribute(
      "transform",
      `translate(${(-KEY.x * EDGE_SHIFT * rx).toFixed(2)} ${(-KEY.y * EDGE_SHIFT * ry).toFixed(2)})`,
    );
    g.appendChild(edge);

    // The heart, hanging inside and going round — on the far half too, which
    // is what a glass bell is for.
    const body = at(ctx.centre.x, ctx.centre.y);
    const soft = document.createElementNS(SVG, "radialGradient");
    soft.setAttribute("id", `${ctx.uid}-hollow-heart`);
    stops(soft, [
      [0, ctx.colour, 0.85],
      [0.4, ctx.colour, 0.4],
      [1, ctx.colour, 0],
    ]);
    ctx.defs.appendChild(soft);
    const glow = document.createElementNS(SVG, "circle");
    glow.setAttribute("r", (reach * HEART).toFixed(2));
    glow.setAttribute("fill", `url(#${ctx.uid}-hollow-heart)`);
    const core = document.createElementNS(SVG, "circle");
    core.setAttribute("r", (reach * HEART_CORE).toFixed(2));
    core.setAttribute("fill", "#FFFFFF");
    core.setAttribute("fill-opacity", "0.9");
    body.appendChild(glow);
    body.appendChild(core);
    g.appendChild(body);

    const step = (t: number): void => {
      const f = facet(HEART_PIN, t * SPIN);
      const strength = f.near ? surfaceDim(HEART_DIM, f.lit) : HEART_BEHIND;
      const place = `translate(${(f.x * reach).toFixed(2)} ${(f.y * reach).toFixed(2)}) scale(${Math.max(0.1, Math.abs(f.sx)).toFixed(4)} 1)`;
      glow.setAttribute("transform", place);
      core.setAttribute("transform", place);
      glow.setAttribute("opacity", strength.toFixed(3));
      core.setAttribute("opacity", strength.toFixed(3));
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
