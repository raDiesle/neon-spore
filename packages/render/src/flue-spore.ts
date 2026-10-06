import { blobPoints } from "@neon-spore/content";
import { paintFilm } from "./baton-flesh.js";
import { flueEmberR, type Point } from "./flue-shape.js";
import { haloSprite, strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **The ember, grown into a spore** (the owner, 6 October 2026: *all boss
 * graphics bigger, especially the ball, and more alien living*): a trembling
 * membrane that overfills the slot, warm white at its heart and going to a
 * pale lavender at its skin, a nucleus beating on the beat, three motes
 * turning slowly inside it, and a wet film.
 *
 * **In neither cannon's colour**: it runs through the sight, which is drawn
 * in red or cyan, so the spore is white and lavender and never pink or blue.
 * Where it is drawn is the simulation's place and nothing else; what moves
 * inside the membrane moves round its own middle. Spent, it is dimmed and its
 * nucleus stops beating.
 */

/** The membrane's lobes, how deep they cut and how much it trembles. */
const LOBES = 6;
const DEPTH = 0.05;
const WOBBLE = 0.045;
/** The nucleus's radius, as a share of the spore's, and how much it swells on the beat. */
const NUCLEUS = 0.4;
const BEAT_SWELL = 0.12;
/** The motes: how many, how far out they turn, as a share of the radius, and how fast, in radians a second. */
const MOTES = 3;
const MOTE_OUT = 0.64;
const MOTE_TURN = 0.45;

/** The spore at `at`, `dim` 1 alive and less once spent, on the beat's phase and the picture's clock. */
export function drawFlueSpore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  dim: number,
  beatPhase: number,
  time: number,
): void {
  const r = flueEmberR(l);
  const alive = dim >= 1;

  const halo = haloSprite(PALETTE.hullRim, Math.round(r * 2.2));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha *= 0.45 * dim;
  ctx.drawImage(halo, at.x - halo.width / 2, at.y - halo.height / 2);
  ctx.restore();

  const skin = splinePath(
    blobPoints(at.x, at.y, r, r, LOBES, DEPTH, WOBBLE, time * 1.4, 77, 24),
    true,
  );
  const g = ctx.createRadialGradient(at.x - r * 0.2, at.y - r * 0.25, r * 0.1, at.x, at.y, r);
  g.addColorStop(0, rgba(PALETTE.hullRim, 0.95 * dim));
  g.addColorStop(0.55, rgba(PALETTE.sheenRim, 0.7 * dim));
  g.addColorStop(1, rgba(PALETTE.sheenDeep, 0.6 * dim));
  ctx.fillStyle = g;
  ctx.fill(skin);

  ctx.save();
  ctx.clip(skin);
  for (let i = 0; i < MOTES; i++) {
    const a = (i / MOTES) * Math.PI * 2 + (alive ? time * MOTE_TURN : 0);
    const mx = at.x + Math.cos(a) * r * MOTE_OUT;
    const my = at.y + Math.sin(a) * r * MOTE_OUT;
    ctx.fillStyle = rgba(PALETTE.sheenDeep, 0.55 * dim);
    ctx.beginPath();
    ctx.arc(mx, my, r * (0.09 + 0.03 * i), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const swell = alive ? 1 + BEAT_SWELL * Math.max(0, Math.cos(beatPhase * Math.PI * 2)) : 1;
  const nucleus = new Path2D();
  nucleus.arc(at.x + r * 0.06, at.y + r * 0.05, r * NUCLEUS * swell, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.hullRim, dim);
  ctx.fill(nucleus);
  strokeGlowFaded(ctx, nucleus, PALETTE.hullRim, STROKE.inner, dim, 0.7);

  strokeGlowFaded(ctx, skin, PALETTE.sheenRim, STROKE.outline, dim, 0.9);
  paintFilm(ctx, at.x, at.y, r, 0.55 * dim);
}
