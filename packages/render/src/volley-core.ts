import { spanOf, volleyIsClimbing } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { colorTrio } from "./creature-tint.js";
import { drawnRow, hazed } from "./depth.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { showsVolleyCore, volleyBallRadius } from "./volley.js";
import { seamPath } from "./volley-seams.js";

/**
 * THE VOLLEY's core: the body inside the ball, once a ward has opened it.
 *
 * It used to be the slick or the bulb the volley falls as, drawn full size
 * under the shell — and a lobed blob showing through a bite in a ball read as
 * two things in one tile. The owner, 12 September 2026: *change what is
 * inside to be a smaller red or cyan only enemy, so it looks harmonic with
 * the same shape of the basketball.* So this is a ball inside the ball — a
 * glossy sphere of the body's colour at half the shell's radius, wearing the
 * shell's own four seams in its dark tone — and the whole thing reads as one
 * object with a smaller one of the same shape sealed in it. It breathes, so
 * it is a body and not a bearing. The moment the last plate goes the
 * simulation makes it the plain body (`volleyBecomes`) and the hatch's burst
 * covers the change, which is THE CRYSTAL's arrangement for its pods.
 *
 * Nothing while every plate is on (`showsVolleyCore`): the ball is opaque.
 */

/** The core's radius as a share of the shell's. */
export const CORE_MUL = 0.5;
/** How much it breathes, as a share of its radius, and how fast. */
const BREATH = 0.06;
const BREATH_RATE = 3.1;

export function drawVolleyCore(b: Body): void {
  const { ctx, l, world, c, x, y, time, beatPhase, near } = b;
  const cfg = world.cfg;
  if (!showsVolleyCore(cfg, c)) return;
  const shell = volleyBallRadius(l, cfg, spanOf(c), drawnRow(c, beatPhase));
  const phase = sinHash(c.id) * 6.3;
  const breath = 1 + BREATH * Math.sin(time * BREATH_RATE + phase);
  const r = shell * CORE_MUL * breath;
  const trio = colorTrio(c.color);
  const hex = hazed(cfg, trio.hex, near);
  const rim = hazed(cfg, trio.rim, near);
  const dark = hazed(cfg, trio.dark, near);
  // Brighter while a ward is carrying the whole thing up: the body inside is
  // the one under load.
  const lit = volleyIsClimbing(c) ? 1 : 0.7;

  halo(ctx, x, y, r * 2.4, hex, 0.35 * lit);
  ctx.save();
  ctx.translate(x, y);
  // The sphere: lit from the upper left, dark at the far edge.
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, rim);
  g.addColorStop(0.35, hex);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  // The shell's seams, rolled the other way and in the dark tone: the same
  // pattern at the smaller size is what makes the two read as one shape.
  const ball = new Path2D();
  ball.arc(0, 0, r, 0, Math.PI * 2);
  ctx.save();
  ctx.clip(ball);
  ctx.rotate(-time * 0.2 - phase);
  ctx.strokeStyle = dark;
  ctx.lineWidth = Math.max(0.8, r * 0.09);
  ctx.lineCap = "round";
  ctx.stroke(seamPath(r));
  ctx.restore();
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.2;
  ctx.stroke(ball);
  // The highlight on the gloss.
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(-r * 0.38, -r * 0.42, r * 0.22, r * 0.13, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
