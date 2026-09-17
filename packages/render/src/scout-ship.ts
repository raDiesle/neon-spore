import { blobPoints } from "@neon-spore/content";
import {
  mazeCosMilli,
  mazeSinMilli,
  type ScoutState,
  type SimConfig,
  scoutNose,
} from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { scoutAt } from "./scout-draw.js";
import { splinePath } from "./spline.js";

/**
 * THE SCOUT's little ship, drawn. Split off `scout-draw.ts` — the arena it
 * flies in — on that file's line count.
 *
 * **It is the mother ship's own material at a tile's scale**: one lobed
 * contour of the hull's violet (`blobPoints`, the call the hull itself is
 * built from), with a nose on it where the heading is. Not a new shape — a
 * piece of the ship, put out, which is what the wave's guide says happens.
 *
 * Nothing is held between frames; every number comes off the round, the tick
 * and the frame clock.
 */

/**
 * The little ship: a lobe of the mother ship's own material, with a nose on
 * it where the heading is and its wake behind it while it burns.
 *
 * `nose` is the pilot's half of the split (`showsScoutNose`): without it the
 * ship is a place and nothing more, which is exactly what the navigator is
 * meant to have. The motes it carries ride its rim on the same half — they
 * come off it only at home, and the pilot is the one flying it there.
 */
export function drawScout(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  round: ScoutState,
  tick: number,
  time: number,
  nose: boolean,
): void {
  const { x, y } = scoutAt(l, round);
  const r = (cfg.scoutRadiusMilli * l.tile) / 1000;
  const sin = mazeSinMilli(round.headingMilli) / 1000;
  const cos = mazeCosMilli(round.headingMilli) / 1000;

  // Caught: a red flash that fades over the verdict, so the touch is seen.
  if (round.caughtTick >= 0) {
    const age = Math.max(0, tick - round.caughtTick);
    const flash = Math.max(0, 1 - age / 60);
    halo(ctx, x, y, r * 3, PALETTE.red, 0.3 + 0.6 * flash);
  }
  if (nose && round.burning) drawScoutWake(ctx, x, y, r, sin, cos, time);

  const body = splinePath(blobPoints(x, y, r, r * 0.9, 3, 0.1, 0.05, time * 0.7, 5, 24), true);
  ctx.save();
  ctx.fillStyle = "#1A0B2A";
  ctx.fill(body);
  ctx.restore();
  strokeGlow(ctx, body, PALETTE.hull, STROKE.outline, 0.7);

  if (!nose) return;
  const tip = scoutNose(round.headingMilli);
  const reach = r * 1.7;
  ctx.save();
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.4, r * 0.18);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + (tip.colMilli / 1000) * reach, y + (tip.rowMilli / 1000) * reach);
  ctx.stroke();
  ctx.restore();
  // What it is carrying, riding the rim opposite the nose: one amber bead a
  // mote, so the pilot can count them without being told.
  const beads = round.carrying.length;
  for (let i = 0; i < beads; i++) {
    const spread = (i - (beads - 1) / 2) * 0.5;
    const bx = x - sin * r * 1.15 * Math.cos(spread) + cos * r * 1.15 * Math.sin(spread);
    const by = y + cos * r * 1.15 * Math.cos(spread) + sin * r * 1.15 * Math.sin(spread);
    ctx.save();
    ctx.fillStyle = PALETTE.pod;
    ctx.beginPath();
    ctx.arc(bx, by, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** The wake: two chevrons behind the ship, jittering on the frame clock. */
function drawScoutWake(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  sin: number,
  cos: number,
  time: number,
): void {
  ctx.save();
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 2; i++) {
    const back = r * (1.3 + i * 0.6 + 0.1 * Math.sin(time * 19 + i));
    const cx = x - sin * back;
    const cy = y + cos * back;
    const half = r * 0.55;
    const dip = r * 0.3;
    ctx.globalAlpha = i === 0 ? 0.8 : 0.4;
    ctx.lineWidth = Math.max(1, r * 0.14);
    ctx.beginPath();
    ctx.moveTo(cx - cos * half - sin * dip, cy - sin * half + cos * dip);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + cos * half - sin * dip, cy + sin * half + cos * dip);
    ctx.stroke();
  }
  ctx.restore();
}
