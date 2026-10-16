import type { Body } from "./creature-body-in.js";
import { drawGlancedBody, drawGlancedLiving } from "./creature-glance.js";
import { livingBodyMul } from "./creature-place.js";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";
import { drawPodBody } from "./pods.js";

/**
 * THE SEEDER, drawn: the ordinary living body in its own colour, and **the
 * pod it will leave, glowing inside it** — the seed in the seed head.
 *
 * The creature's whole rule is cause and effect on one tile: shoot it, and the
 * pod is exactly where it was. So the pod is shown before the shot, in the
 * pod's own drawing, shell and core, so that the thing left hanging
 * is the thing the pair was already looking at rather than a surprise. Big
 * enough to read from across the field — half the body's width, with the
 * pod's halo round it (the owner, 9 October 2026: a look nobody can see is
 * not a look).
 *
 * Nothing is stored. The seed beats on the clock, so both phones draw the
 * same frame of it.
 */

/** How wide the seed is, against the body's radius: the whole pod, shell and
 * core, small enough that the burr's edge still shows round it. */
const SEED = 0.6;

export function drawSeederBody(b: Body): void {
  drawGlancedLiving(b);
  const { x, y, time } = b;
  const r = b.l.tile * 0.4 * livingBodyMul(b.c);
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
  halo(b.ctx, x, y, r * 1.4, PALETTE.pod, 0.18 + 0.1 * pulse);
  // The seed turns with the body it sits in, like anything on it.
  drawGlancedBody(b, { r, lit: true }, (ctx) => drawPodBody(ctx, x, y, r * SEED, time));
}
