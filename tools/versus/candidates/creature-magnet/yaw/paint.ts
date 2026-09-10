import {
  MAGNET_SHAPE,
  type MagnetShape,
} from "../../../../../packages/content/src/magnet-shape.js";
import { hazed } from "../../../../../packages/render/src/depth.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import {
  type MagnetDraw,
  magnetArchPath,
  magnetHang,
  magnetPlatePath,
  magnetPolePath,
  magnetRadius,
  TURN,
} from "../../../../../packages/render/src/magnet.js";
import { pole, slab } from "../../../../../packages/render/src/magnet-coil.js";
import { lanes } from "../../../../../packages/render/src/magnet-lanes.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import { magnetPoleColor } from "../../../../../packages/sim/src/magnet.js";

/**
 * YAW, drawn: the horseshoe turns on its staff, and its sides come into view.
 *
 * The shipped body hangs and never turns. This one swings slowly about the
 * staff it hangs from — under a third of a right angle each way on the pose
 * clock — and the picture does the two things a real turn does and a lean
 * cannot. The front faces narrow, which is the pose (`scale(cos yaw, 1)`),
 * and on the side swinging *toward* the viewer the body's **sides** appear:
 * the plate's edge, the staff's flank, the arch's outer wall, the pole tip's
 * end — a darker copy of every path offset in the direction the turn
 * uncovers, wider as the turn deepens and gone when it comes back through
 * square. That is a thing coming out from behind, which `docs/dimensional.md`
 * calls the one cue that is a difference in kind: the width goes through two
 * cycles for every one the sides go through, and going away is not the
 * mirror of coming toward, because the side that shows is a different side.
 *
 * The turn is small on purpose. The rule says the left pole is the authored
 * colour and the right its opposite, and that has to stay true of the
 * picture: at the widest yaw here the left is still plainly the left.
 *
 * The lanes are drawn level and unturned, before any of this: they are the
 * bolt's path and a path does not turn because the body it arrives at is
 * turning. The key light, the plate, the poles and the paths are the shipped
 * ones called as they are.
 */

/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";

/** How far the body turns each way, in radians, over how many beats, and how
 * far apart two bodies are held in that turn. Not a multiple of the hang's
 * beats, so the two never come back into step. */
const YAW = 0.5;
const YAW_BEATS = 4.3;
const YAW_SPREAD = 0.29;

/** How thick the body is, front to back, in body radii: what the sides show at
 * the widest yaw is this times the sine of it. */
const DEPTH = 0.48;

/** How much darker a side is than the face beside it. */
const SIDE_DARK = 0.55;

/** How far the body has turned this instant, in radians. */
function yawAt(id: number, beats: number): number {
  return Math.sin((beats / YAW_BEATS + id * YAW_SPREAD) * TURN) * YAW;
}

/** Every side face at once: the paths again, narrowed with the front and
 * pushed out on the side the turn is uncovering, in a darker grey — and the
 * pole tips' sides in their own darker colour. Drawn before the front faces,
 * which cover all but the strip that reads as a side. */
function sides(
  d: MagnetDraw,
  r: number,
  s: MagnetShape,
  yaw: number,
  haze: (h: string) => string,
): void {
  const { ctx, c } = d;
  const shift = -r * DEPTH * Math.sin(yaw);
  if (Math.abs(shift) < 0.25) return;
  ctx.save();
  ctx.translate(shift, 0);
  ctx.scale(Math.cos(yaw), 1);
  ctx.fillStyle = haze(mixHex(PALETTE.rockDark, SHADOW, SIDE_DARK));
  ctx.fill(magnetPlatePath(r, s));
  ctx.fill(magnetArchPath(r, s));
  for (const left of [true, false]) {
    const color = magnetPoleColor(c, left);
    if (color === null) continue;
    ctx.fillStyle = haze(mixHex(color === "red" ? PALETTE.red : PALETTE.cyan, SHADOW, SIDE_DARK));
    ctx.fill(magnetPolePath(r, left, s));
  }
  ctx.restore();
}

/** The arch's front face: `coil`'s fill and key, without its bevel — a bevel
 * on a face that has a side beside it is two edges arguing. */
function face(
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
  litRound(ctx, 0, 0, r, "value", spin);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = haze(PALETTE.dim);
  ctx.stroke(path);
}

export function yawing(d: MagnetDraw): void {
  const { ctx, l, cfg, c, x, y, beats, struck, near } = d;
  const s = MAGNET_SHAPE;
  const r = magnetRadius(l, c);
  const haze = (h: string): string => hazed(cfg, h, near);
  const spin = magnetHang(c, beats);
  const yaw = yawAt(c.id, beats);

  ctx.save();
  ctx.translate(x, y);
  lanes(d, r, s, haze);
  ctx.rotate(spin);
  sides(d, r, s, yaw, haze);
  // The front faces, narrowed: the pose half of the turn.
  ctx.scale(Math.cos(yaw), 1);
  slab(d, r, s, struck, haze);
  face(ctx, r, s, haze, spin);
  pole(d, r, s, true, haze);
  pole(d, r, s, false, haze);
  ctx.restore();
}
