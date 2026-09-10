import type { ClownFigure } from "@neon-spore/content";
import { drawClownRider } from "./veer-rider.js";

/**
 * THE ONE RECORD A CANDIDATE VEER LOOK PATCHES.
 *
 * `throb-look.ts` and the files it counts are the precedent, and this is here
 * rather than at the bottom of `veer-clown.ts` for their reason: the record
 * needs the paint and the caller needs the record, so the two would import
 * each other. The paint is `veer-rider.ts`.
 *
 * The record is the **rider** and not the rock. The stone under it is
 * `METEOR_LOOK`, which every rock on the field shares, and a look for one
 * body's stone would be a look for all of them. What is THE VEER's own is the
 * thing sitting on it — the reason the rock does not fall straight — and that
 * is what a candidate answers.
 */

/**
 * One rider, as everything a look on it could want. The figure is already
 * placed: `clownFigure` put every disc where it goes, sunk into the crouch
 * and carried by the sway, and a look draws it rather than re-deciding it.
 */
export interface VeerRider {
  readonly ctx: CanvasRenderingContext2D;
  /** Every disc, corner and arc of the figure, in screen space. */
  readonly f: ClownFigure;
  /** The rock's radius, which the figure is written in. */
  readonly r: number;
  /** How hard the rider is bracing, 0 to 1 (`veerBrace`). */
  readonly brace: number;
  /** The idle sway, in head radii, already applied to the figure. */
  readonly sway: number;
  /** Seconds, for anything that breathes. */
  readonly time: number;
  /** The creature's id, which spreads anything hashed per body. */
  readonly id: number;
}

export interface VeerLook {
  rider(v: VeerRider): void;
}

/** The shipped rider: a clown of stone discs — ruff, head, cone hat, pompom —
 * flat under the field's light, with the one fuchsia nose. */
export const VEER_LOOK: VeerLook = { rider: drawClownRider };
