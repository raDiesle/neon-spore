import { PALETTE } from "@neon-spore/render";
import type { QueenVariant } from "./queen-shared.js";
import { drawQueenShell, type QueenGeom, queenGeom } from "./queen-shell.js";

/**
 * HAIRLINE — her shell keeps every petal she has lost as a crack across it.
 *
 * One axis for the three whole-body drafts, spread the way the holders page
 * spread the torch: **how much of her condition the body itself admits,
 * before the row of petals or the sinking confirm it.** This end of the axis
 * says all of it, permanently, in the outline. The armour itself carries her
 * history — a queen four petals down is visibly a queen who has taken four
 * hits, not merely a shorter health bar.
 *
 * Against it: the shell was rock, faceted and gradient-shaded, in the shipped
 * queen — a network of hairline cracks is a busier read at 26 px, and a
 * silhouette with damage baked into its edge is harder to keep reading as one
 * clean shape once she is down to her last petal.
 */

/** How far a crack reaches out from the shell's centre, as a share of the body's own radius. */
const CRACK_REACH = 0.92;

function drawCracks(ctx: CanvasRenderingContext2D, geom: QueenGeom, lost: number): void {
  const { cx, cy, rx, ry } = geom;
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = Math.max(1, rx * 0.03);
  for (let i = 0; i < lost; i++) {
    // A fixed angle per crack index, so a crack once drawn never moves —
    // losing a fifth petal adds a fifth line rather than redrawing the first four.
    const angle = (i * 2.4 + 0.6) % (Math.PI * 2);
    const ex = cx + Math.cos(angle) * rx * CRACK_REACH;
    const ey = cy + Math.sin(angle) * ry * CRACK_REACH;
    const midx = cx + Math.cos(angle) * rx * 0.45 + Math.sin(angle) * rx * 0.12;
    const midy = cy + Math.sin(angle) * ry * 0.45 - Math.cos(angle) * ry * 0.12;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(midx, midy, ex, ey);
    ctx.stroke();
  }
}

export const HAIRLINE: QueenVariant = {
  id: "hairline",
  name: "HAIRLINE",
  claim: "Her armour keeps a crack for every petal she has lost.",
  note:
    "The far end of the axis: her condition is written straight into the shell, so a glance at the outline alone says how many hits she has taken, before the petal row or the sink confirm it. Nothing about the marks, the sockets or the sinking changes — the cracks sit on the shell CRADLE and the two marks are already drawn under. " +
    "Against it: cracks are the busiest of the three at phone size, and a silhouette with damage baked into its own edge is the hardest of the three to keep reading as one clean shape once she is down to her last petal.",

  draw(ctx, w, h, cycle) {
    drawQueenShell(ctx, queenGeom(w, h, cycle), cycle, {
      onShell: (c, geom) => drawCracks(c, geom, cycle.startPetals - cycle.petals),
    });
  },
};
