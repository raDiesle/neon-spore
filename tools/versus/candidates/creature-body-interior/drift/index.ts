import * as look from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * DRIFT — offered 27 September 2026, from the queue's "COUNTDOWN, BEATBOX and
 * THROB have no motion of their own". Every other body has one part on a
 * clock of its own — a slick's vein bead, a bulb's spores, a limpet's hooklets
 * — and these three, with a dart and a falling leech or limpet, have
 * `twoCores` for an interior: two dots at a fixed place. Here the two circle each other and
 * swell out of step, in the same place and at the same size, so the only
 * difference is that they are alive.
 *
 * Both rates are off the contour clock and on none of the terms that already
 * move a body: the contour's 0.9, 0.53 and 0.31, the smoke's 0.9, the spores'
 * 0.42 and the bloom's 1.1 — a core moving in step with its own outline reads
 * as the outline moving, which is nothing new.
 *
 * **It reaches a box and a dart and not the other two.** A count's socket and
 * a throb's far half are drawn over the middle of the body, and a frame of
 * each, shipped against this, is the same pixels. What moves those two is a
 * question for their own marks, and the queue has it.
 */
const ORBIT = 0.67;
const SWELL = 1.7;
/** How far each core stands off the pair's middle, across and down, in the
 * body's half-extents — the shipped pair is 0.12 across and never moves. */
const REACH_X = 0.12;
const REACH_Y = 0.1;
/** The shipped core's radius, and how much of it the swell adds or takes. */
const CORE = 0.07;
const BREATH = 0.22;

function driftingCores(ctx: CanvasRenderingContext2D, p: look.Interior): void {
  const a = p.t * ORBIT;
  const ox = Math.cos(a) * p.rx * REACH_X;
  const oy = Math.sin(a) * p.ry * REACH_Y;
  const cy = p.ry * 0.2;
  ctx.fillStyle = p.rim;
  for (const side of [1, -1]) {
    const swell = 1 + BREATH * Math.sin(p.t * SWELL + (side > 0 ? 0 : Math.PI));
    ctx.beginPath();
    ctx.arc(side * ox, cy + side * oy, p.ry * CORE * swell, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const INTERIOR_DRIFT: Variant = {
  slot: "creature:body-interior",
  name: "drift",
  sentence:
    "drift — the two cores inside a box and a dart circle each other slowly and swell out of step, where today they are two dots that never move",
  dir: "tools/versus/candidates/creature-body-interior/drift",
  patches: [
    patch({
      target: look.BODY_LOOK,
      reached: () => look.interiorFor("countdown"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "BODY_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: driftingCores },
    }),
  ],
};
