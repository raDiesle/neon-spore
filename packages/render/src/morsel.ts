import { POD } from "@neon-spore/content";
import { morselIsLimp } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { drawLivingBody } from "./creature-body-living.js";
import { drawGlancedBody, drawGlancedLiving } from "./creature-glance.js";
import { livingBodyMul } from "./creature-place.js";
import type { Wash } from "./creature-tint.js";
import { halo } from "./glow.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";
import { drawPodCore } from "./pods.js";

/**
 * THE MORSEL, drawn: whole, it is the ordinary living body in its own colour;
 * **limp, it is a cargo**, and the picture has to say so from across the
 * field, because the answer has just moved from the trigger to the maw.
 *
 * Three things change at once and each is big enough to read on its own
 * (the owner, 9 October 2026: a look nobody can see is not a look):
 *
 * - **the colour drains to the pod's amber** — the colour every other thing
 *   the maw wants already wears, so the pilot reads *open* off it without
 *   learning a new word;
 * - **the body sags**: wider and flatter, wobbling slowly like a jelly set
 *   down, where the whole one held itself round;
 * - **the cargo's mark comes up inside it**, the same core a pod carries, and
 *   the pod's halo round it.
 *
 * Nothing is stored. `morselIsLimp` is the one fact, and the slack and the
 * wobble come off the clock, so both phones draw the same frame of it.
 */

/** The amber a limp body is washed to: nearly all of it, so the old colour
 * shows only as a tinge — a red one and a cyan one are both cargo now. */
const LIMP_WASH: Wash = {
  rim: PALETTE.podRim,
  hex: PALETTE.pod,
  // Warmer than a pod's own dark: a pod is a small bright shell, and a
  // body this size filled with that brown read as a rock, not a cargo.
  dark: mixHex(PALETTE.podDark, PALETTE.pod, 0.4),
  amount: 0.85,
};

/** How much wider than tall it has gone, at rest and at the wobble's top. */
const SAG = 0.2;
const WOBBLE = 0.06;

/** The pod's own normalisation, so `drawPodCore` — in `POD`'s units — fits. */
const POD_NORM = Math.max(POD.rx, POD.ry);

export function drawMorselBody(b: Body): void {
  if (!morselIsLimp(b.c)) {
    drawGlancedLiving(b);
    return;
  }
  const { x, y, time } = b;
  const r = b.l.tile * 0.4 * livingBodyMul(b.c);
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
  halo(b.ctx, x, y, r * 2.8, PALETTE.pod, 0.26 + 0.12 * pulse);
  drawGlancedBody(b, { r, lit: true }, (ctx) => {
    const w = Math.sin(time * 1.7 + b.c.id);
    const sx = 1 + SAG + WOBBLE * w;
    const sy = 1 / (1 + SAG) - WOBBLE * w;
    ctx.save();
    // Squashed about its bottom edge rather than its middle, so it slumps
    // onto what is under it instead of shrinking into the air.
    ctx.translate(x, y + r);
    ctx.scale(sx, sy);
    ctx.translate(-x, -y - r);
    drawLivingBody({ ...b, ctx }, 1, undefined, LIMP_WASH);
    ctx.restore();
    ctx.save();
    ctx.translate(x, y + r * (1 - sy));
    ctx.scale((r * 0.9) / POD_NORM, (r * 0.9) / POD_NORM);
    drawPodCore(ctx, 0.7 + 0.3 * pulse);
    ctx.restore();
  });
}
