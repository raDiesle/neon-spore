import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The beam of a brake — the one part of a hand on a rock that is visible from
 * across the room. Cut out of `grip.ts` when THE CAIRN's hand took that file
 * over its length; the ring, the word and the rule about which hand gets
 * what are still there.
 */

/** Lights travelling up the beam, spread over its length. */
const SPARKS = 4;
/**
 * How wide one of them is, in tiles — the glow, and the lit core inside it.
 * Big enough to read as a light being drawn *up* the line at a glance: at a
 * third of this they were a texture on the beam rather than a direction.
 */
const SPARK_TILES = 0.3;
const SPARK_CORE = 0.1;

/**
 * The line back to the ship. It is the only part visible from across the
 * room, and it is drawn from the hull rather than from nowhere: the pull has
 * to come from the thing the pair is defending, or it reads as the creature's
 * own light.
 */
export function drawBeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  time: number,
  weight: number,
): void {
  const from = l.hullY;
  if (from <= y) return;
  const sway = Math.sin(time * 5) * l.tile * 0.06;

  ctx.save();
  ctx.globalAlpha = 0.14 + 0.1 * weight + 0.05 * Math.sin(time * 7);
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 1 + 2 * weight;
  ctx.beginPath();
  ctx.moveTo(x, from);
  ctx.quadraticCurveTo(x + sway, (from + y) / 2, x, y);
  ctx.stroke();
  ctx.restore();

  // Lights climbing the beam: the direction of the pull, so it never reads as
  // something falling down the line instead. Each is a glow with a lit core in
  // it — the glow on its own is soft enough to lose against the field.
  for (let k = 0; k < SPARKS; k++) {
    const t = (((time * 0.7 + k / SPARKS) % 1) + 1) % 1;
    const sy = from - (from - y) * t;
    const fade = 1 - t * 0.55;
    halo(ctx, x, sy, l.tile * SPARK_TILES, PALETTE.pod, (0.34 * weight + 0.22) * fade);
    ctx.save();
    ctx.globalAlpha = 0.9 * fade;
    ctx.fillStyle = PALETTE.podRim;
    ctx.beginPath();
    ctx.arc(x, sy, Math.max(1, l.tile * SPARK_CORE), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
