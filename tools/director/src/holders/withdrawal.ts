import type { QueenVariant } from "./queen-shared.js";
import { drawQueenShell, queenGeom } from "./queen-shell.js";

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
/** And how much taller she stands for it, on the same clock. */
const RISE = 0.2;

export const WITHDRAWAL: QueenVariant = {
  id: "withdrawal",
  name: "WITHDRAWAL",
  claim: "She narrows and hunches as she is hurt, rather than scarring.",
  note:
    "No scar and no light — only posture. A wide, low hull at full health pulls its flanks in and rises a little taller as petals fall, so a queen at one petal is visibly a smaller, tighter shape before the row or the sink confirms it. Marks, sockets and the petal row keep their own logic; only the body's own width and height answer to health. " +
    "Against it: it is the easiest of the three to lose across a long fight — a slow squeeze reads as jitter beat to beat — and narrowing her flanks narrows the gap her two sockets sit in, which risks looking like the sockets are moving rather than her.",

  draw(ctx, w, h, cycle) {
    // The only draft that moves the geometry itself. The socket columns do not
    // follow it — `drawQueenShell` fixes those at the unsqueezed half-width,
    // and says why.
    const hurt = 1 - cycle.healthShare;
    const geom = queenGeom(w, h, cycle, 1 - hurt * SQUEEZE, 1 + hurt * RISE);
    drawQueenShell(ctx, geom, cycle);
  },
};
