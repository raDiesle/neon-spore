import { SVG } from "../skins/types.js";
import type { Tail } from "./types.js";

/**
 * Eight cooling embers hanging back down the line the body came along, each
 * smaller and dimmer than the one in front and the gaps opening as they go —
 * a body you can read the heading of from one still frame.
 *
 * It was `creature:dart` / `wake` on VERSUS — the flame kept, and this behind
 * it — and the owner took SHOCK instead on 10 September 2026 and asked for it
 * to be kept on the SHAPES page. CINDERS rather than WAKE because that name
 * is taken here by an earlier dart candidate, the rungs; and the two are
 * different claims. WAKE marks where the body *was* with bars across the
 * track; this marks it with what the body *shed*, in a line down the track.
 *
 * ## Not EMBERS, either
 *
 * EMBERS are motes in flight, born at the body and slowing as they go, on a
 * seeded scatter. These hold still. They are placed off the body's position
 * and heading and nothing else, so in the game nothing remembered a previous
 * frame and a body restarted had no tail to clear — CLAUDE.md's rule about
 * anything in render that outlives a frame. Widening rather than even: a
 * trail that thins reads as one being left, and an evenly spaced one reads as
 * a drawn line.
 *
 * ## Where it can lose
 *
 * The lane fills up. A dart's run crosses most of the field, a wave may send
 * several, and eight marks each is a lot of light in lanes a pair also has to
 * read a colour out of. If the trails start reading as a body, or as the beam
 * THE LANCE leaves, the creature has borrowed a word that is already taken.
 */
const EMBERS = 8;
/** How far back the last ember sits, in body heights, and how the spacing
 * opens as it goes. */
const REACH = 2.1;
const SPREAD = 1.5;
/** How big the nearest ember is as a share of the body's half-width, and what
 * is left of that at the far end. */
const SIZE = 0.3;
const SIZE_END = 0.08;

function dot(cx: number, cy: number, r: number, colour: string, alpha: number): SVGCircleElement {
  const c = document.createElementNS(SVG, "circle");
  c.setAttribute("cx", cx.toFixed(2));
  c.setAttribute("cy", cy.toFixed(2));
  c.setAttribute("r", r.toFixed(2));
  c.setAttribute("fill", colour);
  c.setAttribute("fill-opacity", alpha.toFixed(3));
  return c;
}

export const CINDERS: Tail<"cinders"> = {
  id: "cinders",
  label: "CINDERS",
  hint: "eight cooling embers in a line down the track it came along, thinning and spreading as they go — a heading read off one frame",
  reachUp: REACH,
  build(ctx) {
    // Sizes off the smaller radius: the body behind a trail is round in the
    // game, and a slick here is twice as wide as it is tall.
    const rx = Math.min(ctx.extent.w, ctx.extent.h) / 2;
    const ry = ctx.extent.h / 2;
    for (let i = 0; i < EMBERS; i++) {
      const t = (i + 1) / EMBERS;
      const y = ctx.centre.y - ry * 2 * REACH * t ** SPREAD;
      const fade = (1 - t) ** 1.6;
      const r = rx * (SIZE + (SIZE_END - SIZE) * t);
      // A soft halo under a firmer centre — the two lights `halo` draws in the
      // game, without importing it.
      ctx.body.appendChild(dot(ctx.centre.x, y, r * 2.2, ctx.colour, 0.08 + 0.16 * fade));
      ctx.body.appendChild(dot(ctx.centre.x, y, r, ctx.colour, 0.2 + 0.55 * fade));
    }
  },
};
