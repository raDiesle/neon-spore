import type { World } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { showsCannon } from "./view-role.js";

/**
 * THE WELL's projection: **the field turned inside out**, and the only thing
 * this boss is.
 *
 * The hull goes to the centre, the far row becomes a rim around it, and the
 * columns are spread round the middle as the sectors of a clock — so a lane is
 * named by an hour instead of by a number across. On the field the game ships
 * the two words are the same number: eleven columns and one sector left over
 * for the seam make twelve, so **column four is four o'clock** and the pair
 * needs no vocabulary they did not already own. `docs/spec/bosses.md` 11.12 is
 * the design; `sim/well.ts` is why there is nothing of it in the simulation.
 *
 * **The numerals are the column numbers, not hours.** They are drawn at
 * `cfg.cols` sectors of whatever field is being played, so a narrower field is
 * a wider clock with fewer numbers on it and the picture is never wrong — and
 * the coincidence that makes the sentence work is a fact about the shipped
 * field rather than a rule this file enforces.
 *
 * **The seam is at twelve, and it is what the pair has to learn.** The field has
 * two walls, and rolled into a circle they meet — so the sector straight above
 * the ship holds no column at all, and the two lanes either side of it are the
 * left wall and the right wall, which are as far apart as this game gets.
 *
 * What that costs is **reading and reaching, not travel**: `cannonCol` names a
 * column outright and the cannon is simply there on the next tick
 * (`sim/commands.ts`), so nothing in the simulation charges for crossing the
 * field. What does charge is the thumb and the eye. The rail under the clock is
 * still a straight strip with column one at one end and column eleven at the
 * other, so one hour of apparent movement across the top of the picture is the
 * whole width of a phone under the hand — and the picture offers a direction
 * the control has not got, which is *round*. Nothing is hidden: the seam is
 * drawn as the two walls standing a sector apart (`well-face.ts`), and the
 * answer is the hour said plainly rather than a lane described as next to
 * another one. Whether the seam should cost travel as well is an **Asks** in
 * `docs/queue.md`; it would be a change to the simulation, which this boss
 * deliberately is not.
 *
 * Every figure below is in shares of the field's own half-width rather than in
 * tiles, so the disc fits any field the layout hands it. They are constants
 * here and not `SimConfig` fields for `maze-relief.ts`' reason: the only thing
 * one of them could change is how the picture reads, and a second answer to
 * that is a VERSUS candidate rather than a dial (`docs/versus.md`).
 */

/**
 * The far row's radius, as a share of the field's half-width.
 *
 * The margin it leaves outside itself is not spare: the numbers stand in it,
 * and a body **standing on** the rim reaches its own radius further out again.
 * At 0.87 an arriving bulb sat on top of its own numeral.
 */
const RIM = 0.82;
/**
 * The hull's, which is the ship's own rim at the centre. Wide enough that a
 * sector at the hub is still wider than a body: at eleven columns it comes to
 * about three quarters of a tile, against `WELL_BODY`'s two thirds. Narrower
 * and the eleven lanes converge into one crowd over the ship, which is exactly
 * where the pair is doing the work.
 */
const HUB = 0.25;
/**
 * Where an hour's numeral sits — outside the rim, in the margin the disc
 * leaves, which is the only place a number is not standing in a lane.
 */
const NUMERAL = 0.95;
/**
 * How the rows are spread between the two radii: the power the row's share is
 * raised to, so the step between two rings **grows** toward the ship.
 *
 * Fifteen rows will not fit round a phone at an even pitch — the whole radius
 * is under four tiles, and an even spread gives every row a quarter of one,
 * which is a third of a body. So the near rows take most of it and the far
 * ones crowd against the rim: rows ten to fourteen get four fifths of a tile
 * each and rows nought to four share a third of one between them. That is the
 * field's own depth cue rather than a compromise — a thing just over the rim
 * is far away, and far away is where bodies bunch up — and it puts the room
 * exactly where a pair is timing a ward.
 *
 * At 2 the far rows are crushed flat enough that four beats of a fall read as
 * no movement at all, which costs the pilot "on the three". 1.7 is the most
 * bend the near rows can be given without that.
 */
const BEND = 1.7;
/**
 * How big a body is drawn in the well, against the footprint it has on the
 * flat field. It fits the narrowest lane there is, which is a sector at the
 * hub; the depth scale the field already gives a row is multiplied on top, so
 * a body still grows as it comes in (`depth.ts`).
 */
export const WELL_BODY = 0.85;

/** Whether this screen is the one drawn inside out.
 *
 * **The pilot's, and only one of the two.** Flipped on both phones the well is
 * a skin on the field: both seats say the same word about the same lane and
 * the round is the wave it was already. Flipped on one, the pair holds two
 * pictures of one field — the seat with the clock and the seat with the rows —
 * which is this game's whole control scheme pointed at its own board. The
 * pilot gets it because the cannon is the hand of the clock and because the
 * navigator holds the only shield: the seat that has to answer *how far* keeps
 * the picture that tells the truth about distance. */
export const showsWell = showsCannon;

/** Whether the well is the picture this frame — the boss installed, and this
 * the seat it is drawn on. The one question every field pass asks. */
export function wellShown(l: Layout, world: World): boolean {
  return world.boss?.kind === "well" && showsWell(l.role);
}

