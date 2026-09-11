import { facet, LAT_LIMIT, pin, surfaceDim } from "@neon-spore/content";
import { mixHex, rgba } from "./hex.js";
import type { VeilMassDraw } from "./veil-look.js";

/**
 * THE VEIL's cloud, filled: what a thunderhead is made of between its rim and
 * its lightning.
 *
 * It was one vertical gradient across the whole contour — a correct sentence
 * about weather, lit above and heavy below, painted on a surface with no
 * inside. The owner took ANVIL out of VERSUS on 9 September 2026 and this is
 * it: the same two colours as the ends of a ramp *per heap*, each heap taking
 * its own lambert against the fixed key, so the boundary between the pale
 * shoulders and the dark under them is a terminator running across the cloud
 * rather than a line drawn straight across the picture.
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
const HEAP = 0.7;

/** How many beats one turn of the mass takes. Six, and on the **beat** rather
 * than the wall clock: the pair is already counting this body's morph, so its
 * weather turning on the same count gives them one clock instead of two. */
const TURN_BEATS = 6;

/**
 * The crest a heap takes where it is square to the light — the one colour this
 * candidate brings that the shipped fill does not have.
 *
 * The shipped ramp runs between two darks, so a lambert read across them can
 * only ever make the cloud *duller* than it already is: the lit end has to
 * stand somewhere above the top of that ramp or the argument is a shading pass
 * that costs contrast. It is the contour's own edge colour rather than a new
 * hue — `veil.ts`'s `EDGE`, which is what the rim outside these heaps is
 * already drawn in — so a lit shoulder reads as the same weather catching the
 * light rather than as a second material.
 */
const CREST = "#A79EE8";

/** Where the ramp hands over from the dark pair to the crest. Past two-thirds,
 * so only the shoulders genuinely facing the light take any of it. */
const SHOULDER = 0.66;

/** What is left of a heap's light where it has turned away. A cloud's shadow
 * side is dark and never black — `docs/style-guide.md` — and this is the floor
 * that keeps the far half of the mass a surface rather than a hole. */
const DIM = 0.2;

/**
 * How much of the mass the screen that sees into the cloud gets.
 *
 * On player 1's screen the body inside is the whole point of looking, and the
 * owner said on 11 September 2026 it was too hard to find: "make the
 * underlying slick or bulb a little bit more visible, so less clouds, just
 * some". So that screen draws the mass thinner, and only the heaps on the near
 * side of the turn — a few lumps of weather passing in front of the body,
 * rather than a base and nine heaps laid over it. Player 2's cloud is the
 * whole mass, as before; the contour, the rim and the bolts are the same on
 * both, which is the disguise (`veil.ts`).
 */
const SEE_THROUGH_ALPHA = 0.8;

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Where each heap sits on the mass, worked out once. `LAT_LIMIT` is called
 * rather than typed: a heap nearer a pole than that flattens to a bar. */
const PINS = Array.from({ length: BILLOWS }, (_, i) =>
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
  ctx.globalAlpha = d.seeThrough ? SEE_THROUGH_ALPHA : 1;
  ctx.clip(path);

  // The base, under every heap: the gradient's own dark, filling the whole
  // contour. Without it a rotation that carried two heaps to the same side
  // would open a hole onto the field through the middle of a cloud. Not on
  // the screen that sees through: there the rim's own fill is already under
  // the mass (`veil.ts`), and what shows between the heaps is the body, which
  // is what that screen is for.
  if (!d.seeThrough) {
    ctx.fillStyle = d.bottom;
    ctx.fill(path, "nonzero");
  }

  // Far heaps first, near ones over them. A heap is not opaque, so what this
  // buys is not occlusion but *stacking*: the near ones come up over the far
  // ones' shoulders, which is the one thing a flat gradient cannot show and
  // what makes the mass read as deep rather than as tall. The see-through
  // screen gets the near ones only.
  for (const want of d.seeThrough ? [true] : [false, true]) {
    for (let i = 0; i < PINS.length; i++) {
      const p = PINS[i];
      if (!p) continue;
      const f = facet(p, theta);
      if (f.near !== want) continue;
      // A heap breathes on its own phase, so the mass boils slowly instead of
      // turning as one rigid lump. Off the beat, like everything else here.
      const swell = 1 + 0.12 * Math.sin(beats * 1.3 + i * 1.9);
      const lit = surfaceDim(DIM, f.lit);
      // Two segments rather than one: dark to the fill's own top across most of
      // the ramp, and on past it to the crest for the shoulders that are
      // actually facing the light.
      const hex =
        lit <= SHOULDER
          ? mixHex(d.bottom, d.top, lit / SHOULDER)
          : mixHex(d.top, d.haze(CREST), (lit - SHOULDER) / (1 - SHOULDER));
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
