import { SVG } from "../skins/types.js";
import type { Hit } from "./types.js";

/**
 * A glow building over the beats before the hit, snapping off the instant it
 * lands.
 *
 * The owner's *Telegraphing*, and the one value on this axis that draws in the
 * window where nothing has happened yet. That is exactly why it is on this
 * axis rather than on GLOW: a building glow is not a state the body is in, it
 * is the announcement of a hit that has not landed, and it needs the same
 * trigger the hit does.
 *
 * **The snap is the whole thing.** It ramps up and then goes to nothing in one
 * frame, because a ring that eased back down would read as a body relaxing,
 * and what a telegraph promises is that it is not going to. `HitMoment.wind`
 * is written to reach 1 and immediately be 0 for this reason, so nothing here
 * has to arrange it.
 */
const NEAR = 1.1;
const SWELL = 0.22;

export const TELEGRAPH: Hit<"telegraph"> = {
  id: "telegraph",
  label: "TELEGRAPH",
  hint: "a ring tightening in over the beat before the hit, gone the instant it lands",
  phase: "before",
  spread: NEAR + SWELL - 1 + 0.08,
  build(ctx) {
    const ring = document.createElementNS(SVG, "ellipse");
    ring.setAttribute("cx", String(ctx.centre.x));
    ring.setAttribute("cy", String(ctx.centre.y));
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", ctx.colour);
    ring.setAttribute("stroke-dasharray", `${ctx.weight * 3} ${ctx.weight * 2.2}`);
    ctx.body.appendChild(ring);

    const rx = (ctx.extent.w / 2) * NEAR;
    const ry = (ctx.extent.h / 2) * NEAR;

    ctx.onFrame(({ hit }) => {
      const w = hit.wind;
      // Closes *in* rather than spreading out: an indicator that arrives at
      // the body reads as something coming for it, and one that leaves reads
      // as something already spent. The dashed ring is the source's own
      // choice — `docs/tower-defence.md` reads it off the arena frame, where
      // the danger circle is never filled, so what it warns about stays
      // visible underneath.
      const grow = 1 + SWELL * (1 - w);
      ring.setAttribute("rx", (rx * grow).toFixed(2));
      ring.setAttribute("ry", (ry * grow).toFixed(2));
      ring.setAttribute("stroke-width", (ctx.weight * (0.8 + w * 1.4)).toFixed(2));
      ring.setAttribute("stroke-opacity", (w * w * 0.9).toFixed(3));
    });
  },
};
