import { PALETTE, STROKE } from "@neon-spore/render";
import type { Holder, HolderContext, HolderFrame } from "./types.js";

/**
 * THE COLLAR — the reference picture's own answer, turned on its side.
 *
 * The owner's image is a sphere sitting in a shallow bowl with a rim around
 * its equator: the thing is *seated*, and the rim is what says so. Turned
 * ninety degrees it becomes a socket on the queen's flank that the rock beds
 * into sideways, half of it in her and half of it out in the field.
 *
 * **The rim is two arcs, not one ellipse, and that is the whole draft.** The
 * far half passes behind the rock and the near half in front of it. A single
 * ellipse stroked over the top reads as a ring painted on a rock; the rock
 * interrupting the line is what makes it sit *in* something. That is why
 * `types.ts` hands the draft `drawRock` rather than drawing it around them.
 */

/** How far the rim stands proud of the rock, as a share of its radius. */
const LIP = 0.34;

function rim(c: HolderContext, open: number, behind: boolean): void {
  const { ctx } = c;
  const r = c.rockR;
  // The lip opens by leaning away rather than by widening — a socket that grew
  // would read as the rock shrinking inside it.
  const lean = open * r * 0.55;
  ctx.beginPath();
  ctx.ellipse(
    c.rockX - r * 0.12,
    c.rockY,
    r * (1 + LIP),
    r * 0.34 + lean,
    0,
    behind ? Math.PI : 0,
    behind ? Math.PI * 2 : Math.PI,
  );
  ctx.stroke();
}

export const COLLAR: Holder = {
  id: "collar",
  name: "COLLAR",
  claim: "She grew a socket, and the rock is bedded into it.",
  note:
    "Closest to the picture you sent, turned ninety degrees. The rim passes behind the rock and then in front of it, which is what makes the rock sit in something rather than beside it. Release is the lip leaning open; the rock is free the moment it does. " +
    "Against it: it is the quietest of the three at phone size, because a collar is a thin line and thin lines are the first thing a small screen loses. It also says nothing about when — a collar looks the same four beats before a drop as one beat before, so the whole telegraph stays on the pulsing ring player 2 already has.",

  draw(c, f) {
    const { ctx } = c;

    // The far half of the rim first, so the rock closes over it.
    ctx.strokeStyle = PALETTE.hull;
    ctx.lineWidth = STROKE.outline * 1.6;
    ctx.globalAlpha = 0.85;
    rim(c, f.release, true);

    // The bed: a pocket of her own body, dark, so nothing shows through the
    // rock's own gaps and the rock reads as sunk into her rather than laid on.
    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.background;
    ctx.beginPath();
    ctx.ellipse(
      c.rockX - c.rockR * 0.12,
      c.rockY,
      c.rockR * 1.02,
      c.rockR * 0.92,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    c.drawRock();

    // The near half, over the rock. It fades as it opens: a lip leaning away
    // from the eye is a lip turning edge-on.
    ctx.strokeStyle = PALETTE.hullRim;
    ctx.lineWidth = STROKE.outline * 1.6;
    ctx.globalAlpha = 0.9 - f.release * 0.55;
    rim(c, f.release, false);
    ctx.globalAlpha = 1;
  },
};
