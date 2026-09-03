import { blobPath } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { STROKE } from "./palette.js";

/**
 * The surface in the middle of THE GYRE's wheel: the organelle the whole
 * mechanism is built around.
 *
 * **A wheel needs a middle.** Every other armature in this game hangs off
 * something with a body in it — the queen has a figure, the warden has an eye —
 * and a hub drawn as a ring on a stick is the one part of a wheel that looks
 * like scaffolding rather than like an animal. So the middle is a filled thing:
 * a lobed contour with fluid inside it, which is the same closed-contour-with-
 * lobes vocabulary as every creature on the field (CLAUDE.md) rather than a
 * second idiom.
 *
 * **Not a flower and not a turbine.** Both are shapes made of repeated blades,
 * and a blade points at something — six of them around a hub would be six more
 * spokes arguing with the six that are already there, and a turn would read as
 * the blades chopping rather than the wheel turning. What is here instead is one
 * skin with fluid under it: the contour breathes, the light inside swims round
 * at the rate the wheel is actually turning, and the only hard edge is the
 * nucleus at the very centre.
 *
 * **It is the one part of the wheel that moves continuously.** The rim ratchets,
 * because six bodies stand on tiles (`gyre-place.ts`); nothing stands on the
 * core, so it is free to turn at the true rate — and that makes it the readout
 * for the maw. A pair who cannot tell whether the pull worked can look at the
 * middle of the wheel and see the swim slow to a crawl.
 */

/** Lobes on the skin. Four: three reads as a rounded triangle, which is a shape
 * with a direction in it, and this one must not point anywhere (see above). */
const LOBES = 4;

/** How deep those lobes cut, and how much the skin wanders on top of them. Both
 * from the living bodies' own range, so the middle of a wheel is the same kind
 * of surface as the things bolted round it. */
const LOBE_DEPTH = 0.11;
const SKIN_WOBBLE = 0.055;

/** Points on the contour. Fewer than a body's 40: it is drawn at a fraction of
 * the size and this is a per-frame path with no cache behind it. */
const SKIN_POINTS = 26;

/** How much of the core the fluid inside fills, and where the nucleus sits.
 * Fractions of the skin's own radius rather than of the tile, so the whole
 * organelle scales as one thing. */
const FLUID = 0.94;
const IRIS = 0.44;
const NUCLEUS = 0.19;

/**
 * The core of one wheel. `tint` and `rim` are the wheel's two neon colours,
 * already hazed for the row it is standing on, and `pull` is 0..1 — the same
 * number the rim and the wind brighten with, so the three ends of one pull
 * cannot light on different frames.
 */
export function drawGyreCore(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  tint: string,
  rim: string,
  flow: number,
  time: number,
  pull: number,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // The aura, first and widest. It is what makes the middle read as lit from
  // inside rather than as a disc laid on the field.
  halo(ctx, x, y, r * (2.4 + pull * 0.9), tint, 0.13 + 0.16 * pull);

  // Everything below is drawn in the organelle's own frame, turned by the
  // wheel's true rate. That is what makes it *fluid* rather than a lamp: the
  // highlight sits off to one side of the skin and is carried round by the same
  // rotation the skin is, so one transform turns the whole surface and there is
  // no second copy of the angle to drift.
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(flow);

  const skin = new Path2D(
    blobPath(0, 0, r, r, LOBES, LOBE_DEPTH, SKIN_WOBBLE, time, 17, SKIN_POINTS),
  );

  // The fluid, **filled into the skin** rather than into a circle behind it. A
  // gradient disc under a contour is a lamp with a lid on; the same gradient
  // clipped to the contour is the thing having an inside.
  const swim = r * 0.34;
  const grad = ctx.createRadialGradient(swim, -swim * 0.6, 0, 0, 0, r * FLUID);
  // The pale end is a *sliver* and the violet is most of it. Additive
  // compositing stacks the aura, the fluid and the nucleus on the same pixels,
  // and a pale centre over any width of the surface takes all three to white —
  // a wheel with a headlight in it rather than an organelle.
  grad.addColorStop(0, `${rim}60`);
  grad.addColorStop(0.25, `${tint}E0`);
  grad.addColorStop(0.75, `${tint}80`);
  grad.addColorStop(1, `${tint}20`);
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.9 + 0.1 * pull;
  ctx.fill(skin);

  // A ring inside it, going the other way. The one counter-motion on the whole
  // wheel, and it is here rather than out at the rim for the reason the shine
  // used to be: a light travelling where the bodies are would be read as a body.
  ctx.globalAlpha = 0.5 + 0.3 * pull;
  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.inner;
  ctx.setLineDash([r * 0.36, r * 0.28]);
  ctx.lineDashOffset = -flow * r * 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, r * IRIS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // And the skin over its own contents — in the wheel's colour, not the pale
  // one. A white edge round a violet surface is a sticker; the edge has to be
  // the same substance as what is under it, only brighter.
  ctx.globalAlpha = 0.9;
  strokeGlow(ctx, skin, tint, STROKE.inner, 1.4 + pull);
  ctx.restore();

  // The nucleus: the one hard edge on the organelle, and the thing an eye lands
  // on when it looks for the middle of a wheel.
  ctx.globalAlpha = 1;
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(x, y, r * NUCLEUS * (1 + 0.08 * Math.sin(time * 2.2)), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
