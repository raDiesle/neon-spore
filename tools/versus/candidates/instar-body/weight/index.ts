import { rgba } from "../../../../../packages/render/src/hex.js";
import * as look from "../../../../../packages/render/src/instar-body-look.js";
import { type Body, place } from "../../../../../packages/render/src/instar-profile-surface.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * WEIGHT — offered 1 October 2026, from `docs/spec/living-bosses.md` §2. The
 * owner: *the body is too thin and does not look cool*. The shipped body's
 * width is whatever the poses' top and bottom lines leave, a third of a head
 * at its widest; this one is the spec's radius profile in head radii — 0.65 at
 * the neck, 1.05 at the chest, 0.9 at the middle, 0.6 at the rear — and a
 * tail from 0.45 at the root to 0.07 at the blade. A paler band runs along the
 * belly, placed by longitude so the roll carries it round; the ridge stands
 * highest over the chest. The spine is seated deeper under each nest by the
 * girth there, across the spine rather than down the screen, so the eggs still
 * sit on the back in every pose — the upright rise too.
 *
 * Retuned 1 October 2026, the owner: *each body piece looks like it does not
 * belong together*. So the seams go: the spine starts inside the skull, the
 * profile runs 0.5 at the neck, 1.0 at the chest, 0.88 at the middle, 0.42 at
 * the rear, the tail's root is the rear's width and leaves along the spine
 * before it turns up (`flow`), and the head is the shipped one.
 *
 * Reshaped 2 October 2026, the owner: *looks better but make body more
 * natural shape of a dragon*. So it is no longer one swell from the head to
 * the rear: a slender neck leaves the skull, a deep chest swells behind it
 * over the shoulders, the body draws in at the waist and fills again over the
 * haunches before it narrows into a tail that thins to a finer blade, and the
 * ridge stands tallest over the chest and lowers toward the tail.
 */

/** A smooth curve through `knots` (u, value), flat at each knot. */
function through(knots: readonly (readonly [number, number])[]): (u: number) => number {
  return (u) => {
    const x = Math.max(0, Math.min(1, u));
    for (let i = 1; i < knots.length; i++) {
      const [u1, v1] = knots[i] as readonly [number, number];
      if (x > u1 && i < knots.length - 1) continue;
      const [u0, v0] = knots[i - 1] as readonly [number, number];
      const t = (x - u0) / (u1 - u0 || 1);
      return v0 + (v1 - v0) * (0.5 - 0.5 * Math.cos(Math.PI * t));
    }
    return (knots[0] as readonly [number, number])[1];
  };
}

/** A dragon's line: a slender neck out of the skull, swelling to a deep chest
 * over the shoulders, drawn in at the waist, full again over the haunches, and
 * narrowing into the tail. */
const girth = through([
  [0, 0.32],
  [0.16, 0.4],
  [0.4, 0.9],
  [0.62, 0.64],
  [0.8, 0.72],
  [1, 0.36],
]);
/** The spine starts inside the skull, so the neck runs into the head. */
const neck = { x: 0.3, y: 0.05 };
/** The nest is sunk a little into the back: the spine runs under it at the girth less 0.15. */
const seat = (u: number) => girth(u) - 0.15;
/** The root is the rear's own width, so the tail goes on from the body. */
const tail = through([
  [0, 0.34],
  [0.5, 0.17],
  [1, 0.05],
]);
/** Half the shipped spines' stand-off, since the rings they stand on are twice the girth — and more over the chest. */
const ridge = (u: number) =>
  0.5 * (1 - 0.35 * u) * (1 + 0.6 * Math.exp(-(((u - 0.4) / 0.14) ** 2)));

/** The belly's paler band: from low on the near flank round under the belly, rolled with the body. */
const BAND_FROM = 2.3;
const BAND_TO = Math.PI + 0.3;

function belly(
  ctx: CanvasRenderingContext2D,
  body: Body,
  clip: Path2D,
  roll: number,
  fade: number,
): void {
  const n = body.rings.length;
  if (fade <= 0 || n < 3) return;
  ctx.save();
  ctx.clip(clip);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.16 * fade);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p = place(body, i, BAND_FROM + roll);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  for (let i = n - 1; i >= 0; i--) {
    const p = place(body, i, BAND_TO + roll);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export const INSTAR_BODY_WEIGHT: Variant = {
  slot: "instar:body",
  name: "weight",
  sentence:
    "weight — THE INSTAR's body has a dragon's line: a slender neck, a deep chest, a waist, full haunches and a tail thinning to a blade, with a paler belly band and the ridge tallest over the chest",
  dir: "tools/versus/candidates/instar-body/weight",
  patches: [
    patch({
      target: look.INSTAR_BODY,
      reached: () => look.INSTAR_BODY,
      where: {
        file: "packages/render/src/instar-body-look.ts",
        symbol: "INSTAR_BODY",
        type: "{ neck: { readonly x: number; readonly y: number }; girth: (u: number) => number; seat: (u: number) => number; across: boolean; tail: (u: number) => number; flow: number; ridge: (u: number) => number; belly: (ctx: CanvasRenderingContext2D, body: Body, clip: Path2D, roll: number, fade: number) => void; head: (ctx: CanvasRenderingContext2D, look: Look) => void }",
      },
      fields: { neck, girth, seat, across: true, tail, flow: 0.8, ridge, belly },
    }),
  ],
};
