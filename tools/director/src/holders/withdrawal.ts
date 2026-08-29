import { PALETTE } from "@neon-spore/render";
import {
  drawPetalRow,
  drawQueenMarks,
  drawQueenSocket,
  type QueenVariant,
} from "./queen-shared.js";

/**
 * WITHDRAWAL — she hunches, rather than cracking or glowing, as she is hurt.
 *
 * The far end of the axis from `hairline.ts`: the shell itself carries no
 * scar and no light, only posture. Full health is a wide, low hull; each
 * petal lost narrows her a little and pulls the flanks in toward the centre,
 * so a queen at one petal is visibly smaller and tighter than the one that
 * started the fight, before either the row or the sink says so. It is the
 * closest of the three to a body admitting something rather than a machine
 * reporting a number.
 *
 * Against it: it is the subtlest of the three to hold in memory across a long
 * fight — a slow squeeze is easy to miss beat to beat and easy to mistake for
 * jitter — and narrowing her flanks also narrows the gap the two sockets sit
 * in, which risks reading as the sockets moving rather than as her changing
 * shape around them.
 */

/** How far the flanks pull in at zero health, as a share of full-health width. */
const SQUEEZE = 0.3;

export const WITHDRAWAL: QueenVariant = {
  id: "withdrawal",
  name: "WITHDRAWAL",
  claim: "She narrows and hunches as she is hurt, rather than scarring.",
  note:
    "No scar and no light — only posture. A wide, low hull at full health pulls its flanks in and rises a little taller as petals fall, so a queen at one petal is visibly a smaller, tighter shape before the row or the sink confirms it. Marks, sockets and the petal row keep their own logic; only the body's own width and height answer to health. " +
    "Against it: it is the easiest of the three to lose across a long fight — a slow squeeze reads as jitter beat to beat — and narrowing her flanks narrows the gap her two sockets sit in, which risks looking like the sockets are moving rather than her.",

  draw(ctx, w, h, cycle) {
    const hurt = 1 - cycle.healthShare;
    const cx = w * 0.5;
    const sinkRange = h * 0.16;
    const cy = h * 0.4 + hurt * sinkRange;
    const rx = w * 0.24 * (1 - hurt * SQUEEZE);
    const ry = h * 0.14 * (1 + hurt * 0.2);
    const markY = cy + ry * 1.7;
    const markR = h * 0.075;

    drawQueenMarks(ctx, cx, markY, markR, rx * 0.75, cycle, cycle.t);

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    const grad = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
    grad.addColorStop(0, "#6B707E");
    grad.addColorStop(0.55, "#3C3F49");
    grad.addColorStop(1, PALETTE.rockDark);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = Math.max(1, Math.min(rx, ry) * 0.06);
    ctx.stroke();

    const rockR = h * 0.1;
    for (const side of [-1, 1] as const) {
      // The socket itself stays put — only her flank moves to meet it a
      // little further in — so a released rock still falls from a fixed
      // column rather than one that has been quietly sliding all fight.
      const sockX = cx + side * w * 0.24 * 1.55;
      drawQueenSocket(ctx, w, h, sockX, cy, rockR, cx + side * rx * 0.6, side, cycle, cycle.t);
    }

    drawPetalRow(ctx, cx, cy - ry * 1.9, rx * 1.3, cycle);
  },
};
