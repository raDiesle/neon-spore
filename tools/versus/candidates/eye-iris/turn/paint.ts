import { facet, KEY, pin, surfaceDim } from "../../../../../packages/content/src/index.js";
import { drawIrisMarks, type IrisDraw } from "../../../../../packages/render/src/eye-iris.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * The paint TURN is made of.
 *
 * Nothing here draws an iris: `drawIrisMarks` is the shipped assembly, called
 * so the ring, the spokes and the hole are the same six spokes at the same
 * weight turning at the same rate. What this file adds is **where they are** —
 * a place on a ball rather than the middle of a picture — and the light that
 * does not go with them.
 *
 * The projection is `surface.ts`'s, called and never written out: `pin` once
 * for the iris's home on the sphere, `facet` per frame for where it lands, how
 * far it is foreshortened and how much light it takes.
 */

/** How far the eye looks either side of straight ahead, in radians. Two thirds
 * of a right angle: far enough that the disc is squashed to under half its
 * width at the extremes, and short of the limb, where an iris would vanish and
 * the body would read as blind rather than as looking away. */
const SWEEP = 1.05;

/** Turns of the sweep per beat. Slower than the spokes by a long way — the
 * spokes are a mechanism idling and this is the thing *looking*, and a body
 * that scanned as fast as its own machinery turns would read as twitching. */
const RATE = 0.09;

/** How far out on the ball the iris sits, as a share of the aperture's own
 * half-width. Under one, because an eye's iris is a disc on a sphere rather
 * than a cap over its pole — at the ends of the sweep it has to still be
 * inside the lids the reading is taken off. */
const TRAVEL = 0.5;

/** What the iris keeps of its colour where it has turned furthest from the
 * light. Not zero: a mark that reaches nothing at the terminator reads as a
 * hole rather than as a thing on a surface (`surfaceDim`). */
const DIM = 0.55;

/** The catchlight: where it sits as a share of the aperture's half-width, how
 * wide it is, and how bright. It is the whole argument in three numbers — a
 * wet film has one bright point, it is where the light is, and it does not
 * move when the eye does. */
const WET_AT = 0.42;
const WET_R = 0.3;
const WET = 0.55;

/** The iris's home on the ball: straight ahead, on the equator. An eye looks
 * side to side far more than up and down, and a latitude of nought is what
 * keeps the disc off the poles, where `LAT_LIMIT` says a mark is a hairline
 * whatever the rotation does. */
const HOME = pin(0, 0, 1);

export function turn(d: IrisDraw): void {
  const { ctx, cx, cy, pr, reach, ink, openness, t } = d;
  if (pr <= 0 || openness <= 0) return;

  // Where it is looking this instant. On the **beat** clock, like everything
  // else inside an eye, so two phones draw one picture.
  const theta = SWEEP * Math.sin(t * RATE * Math.PI * 2);
  const f = facet(HOME, theta);
  const travel = reach * TRAVEL;

  ctx.save();
  // The iris rides the surface: `x` is the sphere's own arithmetic and never a
  // fraction of the angle, and `scale(sx, sy)` is the tangent plane's own map —
  // which is why the disc squashes to an ellipse toward the edge rather than
  // shrinking, and why the spokes squash with it instead of being redrawn
  // shorter.
  ctx.translate(cx + f.x * travel, cy + f.y * travel);
  ctx.scale(f.sx, f.sy);
  ctx.globalAlpha = surfaceDim(DIM, f.lit);
  drawIrisMarks(ctx, 0, 0, pr, ink, openness, t);
  ctx.restore();

  // **And the wet, which stays where the light is.** It is drawn after the
  // iris and outside its transform, so as the eye looks left and right the
  // highlight sits still and the iris travels under it. That contrast — a mark
  // that moves against a mark that does not — is the whole of the claim, and
  // it is the cue `docs/dimensional.md` calls the cheapest solid-looking thing
  // there is.
  const wx = cx + KEY.x * reach * WET_AT;
  const wy = cy + KEY.y * reach * WET_AT;
  const wet = ctx.createRadialGradient(wx, wy, 0, wx, wy, reach * WET_R);
  wet.addColorStop(0, rgba(PALETTE.text, WET * openness));
  wet.addColorStop(1, rgba(PALETTE.text, 0));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = wet;
  ctx.fillRect(cx - reach, cy - reach, reach * 2, reach * 2);
  ctx.restore();
}
