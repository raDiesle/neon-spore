import {
  MAGNET_SHAPE,
  type MagnetShape,
} from "../../../../../packages/content/src/magnet-shape.js";
import { hazed } from "../../../../../packages/render/src/depth.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";
import { litBox, litRound } from "../../../../../packages/render/src/key-light.js";
import {
  DOWN,
  type MagnetDraw,
  magnetArchPath,
  magnetHang,
  magnetPlatePath,
  magnetRadius,
  magnetSlabPath,
  poleTip,
  TURN,
} from "../../../../../packages/render/src/magnet.js";
import { pole } from "../../../../../packages/render/src/magnet-coil.js";
import { lanes } from "../../../../../packages/render/src/magnet-lanes.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import { magnetPoleColor } from "../../../../../packages/sim/src/magnet.js";

/**
 * ROD, drawn: the horseshoe is a bent bar with a round section, cut square at
 * both ends, and the plate under it has an edge you could rest a coin on.
 *
 * Three things say *thickness* here and the shipped body has none of them.
 * The arch carries a crest — a band of light along its middle radius that
 * falls off to both edges, which is what a round bar does under a light and
 * what a flat ring never does. Each pole ends in a **cut face**: an ellipse of
 * the pole's own colour standing across the end of the arm, foreshortened
 * the way the end of a rod is when it points a little away from you. And
 * the plate and the staff are extruded — a second copy of each, a little
 * lower and darker, showing under the front face as the side of a slab.
 *
 * The key light, the poles' own gradient and the lanes are the shipped passes
 * called as they are (`litRound`, `litBox`, `pole`, `lanes`); the paths are
 * `magnet.ts`'s, so the silhouette the shape sheet judges has not moved.
 */

/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";

/** How far the plate's side face shows under its front, and the staff's
 * beside it, in body radii. */
const EXTRUDE = 0.09;

/** How much of the band's width the crest lights, and how bright. */
const CREST = 0.5;
const CREST_LIGHT = 0.42;

/** The cut face across a pole's end: how far the ellipse's short axis is
 * foreshortened. Under one — a face seen square-on is a disc, and a disc on
 * the end of an arm is a lamp again. */
const FACE_SQUASH = 0.42;

/** The plate and the staff, with a side. */
function slabWithSide(
  ctx: CanvasRenderingContext2D,
  r: number,
  s: MagnetShape,
  struck: number,
  haze: (h: string) => string,
): void {
  const path = magnetPlatePath(r, s);
  // The side first, lower and darker, so the front face covers all but the
  // strip that reads as an edge.
  ctx.save();
  ctx.translate(0, r * EXTRUDE);
  ctx.fillStyle = haze(mixHex(PALETTE.rockDark, SHADOW, 0.5));
  ctx.fill(path);
  ctx.restore();
  // The front face: `coil`'s lighter grey and its ramp.
  ctx.fillStyle = haze(mixHex(PALETTE.rockDark, PALETTE.rock, 0.34));
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litBox(
    ctx,
    path,
    -r * s.plateHalf,
    r * (s.plateDrop - s.plateThick),
    r * s.plateHalf * 2,
    r * s.plateThick * 2,
    "value",
  );
  ctx.restore();
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = haze(PALETTE.dim);
  ctx.stroke(path);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = haze(PALETTE.rock);
  ctx.stroke(magnetSlabPath(r, s));
  // A shot turned away, on the edge that refused it — the shipped statement.
  if (struck <= 0) return;
  const heat = Math.min(1, struck * 4);
  ctx.globalAlpha = heat;
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
  halo(ctx, 0, r * s.plateDrop, r * 1.1, PALETTE.rock, 0.45 * heat);
}

/** The arch as a bar: the dark mass, a crest of light along its middle, and
 * the key over the top of both. */
function bar(
  ctx: CanvasRenderingContext2D,
  r: number,
  s: MagnetShape,
  haze: (h: string) => string,
  spin: number,
): void {
  const path = magnetArchPath(r, s);
  ctx.fillStyle = haze(PALETTE.rockDark);
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  // The crest: a radial ramp that is dark at both edges of the band and light
  // along its middle. A tube seen from the side is lit along the line nearest
  // the viewer, and that line is the band's middle radius the whole way round.
  const mid = (s.outer + s.inner) * 0.5;
  const half = (s.outer - s.inner) * 0.5;
  const crest = ctx.createRadialGradient(0, 0, r * s.inner, 0, 0, r * s.outer);
  crest.addColorStop(0, haze(SHADOW));
  crest.addColorStop(Math.max(0.05, 0.5 - CREST * 0.5), haze(PALETTE.rockDark));
  crest.addColorStop(0.5, haze(mixHex(PALETTE.rockDark, PALETTE.rock, CREST_LIGHT)));
  crest.addColorStop(Math.min(0.95, 0.5 + CREST * 0.5), haze(PALETTE.rockDark));
  crest.addColorStop(1, haze(SHADOW));
  ctx.fillStyle = crest;
  ctx.beginPath();
  ctx.arc(0, 0, r * (mid + half), 0, TURN);
  ctx.fill();
  litRound(ctx, 0, 0, r, "value", spin);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = haze(PALETTE.dim);
  ctx.stroke(path);
}

/** The cut face across the end of one arm, in the pole's colour. */
function face(
  d: MagnetDraw,
  r: number,
  s: MagnetShape,
  left: boolean,
  haze: (h: string) => string,
): void {
  const { ctx, c } = d;
  const color = magnetPoleColor(c, left);
  if (color === null) return;
  const hex = haze(color === "red" ? PALETTE.red : PALETTE.cyan);
  const rim = haze(color === "red" ? PALETTE.redRim : PALETTE.cyanRim);
  const tip = poleTip(r, left, s);
  const bearing = DOWN + (left ? 1 : -1) * s.gapTurn * TURN;
  const half = (s.outer - s.inner) * 0.5 * r;
  ctx.save();
  ctx.translate(tip.x, tip.y);
  ctx.rotate(bearing);
  ctx.beginPath();
  ctx.ellipse(0, 0, half, half * FACE_SQUASH, 0, 0, TURN);
  ctx.fillStyle = hex;
  ctx.fill();
  ctx.restore();
  const ring = new Path2D();
  ring.ellipse(tip.x, tip.y, half, half * FACE_SQUASH, bearing, 0, TURN);
  strokeGlow(ctx, ring, rim, STROKE.inner, 1.1);
}

export function rod(d: MagnetDraw): void {
  const { ctx, l, cfg, c, x, y, beats, struck, near } = d;
  const s = MAGNET_SHAPE;
  const r = magnetRadius(l, c);
  const haze = (h: string): string => hazed(cfg, h, near);
  const spin = magnetHang(c, beats);

  ctx.save();
  ctx.translate(x, y);
  lanes(d, r, s, haze);
  ctx.rotate(spin);
  slabWithSide(ctx, r, s, struck, haze);
  bar(ctx, r, s, haze, spin);
  pole(d, r, s, true, haze);
  pole(d, r, s, false, haze);
  face(d, r, s, true, haze);
  face(d, r, s, false, haze);
  ctx.restore();
}
