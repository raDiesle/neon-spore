import { SVG } from "../skins/types.js";
import type { Glow } from "./types.js";

/**
 * A soft luminous outline standing off the contour.
 *
 * The owner's *Outer Glow*, renamed: the axis is called GLOW and an axis may
 * not be named after one of its own members. In a browser this is what a
 * `box-shadow` or a `drop-shadow` filter does, and here it is the thing those
 * are shorthand for — one blurred copy of the shape, behind the shape.
 *
 * It is the honest opposite number to BLOOM and the two are worth ticking
 * together once to see the difference: BLOOM is several hard strokes that read
 * as light *spilling*, HALO is one genuinely soft edge that reads as light
 * *sitting*. Which of those a phone shows at 26 px is the question.
 *
 * ## The filter region is not a detail
 *
 * An SVG filter's default region is the object's box grown by ten per cent,
 * which is smaller than the blur it is being asked to hold. Left alone it
 * crops the halo into a rectangle — a square-edged glow that reads as a bug in
 * the shape rather than as a region that is too small, which is the same
 * failure the frame fit has and the reason `spread` below is generous.
 */
const BLUR = 0.075;
const REGION = "-70%";
const REGION_SIZE = "240%";

export const HALO: Glow<"halo"> = {
  id: "halo",
  label: "HALO",
  hint: "one genuinely soft outline standing off the body — the drop-shadow glow, in SVG",
  layer: "under",
  spread: 0.3,
  build(ctx) {
    const filter = document.createElementNS(SVG, "filter");
    filter.setAttribute("id", `${ctx.uid}-halo`);
    filter.setAttribute("x", REGION);
    filter.setAttribute("y", REGION);
    filter.setAttribute("width", REGION_SIZE);
    filter.setAttribute("height", REGION_SIZE);
    const blur = document.createElementNS(SVG, "feGaussianBlur");
    // `primitiveUnits` defaults to user space, so this is contour units — the
    // same units `ctx.weight` and `ctx.reach` are in, and the fit's scale is
    // applied above all of them.
    blur.setAttribute("stdDeviation", String(ctx.reach * BLUR));
    filter.appendChild(blur);
    ctx.defs.appendChild(filter);

    const soft = ctx.contourPath();
    soft.setAttribute("filter", `url(#${ctx.uid}-halo)`);
    soft.setAttribute("fill", ctx.colour);
    soft.setAttribute("fill-rule", "evenodd");
    soft.setAttribute("fill-opacity", "0.34");
    soft.setAttribute("stroke", ctx.colour);
    soft.setAttribute("stroke-opacity", "0.55");
    soft.setAttribute("stroke-width", String(ctx.weight * 2.5));
    ctx.body.appendChild(soft);
  },
};
