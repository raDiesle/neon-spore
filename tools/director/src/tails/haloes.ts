import { SVG } from "../skins/types.js";
import type { Tail } from "./types.js";

/**
 * A short string of fading halos above the body — **what every living body
 * wore until 8 September 2026.**
 *
 * `packages/render/src/creatures.ts`'s `drawMotionTrail`, redrawn here: two
 * halos at 0.85 and 0.73 of the body's radius, a quarter-tile apart going up,
 * each fainter than the last, and each slid sideways by a slow sine so the
 * string is not a ruler-straight column of circles.
 *
 * It was on the axis as a **control** and it is a proposal now: SMOKE beat it,
 * and what the renderer draws behind a falling body is a plume. It stays here
 * for CLAUDE.md's reason — a look that is taken out is kept where it can be
 * seen — and because the two arguments against it are exactly the sort some
 * later body might answer.
 *
 * They are these. It is very
 * short: two steps of a quarter tile is less than a body-height of tail, so at
 * speed it reads as a smear rather than as travel. And it is made of the same
 * `halo` sprite the body already wears, so it says *this thing glows* a second
 * time rather than saying *this thing is moving*.
 */
const STEPS = 2;

export const HALOES: Tail<"haloes"> = {
  id: "haloes",
  label: "HALOES",
  hint: "two fading halos strung above the body — what every living body wore until SMOKE",
  reachUp: 0.6,
  build(ctx) {
    const dots: SVGEllipseElement[] = [];
    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    for (let k = 1; k <= STEPS; k++) {
      const e = document.createElementNS(SVG, "ellipse");
      const shrink = 0.85 - k * 0.12;
      e.setAttribute("rx", (rx * shrink).toFixed(2));
      e.setAttribute("ry", (ry * shrink).toFixed(2));
      e.setAttribute("cy", (ctx.centre.y - k * ry * 0.52).toFixed(2));
      e.setAttribute("fill", ctx.colour);
      // `(1 - k/5) * 0.4 * 0.5` is the renderer's own alpha, kept exactly.
      e.setAttribute("fill-opacity", ((1 - k / 5) * 0.4 * 0.5).toFixed(3));
      ctx.body.appendChild(e);
      dots.push(e);
    }
    ctx.onFrame(({ t }) => {
      for (let k = 1; k <= STEPS; k++) {
        const e = dots[k - 1];
        if (!e) continue;
        // The renderer's sideways wander, at its own rate and scaled by k so
        // the far end swings wider than the near one.
        e.setAttribute("cx", (ctx.centre.x - Math.sin(t * 3 + k) * rx * 0.1 * k).toFixed(2));
      }
    });
  },
};
