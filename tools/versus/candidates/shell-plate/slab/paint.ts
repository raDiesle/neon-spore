import {
  type CreatureSilhouette,
  KEY,
  surfaceLit,
} from "../../../../../packages/content/src/index.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { bareArc, plateBearing, platePaths } from "../../../../../packages/render/src/shell-cut.js";
import type { PlateInk } from "../../../../../packages/render/src/shell-plate.js";

/**
 * The paint SLAB is made of.
 *
 * Nothing here cuts a plate: `platePaths` and `bareArc` are called, so the
 * armour sits exactly where the shipped armour sits and the only thing being
 * argued about is what it is made of. Nothing here names a light angle either —
 * `KEY` is the one direction in the game and `surfaceLit` is the one place it
 * is turned into a number.
 */

/** How far the face stands off the wall, as a share of the body's own reach.
 * Small on purpose, for `warden-plates.ts`'s reason: a lip a player could
 * measure would change which silhouette the pair name, and the silhouette is
 * the word. */
const LIFT = 0.05;

/** How much of the plate's value survives where it faces away from the light.
 * A shadow is cool and never black (`docs/style-guide.md`), so the floor is the
 * plate's own dead grey rather than nothing. */
const FLOOR = 0.22;

/** How far across its own width the face ramps, as shares of the reach either
 * side of centre. Six stops would be a surface; this is a slab, and a slab's
 * face is nearly flat — the ramp is what says which way it is tilted, not what
 * says it is round. */
const RAMP = 0.9;

/** How wide the specular is, as a share of the reach, and how bright. */
const SPEC_R = 0.34;
const SPEC = 0.5;

/** `KEY` in the body's own frame: the transform carries `rot`, so the field's
 * light direction is turned back by it. The veil candidate does the same at
 * the same line, and for the same reason — a body that sways has to sway under
 * a light that does not. */
function keyIn(rot: number): { x: number; y: number } {
  const cos = Math.cos(-rot);
  const sin = Math.sin(-rot);
  return { x: KEY.x * cos - KEY.y * sin, y: KEY.x * sin + KEY.y * cos };
}

/**
 * How much light this plate's face takes.
 *
 * The face is a half-body presented outward, so the direction it shows the
 * world is the middle of its own span (`plateBearing`) turned by whatever the
 * body's own-motion is carrying. That bearing lies in the screen plane, which
 * is `surfaceLit` read at the one case it has for a rim — the projection being
 * *called* rather than a dot product with `KEY` written out here, which is the
 * same call `warden-plates.ts` makes for the same shape of thing.
 */
function litFace(piece: number, rot: number): number {
  const a = plateBearing(piece) + rot;
  return surfaceLit(Math.cos(a), Math.sin(a), 1, 0);
}

export function slab(
  ctx: CanvasRenderingContext2D,
  s: CreatureSilhouette,
  piece: number,
  seed: number,
  t: number,
  ink: PlateInk,
): void {
  const p = platePaths(s, piece, seed, t);
  const reach = Math.max(s.rx, s.ry);
  const k = keyIn(ink.rot);
  const lit = litFace(piece, ink.rot);

  // **The wall**, and it is the whole of what a slab has that a lid does not:
  // the same plate, left standing where the shipped one is, filled in the
  // plate's own dark. The face is lifted off it toward the light, so what is
  // left showing is a hair of thickness down the side the light does not
  // reach. The shipped plate has none, which is the whole of what a lid is.
  ctx.fillStyle = mixHex(PALETTE.background, ink.plate, 0.55);
  ctx.fill(p.body);

  ctx.save();
  ctx.translate(k.x * reach * LIFT, k.y * reach * LIFT);

  // **The face.** One value for the whole plate — a plate over the left half
  // faces up and left and takes nearly all of the light, the one over the
  // right almost none — with a shallow ramp across it saying which way it is
  // tilted. Not a round body's ramp: this is a slab, and a slab is flat.
  const face = mixHex(ink.plate, PALETTE.rock, FLOOR + (1 - FLOOR) * lit);
  const g = ctx.createLinearGradient(
    k.x * reach * RAMP,
    k.y * reach * RAMP,
    -k.x * reach * RAMP,
    -k.y * reach * RAMP,
  );
  g.addColorStop(0, mixHex(face, PALETTE.rock, 0.35));
  g.addColorStop(0.55, face);
  g.addColorStop(1, mixHex(face, PALETTE.background, 0.4));
  ctx.fillStyle = g;
  ctx.fill(p.body);

  // **The lit edge along the outer rim**, and only where the light reaches it.
  // A bright rim all the way round is a light that follows the armour, which
  // is the failure `docs/dimensional.md` names.
  if (lit > 0.12) {
    ctx.strokeStyle = rgba(PALETTE.text, 0.12 + 0.6 * lit);
    ctx.lineWidth = ink.lineWidth * 0.8;
    ctx.stroke(p.arc);
  }
  ctx.strokeStyle = rgba(ink.rim, 0.35 + 0.4 * lit);
  ctx.lineWidth = ink.lineWidth;
  ctx.stroke(p.arc);

  // **The specular, and it does not travel.** It sits where the light is — in
  // the body's frame, with the sway turned back out — so as the creature
  // breathes the highlight stays and the plate moves under it. That contrast
  // is the cheapest thing there is that says one of these two objects is hard
  // and the other is not, and it is the reason this candidate exists.
  // Only on the half the light is actually on: `pieceAngleSpan` splits the
  // body on the sign of `cos a`, so the test is the sign of the light's own x.
  if ((piece === 0) === k.x < 0) {
    ctx.save();
    ctx.clip(p.body);
    const cx = k.x * reach * 0.52;
    const cy = k.y * reach * 0.52;
    const spot = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach * SPEC_R);
    spot.addColorStop(0, rgba(PALETTE.text, SPEC));
    spot.addColorStop(1, rgba(PALETTE.text, 0));
    ctx.fillStyle = spot;
    ctx.fillRect(-reach * 2, -reach * 2, reach * 4, reach * 4);
    ctx.restore();
  }
  ctx.restore();

  // And the body's own light out of everything that is broken, untouched.
  // What comes out of the splits is the colour the pair has to say out loud,
  // and a candidate about the armour has no business dimming it.
  strokeGlow(ctx, p.edge, ink.light, ink.lineWidth * 0.9, 1);
  strokeGlow(ctx, p.crack, ink.light, ink.lineWidth * 0.7, 0.8);
}

/**
 * The bared half's rim, in the same material.
 *
 * It has to move with the plate or the body wears two answers: one half a slab
 * under a light and the other a flat grey line. There is no plate left to lift,
 * so what the light does here is all it can do — the edge is bright where that
 * half faces the light and nearly out where it does not, which is also the
 * honest picture of a rim with nothing standing on it.
 */
export function slabRim(
  ctx: CanvasRenderingContext2D,
  s: CreatureSilhouette,
  piece: number,
  t: number,
  ink: PlateInk,
): void {
  const lit = litFace(piece, ink.rot);
  const arc = bareArc(s, piece, t);
  ctx.strokeStyle = rgba(ink.rim, 0.4 + 0.6 * lit);
  ctx.lineWidth = ink.lineWidth;
  ctx.stroke(arc);
  if (lit > 0.12) {
    ctx.strokeStyle = rgba(PALETTE.text, 0.1 + 0.4 * lit);
    ctx.lineWidth = ink.lineWidth * 0.5;
    ctx.stroke(arc);
  }
}
