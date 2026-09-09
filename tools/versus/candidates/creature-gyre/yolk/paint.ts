import {
  facet,
  LAT_LIMIT,
  type Pin,
  pin,
  surfaceDim,
  surfaceLit,
} from "../../../../../packages/content/src/surface.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { gyreSkinPath } from "../../../../../packages/render/src/gyre-core.js";
import type { GyreCoreDraw } from "../../../../../packages/render/src/gyre-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * The paint YOLK is made of, kept out of `index.ts` so that file stays the
 * argument for the candidate rather than a wall of canvas calls.
 *
 * Nothing here caches a frame: a candidate lives inside two renderers stepping
 * one world, so a module-level canvas would be state shared between the two
 * sides of the pair — the one thing the pair promises it does not have.
 */

/** How much of the membrane the mass inside fills, and the nucleus's own size.
 * Fractions of the organelle's radius, so the whole thing scales as one
 * object. The **contour is not here at all**: `gyreSkinPath` is called, because
 * this candidate argues about what is inside the membrane and a differently
 * lobed skin would be a second question smuggled into the first. */
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
const PINS: Pin[] = Array.from({ length: GRAINS }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 1.9) * LAT_LIMIT * 0.66, REACH),
);

/** How many stops the membrane's rim is walked in. Nine, for
 * `docs/style-guide.md`'s reason: three make a ramp and a ramp reads as a
 * gradient. */
const STOPS = 9;

/**
 * The organelle as a ball with things suspended in it.
 *
 * Three passes and the order matters: the aura under everything, the mass with
 * its granules riding round inside it, and the membrane over its own contents.
 * The nucleus is last and is the only thing drawn in the pale colour.
 */
export function yolk(d: GyreCoreDraw): void {
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
