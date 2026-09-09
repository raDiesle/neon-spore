import { type CreatureSilhouette, surfaceLit } from "../../../../../packages/content/src/index.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { bareArc, plateBearing, platePaths } from "../../../../../packages/render/src/shell-cut.js";
import type { PlateInk } from "../../../../../packages/render/src/shell-plate.js";

/**
 * The paint WORN is made of.
 *
 * Nothing here cuts a plate: `platePaths` and `bareArc` are called, so the
 * armour sits exactly where the shipped armour sits and the only thing being
 * argued about is what it is made of — the same discipline SLAB keeps next
 * door, because the two have to be one question.
 *
 * **Every mark in this file is a shadow.** There is no gradient, no specular
 * and no lifted face: the whole claim is that a plate reads as a solid because
 * of the dark it puts into its own gaps, and the instrument is a stroke under
 * a clip. That is not a stylistic preference, it is the argument — see
 * `index.ts` — and it is why the two candidates in this slot can lose in
 * opposite ways.
 */

/**
 * How wide the shadow under the outer rim is, as a share of the body's reach.
 * The stroke is centred on the arc, so half of it falls outside the clip and
 * what shows is half this — a couple of pixels at the two dozen a body draws
 * at on a phone, which is the smallest dark band that is still a band.
 */
const RIM_GAP = 0.3;

/** The same for the split down the middle, where the two oversize halves fail
 * to meet. Narrower, because the body's own light comes up out of it and a
 * shadow wide enough to swallow that would be arguing with the one thing on
 * this creature the pair has to say out loud. */
const SPLIT_GAP = 0.16;

/** How dark the gap goes at its deepest, and how much of that a plate turned
 * toward the light keeps. A shadow is cool and never black
 * (`docs/style-guide.md`), which is what filling toward `background` rather
 * than toward nothing buys. */
const DARK = 0.42;
const DARK_UNLIT = 0.34;

/**
 * How much light this plate's face takes.
 *
 * WORN does not paint the face — that is the whole of what it is not — but it
 * still has to know which half of the body it is on, because a gap the light
 * can graze into is shallower than one it cannot. The bearing is
 * `plateBearing`'s and the projection is `surfaceLit`'s, both called rather
 * than written out: SLAB reaches them at the same line for the opposite
 * purpose, and a candidate that re-derived either would be moving the armour
 * while claiming to argue about the dark.
 */
function litFace(piece: number, rot: number): number {
  const a = plateBearing(piece) + rot;
  return surfaceLit(Math.cos(a), Math.sin(a), 1, 0);
}

export function worn(
  ctx: CanvasRenderingContext2D,
  s: CreatureSilhouette,
  piece: number,
  seed: number,
  t: number,
  ink: PlateInk,
): void {
  const p = platePaths(s, piece, seed, t);
  const reach = Math.max(s.rx, s.ry);
  const lit = litFace(piece, ink.rot);
  const dark = DARK + DARK_UNLIT * (1 - lit);

  // The plate itself, flat and dead, exactly as the game fills it today. WORN
  // changes nothing about the face on purpose: if the picture works, it works
  // because of what is under the rim, and a face repainted at the same time
  // would make that impossible to tell.
  ctx.fillStyle = ink.plate;
  ctx.fill(p.body);

  ctx.save();
  ctx.clip(p.body);
  // **The overhang.** Plating a size too big stands off the body all the way
  // round its outer edge, and no light gets in under a lip — so the plate's
  // own underside is a band of dark hugging the rim, from inside. Deeper on
  // the half turned away from the key, because a gap the light can graze into
  // is a shallower gap.
  ctx.strokeStyle = rgba(PALETTE.background, dark);
  ctx.lineWidth = reach * RIM_GAP;
  ctx.stroke(p.arc);
  // **And the two halves do not meet.** If each plate is a size too big, the
  // straight edge down the middle is a gap rather than a seam: the same dark,
  // narrower, drawn before the split's own light so the body still comes out
  // of it — over a shadow now, which is what gives the light somewhere to come
  // *from* instead of a line to sit on.
  ctx.strokeStyle = rgba(PALETTE.background, dark * 0.8);
  ctx.lineWidth = reach * SPLIT_GAP;
  ctx.stroke(p.edge);
  ctx.restore();

  // The hard outer edge, at one value the whole way round. SLAB brightens this
  // where the light reaches it; WORN leaves it alone, because a rim that took
  // a highlight would be answering the question with the other candidate's
  // instrument.
  ctx.strokeStyle = ink.rim;
  ctx.lineWidth = ink.lineWidth;
  ctx.stroke(p.arc);

  // And the body's own light out of everything that is broken, untouched.
  // What comes out of the splits is the colour the pair has to say out loud,
  // and a candidate about the armour has no business dimming it.
  strokeGlow(ctx, p.edge, ink.light, ink.lineWidth * 0.9, 1);
  strokeGlow(ctx, p.crack, ink.light, ink.lineWidth * 0.7, 0.8);
}

/**
 * The bared half's rim, in the same material.
 *
 * It has to move with the plate or the body wears two answers. Under WORN's
 * account there is nothing standing here to cast into a gap, and that is
 * exactly what the bared half should say: the collar has gone, so the edge
 * keeps the dark line the plate wore into the body and loses the hard grey it
 * had while something was bearing on it.
 *
 * The dark is stroked with no clip, so half of it falls outside the contour
 * onto a background that is already the darkest thing on the field — which
 * costs nothing and saves a clip on a body that draws two of these.
 */
export function wornRim(
  ctx: CanvasRenderingContext2D,
  s: CreatureSilhouette,
  piece: number,
  t: number,
  ink: PlateInk,
): void {
  const lit = litFace(piece, ink.rot);
  const arc = bareArc(s, piece, t);
  ctx.strokeStyle = rgba(PALETTE.background, DARK * 0.8 + DARK_UNLIT * (1 - lit));
  ctx.lineWidth = ink.lineWidth * 2.6;
  ctx.stroke(arc);
  ctx.strokeStyle = rgba(ink.rim, 0.7);
  ctx.lineWidth = ink.lineWidth;
  ctx.stroke(arc);
}
