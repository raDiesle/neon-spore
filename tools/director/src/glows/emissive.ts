import { SVG } from "../skins/types.js";
import type { Glow } from "./types.js";

/**
 * The body as a light source rather than as a lit thing.
 *
 * This is the best card on the axis and it is worth saying why, because the
 * picture is quiet: it is `corePass` run backwards, and the two of them on one
 * page is an argument the project has been having with itself in prose.
 *
 * `skins/parts.ts` says of its gradient that the outer stop "falls toward the
 * card's own dark and never toward the rim colour", and gives the reason —
 * a gradient that brightens the edge erodes the contrast the silhouette is
 * read by. That is `docs/alive.md`'s position and it is about a creature at
 * 26 px. EMISSIVE takes the other side, which is `docs/tower-defence.md`'s
 * reading of Neon Pulsefire: no shadow, no light source, a body lit by being
 * the thing that emits. Its outer stop stays *in* the rim colour and never
 * reaches the dark.
 *
 * Neither is right in general. What the page is for is finding out which one
 * is right for this body at this size, and until now only one of them could be
 * drawn.
 *
 * Under the skin and inside it: this changes the fill, so it reaches nowhere
 * past the contour and asks the fit for nothing.
 */
export const EMISSIVE: Glow<"emissive"> = {
  id: "emissive",
  label: "EMISSIVE",
  hint: "the body radiates instead of being lit — the fill stays in the rim colour to the edge",
  layer: "under",
  spread: 0,
  build(ctx) {
    const grad = document.createElementNS(SVG, "radialGradient");
    grad.setAttribute("id", `${ctx.uid}-emissive`);
    grad.setAttribute("r", "0.7");
    for (const [offset, alpha] of [
      ["0%", "0.58"],
      ["46%", "0.36"],
      ["100%", "0.18"],
    ] as const) {
      const s = document.createElementNS(SVG, "stop");
      s.setAttribute("offset", offset);
      s.setAttribute("stop-color", ctx.colour);
      s.setAttribute("stop-opacity", alpha);
      grad.appendChild(s);
    }
    ctx.defs.appendChild(grad);

    const glow = ctx.contourPath();
    glow.setAttribute("fill", `url(#${ctx.uid}-emissive)`);
    // `evenodd`, like every other fill in this catalogue: a mouth or a parted
    // body stays a hole rather than being flooded with light.
    glow.setAttribute("fill-rule", "evenodd");
    glow.setAttribute("stroke", "none");
    ctx.body.appendChild(glow);
  },
};
