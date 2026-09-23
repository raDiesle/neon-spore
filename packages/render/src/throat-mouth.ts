import { circleSubpath } from "@neon-spore/content";
import {
  hullRow,
  type SimConfig,
  type ThroatState,
  throatInhales,
  throatMouthRow,
} from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { paintLip } from "./throat-flesh-lip.js";
import { mouthX, mouthY } from "./throat-shape.js";

/**
 * The mouth, the lip, and the column of field the inhale is holding.
 *
 * **The lip is the one place a colour is spent on this boss**, and it is
 * `venom` — THE GUM's own hue (`gum.ts`). Everything else about the gullet is
 * `rock`, which is the honest word for it: shots pass straight through the tube
 * and no hand can take hold of it, so the body of it says *nothing to report*
 * the way THE VANE's arm and THE BATON's spine do. The mouth is the exception
 * because it is the only thing in the fight anybody aims at, and painting it
 * the colour of the only ammunition that works is a *load this* mark that is
 * true — which is exactly what `clownNose` and `arc` are argued not to be.
 *
 * **The hauled column is drawn or the pull is a bug.** A rock that stops
 * falling halfway down a lane, with nothing to say why, is the single most
 * alarming thing this boss does, and the column is on both screens for that
 * reason: it is the mouth's column *now*, which both seats can already read off
 * the tube leaning toward it. What neither of them gets here is the column the
 * mouth will be in next, or the count — those are the navigator's alone.
 */

/** How wide the lip's own ring is, as a share of a tile, shut and open. */
const LIP_SHUT = 0.34;
const LIP_OPEN = 0.54;

/** Beats a choke's and a swallow's flare take to go out. */
const FLARE_BEATS = 1.2;

/** How far into the beat after an inhale the lip is still open. */
const GAPE = 0.8;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * How wide the mouth is standing open, 0..1.
 *
 * It gapes **on** the inhale beat and shuts over the beat after, rather than
 * opening ahead of one. Opening early would be the countdown `throat-shape.ts`
 * refuses to draw, by a different route: a lip that started widening three
 * beats out would hand both screens the number the navigator is there to say.
 */
export function gape(cfg: SimConfig, b: ThroatState, beat: number, beatPhase: number): number {
  if (b.phase === "everts") return 1;
  if (!throatInhales(cfg, b, beat)) return 0;
  return clamp01(1 - beatPhase / GAPE);
}

export function drawMouth(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const x = mouthX(l, cfg, b, beat, beatPhase);
  const y = mouthY(l, cfg);
  const open = gape(cfg, b, beat, beatPhase);
  const r = l.tile * (LIP_SHUT + (LIP_OPEN - LIP_SHUT) * open);

  drawHaul(ctx, l, cfg, x, y, open, time);

  // The lip: a ring of wet muscle round a dark hole rather than a blob, so it
  // reads as an opening in something and not as a body sitting at the end of
  // the tube (`throat-flesh-lip.ts`). Two lobes and
  // a shallow depth — enough that it purses as it shuts and never enough to
  // become a shape with a front.
  const lip = splinePath(lipPoints(x, y, r, r * (0.42 + 0.34 * open), time), true);
  if (open > 0) halo(ctx, x, y, r * 2.4, PALETTE.venom, 0.18 * open);
  paintLip(ctx, lip, x, y, r, l.tile, PALETTE.venom, PALETTE.venomRim, 0.6 + 0.4 * open);

  drawFlare(ctx, x, y, r, b.chokedBeat, beat, beatPhase, PALETTE.rock);
  drawFlare(ctx, x, y, r, b.fedBeat, beat, beatPhase, PALETTE.venomRim);
}

/** The lip's outline, pursed on its short axis. */
function lipPoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  time: number,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const purse = 1 + 0.08 * Math.sin(a * 2) + 0.03 * Math.sin(time * 1.7 + a * 3);
    pts.push({ x: cx + Math.cos(a) * rx * purse, y: cy + Math.sin(a) * ry * purse });
  }
  return pts;
}

/**
 * The column under the mouth, from its own row down to the hull: the field the
 * inhale has hold of.
 *
 * **Faint, and fainter the further from the mouth it gets.** The first frame of
 * this boss had it as an even ladder of chevrons at full length and full
 * strength, and it was the loudest thing on the screen — a fixed rung for every
 * row, brighter than the gum it was supposed to be a background to, and
 * perfectly still because an evenly spaced repeat has no motion in it. The
 * throat's reach really is the whole column (`sim/throat-pull.ts`), so the
 * current is not shortened to lie about it; it is thinned out with distance
 * instead, which is the true thing about a pull anyway and which leaves the
 * bottom of the column to the bodies standing in it.
 *
 * The marks climb rather than fall, and that is the one thing about it that has
 * to be unmistakable: everything else on this field goes down.
 */
function drawHaul(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  x: number,
  y: number,
  open: number,
  time: number,
): void {
  const bottom = tileCY(l, hullRow(cfg));
  const rows = hullRow(cfg) - throatMouthRow(cfg);
  if (rows <= 0) return;
  const half = l.tile * 0.24;
  ctx.save();
  ctx.strokeStyle = PALETTE.venom;
  ctx.lineWidth = STROKE.inner;
  for (let i = 0; i < rows; i++) {
    // A mark's own place in the climb, wrapped: each one rises a tile and the
    // next takes its place, so the column reads as a current rather than as a
    // row of rungs.
    const at = ((i + time * 0.7) % rows) / rows;
    const my = bottom - (bottom - y) * at;
    // Strongest at the top and gone by the hull — `at` is 1 at the mouth, so
    // the falloff is the cube of it and the lowest third is barely there.
    ctx.globalAlpha = (0.06 + 0.16 * open) * at ** 3;
    const w = half * (0.4 + 0.6 * at);
    const line = new Path2D();
    line.moveTo(x - w, my + l.tile * 0.14);
    line.lineTo(x, my - l.tile * 0.08);
    line.lineTo(x + w, my + l.tile * 0.14);
    ctx.stroke(line);
  }
  ctx.restore();
}

/**
 * A receipt at the mouth: a ring going out from it for a beat.
 *
 * Both of them are on both screens, THE DIASTOLE's `drawStruck`'s argument said
 * about the other direction: a choke and a heal are the two facts in this fight
 * neither player has to be told by the other, and the pair that just fed the
 * boss by mistake deserves to see it happen. Grey going out is a ring lost,
 * pale venom is one the throat got back.
 */
function drawFlare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  at: number,
  beat: number,
  beatPhase: number,
  color: string,
): void {
  if (at === -1) return;
  const since = beat - at + beatPhase;
  if (since < 0 || since >= FLARE_BEATS) return;
  const fade = 1 - since / FLARE_BEATS;
  const ring = new Path2D(circleSubpath(x, y, r * (1 + since * 1.1)));
  strokeGlow(ctx, ring, color, STROKE.inner, 0.9, fade);
}
