import { MAGNET_SHAPE, type MagnetShape } from "@neon-spore/content";
import { magnetPoleColor } from "@neon-spore/sim";
import { hazed } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { litBox, litRound } from "./key-light.js";
import {
  type MagnetDraw,
  magnetArchPath,
  magnetHang,
  magnetPlatePath,
  magnetPolePath,
  magnetRadius,
  magnetSlabPath,
  poleTip,
} from "./magnet.js";
import { lanes } from "./magnet-lanes.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * WHAT THE MAGNET IS DRAWN AS: a solid horseshoe, poles lit from their tips,
 * and a chevron lane at each side saying the way in is across and not up.
 *
 * It arrived as `creature:magnet` / `coil` on VERSUS and the owner took it
 * into the game on 8 September 2026. What it replaced was three flat greys and
 * two wedges of colour — a body that stated two thirds of its own rule and
 * left the hardest clause, that a shot only gets in **sideways**, to be
 * learned by losing a shot to the plate.
 *
 * **Every path here is the geometry next door.** `magnetArchPath`, `magnetPolePath`,
 * `magnetPlatePath` and `magnetSlabPath` come from `magnet.ts` rather than
 * being redrawn here, because `magnetOutline` in `packages/content` is the
 * silhouette the shape sheet judges and the nameability gate reads, and a
 * picture that moved the contour without moving that function would disagree
 * with the one file allowed to say what this body's shape is. What this file
 * decides is the light on it, what the poles do, and one thing drawn beside
 * it.
 */

/**
 * A machined edge, all the way round, drawn **inside** the clip.
 *
 * A wide pale stroke on a clipped path lands entirely within the shape, so the
 * whole rim lifts; the key light then goes over the top and takes the far half
 * of it back down. That is the order that matters — bevel first, light second
 * — because a bevel drawn after the ramp is a bright ring on a dark side, and
 * a bright ring on a dark side is the one thing that says *sticker*.
 *
 * The caller has already clipped. It never restores: the clip is the caller's.
 */
function bevel(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  r: number,
  haze: (h: string) => string,
): void {
  ctx.strokeStyle = haze(PALETTE.rock);
  ctx.globalAlpha = 0.34;
  ctx.lineWidth = Math.max(1.5, r * 0.11);
  ctx.stroke(path);
  ctx.globalAlpha = 1;
}

/**
 * COIL, drawn: the horseshoe as a solid under the key light, its two poles lit
 * from their ends, and a lane of its own colour running in at each side.
 */
export function coil(d: MagnetDraw): void {
  const { ctx, l, cfg, c, x, y, beats, struck, near } = d;
  const s = MAGNET_SHAPE;
  const r = magnetRadius(l, c);
  const haze = (h: string): string => hazed(cfg, h, near);
  const spin = magnetHang(c, beats);

  // The lanes go down before the transform, level and unrotated: what they
  // draw is the path a locked bolt runs, and a bolt does not lean because the
  // body it is arriving at happens to be hanging.
  ctx.save();
  ctx.translate(x, y);
  lanes(d, r, s, haze);
  ctx.rotate(spin);

  slab(d, r, s, struck, haze);
  arch(d, r, haze, spin);
  pole(d, r, s, true, haze);
  pole(d, r, s, false, haze);
  ctx.restore();
}

/**
 * The staff and the plate, lit as a slab rather than filled flat.
 *
 * The shipped plate is one mid-grey with a hard white edge, which reads as a
 * cut-out card seen face on. `litBox` puts the shipped ramp across it — dark
 * along the bottom, light along the top — so the one part of this body whose
 * whole job is to be *thick* looks it. The hard rock edge stays: it is what
 * tells a glance which of the two greys is armour.
 */