/** How many sectors the clock is cut into: one per column, and one for the
 * seam where the field's two walls meet. Twelve on the shipped field. */
export function wellSectors(l: Layout): number {
  return l.cols + 1;
}

/**
 * The row the hull stands on, **read off the layout rather than worked out
 * again**.
 *
 * `hullRow` is the simulation's rule and `computeLayout` has already applied it
 * to put `hullY` where it is, so the one place the well could take a second
 * copy of it is here — and a well whose hub was a row out from the hull would
 * draw every body in the fight a fraction of a lane from where the other screen
 * has it. Dividing the layout's own two numbers asks the rule instead of
 * restating it.
 */
function deepestRow(l: Layout): number {
  return l.tile > 0 ? (l.hullY - l.gridTop) / l.tile : 0;
}

/** Half the field's width or height, whichever is smaller — what every radius
 * below is a share of, so the disc is inside the field on any layout. */
function span(l: Layout): number {
  return Math.min(l.gridWidth, l.gridHeight) / 2;
}

/** The middle of the well, which is the middle of the field. */
export function wellCenter(l: Layout): { x: number; y: number } {
  return { x: l.gridLeft + l.gridWidth / 2, y: l.gridTop + l.gridHeight / 2 };
}

/**
 * The angle a column is drawn at, in radians **clockwise from straight up** —
 * the direction a clock's hand points at that hour.
 *
 * Fractional columns are carried through untouched: the cannon's eased place
 * and a dart's crossing are both a column and a half at times, and a hand that
 * jumped sector to sector would be the one thing on this picture that moves
 * like a clock rather than like the ship it is.
 *
 * Column 0 is one sector clockwise of up, so the seam is the sector *before*
 * it and increasing columns run clockwise. That is the way round that matches
 * the rail: a thumb carried right along the strip walks the hand clockwise.
 */
export function wellAngle(l: Layout, col: number): number {
  return ((col + 1) * 2 * Math.PI) / wellSectors(l);
}

/** How wide one sector is, in radians. */
export function wellSectorAngle(l: Layout): number {
  return (2 * Math.PI) / wellSectors(l);
}

/**
 * How far out a row is drawn, in pixels from the centre. The top row is the
 * rim and the hull row is the hub; in between is `BEND`.
 *
 * Fractional rows for the glide, exactly as `tileCY` takes them: a body's fall
 * is one row a beat carried evenly across it (`depth.ts`'s `drawnRow`), and
 * the well changes where that lands, never how it is paced.
 */
export function wellRadius(l: Layout, row: number): number {
  const s = span(l);
  const deep = Math.max(1, deepestRow(l));
  const u = Math.min(1, Math.max(0, row / deep));
  return s * (RIM - (RIM - HUB) * u ** BEND);
}

/** The rim itself — row 0, and the circle arrivals cross. */
export function wellRim(l: Layout): number {
  return span(l) * RIM;
}

/** The ship's own rim at the middle — the hull row. */
export function wellHub(l: Layout): number {
  return span(l) * HUB;
}

/** Where a column's number sits, outside the rim. */
export function wellNumberRing(l: Layout): number {
  return span(l) * NUMERAL;
}

/** A point at this angle and radius. The one place the polar arithmetic is
 * written down, so the face, the bodies, the bolts and the ship cannot come
 * apart. */
export function wellAt(l: Layout, angle: number, radius: number): { x: number; y: number } {
  const c = wellCenter(l);
  return { x: c.x + Math.sin(angle) * radius, y: c.y - Math.cos(angle) * radius };
}

/** Where a tile is drawn — the well's `tileCX`/`tileCY` in one call, because
 * in a circle the two coordinates cannot be asked separately. */
export function wellPlace(l: Layout, col: number, row: number): { x: number; y: number } {
  return wellAt(l, wellAngle(l, col), wellRadius(l, row));
}

/**
 * Which way "down the lane" points at this column, as a rotation for the
 * canvas — so a body's own underside faces the ship it is falling toward.
 *
 * It is the angle itself: a canvas rotated by `a` sends the y axis to
 * `(-sin a, cos a)`, which is the direction from a body at angle `a` back to
 * the centre. A well of upright bodies sliding sideways would be a clock face
 * with things on it rather than a field with things falling in.
 */
export function wellFall(l: Layout, col: number): number {
  return wellAngle(l, col);
}

/**
 * Where the well draws a point the **flat** field would have drawn at `(x, y)`.
 *
 * It is the projection composed with the flat field's own inverse, and it is
 * what lets a transient that was already placed in pixels — a burst of sparks,
 * off `burstFor` — land in the circle without every case in that table learning
 * about this boss (`effects.ts`). A kill that flashed at the bottom of the
 * screen while the body it came out of was drawn at four o'clock is the one
 * failure this is for.
 *
 * **The inverse is written by calling the forward rule, not by restating it.**
 * `tileCX(l, 0)` is column nought's own centre and `tileCY(l, 0)` is row
 * nought's, so the two divisions below carry no copy of how a tile is placed:
 * change `tileCX` and this follows it. A second spelling of that arithmetic is
 * how a spark comes to be a column out in one picture and not the other.
 */
export function wellFromFlat(l: Layout, x: number, y: number): { x: number; y: number } {
  if (l.tile <= 0) return { x, y };
  return wellPlace(l, (x - tileCX(l, 0)) / l.tile, (y - tileCY(l, 0)) / l.tile);
}
