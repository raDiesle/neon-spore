import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { Interior } from "../../../../../packages/render/src/body-interior.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * ROE — the two sacs are full of eggs.
 *
 * The shipped slick has two dots in it, one per sac, in the rim colour, at a
 * fixed place. A body the pair sees on more waves than any other is a bag with
 * two full stops in it. This says the sacs are *carrying* something, and it
 * says it with the one thing a still cannot fake: the eggs are pinned to a
 * surface and the surface turns, so the ones at the back come round into view
 * and the ones at the front go away (`docs/dimensional.md`'s reveal).
 *
 * **Placed, not posed.** Every egg is a `pin(lon, lat, reach)` worked out once
 * at module load and a `facet(pin, theta)` per frame; the tangent plane's own
 * `sx`, `sy` foreshortens it. Nothing here squashes a picture — an affine moves
 * every mark at one rate and can never bring anything out from behind
 * (`.claude/skills/depth`).
 *
 * **The roll is rotated out rather than the light rotated in.** A slick leans
 * on its own-motion, and an interior on a leaning body is either lit wrong or
 * placed wrong by that lean. `surface.ts`'s light lives in the surface's own
 * frame, so the honest way round is to lay the eggs out upright and let the
 * body lean under them: a tenth of a radian of misplacement is invisible and a
 * tenth of a radian of mislit is the thing the eye catches.
 */

/** Two clusters, because a slick is two sacs joined at a waist. */
const SACS = [-0.42, 0.42];
/** How many eggs a sac carries, and how big each is against the sac's reach. */
const EGGS = 5;
const EGG = 0.38;
/** How fast the surface turns, in radians per second of the contour clock. */
const SPIN = 0.55;
/** What an egg keeps of its colour in full shadow. At 0 the far half of a sac
 * is empty, which reads as a body that has lost its contents. */
const DIM = 0.26;
/** The sac's own ball, as a share of the body's half-height. */
const REACH = 0.58;

/** Where the eggs sit. Worked out once: a `Pin` is constant for the life of the look. */
const PINS: Pin[] = [];
for (let i = 0; i < EGGS; i++) {
  // A spiral rather than a ring: a ring of one latitude folds to a line the
  // moment it goes round the back, and a ring of one longitude never leaves
  // the limb. Both are the shapes `surface.ts` warns about.
  const lon = i * 2.39;
  const lat = ((i / (EGGS - 1)) * 2 - 1) * 0.82;
  PINS.push(pin(lon, lat, 1));
}

export function roe(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = p.ry * REACH;
  const pale = p.rim;

  ctx.save();
  ctx.rotate(-p.rot);
  for (const side of SACS) {
    const cx = p.rx * side;
    for (const q of PINS) {
      const f = facet(q, theta + side);
      if (!f.near) continue;
      const r = reach * EGG * Math.max(0.2, f.sy);
      ctx.save();
      ctx.translate(cx + f.x * reach, f.y * reach);
      // The tangent plane's own map, which is right for a feature of any shape
      // and not only for a dot. `sx` is a cosine and is positive here because
      // the far half was dropped above.
      ctx.scale(Math.max(0.08, f.sx), 1);
      ctx.fillStyle = mixHex(p.hex, pale, surfaceDim(DIM, f.lit));
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}
