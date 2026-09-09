import { blobPath, facet, LAT_LIMIT, pin, surfaceDim, surfaceLit } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import type { GyreCoreDraw } from "./gyre-look.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

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
 * **The skin turns; the light does not.** The mass inside is shaded in a frame
 * the turn has been taken out of, so the granules suspended in it cross a
 * specular that stays upper-left rather than carrying one round with them
 * (`docs/style-guide.md`, Depth).
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

/**
 * The organelle's own contour, about the origin and **not** turned — the caller
 * turns it, because the turn is what the surface is doing and a path carries no
 * transform.
 *
 * Exported so anything arguing about what is *inside* the membrane — the paint
 * below, and a candidate organelle in `tools/versus` — carries no second copy
 * of the four numbers that make the membrane: a lobe count re-typed elsewhere
 * is a second question smuggled into the first, and the sweep in
 * `packages/sim/test/purity.test.ts` says so.
 */
export function gyreSkinPath(r: number, time: number): Path2D {
  return new Path2D(blobPath(0, 0, r, r, LOBES, LOBE_DEPTH, SKIN_WOBBLE, time, 17, SKIN_POINTS));
}

/** How much of the membrane the mass inside fills, and the nucleus's own size.
 * Fractions of the organelle's radius, so the whole thing scales as one
 * object. The **contour is not here at all**: `gyreSkinPath` is called above. */
const YOLK = 0.9;
const NUCLEUS = 0.19;

/** How many granules are suspended in the mass, and how far out they sit.
 * Nine: enough that four or five are on the near side at any turn, few enough
 * that at the twenty-odd pixels a core draws at they are marks rather than a
 * texture. */
const GRAINS = 9;
const REACH = 0.58;

/** What a granule keeps where the surface has turned away from the light.
 * Generous, because the mass is *lit from inside* as well as from the key —
 * a granule that went black would read as a hole in an organelle. */
const GRAIN_FLOOR = 0.42;

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PINS = Array.from({ length: GRAINS }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 1.9) * LAT_LIMIT * 0.66, REACH),
);

/** How many stops the membrane's rim is walked in. Nine, for
 * `docs/style-guide.md`'s reason: three make a ramp and a ramp reads as a
 * gradient. */
const STOPS = 9;

/**
 * The core of one wheel: a ball with things suspended in it.
 *
 * `tint` and `rim` are the wheel's two neon colours, already hazed for the row
 * it is standing on, and `pull` is 0..1 — the same number the rim and the wind
 * brighten with, so the three ends of one pull cannot light on different
 * frames. It takes a record rather than nine positional arguments because it is
 * the field on `GYRE_LOOK` a candidate organelle is patched onto
 * (`gyre-look.ts`).
 *
 * It was a radial gradient built inside a frame turned by `flow`, so the pale
 * sliver was glued to the membrane and travelled with it — a lit surface that
 * turns with its light is a painted stone. The owner took YOLK out of VERSUS
 * on 9 September 2026 and this is it: the contour is turned and the shading is
 * not, so the granules cross a highlight that stays where it is.
 *
 * Three passes and the order matters: the aura under everything, the mass with
 * its granules riding round inside it, and the membrane over its own contents.
 * The nucleus is last and is the only thing drawn in the pale colour.
 */
export function drawGyreCore(d: GyreCoreDraw): void {
  const { ctx, x, y, r, tint, rim, flow, time, pull } = d;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // The aura, first and widest — the shipped pass, unchanged. It is what makes
  // the middle read as lit from inside rather than as a disc laid on the field,
  // and it is not what this candidate is arguing about.
  halo(ctx, x, y, r * (2.4 + pull * 0.9), tint, 0.13 + 0.16 * pull);

  ctx.save();
  ctx.translate(x, y);

  // **The skin turns; the light does not.** The shipped organelle rotates the
  // whole frame by `flow` and builds its fluid gradient inside it, so the pale
  // sliver is glued to the membrane and travels with it — a lit surface that
  // turns with its light is a painted stone, whatever else is right about it
  // (`docs/style-guide.md`, Depth). Here the contour is turned and the shading
  // is not, so the granules cross a highlight that stays where it is.
  const skin = gyreSkinPath(r, time);

  // The turn is taken for the *clip* and put straight back for the shading. A
  // clip is fixed in device space the moment it is taken, so the membrane can
  // be turned by `flow` while everything painted inside it is drawn in a frame
  // the turn has been taken out of — which is the whole two-step this candidate
  // is.
  ctx.save();
  ctx.rotate(flow);
  ctx.clip(skin);
  ctx.rotate(-flow);

  // The mass: a value ramp across the ball read off `surfaceLit` at the
  // longitude the surface is pointing in, rather than a radial gradient with a
  // bright spot in it. A cosine with a terminator is what makes a ball read as
  // a ball; a radial disc reads as a lamp seen head-on from any angle.
  const mass = ctx.createLinearGradient(-r, -r * 0.6, r, r * 0.6);
  for (let i = 0; i < STOPS; i++) {
    const u = i / (STOPS - 1);
    const lon = -1.2 + 2.4 * u;
    const k = surfaceDim(0.12, surfaceLit(1, 0, Math.sin(lon), Math.cos(lon)));
    mass.addColorStop(u, rgba(tint, (0.2 + 0.8 * k) * (0.9 + 0.1 * pull)));
  }
  ctx.fillStyle = mass;
  ctx.beginPath();
  ctx.arc(0, 0, r * YOLK, 0, Math.PI * 2);
  ctx.fill();

  // The granules, placed and carried round by the wheel's own true rate — the
  // same `flow` the skin is turned by, so the inside and the outside of the
  // organelle are one object turning rather than two things moving. Each is
  // drawn about its own origin and foreshortened by the tangent plane's map, so
  // one going round the limb narrows to nothing instead of being clipped by an
  // edge; the ones at the back come into view, which is the reveal no pose can
  // produce at any setting.
  for (const p of PINS) {
    const f = facet(p, flow);
    if (!f.near) continue;
    ctx.save();
    ctx.translate(f.x * r, f.y * r);
    ctx.scale(f.sx, f.sy);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.19, 0, Math.PI * 2);
    ctx.fillStyle = rgba(rim, 0.42 * surfaceDim(GRAIN_FLOOR, f.lit));
    ctx.fill();
    ctx.restore();
  }

  // The one specular, upper left and stationary. It is the half of the pair
  // that no amount of turning supplies and the half without which all that
  // turning is a coin: `KEY` is a constant and never a parameter.
  ctx.beginPath();
  ctx.ellipse(-r * 0.34, -r * 0.34, r * 0.24, r * 0.17, -0.79, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.22);
  ctx.fill();
  ctx.restore();

  // The membrane over its own contents, back in the turned frame and in the
  // wheel's colour rather than the pale one — the shipped organelle's rule, and its reason: a white edge round
  // a violet surface is a sticker, and the edge has to be the same substance as
  // what is under it, only brighter.
  ctx.globalAlpha = 0.9;
  ctx.rotate(flow);
  strokeGlow(ctx, skin, tint, STROKE.inner, 1.4 + pull);
  ctx.restore();

  // The nucleus: the one hard edge on the organelle, and the thing an eye lands
  // on when it looks for the middle of a wheel. It sits a little off centre
  // toward the light, which is what a solid thing inside a translucent one
  // looks like when it is nearer the viewer than the far wall.
  ctx.globalAlpha = 1;
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(
    x - r * 0.06,
    y - r * 0.06,
    r * NUCLEUS * (1 + 0.08 * Math.sin(time * 2.2)),
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.restore();
}
