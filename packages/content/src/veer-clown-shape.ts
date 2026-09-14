import type { Point } from "./shapes.js";

/**
 * THE VEER's rider, as geometry: where every disc of the clown sits on the
 * rock, how far the hat whips over when it braces, and the loops all of that
 * comes to when something wants the figure as an outline rather than as a
 * drawing.
 *
 * **Why it is here and not in render.** The rider was drawn in one place —
 * `render/veer-clown.ts` — for as long as one thing drew it, and every figure
 * in it was a literal beside the stroke that used it. Two things draw it now:
 * the game, in colour, disc by disc, and the director's palette, which needs
 * the same figure as a contour so the VEER brush shows a clown instead of the
 * plain stone every other rock brush shows. A second copy of "the hat is two
 * and a tenth head-radii tall" is a clown whose picture in the palette is not
 * the clown on the field, and nobody would ever see the two drift apart. So
 * the figures live here, beside `lid-shape.ts` and `ghost-shape.ts` for the
 * reason those two give: this package is where a shape is described, and a
 * shape described in two places is two shapes.
 *
 * **It is discs and one triangle, not a contour.** Every other body in this
 * package is a closed curve sampled round a centre, because every other body
 * is one lump. A clown is a pile of separate round things with a cone on top,
 * and what tells it apart at a tile thirty pixels wide is that the things are
 * separate — `clownLoops` hands them over as separate loops for that reason,
 * and the shape sheet's `contour.ts` already knows what to do with a subject
 * that comes apart.
 */

/** One disc of the figure: the head, the nose, a ruff bead, the pompom. */
export interface ClownDisc {
  x: number;
  y: number;
  r: number;
}

/** The grin: the one mark that is a stroke rather than a body, struck across
 * the face between two angles. */
export interface ClownArc {
  x: number;
  y: number;
  r: number;
  from: number;
  to: number;
  width: number;
}

/**
 * The whole rider at one moment, in the same units the rock's radius is in and
 * placed against the rock's own centre. The face is carried here beside the
 * rest even though it is no part of the outline, because it is part of the
 * figure and the alternative is a second table of numbers in render for three
 * marks; `clownLoops` decides which of these belong to a silhouette.
 */
export interface ClownFigure {
  ruff: ClownDisc[];
  head: ClownDisc;
  /** The hat, as the three corners it is drawn between, already leaned. */
  hat: Point[];
  pompom: ClownDisc;
  eyes: ClownDisc[];
  grin: ClownArc;
  nose: ClownDisc;
  /** How far the breath of light under the nose reaches. */
  noseGlow: number;
  /** Where the light around a bracing rider is centred, and how wide. */
  brace: ClownDisc;
}

/** Every proportion of the figure. Head radii unless the field says rock. */
export interface ClownSilhouette {
  /** The head's radius, in rock radii — and the unit every other figure here
   * is written in, so a rock authored two tiles wide carries a rider twice the
   * size rather than the same small one perched on a boulder. */
  headMul: number;
  /** How far above the rock's centre the shoulders sit, in rock radii. */
  seatMul: number;
  /** How deep the rider sinks into the pull, in rock radii, at full crouch. */
  crouchMul: number;
  /** How far the hat whips over with it, in radians, at full crouch. */
  hatLean: number;
  /** Ruff beads either side of the middle one: 2 draws a collar of five. */
  ruffSide: number;
  /** The step from one ruff bead to the next, how far each rides down the
   * rock's shoulder as it goes out, and how big one is. */
  ruffStep: number;
  ruffDrop: number;
  ruffMul: number;
  /** The head's centre above the shoulders. */
  headLift: number;
  /** The hat's base above the head's centre, its half-width, and its height. */
  hatLift: number;
  hatHalf: number;
  hatTip: number;
  pompomMul: number;
  /** The eyes: how far out, how far up, how big. */
  eyeOut: number;
  eyeUp: number;
  eyeMul: number;
  /** The grin: how far below the head's centre it is struck, how wide an arc,
   * between which two angles in turns of π, and how heavy the stroke. */
  grinDrop: number;
  grinMul: number;
  grinFrom: number;
  grinTo: number;
  grinWidth: number;
  /** The nose: how far below the head's centre, how big, and how far its own
   * light reaches. */
  noseDrop: number;
  noseMul: number;
  noseGlowMul: number;
  /** How far the light around a bracing rider reaches. */
  braceMul: number;
  /** The idle sway, as a share of a head radius. The rock is never still and
   * neither is the thing sitting on it; render supplies the phase. */
  swayMul: number;
}

/**
 * THE VEER's rider: a cone hat with a pompom over a head, a ruff where it
 * meets the stone, and a nose.
 *
 * The proportions are the ones the creature shipped with, and every one of
 * them is a reading at a tile thirty pixels wide rather than a drawing at
 * rest. The hat is the tallest thing on the figure and carries the
 * silhouette — a clown read at arm's length is a triangle over a circle — and
 * the ruff is what says the figure is *on* the rock and not floating over it.
 */
export const VEER_CLOWN: ClownSilhouette = {
  headMul: 0.46,
  seatMul: 0.72,
  crouchMul: 0.3,
  hatLean: 0.5,
  ruffSide: 2,
  ruffStep: 0.52,
  ruffDrop: 0.12,
  ruffMul: 0.36,
  headLift: 0.95,
  hatLift: 0.55,
  hatHalf: 0.9,
  hatTip: 2.1,
  pompomMul: 0.3,
  eyeOut: 0.4,
  eyeUp: 0.26,
  eyeMul: 0.15,
  grinDrop: 0.08,
  grinMul: 0.64,
  grinFrom: 0.28,
  grinTo: 0.72,
  grinWidth: 0.15,
  noseDrop: 0.1,
  noseMul: 0.24,
  noseGlowMul: 0.6,
  braceMul: 1.9,
  swayMul: 0.07,
};
