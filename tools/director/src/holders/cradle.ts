import { PALETTE, STROKE } from "@neon-spore/render";
import type { Holder, HolderContext } from "./types.js";

/**
 * THE CRADLE — she is holding it with herself.
 *
 * No socket and no mechanism: two lobes of her own body have grown around the
 * rock the way a calyx holds a bud, with a few strands of her drawn taut
 * across the gap. Letting go is the lobes peeling back and the strands going
 * slack and parting.
 *
 * This is the only one of the three that stays inside the game's own
 * vocabulary — `CLAUDE.md` says the forms here are blobs and slimes, closed
 * contours with lobes, and a lobe is exactly what this uses. It is also the
 * only one that makes the torch look *grown* rather than *carried*, which fits
 * a boss whose sockets already grow a replacement over half a beat
 * (`queenEggGrowShare`).
 *
 * Against it: it is the least like the picture the owner sent, and the most
 * likely of the three to disappear into her outline at phone size — a lobe of
 * her body against her body is one colour, where a collar and an arm both have
 * an edge against the dark.
 */

/** How far round the rock each lobe reaches while holding, in radians. */
const GRIP = 1.15;
/** How far the lobes peel back as they let go. */
const PEEL = 0.85;
const STRANDS = 4;

function lobe(c: HolderContext, side: -1 | 1, open: number): void {
  const { ctx } = c;
  const r = c.rockR;
  // An arc centred on the rock, not a line from her body to it. The first
  // version ran root-to-tip through a control point and came out as a long
  // straight strut — which is a bracket, the very thing this draft exists to
  // avoid. A husk is a curve that shares the rock's centre, so it hugs.
  const hug = r * 1.16;
  // Held: the lobe reaches from behind the rock round to past its front face.
  // Letting go: the far end retreats, so the husk opens like a bract.
  const from = Math.PI * 0.86;
  const to = Math.PI * 0.86 - (GRIP + 0.55) * (1 - open * PEEL);
  ctx.beginPath();
  ctx.arc(c.rockX, c.rockY, hug, side * from, side * to, side < 0);
  ctx.stroke();

  // The stem: a short thick root from her flank to where the lobe starts, so
  // the husk is plainly part of her and not a ring floating round the rock.
  const sx = c.rockX + Math.cos(side * from) * hug;
  const sy = c.rockY + Math.sin(side * from) * hug;
  ctx.beginPath();
  ctx.moveTo(c.bodyX + c.bodyR * 0.6, c.bodyY + side * r * 0.5);
  ctx.quadraticCurveTo((c.bodyX + sx) / 2, c.bodyY + side * r * 1.05, sx, sy);
  ctx.stroke();
}

export const CRADLE: Holder = {
  id: "cradle",
  name: "CRADLE",
  claim: "She is holding it with herself.",
  note:
    "Two lobes of her own body grown around the rock the way a calyx holds a bud, with a few strands drawn taut across the gap. Letting go is the lobes peeling back and the strands parting. It is the only one of the three inside the game's own vocabulary — blobs and slimes, closed contours with lobes — and the only one that makes the torch look grown rather than carried, which is what her sockets already do when they grow a replacement over half a beat. " +
    "Against it: it is the least like the picture you sent, and the most likely to vanish into her outline at phone size. A lobe of her body against her body is one colour, where a collar and an arm each have an edge against the dark.",

  draw(c, f) {
    const { ctx } = c;

    // Strands first and behind: they are the inside of the grip, and a strand
    // over the rock would read as a net rather than as tissue giving way.
    ctx.strokeStyle = PALETTE.hull;
    ctx.lineWidth = STROKE.inner;
    ctx.globalAlpha = 0.75 * (1 - f.release);
    for (let i = 0; i < STRANDS; i++) {
      const at = (i + 0.5) / STRANDS;
      const y = c.rockY + (at - 0.5) * c.rockR * 1.7;
      // Slack as it lets go: the strand bows before it parts.
      const sag = f.release * c.rockR * 0.35;
      ctx.beginPath();
      ctx.moveTo(c.bodyX + c.bodyR * 0.55, y);
      ctx.quadraticCurveTo((c.bodyX + c.rockX) / 2, y + sag, c.rockX - c.rockR * 0.55, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    c.drawRock();

    // The lobes close over the rock's near face, so it sits inside them.
    ctx.strokeStyle = PALETTE.hullRim;
    ctx.lineWidth = STROKE.outline * 2.2;
    ctx.lineCap = "round";
    lobe(c, -1, f.release);
    lobe(c, 1, f.release);
    ctx.lineCap = "butt";
  },
};
