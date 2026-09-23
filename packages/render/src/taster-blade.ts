import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";
import { paintSteel, paintUnset } from "./taster-flesh.js";

/**
 * **One blade of THE TASTER's fan**, as a shape and as a paint.
 *
 * Split out of `taster-draw.ts` because the fan is eleven of these and the
 * next door file's job is *the crest and which blade is where*: the geometry
 * of a whetted sliver, and the four things one can be wearing, are one
 * subject and they are this one.
 *
 * **A blade is a knife and it is drawn like one.** Metal, not membrane —
 * everything else hanging over this field is a sack, a sheet or a lobe, and
 * this boss is the one whose health is edged. So the body is `rockDark`
 * steel, lit and ground (`taster-flesh.ts`), and the **only** colour on it is
 * the edge: a lit
 * rim down the leading side in the ammunition colour it grew toward, which is
 * the one colour that cannot break it (`sim/taster.ts`). A blade filled in its
 * colour would say *shoot me with this*, which is the flat opposite of the
 * rule, and it is the one thing this picture must not say.
 *
 * **Thickness is a second rim, not a fatter line.** A blade the pair fed its
 * own colour to takes two shots, and it says so with a second edge line inside
 * the first — the style guide's rule about glow coming from an aura rather
 * than from weight, said about a blade that is literally thicker.
 */

/** Half the width of a blade's base, in tiles. */
const BASE = 0.3;
/** A blade at full growth, in tiles. The space over row 0 is about one deep. */
export const BLADE_TILES = 0.92;

/** The two hexes a blade's edge is drawn with, or grey while it has none. */
export function edgeHex(color: Color | null): { rim: string; lit: string } {
  if (color === "red") return { rim: PALETTE.redRim, lit: PALETTE.red };
  if (color === "cyan") return { rim: PALETTE.cyanRim, lit: PALETTE.cyan };
  return { rim: PALETTE.rock, lit: PALETTE.dim };
}

/**
 * The sliver, standing on `(x, y)` and reaching `h` pixels up.
 *
 * `lean` slides the tip sideways in pixels, which is the whole of how this
 * picture says *closed* and *out*: the interlock is the last blades leaning
 * across each other over the body, and the end is the fan opening outward. A
 * rotation would have been the other way to do it and would have needed a
 * transform per blade; a tip that moves is one number and reads the same.
 *
 * The leading side bows out and the trailing side in, so the shape is a
 * whetted curve rather than a triangle — a blade has a belly.
 */
export function bladePath(x: number, y: number, tile: number, h: number, lean: number): Path2D {
  const w = tile * BASE;
  const tipX = x + lean;
  const p = new Path2D();
  p.moveTo(x - w, y);
  p.quadraticCurveTo(x - w * 0.8, y - h * 0.55, tipX, y - h);
  p.quadraticCurveTo(x + w * 0.5, y - h * 0.4, x + w, y);
  p.closePath();
  return p;
}

/** The lit edge alone: the leading side of the same sliver, as a line. */
function edgePath(
  x: number,
  y: number,
  tile: number,
  h: number,
  lean: number,
  inset: number,
): Path2D {
  const w = tile * BASE * (1 - inset);
  const p = new Path2D();
  p.moveTo(x - w, y - h * inset * 0.5);
  p.quadraticCurveTo(x - w * 0.8, y - h * 0.55, x + lean, y - h * (1 - inset * 0.3));
  return p;
}

/** What a blade is wearing this frame. */
export interface BladeLook {
  /** Its edge colour, or `null` while it is still growing and has none. */
  color: Color | null;
  /** 0..1 of full height: a growing blade is still coming out of the crest. */
  grown: number;
  /** Shots of the other colour it still takes; 1 ordinarily, more if thickened. */
  layers: number;
  /** Pixels the tip is slid sideways — the interlock, and the fan opening. */
  lean: number;
  /** 0..1, the whole blade's fade: the last beats after the beam. */
  alpha: number;
  /** A second edge in the other colour: the interlock, edged in both at once. */
  both?: Color;
}

/**
 * Paint one blade.
 *
 * A growing blade is the same shape short and colourless, breathing — it is
 * the four beats of warning the design owes the pair before a colour is
 * decided, so it has to be visible as *not decided yet* rather than as a
 * small blade.
 */
export function drawBlade(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  look: BladeLook,
  /** Wall-clock seconds, for the growing blade's shimmer alone. */
  time: number,
): void {
  const h = tile * BLADE_TILES * Math.max(0.15, look.grown);
  if (h <= 0 || look.alpha <= 0) return;
  const body = bladePath(x, y, tile, h, look.lean);
  const hex = edgeHex(look.color);

  ctx.save();
  ctx.globalAlpha = look.alpha * (look.color === null ? 0.28 : 0.55);
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(body);
  ctx.restore();

  if (look.color === null) {
    // Colourless, a light moving up through it: the pair can see it standing
    // there and cannot yet say a word about it. The grey rather than the
    // steel, for the reason the edge below is saturated: nothing on this crest
    // may read as an edge until it is one.
    paintUnset(ctx, body, y, h, look.alpha, (time * 0.5 + x * 0.013) % 1);
    return;
  }

  paintSteel(
    ctx,
    body,
    edgePath(x, y, tile, h, look.lean, 0.45),
    x,
    y,
    h,
    look.lean,
    tile,
    look.alpha,
  );
  // The edge itself, once for the shot it takes and again inside for the one
  // its own colour bought it.
  //
  // **The saturated hue and not the rim.** `cyanRim` is a near-white and so
  // is the `rock` a blade's body is stroked in, so a cyan edge drawn in it was
  // a blade the pair could not tell from one that had not decided — seen in
  // the first frame of the fight. The rim goes on inside as a highlight, which
  // is where a whetted edge has one anyway.
  for (let k = 0; k < look.layers; k++) {
    const edge = edgePath(x, y, tile, h, look.lean, k * 0.34);
    strokeGlow(ctx, edge, hex.lit, STROKE.outline, 0.9 - k * 0.25, look.alpha);
    strokeGlow(ctx, edge, hex.rim, STROKE.inner, 0.5 - k * 0.2, look.alpha);
  }
  if (look.both !== undefined) {
    // Interlocked: the trailing side carries the other colour, so no single
    // bolt is the right one and the shape says it before the bolt is fired.
    const other = edgeHex(look.both);
    const back = new Path2D();
    back.moveTo(x + tile * BASE, y);
    back.quadraticCurveTo(x + tile * BASE * 0.5, y - h * 0.4, x + look.lean, y - h);
    strokeGlow(ctx, back, other.lit, STROKE.outline, 0.85, look.alpha);
    strokeGlow(ctx, back, other.rim, STROKE.inner, 0.45, look.alpha);
  }
}
