import { fillPass } from "../skins/parts.js";
import type { Hit } from "./types.js";

/**
 * The body simply goes dark for a beat.
 *
 * **This is the control, and it is the point of the axis.** LINE is what every
 * skin is judged against and NONE is what every glow is judged against; this
 * is that, for hits. It is the cheapest possible way to say *that was hit*,
 * it costs one fill, and every other value here has to beat it by looking
 * better rather than by being more elaborate.
 *
 * If none of them does, the honest finding is that a hit does not need juice
 * — which is a real result about this game and not a failed experiment. Say it
 * in those words if that is how it comes out.
 */
export const DIM: Hit<"dim"> = {
  id: "dim",
  label: "DIM",
  hint: "the body just darkens for a beat — the control every other value here has to beat",
  phase: "impact",
  spread: 0,
  build(ctx) {
    const shade = fillPass(ctx);
    shade.setAttribute("fill", "#07060F");
    shade.setAttribute("fill-opacity", "0");
    // The fill alone was not enough, and the reason is worth keeping: it
    // covers the body's *interior* and a stroke sits on the contour itself, so
    // the one bright thing on the card — the rim every silhouette is read by —
    // survived the darkening untouched. Beside NONE the two were the same
    // picture. So the shade wears the outline as well, at a weight that
    // covers the rim rather than merely sitting inside it.
    shade.setAttribute("stroke", "#07060F");
    shade.setAttribute("stroke-width", String(ctx.weight * 1.8));
    shade.setAttribute("stroke-opacity", "0");
    ctx.onFrame(({ hit }) => {
      const s = hit.shock;
      shade.setAttribute("fill-opacity", (s * 0.85).toFixed(3));
      shade.setAttribute("stroke-opacity", (s * 0.85).toFixed(3));
    });
  },
};
