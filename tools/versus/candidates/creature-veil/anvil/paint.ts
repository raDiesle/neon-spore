import {
  facet,
  LAT_LIMIT,
  type Pin,
  pin,
  surfaceDim,
} from "../../../../../packages/content/src/surface.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import type { VeilMassDraw } from "../../../../../packages/render/src/veil-look.js";

/**
 * The paint ANVIL is made of, kept out of `index.ts` so that file stays the
 * argument for the candidate rather than a wall of canvas calls.
 *
 * **Every mark is inside the shipped contour and nothing here strokes it.** The
 * cloud's outline is what player 2 finds this body by and what makes a veil and
 * a clasp read as the same class of object; the slot is what the weather is
 * made of *between* that rim and its lightning. So the first thing this does is
 * clip to the path it was handed, and the last thing it does is give it back
 * unmarked.
 */

/** How many heaps the cloud is built out of. Nine: five is the shipped
 * contour's own lobe count and would read as one heap per lobe — a cloud
 * wearing its own silhouette as a pattern — and more than a dozen at this size
 * is mist. */
const BILLOWS = 9;

/** How far out the heaps sit, as a share of the cloud's reach. Well inside, so
 * a billow's own soft edge dies before the contour and the rim keeps its job. */
const REACH = 0.58;

/** How wide one heap is, in the same share. Wide enough that neighbours
 * overlap at every rotation — a cloud with a gap in it is two clouds. */
const HEAP = 0.62;

/** How many beats one turn of the mass takes. Six, and on the **beat** rather
 * than the wall clock: the pair is already counting this body's morph, so its
 * weather turning on the same count gives them one clock instead of two. */
const TURN_BEATS = 6;

/** What is left of a heap's light where it has turned away. A cloud's shadow
 * side is dark and never black — `docs/style-guide.md` — and this is the floor
 * that keeps the far half of the mass a surface rather than a hole. */
const DIM = 0.3;

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Where each heap sits on the mass, worked out once. `LAT_LIMIT` is called
 * rather than typed: a heap nearer a pole than that flattens to a bar. */
const PINS: Pin[] = Array.from({ length: BILLOWS }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 2.4) * LAT_LIMIT * 0.7, REACH),
);

/**
 * ANVIL: the thunderhead as a mass of heaps standing on a volume that turns,
 * lit from where the light actually is.
 *
 * The shipped fill is one vertical gradient across the whole contour, which is
 * a correct sentence about weather — lit above, heavy below — painted on a
 * surface with no inside. Here the same two colours are the ends of a *ramp per
 * heap*: each takes its own lambert against the fixed key, so the heaps on the
 * lit shoulder are pale and the ones under them are the gradient's own dark,
 * and the boundary between them is a terminator that runs across the cloud
 * rather than a line drawn straight across the picture.
 */
export function anvil(d: VeilMassDraw): void {
  const { ctx, r, path, beats } = d;
  const theta = (beats / TURN_BEATS) * Math.PI * 2;

  ctx.save();
  ctx.globalAlpha = d.seeThrough ? 0.66 : 1;
  ctx.clip(path);

  // The base, under every heap: the gradient's own dark, filling the whole
  // contour. Without it a rotation that carried two heaps to the same side
  // would open a hole onto the field through the middle of a cloud.
  ctx.fillStyle = d.bottom;
  ctx.fill(path, "nonzero");

  // Far heaps first, near ones over them. A heap is not opaque, so what this
  // buys is not occlusion but *stacking*: the near ones come up over the far
  // ones' shoulders, which is the one thing a flat gradient cannot show and
  // what makes the mass read as deep rather than as tall.
  for (const want of [false, true]) {
    for (let i = 0; i < PINS.length; i++) {
      const p = PINS[i];
      if (!p) continue;
      const f = facet(p, theta);
      if (f.near !== want) continue;
      // A heap breathes on its own phase, so the mass boils slowly instead of
      // turning as one rigid lump. Off the beat, like everything else here.
      const swell = 1 + 0.12 * Math.sin(beats * 1.3 + i * 1.9);
      const lit = surfaceDim(DIM, f.lit);
      const hex = mixHex(d.bottom, d.top, lit);
      const rad = r * HEAP * swell;
      ctx.save();
      ctx.translate(f.x * r, f.y * r);
      // The tangent plane's own map. A heap near the limb is squeezed across
      // its width and stands up tall, which is what a lump of cloud going
      // round the back of a mass does.
      ctx.scale(Math.max(0.12, Math.abs(f.sx)), f.sy);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
      g.addColorStop(0, rgba(hex, want ? 0.95 : 0.6));
      g.addColorStop(0.55, rgba(hex, want ? 0.6 : 0.35));
      g.addColorStop(1, rgba(hex, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}
