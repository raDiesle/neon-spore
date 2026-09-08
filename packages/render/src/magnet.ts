import { MAGNET_SHAPE, type MagnetShape } from "@neon-spore/content";
import type { Creature, SimConfig } from "@neon-spore/sim";
import type { Layout } from "./layout.js";

/**
 * THE MAGNET's geometry: the horseshoe, its two pole tips, the staff and the
 * plate, as paths anything may fill.
 *
 * What draws them is `magnet-coil.ts`, and the record the draw goes through is
 * `magnet-look.ts`. The three are separate files rather than one because a
 * record that names a paint function and a paint function that needs these
 * paths would be a cycle — the split `dart-look.ts` and `dart-torch.ts` make,
 * for the same reason.
 *
 * **It is not a blob and it cannot be one.** Every living body in this game is
 * a radius sampled all the way round a centre (`blobRadiusMul`), and this one
 * has a hole through the middle and an opening at the bottom — a contour no
 * radius function describes. THE LID is the same case and takes the same
 * route: a shape of its own in `content` (`magnet-shape.ts`) and a draw path
 * of its own here, routed away in `creature-body.ts` before the living pass
 * sees it.
 *
 * **The picture has to say the rule before anybody reads a word.** Three
 * things are drawn and each is one clause of it. The *opening* at the bottom
 * says there is a way in. The *plate* under it, wider than the poles stand and
 * hanging clear below them, says the way in is not from underneath. And the
 * two *poles* say that the way in has a colour, and that which colour depends
 * on which side. Nothing here is decoration: take away any one of the three
 * and the body stops explaining `sim/magnet.ts`.
 *
 * **The plate is the only armour in this game that is not cut from the body's
 * own contour**, and that is the owner's rule bent on purpose rather than
 * forgotten. Armour that follows a body says *this thing is hard all over*;
 * this plate has to say the opposite — that one direction is shut and the
 * others are open — and a border round the horseshoe would say the first
 * thing while the rule does the second. It is joined into the arch by a staff
 * thick enough to be part of the same mass rather than a wire drawn between
 * two separate objects.
 *
 * `MAGNET_LOOK` is a record and the draw goes through it for `STRAND_LOOK`'s
 * reason: a candidate look is a field patched onto it for the length of one
 * `draw()`, and a path that named the function would never see one
 * (`docs/versus.md`).
 */

/** Everything the body draw needs, so the table next door can hand it over
 * without this file importing the table back (`creature-body.ts`). */
export interface MagnetDraw {
  ctx: CanvasRenderingContext2D;
  l: Layout;
  cfg: SimConfig;
  c: Creature;
  x: number;
  y: number;
  /** The pose clock in beats — the hang is read off it, never off `time`. */
  beats: number;
  /** Seconds of white left on the plate after it turned a shot away, or 0. */
  struck: number;
  near: number;
}

/** How far the body swings, in radians, how many beats a swing takes, and how
 * far apart two bodies are held in that swing. Small: it hangs, it does not
 * sway — a plate that visibly tips would be a picture arguing with a rule that
 * knows nothing about tipping.
 *
 * Exported, unlike everything else about the hang, because `magnet-coil.ts`
 * draws with them and a second copy of an angle is two bodies leaning
 * differently on two phones. */
export const HANG = 0.05;
export const HANG_BEATS = 2.7;
export const HANG_SPREAD = 0.37;

/** A whole turn, so the angles below read as what they are. */
export const TURN = Math.PI * 2;
/** Straight down, in canvas bearings. Every angle here is measured from it. */
const DOWN = Math.PI / 2;

/** The band between the two radii, from `a0` to `a1`, going `ccw`. */
function band(
  r: number,
  outer: number,
  inner: number,
  a0: number,
  a1: number,
  ccw: boolean,
): Path2D {
  const p = new Path2D();
  p.arc(0, 0, r * outer, a0, a1, ccw);
  p.arc(0, 0, r * inner, a1, a0, !ccw);
  p.closePath();
  return p;
}

/** The whole horseshoe, gap at the bottom. */
export function magnetArchPath(r: number, s: MagnetShape = MAGNET_SHAPE): Path2D {
  const g = s.gapTurn * TURN;
  return band(r, s.outer, s.inner, DOWN - g, DOWN + g - TURN, true);
}

/** One pole tip: the last `poleTurn` of an arm, which is the part that carries
 * a colour. `left` is the arm on the viewer's left, and it is the arm that
 * carries the body's authored colour (`magnetPoleColor` in sim). */
export function magnetPolePath(r: number, left: boolean, s: MagnetShape = MAGNET_SHAPE): Path2D {
  const g = s.gapTurn * TURN;
  const p = s.poleTurn * TURN;
  return left
    ? band(r, s.outer, s.inner, DOWN + g, DOWN + g + p, false)
    : band(r, s.outer, s.inner, DOWN - g, DOWN - g - p, true);
}

/** The staff and the plate as one path, so they fill as one mass and no seam
 * is ever drawn between them. */
export function magnetPlatePath(r: number, s: MagnetShape = MAGNET_SHAPE): Path2D {
  const p = new Path2D();
  // The staff starts inside the arch's crown rather than at its inner edge, so
  // the two overlap instead of touching.
  const top = -r * (s.outer + s.inner) * 0.5;
  p.rect(-r * s.staffHalf, top, r * s.staffHalf * 2, r * s.plateDrop - top);
  p.addPath(magnetSlabPath(r, s));
  return p;
}

/** The plate alone, without the staff it hangs on — the half that is armour,
 * and the only edge on this body drawn in hard white. */
export function magnetSlabPath(r: number, s: MagnetShape = MAGNET_SHAPE): Path2D {
  const p = new Path2D();
  p.roundRect(
    -r * s.plateHalf,
    r * (s.plateDrop - s.plateThick),
    r * s.plateHalf * 2,
    r * s.plateThick * 2,
    r * s.plateThick,
  );
  return p;
}

/** The tip of one pole, in body radii — where its light hangs. It is the
 * midpoint of the band at the bearing `gapTurn` puts a pole at. */
export function poleTip(r: number, left: boolean, s: MagnetShape): { x: number; y: number } {
  const a = DOWN + (left ? 1 : -1) * s.gapTurn * TURN;
  const mid = r * (s.outer + s.inner) * 0.5;
  return { x: Math.cos(a) * mid, y: Math.sin(a) * mid };
}