export function slab(
  d: MagnetDraw,
  r: number,
  s: MagnetShape,
  struck: number,
  haze: (h: string) => string,
): void {
  const { ctx } = d;
  const path = magnetPlatePath(r, s);
  // The shutter is a **lighter** grey than the arch it hangs from, which the
  // shipped body does not do — both are `rockDark` there, so at the size a
  // magnet is actually drawn the plate is a smudge under a ring rather than a
  // separate hard thing in the way. Value is the one channel that survives
  // twenty-eight pixels, and this body's whole rule lives on the plate.
  ctx.fillStyle = haze(mixHex(PALETTE.rockDark, PALETTE.rock, 0.34));
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  bevel(ctx, path, r, haze);
  // A specular line down the staff, inside the clip so it cannot escape the
  // shaft. One line is the difference between a bar and a cylinder, and this
  // body hangs its whole plate on that shaft.
  const shaft = new Path2D();
  shaft.moveTo(-r * s.staffHalf * 0.42, -r * s.inner * 0.6);
  shaft.lineTo(-r * s.staffHalf * 0.42, r * s.plateDrop);
  ctx.strokeStyle = haze(PALETTE.rock);
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(shaft);
  ctx.globalAlpha = 1;
  // The box is the plate's own, not the staff's: the ramp belongs to the flat
  // thing being read as a slab, and running it up the staff as well would put
  // the bright end of it inside the arch, where the arch's own light already is.
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

  // A shot that came straight up and went nowhere, on the edge that refused
  // it — the shipped statement, unchanged, because it is already right.
  if (struck <= 0) return;
  const heat = Math.min(1, struck * 4);
  ctx.globalAlpha = heat;
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.stroke(magnetPlatePath(r, s));
  ctx.globalAlpha = 1;
  halo(ctx, 0, r * s.plateDrop, r * 1.1, PALETTE.rock, 0.45 * heat);
}

/** The horseshoe: the same dark mass, with the shipped key light over it so it
 * reads as a bent bar rather than as a ring cut out of paper. `litRound`
 * rather than a gradient of this file's own, for `forge`'s reason — which
 * greys a body is made of is a material question and where the light is
 * coming from is not. */
function arch(d: MagnetDraw, r: number, haze: (h: string) => string, spin: number): void {
  const { ctx } = d;
  const path = magnetArchPath(r);
  ctx.fillStyle = haze(PALETTE.rockDark);
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  bevel(ctx, path, r, haze);
  litRound(ctx, 0, 0, r, "value", spin);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = haze(PALETTE.dim);
  ctx.stroke(path);
}

/**
 * One pole, lit from its own end. Exported, with `slab`, for a candidate in
 * `tools/versus` that argues about the arch or the plate and not about the
 * poles: the two lamps are the half of this body that carries a word somebody
 * says out loud, and a second copy of how they are lit is a second copy of
 * where the pair looks for it.
 *
 * Shipped, a pole is a flat wedge of colour with a halo at the tip. Here the
 * colour is a gradient standing *on* the tip and falling away up the arm, so
 * the bright part of the body is the part a bolt has to reach — and the arm
 * behind it goes back to the body's own dark within a third of a radius, which
 * is the whole of why `MAGNET_SHAPE` keeps `poleTurn` short.
 *
 * The colour comes from `magnetPoleColor` and not from a ternary here: the
 * pole the pair is looking at and the pole the bolt has to match are one fact.
 */
export function pole(
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
  const path = magnetPolePath(r, left);
  const tip = poleTip(r, left, s);
  const fall = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, r * 0.62);
  // The tip keeps the ammunition's own hex and does **not** brighten toward
  // its rim. `key-light.ts` refuses `lift` on a creature for one reason —
  // brightening moves a red body a measurable distance toward cyan — and a
  // pale tip on the one body whose whole job is to name a colour would be
  // that defect on the worst possible surface. The rim is on the outline,
  // where it always was.
  fall.addColorStop(0, hex);
  fall.addColorStop(0.5, hex);
  fall.addColorStop(1, haze(PALETTE.rockDark));
  ctx.fillStyle = fall;
  ctx.fill(path);
  strokeGlow(ctx, path, rim, STROKE.outline, 1.3);
  // A wider, stronger light than the shipped one. The two lamps are the only
  // part of this body that carries a word somebody has to say out loud, and at
  // the size it is drawn the glow is more of that reading than the wedge is.
  halo(ctx, tip.x, tip.y, r * 1.05, hex, 0.62);
}
