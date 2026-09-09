import { surfaceLit } from "../../../../../packages/content/src/surface.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import {
  clear,
  PLATE_SPAN,
  plateArc,
  plateStart,
  type WardenPlatesDraw,
} from "../../../../../packages/render/src/warden-plates.js";

/**
 * The paint BEVEL is made of, kept out of `index.ts` so that file stays the
 * argument for the candidate rather than a wall of canvas calls.
 *
 * **Where a plate is, is not this candidate's to decide.** `plateArc`,
 * `plateStart`, `PLATE_SPAN` and `clear` are all called rather than re-typed:
 * the first three are where the ring puts plate `k`, which is the game's only
 * health bar and has to agree to the radian on both sides of a vote, and the
 * fourth is the rule that no armour may be drawn across the way in. A hand copy
 * of any of them would be a second answer to a question the simulation already
 * owns — and a plate two pixels wide across the shot lane closes it, whatever
 * the fill rule says.
 */

/** Where the armour band stands, as shares of the body's radius: the shipped
 * arc sits at 0.94 and is stroked at `STROKE.outline * 2.2`, so these two are
 * that band given an inside and an outside rather than a new place to be. */
const INNER = 0.9;
const OUTER = 0.985;

/** How far a plate stands off the rim, in the same shares — the wall you see
 * because the plate is a slab and not a line. It is small on purpose: a lip a
 * player could measure would change the boss's silhouette, and the silhouette
 * is the readout. */
const LIFT = 0.035;

/** How much of the rock's own value a plate keeps where it faces away from the
 * light. A shadow is cool and never black (`docs/style-guide.md`), so the floor
 * is the body's own dark rather than nothing. */
const FLOOR = 0.16;

/** How far the breath carries a plate, in shares of the radius, and how long it
 * takes. Slow and tiny: a ring of armour that pumped would read as a body
 * breathing, and this is a machine bolted to one. */
const BREATH = 0.008;
const BREATH_RATE = 0.55;

/**
 * The light a plate takes, given the bearing its outer face points along.
 *
 * The face is edge-on to us — it is on the rim of a ring drawn face-on — so its
 * normal lies in the screen plane at that same bearing, which is `surfaceLit`
 * read at latitude `a` with the longitude square to us. That is the projection
 * being *called* at the one case it has for a rim, rather than a dot product
 * written out here from `KEY`'s two components.
 */
function litAt(a: number): number {
  return surfaceLit(Math.cos(a), Math.sin(a), 1, 0);
}

/** One band of armour between two radii, from bearing `s` to bearing `e`. */
function slab(
  cx: number,
  cy: number,
  r: number,
  inner: number,
  outer: number,
  s: number,
  e: number,
): Path2D {
  const p = new Path2D();
  p.arc(cx, cy, r * outer, s, e);
  p.arc(cx, cy, r * inner, e, s, true);
  p.closePath();
  return p;
}

/**
 * BEVEL: a plate with a thickness, a wall you can see and a light that stays
 * where the light is.
 *
 * Four marks per piece, in the order a solid is built: the wall it stands on,
 * the face, the lit edge along its outer rim, and the seam of shadow where it
 * meets the body. `docs/style-guide.md`'s five zones with the cast shadow left
 * out — nothing in this game casts onto anything else, and the reflected light
 * is the last stop inside the face's own ramp rather than a pass of its own.
 */
export function bevel(d: WardenPlatesDraw): void {
  const { ctx, cx, cy, r, b, time, cut } = d;
  const arc = plateArc(d.cfg);

  ctx.save();
  ctx.lineCap = "butt";
  for (let k = 0; k < b.plates; k++) {
    const a0 = plateStart(k, arc, time);
    // Each plate breathes on a phase of its own, so the ring reads as a row of
    // separate slabs rather than as one thing scaled up and down.
    const lift = LIFT + BREATH * Math.sin(time * BREATH_RATE + k * 1.3);
    for (const [s, e] of clear(a0, a0 + arc * PLATE_SPAN, cut)) {
      const lit = litAt((s + e) / 2);
      const face = mixHex(PALETTE.rockDark, PALETTE.rock, FLOOR + (1 - FLOOR) * lit);
      const inner = INNER + lift;
      const outer = OUTER + lift;

      // The wall: the same band, sunk back to where the rim is, drawn dark. It
      // is what the eye reads as the height of the slab — the shipped arc has
      // none, which is the whole of what a line is.
      ctx.fillStyle = PALETTE.rockDark;
      ctx.fill(slab(cx, cy, r, INNER - lift * 0.4, outer - lift, s, e));

      // The face.
      ctx.fillStyle = face;
      ctx.fill(slab(cx, cy, r, inner, outer, s, e));

      // The lit edge along the outer rim, and only where the light reaches it:
      // a specular that ran the whole ring would be a light that follows the
      // armour round, which is the failure `docs/dimensional.md` names.
      if (lit > 0.15) {
        ctx.strokeStyle = rgba(PALETTE.text, 0.1 + 0.55 * lit);
        ctx.lineWidth = STROKE.outline * 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, r * outer, s, e);
        ctx.stroke();
      }

      // The seam where the plate meets the body — the contact shadow, without
      // which the whole ring floats a hair off the boss and reads as printed on
      // it. It is darkest where the plate is brightest, which is what a lit
      // solid standing on a surface does.
      ctx.strokeStyle = rgba(PALETTE.background, 0.35 + 0.35 * lit);
      ctx.lineWidth = STROKE.outline;
      ctx.beginPath();
      ctx.arc(cx, cy, r * inner, s, e);
      ctx.stroke();
    }
  }
  ctx.restore();
}
