import { SVG } from "../skins/types.js";
import type { Tail } from "./types.js";

/**
 * A soft plume widening away above the body.
 *
 * The only value on the axis that gets **wider** as it goes, and that is the
 * whole proposal. Every other tail here narrows away — the shipped wedge, the
 * ribbon, the streak — because they are all drawing the *path* a thing took. A
 * plume is not a path, it is what the path did to the air, and it spreads.
 *
 * The reason to try it on this bestiary is that a slick and a bulb are wet
 * things. A hard tapering streak says metal or fire; a plume that swells and
 * dissipates says something is leaking, which for a body made of lobes and
 * membrane may be the more honest reading.
 *
 * Three overlapping ellipses rather than one shape, stepped up and out and
 * fainter each time. It is the cheapest way to a soft edge without a filter,
 * and a filter is the thing to avoid: `glows/halo.ts` uses one and it is the
 * most expensive value on the page.
 */
const PUFFS = 3;
const REACH = 1.8;

export const SMOKE: Tail<"smoke"> = {
  id: "smoke",
  label: "SMOKE",
  hint: "a plume that widens and dissipates — the only tail here that spreads instead of tapering",
  reachUp: REACH,
  build(ctx) {
    const grad = document.createElementNS(SVG, "radialGradient");
    grad.setAttribute("id", `${ctx.uid}-smoke`);
    for (const [offset, alpha] of [
      ["0%", "0.34"],
      ["55%", "0.16"],
      ["100%", "0"],
    ] as const) {
      const s = document.createElementNS(SVG, "stop");
      s.setAttribute("offset", offset);
      s.setAttribute("stop-color", ctx.colour);
      s.setAttribute("stop-opacity", alpha);
      grad.appendChild(s);
    }
    ctx.defs.appendChild(grad);

    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    const puffs: SVGEllipseElement[] = [];
    for (let k = 1; k <= PUFFS; k++) {
      const e = document.createElementNS(SVG, "ellipse");
      const up = (k / PUFFS) * REACH * 2;
      e.setAttribute("cx", String(ctx.centre.x));
      e.setAttribute("cy", (ctx.centre.y - ry * up).toFixed(2));
      e.setAttribute("rx", (rx * (0.55 + k * 0.3)).toFixed(2));
      e.setAttribute("ry", (ry * (0.5 + k * 0.22)).toFixed(2));
      e.setAttribute("fill", `url(#${ctx.uid}-smoke)`);
      e.setAttribute("opacity", (1 - k / (PUFFS + 1)).toFixed(3));
      ctx.body.appendChild(e);
      puffs.push(e);
    }
    ctx.onFrame(({ t }) => {
      for (let k = 1; k <= PUFFS; k++) {
        const e = puffs[k - 1];
        if (!e) continue;
        // Each puff drifts at its own lag, so the column curls rather than
        // standing up like a chimney.
        e.setAttribute(
          "cx",
          (ctx.centre.x + Math.sin(t * 0.9 - k * 0.6) * rx * 0.3 * k).toFixed(2),
        );
      }
    });
  },
};
