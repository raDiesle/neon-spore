import { iris } from "./lid-iris.js";

/**
 * THE ONE RECORD A CANDIDATE LID ARMOUR PATCHES.
 *
 * The lens under the plates is THE WARDEN's and is `eye-look.ts`'s question;
 * this record is the armour that slides across it, and nothing else. The two
 * are separate on purpose: `eye:iris` was opened as one slot on two bodies
 * because one record paints both, and a lid slot that reached the lens would
 * be voting on the boss's eye by accident (`tools/versus/DECIDED.md`).
 *
 * Its own file rather than the bottom of `lid.ts`, for `crawler-look.ts`'s
 * reason word for word: the record needs the paint and the caller needs the
 * record, so the two would import each other.
 */

/**
 * The plates over one lid, as everything a drawing of them could want.
 *
 * The context arrives translated to the socket's centre, scaled to the body's
 * own units, and **clipped to the socket** — the caller holds that clip because
 * the lens under the plates is clipped to the same path, and opening it twice
 * would be two clips for one shape. A candidate draws inside it and may rely on
 * it: a plate is a rectangle here and the socket makes it a plate.
 *
 * `gap` is the readout. It is how far each plate's inner edge stands from the
 * middle, and it is `open` already multiplied out by the one rule in `lid.ts`
 * that says how far a fully open lid parts — handed over rather than left to
 * be re-derived, because the seat without the cord reads that distance as the
 * other seat's hand, and two answers to it would be two readouts.
 */
export interface LidPlates {
  readonly ctx: CanvasRenderingContext2D;
  /** How far open, 0..1 — the simulation's number, never eased. */
  readonly open: number;
  /** Where each plate's inner edge stands from the middle, in body units. */
  readonly gap: number;
  /** The socket's half-extents, in the same units. */
  readonly rx: number;
  readonly ry: number;
  /** The armour's own grey, hazed for the row it is on. */
  readonly plate: string;
  /** The armour's edge grey — `shell-plate.ts`'s, unhazed, as the shipped
   * grooves have always been drawn. */
  readonly edge: string;
  /** The lens's rim colour, hazed: the seam is lit in it whatever the tension,
   * so a shut lid still says which trigger to load. */
  readonly light: string;
  /** A line width already divided by the body's scale. */
  readonly line: number;
  /** The wall clock, for anything on the armour that moves and nobody reads a
   * number off. The opening itself is `open` and is never on this clock. */
  readonly time: number;
}

export interface LidLook {
  /** The armour and the gap in it, drawn over the lens and inside the socket. */
  plates(d: LidPlates): void;
}

/** The shipped armour: six overlapping leaves closing to a point at the
 * middle of the eye and turning outward as the cord is pulled — IRIS, the
 * owner's pick on 11 September 2026 (`lid-iris.ts`). The two flat sliding
 * plates it replaced are `drawPlates` in `lid-plates.ts`, kept for the
 * GRAPHICS page's LIBRARY beside BEVEL. */
export const LID_LOOK: LidLook = { plates: iris };
