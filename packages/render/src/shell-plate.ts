import { type CreatureSilhouette, KEY, surfaceLit } from "@neon-spore/content";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { plateBearing, platePaths } from "./shell-cut.js";

/**
 * WHAT A PLATE IS MADE OF — the paint over the geometry next door.
 *
 * `shell-cut.ts` answers where the armour sits; this answers what it is. The
 * pass that finds the bodies and puts it at the right place on the field is
 * `shell-draw.ts`, the same seam `shell.ts` and `shell-round.ts` are split
 * along in the simulation, and `shell-look.ts` is the record a candidate look
 * patches.
 *
 * **A plate is a slab, not a lid** — `shell:plate` / `slab`, taken into the
 * game on 9 September 2026. What shipped before was the body's contour cut in
 * half and filled in one flat grey: the one hard surface in the game with no
 * highlight, no bevel and no thickness at all, sitting directly over a body
 * that had all three. Three things a lid cannot have replaced it, in the order
 * a solid is built — a wall, a face with a ramp, and a specular that
 * does not travel — and each is commented where it is drawn.
 *
 * **Both plates are one colour** — the owner, 20 September 2026: *all shell
 * parts should have the same colour, which is the light white one.* The face
 * used to take the key by its own normal, so the plate over the left half came
 * out near white and the one over the right near black, and the pair read two
 * materials. Now both are `PLATE_RIM`, the light one, under one shallow ramp
 * across the whole body; the light is said by the specular and the lit edge,
 * which are highlights rather than a second colour.
 *
 * **Nothing on a plate glows.** The split and the crack carry the body's own
 * colour, which on an intact shell is the only way the pair can tell red from
 * cyan, but they carry it as flat lines: armour is the thing that damps a
 * body's light, and a bloom coming off it says the opposite. The same sentence
 * is why `shell-draw.ts` keeps the body's halo and motion trail off a plated
 * half altogether.
 */

/** Dead, non-living material, as THE CRAWLER and THE LID still wear it. The
 * shell's plates were filled with it until 20 September 2026 and are
 * `PLATE_RIM` now; the two above are a question for the owner, not this file. */
export const PLATE = "#23222C";
/** The shell's one colour: every plate's face, and its hard outer edge. Hard
 * and bright where the body's own outline is soft and coloured; that contrast
 * is most of what says "armour". */
export const PLATE_RIM = PALETTE.rock;

/** What one plate is drawn in: its face, its edge, and the light of the body
 * behind it. All three already hazed by the caller, which owns the row. */
export interface PlateInk {
  plate: string;
  rim: string;
  light: string;
  lineWidth: number;
  /**
   * How far the body's own-motion has turned the local axes this frame
   * (`livingPose`). `KEY` is a direction in *field* space, so it has to be
   * turned back by this or the highlight rides round with the sway, which is
   * the one thing a hard surface must not do.
   */
  rot: number;
}

/** How far the face stands off the wall, as a share of the body's own reach.
 * Small on purpose, for `warden-plates.ts`'s reason: a lip a player could
 * measure would change which silhouette the pair name, and the silhouette is
 * the word. */
const LIFT = 0.05;

/** How far across the body the face ramps, as shares of the reach either side
 * of centre, and how far toward the background its far end goes. Shallow: the
 * ramp runs across both plates, and a deep one would make the far plate the
 * dark one again. */
const RAMP = 0.9;
const SHADE = 0.15;

/** How wide the dark cut is that the body's colour shows through, as a share
 * of the line. On a light slab a coloured line alone is a scratch on it; a cut
 * darker than the plate with the colour inside it is a crack. */
const CUT = 2.4;

/** How wide the specular is, as a share of the reach, and how bright. */
const SPEC_R = 0.34;
const SPEC = 0.5;

/** `KEY` in the body's own frame: the transform carries `rot`, so the field's
 * light direction is turned back by it. A body that sways has to sway under a
 * light that does not. */
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
export function litFace(piece: number, rot: number): number {
  const a = plateBearing(piece) + rot;
  return surfaceLit(Math.cos(a), Math.sin(a), 1, 0);
}

/**
 * One plate: a slab with a wall and a light face, the same on either half,
 * under a highlight that stays where the light is while the body sways
 * beneath it.
 */
export function drawPlate(
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
  // the same plate, left standing where the old flat one was, filled in the
  // plate's own dark. The face is lifted off it toward the light, so what is
  // left showing is a hair of thickness down the side the light does not
  // reach.
  ctx.fillStyle = mixHex(PALETTE.background, ink.plate, 0.55);
  ctx.fill(p.body);

  ctx.save();
  ctx.translate(k.x * reach * LIFT, k.y * reach * LIFT);

  // **The face**, in the shell's one colour whichever half it is on, with a
  // shallow ramp away from the key. The ramp is in the body's frame, so it
  // runs on across the other plate rather than starting again: one slab of
  // light, not two plates lit two ways.
  const face = ink.plate;
  const g = ctx.createLinearGradient(
    k.x * reach * RAMP,
    k.y * reach * RAMP,
    -k.x * reach * RAMP,
    -k.y * reach * RAMP,
  );
  g.addColorStop(0, face);
  g.addColorStop(1, mixHex(face, PALETTE.background, SHADE));
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
  ctx.strokeStyle = rgba(ink.rim, 0.75);
  ctx.lineWidth = ink.lineWidth;
  ctx.stroke(p.arc);

  // **The specular, and it does not travel.** It sits where the light is — in
  // the body's frame, with the sway turned back out — so as the creature
  // breathes the highlight stays and the plate moves under it. That contrast
  // is the cheapest thing there is that says one of these two objects is hard
  // and the other is not. Only on the half the light is actually on:
  // `pieceAngleSpan` splits the body on the sign of `cos a`, so the test is
  // the sign of the light's own x.
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

  // And the body's own colour out of everything that is broken — the split it
  // will come apart along, and the crack across it. **Flat, not glowing.** On
  // an intact shell these two lines are the only way the pair can tell a red
  // body from a cyan one, so the colour has to be there; a bloom around them
  // would be armour giving off light, which is the one thing armour does not
  // do (`shell-draw.ts`, and the owner's answer on 9 September 2026). A dark
  // cut under each, because the slab is light: the colour reads as coming out
  // of the plate only where what is round it is darker than it is.
  ctx.strokeStyle = rgba(PALETTE.background, 0.85);
  ctx.lineWidth = ink.lineWidth * CUT;
  ctx.stroke(p.edge);
  ctx.lineWidth = ink.lineWidth * CUT * 0.8;
  ctx.stroke(p.crack);
  ctx.strokeStyle = ink.light;
  ctx.lineWidth = ink.lineWidth * 0.9;
  ctx.stroke(p.edge);
  ctx.strokeStyle = rgba(ink.light, 0.8);
  ctx.lineWidth = ink.lineWidth * 0.7;
  ctx.stroke(p.crack);
}
