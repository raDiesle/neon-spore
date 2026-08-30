import { SVG } from "../skins/types.js";
import type { Glow } from "./types.js";

/**
 * A ring standing clear of the body, pulsing.
 *
 * The owner named it by the thing everybody recognises: the circle under a
 * Brawler whose Super is charged. It is the one value on this axis that is not
 * about the body's *surface* at all — it does not follow the contour, it
 * stands off it as a plain ellipse, and that is the whole proposal. A ring
 * says "this one, now" in a way a brighter outline cannot, because a brighter
 * outline is still the same drawing.
 *
 * ## It pulses on the page's beat and never on its own clock
 *
 * `skins/types.ts` argues this at length and the argument is not repeated
 * here: `frame.beat` is built once per `requestAnimationFrame` and handed to
 * every figure, so thirty cards pulse together. Thirty private clocks read as
 * noise, and a heartbeat is only a heartbeat because the page does it at once.
 *
 * ## Nothing is allocated per frame
 *
 * One ellipse, built once, with four attributes mutated. Rule (d) in
 * `docs/skins.md`, and it is the rule this axis breaks most easily — the
 * obvious way to write a pulse is to hand the browser a new radius object
 * sixty times a second on thirty cards.
 */
/** Where the ring sits at its smallest, as a multiple of the body's half-extent. */
const NEAR = 1.16;
/** How much further out it reaches at the top of the beat. */
const SWELL = 0.14;

export const AURA: Glow<"aura"> = {
  id: "aura",
  label: "AURA",
  hint: "a ring standing clear of the body, pulsing on the page's beat — the charged-Super circle",
  layer: "under",
  spread: NEAR + SWELL - 1 + 0.08,
  build(ctx) {
    const ring = document.createElementNS(SVG, "ellipse");
    ring.setAttribute("cx", String(ctx.centre.x));
    ring.setAttribute("cy", String(ctx.centre.y));
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", ctx.colour);
    ring.setAttribute("stroke-width", String(ctx.weight * 1.4));
    ctx.body.appendChild(ring);

    const rx = (ctx.extent.w / 2) * NEAR;
    const ry = (ctx.extent.h / 2) * NEAR;

    ctx.onFrame(({ beat }) => {
      // A slow swell out and a quicker settle back, rather than a sine: a ring
      // that arrives faster than it leaves reads as charged, and one that does
      // both at the same rate reads as breathing, which the body already does.
      const p = beat < 0.35 ? beat / 0.35 : 1 - (beat - 0.35) / 0.65;
      const grow = 1 + SWELL * p;
      ring.setAttribute("rx", (rx * grow).toFixed(2));
      ring.setAttribute("ry", (ry * grow).toFixed(2));
      ring.setAttribute("stroke-opacity", (0.16 + 0.42 * p).toFixed(3));
    });
  },
};
