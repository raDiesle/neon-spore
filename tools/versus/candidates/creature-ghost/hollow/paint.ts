import { GHOST } from "../../../../../packages/content/src/ghost-shape.js";
import { KEY } from "../../../../../packages/content/src/light.js";
import { facet, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { GHOST_SPIN } from "../../../../../packages/render/src/ghost-latitude.js";
import type { InteriorDraw } from "../../../../../packages/render/src/ghost-look.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";

/**
 * HOLLOW — the dome is a bell of glass, and what is being looked at is its
 * *inside*.
 *
 * A ghost is a thing the field can see through, and the shipped nebula says
 * so with softness: no edge inside the body is hard. This says it with
 * structure instead. The body is a shell with a wall you can see the
 * thickness of, and the light that comes in from `KEY` at the upper left
 * passes through it and lands on the far inner wall at the lower right — so
 * the inside is bright exactly where the outside of a solid ball would be
 * dark. That inversion is the whole cue: a lit body is bright toward the
 * light; a lit *hollow* is bright away from it, because you are seeing the
 * far wall through the near one.
 *
 * Three layers, back to front:
 *
 * - **the far wall** — the contour again at four fifths of its size and
 *   dropped a little, filled by a radial gradient whose centre sits down and
 *   to the right, opposite the key. That is the inside of the shell where the
 *   light lands, and it goes to the field's dark toward the upper left where
 *   the near wall shadows it;
 * - **the wall's thickness** — the ring between the outer contour and the
 *   far wall, dark, with a thin band of the rim colour along its upper-left
 *   edge: the near wall catching the light on its outer face, the one place
 *   on this body lit the way a solid would be;
 * - **the heart** — a small hot core hanging *inside* the bell, pinned to a
 *   longitude and carried round by `GHOST_SPIN`. It is seen on both halves
 *   of the turn, because there is nothing opaque to hide it, and dims only a
 *   little at the far side where it is behind the thickest glass. A body
 *   with something visibly suspended in it is a body with an inside.
 *
 * **How it can lose.** *Two contours where there was one.* Player 2 finds
 * this creature by its outline in under a second, and an inner contour four
 * fifths the size of the outer is a second outline for the eye to snag on.
 * At 26 px the wall is three pixels and the inner shape may read as a
 * smaller ghost inside a bigger one. The bands are the same `latitude` on
 * both sides and go over all of this, which helps — a torn skin over a glass
 * bell is still one body — but judge it small.
 */

/** How much of the body's colour the glass itself carries. A wall the same
 * dark as the inside it surrounds has no thickness to see. */
const GLASS = 0.3;

/** The far wall's size against the outer contour, and how far down it sits:
 * the inside of a dome seen from above its middle is lower than its rim. */
const WALL = 0.8;
const WALL_DROP = 0.08;

/** How far *away* from the key the far wall's light is centred, in body
 * radii, and how wide the lit patch is. */
const INNER_OFFSET = 0.4;
const INNER_REACH = 1.15;

/** The near wall's lit edge: width as a share of the half-width, and how far
 * toward the key the contour is shifted to land the stroke on that side. */
const EDGE_WIDTH = 0.1;
const EDGE_SHIFT = 0.08;

/** The heart's floor when it faces away from the key and when it is on the
 * far side of the bell. High on both, because the glass hides nothing. */
const HEART_DIM = 0.6;
const HEART_BEHIND = 0.5;

/** The heart's reach, rounded once in body units for `halo`'s cache. */
const HEART_RADIUS = Math.round(GHOST.rx * 0.5);
const HEART_CORE = Math.round(GHOST.rx * 0.2);

/** Where the heart hangs: a little above the middle, at a smaller reach than
 * the wall so its whole orbit stays inside the glass. */
const HEART = pin(0, -0.1, 0.42);

export function hollow(d: InteriorDraw): void {
  const { ctx, body, time, hex, dark, rim, back } = d;

  // The wall's thickness first: the whole body in the glass's own tint, so
  // the ring left around the far wall below is the shell seen edge-on.
  ctx.fillStyle = mixHex(dark, hex, GLASS);
  ctx.fill(body);

  ctx.save();
  ctx.clip(body);

  // The far wall, lit from where the light lands rather than from where it
  // comes: down and to the right, opposite `KEY`.
  ctx.save();
  ctx.translate(0, WALL_DROP * GHOST.ry);
  ctx.scale(WALL, WALL);
  const lx = -KEY.x * INNER_OFFSET * GHOST.rx;
  const ly = -KEY.y * INNER_OFFSET * GHOST.ry;
  const inner = ctx.createRadialGradient(lx, ly, 0, 0, 0, GHOST.ry * INNER_REACH);
  inner.addColorStop(0, hex);
  inner.addColorStop(0.5, dark);
  inner.addColorStop(1, back);
  ctx.fillStyle = inner;
  ctx.fill(body);
  ctx.restore();

  // The near wall's outer face catching the key: the contour again, pushed
  // *away* from the light, so the shifted shape's key-side edge is the part
  // of the stroke left inside the clip.
  ctx.save();
  ctx.translate(-KEY.x * EDGE_SHIFT * GHOST.rx, -KEY.y * EDGE_SHIFT * GHOST.ry);
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(rim, 0.35);
  ctx.lineWidth = GHOST.rx * EDGE_WIDTH;
  ctx.stroke(body);
  ctx.restore();

  // The heart, hanging inside and going round. Drawn on the far half too —
  // that is what a glass bell is for — and foreshortened by the tangent
  // plane's own map so it is a disc facing us and a sliver at the limb.
  const f = facet(HEART, time * GHOST_SPIN * Math.PI * 2);
  ctx.translate(f.x * GHOST.rx, f.y * GHOST.ry);
  ctx.scale(Math.max(0.1, Math.abs(f.sx)), f.sy);
  const strength = f.near ? surfaceDim(HEART_DIM, f.lit) : HEART_BEHIND;
  halo(ctx, 0, 0, HEART_RADIUS, hex, 0.7 * strength);
  halo(ctx, 0, 0, HEART_CORE, rim, 0.8 * strength);
  ctx.restore();
}
