import { blobPoints } from "@neon-spore/content";
import { paintFilm } from "./baton-flesh.js";
import { flueEmberR, type Point } from "./flue-shape.js";
import { drawFlueSporeCracks } from "./flue-spore-cracks.js";
import { haloSprite, strokeGlowFaded } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
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
 *
 * **It cracks a little more with every level cleared**
 * (`flue-spore-cracks.ts`), `hits` of them, the newest running in as the
 * hit's flash (`fresh`) fades.
 *
 * **Over the cannon it goes red** (`red`, out of `flue-bare.ts`): the one
 * place a shot can hurt it, the owner's ask of 6 October 2026 by name, so
 * there it is in the red of a blow and quivers.
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

/**
 * The spore at `at`, `dim` 1 alive and less once spent, `red` 0 shielded to 1
 * bare over the cannon, on the beat's phase and the picture's clock.
 */
export function drawFlueSpore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  dim: number,
  red: number,
  beatPhase: number,
  time: number,
  hits = 0,
  fresh = 0,
): void {
  const r = flueEmberR(l);
  const alive = dim >= 1;
  const heart = mixHex(PALETTE.hullRim, PALETTE.redRim, red);
  const flesh = mixHex(PALETTE.sheenRim, PALETTE.red, red);
  const deep = mixHex(PALETTE.sheenDeep, PALETTE.red, red * 0.6);

  const halo = haloSprite(PALETTE.hullRim, Math.round(r * 2.2));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha *= 0.45 * dim;
  ctx.drawImage(halo, at.x - halo.width / 2, at.y - halo.height / 2);
  ctx.restore();

  const skin = splinePath(
    blobPoints(
      at.x,
      at.y,
      r,
      r,
      LOBES,
      DEPTH,
      WOBBLE * (1 + 2 * red),
      time * (1.4 + 4 * red),
      77,
      24,
    ),
    true,
  );
  const g = ctx.createRadialGradient(at.x - r * 0.2, at.y - r * 0.25, r * 0.1, at.x, at.y, r);
  g.addColorStop(0, rgba(heart, 0.95 * dim));
  g.addColorStop(0.55, rgba(flesh, (0.7 + 0.25 * red) * dim));
  g.addColorStop(1, rgba(deep, (0.6 + 0.3 * red) * dim));
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
  ctx.fillStyle = rgba(heart, dim);
  ctx.fill(nucleus);
  strokeGlowFaded(ctx, nucleus, heart, STROKE.inner, dim, 0.7);

  ctx.save();
  ctx.clip(skin);
  drawFlueSporeCracks(ctx, l, at, hits, fresh, dim);
  ctx.restore();
  strokeGlowFaded(ctx, skin, flesh, STROKE.outline, dim * (1 + red), 0.9);
  paintFilm(ctx, at.x, at.y, r, 0.55 * dim);
}
