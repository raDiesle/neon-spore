import { streamFor } from "../skins/seed.js";
import { SVG } from "../skins/types.js";
import type { Tail } from "./types.js";

/**
 * Sparks shed off the body and falling away behind it.
 *
 * The particle answer to the same question, and the one that says the body is
 * *losing* something on the way down rather than merely being followed by a
 * shape. That difference matters for this bestiary: a torch is burning and a
 * meteor is ablating, and neither of those is a ribbon.
 *
 * ## Not GLOW's SPARKS with a different direction
 *
 * SPARKS throws motes outward in every direction from a body standing still.
 * These are born at the body and go one way — up the screen, which is behind a
 * thing that is falling — and they **slow down** as they go, because a mote
 * left in the air is not being pushed. That reads as shedding; a mote at
 * constant speed reads as being fired.
 *
 * Seeded from the name, and nothing allocated per frame: fourteen circles and
 * three arrays built once.
 */
const MOTES = 14;
const REACH = 2.1;

export const EMBERS: Tail<"embers"> = {
  id: "embers",
  label: "EMBERS",
  hint: "sparks shed off the body and left behind — a thing burning down, not a thing followed",
  reachUp: REACH,
  build(ctx) {
    const rand = streamFor(ctx.name);
    const dots: SVGCircleElement[] = [];
    const drift: number[] = [];
    const rate: number[] = [];
    const phase: number[] = [];
    for (let i = 0; i < MOTES; i++) {
      const c = document.createElementNS(SVG, "circle");
      c.setAttribute("fill", ctx.colour);
      c.setAttribute("r", (ctx.weight * (0.5 + rand() * 0.9)).toFixed(2));
      ctx.body.appendChild(c);
      dots.push(c);
      // Where across the body it is shed from, and which way it then wanders.
      drift.push((rand() - 0.5) * 1.6);
      rate.push(0.5 + rand() * 0.55);
      phase.push(rand());
    }

    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;

    ctx.onFrame(({ t }) => {
      for (let i = 0; i < MOTES; i++) {
        const dot = dots[i];
        const d = drift[i];
        const r = rate[i];
        const p0 = phase[i];
        if (!dot || d === undefined || r === undefined || p0 === undefined) continue;
        const p = (t * r + p0) % 1;
        // `sqrt` rather than linear: fast off the body and slowing as it goes,
        // which is what being left behind looks like.
        const up = Math.sqrt(p);
        dot.setAttribute("cx", (ctx.centre.x + d * rx * (0.4 + up * 0.9)).toFixed(2));
        dot.setAttribute("cy", (ctx.centre.y - up * ry * REACH * 2).toFixed(2));
        dot.setAttribute("fill-opacity", ((1 - p) * 0.85).toFixed(3));
      }
    });
  },
};
