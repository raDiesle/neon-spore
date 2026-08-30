import { SVG } from "../skins/types.js";
import type { Hit } from "./types.js";

/**
 * A circle leaving the body and fading — the shockwave.
 *
 * The aftermath drawn as something that *travels*, which is the one thing
 * neither FLASH nor DIM can say. A flash tells you the body was hit; a ring
 * tells you the hit went somewhere, and on a field where two players are
 * reading columns that is the difference between a hit and a hit that reached
 * the neighbours.
 *
 * It thins as it grows rather than only fading, because a ring that keeps its
 * weight while expanding reads as a second body rather than as a wave. Drawn
 * over the skin: a shockwave passes in front of the thing that made it.
 */
const REACH = 1.9;

export const RING: Hit<"ring"> = {
  id: "ring",
  label: "RING",
  hint: "a shockwave leaving the body and thinning as it goes — the one aftermath that travels",
  phase: "after",
  spread: REACH - 1,
  build(ctx) {
    const ring = document.createElementNS(SVG, "ellipse");
    ring.setAttribute("cx", String(ctx.centre.x));
    ring.setAttribute("cy", String(ctx.centre.y));
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", ctx.colour);
    ring.setAttribute("stroke-opacity", "0");
    ctx.body.appendChild(ring);

    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;

    ctx.onFrame(({ hit }) => {
      const s = hit.shock;
      if (s <= 0) {
        ring.setAttribute("stroke-opacity", "0");
        return;
      }
      // `1 - s` runs 0 to 1 across the aftermath, so the wave leaves the body
      // as the shock decays. Eased out, because a shockwave is fastest when it
      // is born and nothing about a linear one reads as released.
      const p = 1 - s;
      const out = 1 + (REACH - 1) * Math.sqrt(p);
      ring.setAttribute("rx", (rx * out).toFixed(2));
      ring.setAttribute("ry", (ry * out).toFixed(2));
      ring.setAttribute("stroke-width", (ctx.weight * 2.2 * s).toFixed(2));
      ring.setAttribute("stroke-opacity", (s * 0.75).toFixed(3));
    });
  },
};
