import { haloSprite, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { litRound } from "./key-light.js";

/**
 * What a living body is *made of*, as a record rather than as three lines in
 * the middle of `drawLiving`.
 *
 * Every blob in this game — slick, bulb, throb, dart, wisp, choir, and every
 * lure wearing one of them — is made of the same material, and until this file
 * that material was written inline in the middle of `drawLiving` with nowhere
 * for a second answer to sit. It is a record for `WARD_LOOK`'s reason and
 * `METEOR_LOOK`'s: the bodies the pair spends the whole game looking at had
 * exactly one skin and no way to offer another beside it at twenty-six pixels
 * and at tempo, which is what `docs/versus.md` exists to fix.
 *
 * **What that material is changed on 8 September 2026.** It was `neon`: the
 * body's own deep, filled flat, and a glowing rim in its own colour. The deep
 * is very nearly the background — `redDark` is `#190F2C` against a `#07060F`
 * field — so a creature was, materially, a hole in space with a neon line
 * round the edge of it. `lit` below is the answer the owner picked off the
 * VERSUS page, and it argues the hole should be a **solid**. Four clauses, in
 * the order they are painted: flesh carried a little under half way from the
 * deep toward the body's own hue, so there is something for a light to act on;
 * a rim *inside* the contour, drawn before the light so the far half of it is
 * taken back down; the shipped key light over both, with the transform's own
 * rotation undone; and a sheen in the body's own hue and never in white.
 *
 * The neon edge is untouched, because it is the identity of the whole game and
 * the one thing on this body that is *state* rather than material — a body
 * shot in the wrong colour is a grey outline, and that branch of `drawLiving`
 * never reaches this file at all.
 *
 * `veil`, the other answer, is still on VERSUS beside it
 * (`tools/versus/candidates/creature-skin/veil`): it keeps the deep and gives
 * the membrane a wall instead. One adds mass, the other adds a wall, and the
 * pair is still worth having now that one of them ships.
 *
 * The rim is *not* passed to `neon`, and that is deliberate rather than an
 * oversight: the shipped skin lights its edge in `hex` and keeps `rim` for the
 * interior marks `creature-detail.ts` draws. A candidate skin may want it, so
 * it is on `BodyPaint`; the shipped one does not use it.
 */
export interface BodyPaint {
  /** The body's three colours, already hazed for its distance. */
  readonly hex: string;
  readonly rim: string;
  readonly dark: string;
  /** Body radius in screen pixels, before the contour transform. */
  readonly r: number;
  /** The scale that transform carries, so a line width can be undone by it. */
  readonly scale: number;
  /** The contour's own half-extents, for anything placed on the surface. */
  readonly rx: number;
  readonly ry: number;
  /**
   * The rotation the transform already carries — a throb's turn, a dart's
   * lean, an own-motion's roll.
   *
   * The shipped skin has no use for it and every candidate skin with a light
   * in it does: `KEY` is a direction in the *field*, and a gradient laid out
   * in body space turns with the body, which is a light glued to a spinning
   * rock. Undo it with this. It is on the record rather than left for a
   * candidate to guess, because guessing it is the defect.
   */
  readonly rot: number;
}

export interface LivingSkin {
  paint(ctx: CanvasRenderingContext2D, path: Path2D, rule: CanvasFillRule, p: BodyPaint): void;
}

/** How far the flesh is carried from the deep toward the body's own colour.
 * The whole look turns on this number: at 0 it is the old skin with an unlit
 * gradient over it, and past about a half the body stops being a silhouette
 * and starts being a lamp. */
const FLESH = 0.42;

/** The inner rim, as a share of the contour's own reach, and how much of the
 * pale rim colour it carries. Drawn **before** the light, so the far half of
 * it is taken back down — a bevel painted after the ramp is a bright ring on a
 * dark side, which is the one thing that reads as a sticker. */
const BEVEL = 0.15;
const BEVEL_ALPHA = 0.32;

/** The sheen: a soft light gathered under the lit shoulder, in the body's own
 * hue rather than in white, because a creature takes no `lift` — brightening
 * moves a red body a measurable distance toward cyan (`key-light.ts`).
 *
 * It is the baked halo sprite and not a `createRadialGradient`, and on this
 * surface that is not a detail: this function runs once per body per frame, and
 * THE ECHO puts fifteen bodies on one field. Fifteen gradients built and thrown
 * away every frame is the shape of every performance complaint in this
 * repository; `haloSprite` is cached on colour and radius (`glow.ts`) and the
 * radius here is a fixed multiple of a body's own. */
const SHEEN_ALPHA = 0.2;
/** Where the sheen sits above the centre and how wide it spreads, both as
 * shares of the contour's reach. */
const SHEEN_UP = 0.34;
const SHEEN_WIDE = 0.8;

/**
 * The shipped skin: flesh, a bevel inside the contour, the key light over
 * both, a sheen in the body's own hue, and the neon edge unchanged.
 *
 * Nothing here decides where the light is. `litRound` is the shipped ramp at
 * the shipped `KEY`, called the way `meteor-look.ts` calls it — which material
 * a body is made of is a look, and where the sun is, is not.
 */
function lit(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  rule: CanvasFillRule,
  p: BodyPaint,
): void {
  const reach = Math.max(p.rx, p.ry);

  // The flesh. A body has to have a body before it can have a terminator on
  // it, and the deep is very nearly the field behind it.
  ctx.fillStyle = mixHex(p.dark, p.hex, FLESH);
  ctx.fill(path, rule);

  ctx.save();
  ctx.clip(path, rule);
  ctx.strokeStyle = p.rim;
  ctx.globalAlpha = BEVEL_ALPHA;
  ctx.lineWidth = reach * BEVEL;
  ctx.stroke(path);
  ctx.globalAlpha = 1;

  // The key light, undone by the rotation the transform already carries, so a
  // throb's turn and a dart's lean move the body under a light that stays
  // where it is.
  litRound(ctx, 0, 0, reach, "value", p.rot);

  // The sheen goes on after the ramp: it is light *coming off* the surface,
  // and a ramp over it would be the surface shading its own highlight. Still
  // inside the clip, so it lands on the body and nowhere else.
  const sprite = haloSprite(p.hex, Math.max(2, Math.round(reach * SHEEN_WIDE)));
  ctx.globalAlpha = SHEEN_ALPHA;
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(sprite, -sprite.width / 2, -reach * SHEEN_UP - sprite.height / 2);
  ctx.restore();

  // The neon edge. The line weight is a tenth of the body radius with a
  // one-pixel floor, divided by the scale because the contour is drawn in the
  // silhouette's units and a stroke must not grow with the body.
  strokeGlow(ctx, path, p.hex, Math.max(1, p.r * 0.1) / p.scale, 1);
}

/** The one record a candidate skin patches. */
export const LIVING_SKIN: LivingSkin = { paint: lit };
