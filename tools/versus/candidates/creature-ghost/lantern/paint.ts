import { GHOST } from "../../../../../packages/content/src/ghost-shape.js";
import { KEY } from "../../../../../packages/content/src/light.js";
import { facet, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { GHOST_SPIN } from "../../../../../packages/render/src/ghost-latitude.js";
import type { InteriorDraw } from "../../../../../packages/render/src/ghost-look.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";

/**
 * LANTERN — the dome is a ball with a light on it, and the nebula inside is a
 * *place* on that ball rather than the middle of the picture.
 *
 * The shipped interior is one radial gradient centred a little below the
 * middle: the colour wells up from the centre and goes dark at the rim, the
 * same from every side, and nothing about it says which way the light is. It
 * is a good nebula and a flat one — a disc with a bright middle, which is what
 * a body drawn under no light looks like.
 *
 * This puts `KEY` on it. Four things, in the order `.claude/skills/depth`
 * names them and with the one it leaves out said below:
 *
 * - **the terminator** — the gradient's centre is pulled up and to the left,
 *   toward the light, so the colour is fullest where the ball faces the key
 *   and falls to the field's own dark on the side that faces away;
 * - **the contact shadow** — a stop near the end of that ramp darker than the
 *   dark it ships with, so the far rim is the deepest thing on the body;
 * - **the rim light** — a thin band of the rim colour just inside the far
 *   edge, drawn as the contour stroked once, shifted toward the shadow and
 *   clipped, which is how a stroke lands only along the side away from the
 *   light. A ball with light bouncing back onto its dark limb is the cue the
 *   eye trusts most that the thing is round;
 * - **the core** — the nebula's heart, pinned to a longitude and a latitude
 *   and carried round by the same slow turn the camouflage turns on
 *   (`GHOST_SPIN`). It is brightest facing us, foreshortens as it goes toward
 *   the limb and is drawn faintly *through* the body when it is behind, so
 *   over nine seconds it goes round the back and comes out the other side —
 *   the reveal, the one cue a pose cannot fake.
 *
 * The specular is the one zone left out on purpose: a ghost is its own light
 * and a hard white glint on it would read as a reflection of something,
 * which on this field there is nothing to be.
 *
 * **How it can lose.** *It is a ball and not a ghost.* The shipped nebula is
 * shapeless on purpose — a thing that is not quite there — and a body with a
 * clear lit side and a clear dark side is very much there. At 26 px the
 * whole ramp is a dozen pixels wide and the rim light is one, so judge it on
 * the small frame before the large one.
 */

/** How far toward the key the gradient's centre is pulled, in body radii. */
const OFFSET = 0.36;

/** How wide the far-rim band is, as a share of the half-width, and how far
 * toward the shadow the contour is shifted to land it there. The shift is
 * more than half the width on purpose: the body's own outline is stroked over
 * the contour afterwards (`ghost.ts`), and a band centred on the edge was
 * under it and gone. */
const RIM_WIDTH = 0.16;
const RIM_SHIFT = 0.22;

/** Where down the body the band has faded to nothing, as a share of the
 * half-height from the middle: above the hem, which is not part of the ball. */
const HEM_FADE = 0.55;

/** What the core keeps of its light in full shadow, and what it keeps when
 * it is behind the body altogether — well above nothing, so the far side of
 * the turn is a heart seen through a skin and not a heart switched off. */
const CORE_DIM = 0.45;
const CORE_BEHIND = 0.18;

/** The core's reach, as a share of the half-width. Rounded once in body
 * units, so `halo`'s cache holds one sprite of it per colour. */
const CORE_RADIUS = Math.round(GHOST.rx * 0.9);
const CORE_HEART = Math.round(CORE_RADIUS * 0.45);

/** The heart of the nebula: a little below the middle of the ball, where the
 * shipped gradient put its centre, and at longitude nought so the first frame
 * is the shipped picture lit. */
const CORE = pin(0, 0.12, 0.62);

export function lantern(d: InteriorDraw): void {
  const { ctx, body, time, hex, dark, rim, back } = d;
  const cx = KEY.x * OFFSET * GHOST.rx;
  const cy = KEY.y * OFFSET * GHOST.ry;

  // The terminator and the contact shadow in one ramp, from the lit side.
  const shade = ctx.createRadialGradient(cx, cy, 0, cx * 0.4, cy * 0.4, GHOST.ry * 1.25);
  shade.addColorStop(0, hex);
  shade.addColorStop(0.42, dark);
  shade.addColorStop(0.8, back);
  shade.addColorStop(1, back);
  ctx.fillStyle = shade;
  ctx.fill(body);

  ctx.save();
  ctx.clip(body);
  // The rim light: the contour again, pushed *toward the key*, so the only
  // part of the stroke left inside the clip is the far side — the shifted
  // shape's shadow-side edge, which now lies inside the body.
  // The band fades out down the body before the hem: the dome is the ball,
  // and a shifted stroke of the tails is a second row of tails.
  const fade = ctx.createLinearGradient(0, 0, 0, GHOST.ry * HEM_FADE);
  fade.addColorStop(0, rgba(rim, 0.45));
  fade.addColorStop(1, rgba(rim, 0));
  ctx.save();
  ctx.translate(KEY.x * RIM_SHIFT * GHOST.rx, KEY.y * RIM_SHIFT * GHOST.ry);
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = fade;
  ctx.lineWidth = GHOST.rx * RIM_WIDTH;
  ctx.stroke(body);
  ctx.restore();

  // The core, placed. `sx` is the tangent plane's own map across, so the
  // heart is a disc facing us and a sliver at the limb; behind, it is drawn
  // faintly through the body and its normal points away.
  const f = facet(CORE, time * GHOST_SPIN * Math.PI * 2);
  ctx.translate(f.x * GHOST.rx, f.y * GHOST.ry);
  ctx.scale(Math.max(0.08, Math.abs(f.sx)), f.sy);
  const strength = f.near ? surfaceDim(CORE_DIM, f.lit) : CORE_BEHIND;
  halo(ctx, 0, 0, CORE_RADIUS, hex, 0.7 * strength);
  halo(ctx, 0, 0, CORE_HEART, rim, 0.9 * strength);
  ctx.restore();
}
