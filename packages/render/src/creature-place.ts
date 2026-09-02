import { bodyPhase } from "@neon-spore/content";
import {
  bodyCenterCol,
  type Creature,
  type CreatureKind,
  DEFAULT_CONFIG,
  isGrippable,
  isMeteorKind,
  type SimConfig,
  spanOf,
} from "@neon-spore/sim";
import { depthScale, drawnCol, drawnRow } from "./depth.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { rockRadius } from "./torch.js";

/**
 * Where a creature is on screen, between beats. The one place the glide is
 * written down: the grip's ring is drawn around the same shape the player is
 * looking at, and the app hit-tests a finger against it, so all three have to
 * agree about where the thing actually is.
 */
export function creatureCenter(
  l: Layout,
  c: Creature,
  beatPhase: number,
): { x: number; y: number } {
  // One tile per beat, linear (`drawnRow`). No easing: the movement must read
  // as an even glide so that "it lands on the four" is a statement both
  // players can act on. Exactly linear, and it stays that way — the depth cues
  // in `depth.ts` change how big a body draws, never where it is.
  const row = drawnRow(c, beatPhase);
  // The same glide sideways, for the one kind that has one: a dart crosses two
  // columns over the beat it moves, and `drawnCol` is where that is written
  // down. Every other body has no `fromCol` to come from and lands on `c.col`
  // exactly, so the lane read is untouched.
  // `c.col` is a wide kind's leftmost column (see `spanCenterCol` in
  // sim/types.ts) — every kind is drawn at its visual centre.
  return { x: tileCX(l, bodyCenterCol(c, drawnCol(c, beatPhase))), y: tileCY(l, row) };
}

/**
 * The seconds a body's contour wobble is sampled at — the wall clock, spread
 * by the body's own phase so that two creatures on the same row are not one
 * shape drawn twice.
 *
 * Not `poseClock`, which is the *beat* a body's own-motion is read at and is
 * a rule in `content/own-motion.ts`. This is the wobble in `blobPath`, and it
 * is here rather than at a draw site because there are now two of those: the
 * body `creatures.ts` fills, and the outline `dart-path.ts` strokes on the
 * tile that body is about to stand in. An outline sampled at a different
 * moment than the body is an outline the body visibly does not fit.
 */
export function contourClock(id: number, time: number): number {
  return time + bodyPhase(id) * 5.4;
}

/**
 * How much of a living body's usual footprint this kind draws at.
 *
 * One today, for everything but THE ECHO. An echo is a slick or a bulb —
 * `wornKind` says so, and `living-look.ts` gives it no contour of its own — so
 * the *only* thing separating it from an ordinary body on the field is that it
 * is small, which makes this number the whole of its silhouette rather than a
 * finish on one. Four of them fan across four columns a beat after one
 * arrives; if the pair cannot tell at a glance that the small ones are the
 * ones that divide, the wave is four slicks with a strange rhythm.
 *
 * It is a rule and not a literal at the draw site because two places ask it:
 * `drawLiving` scales the contour, the glow and the halo by it, and
 * `creatureRadius` below is what the grip's ring is drawn at and what a thumb
 * is hit-tested against. A body drawn at one size and grabbed at another is
 * the defect this function exists to make impossible.
 *
 * Deliberately keyed on `CreatureKind` and not on `CreatureSilhouette.sizeMul`
 * next door: `sizeMul` belongs to a *contour*, and an echo shares its contour
 * with the full-size slick and bulb it is drawn as.
 */
export function livingBodyMul(kind: CreatureKind): number {
  return kind === "echo" ? ECHO_BODY_MUL : 1;
}

/**
 * The echo's share of a body's footprint. Six tenths: small enough to read as
 * a different creature at a glance beside a slick in the next column, and not
 * so small that the 20 px floor the style guide sets for an object at the top
 * of the field is anywhere near — the perspective scale grows it the whole way
 * down, and by the rows where a shot has to land it is close to full size.
 */
const ECHO_BODY_MUL = 0.6;

/**
 * How big it draws. A rock has its own sizes; everything living is one tile —
 * both then times the row's perspective scale, because a ring drawn around a
 * body that grew is a ring that has to grow with it.
 *
 * `beatPhase` and `cfg` are optional so that a caller with neither still gets
 * the shape the game actually draws rather than the flat one: phase 0 puts the
 * body on the row it left, 0.9% of a radius from where it is mid-glide, and
 * `DEFAULT_CONFIG` is what every device runs. `grip.ts` is the one such
 * caller; a quarter of a pixel is under what its own `RING_MUL` spends, and it
 * is worth passing properly the next time that file is open.
 */
export function creatureRadius(
  l: Layout,
  c: Creature,
  beatPhase = 0,
  cfg: SimConfig = DEFAULT_CONFIG,
): number {
  const flat = isMeteorKind(c.kind)
    ? rockRadius(l, spanOf(c))
    : l.tile * 0.4 * livingBodyMul(c.kind);
  return flat * depthScale(cfg, l, drawnRow(c, beatPhase));
}

/**
 * The creature under a finger, or null. Generous — a thumb covers more than a
 * silhouette and a falling target is not a button — and never a boss body or
 * THE WARDEN's rope, neither of which can be gripped (`isGrippable` in
 * sim/kinds.ts). The nearest wins when two overlap.
 *
 * The rope used to be answered here, along its whole length, because a hand was
 * the only thing that touched it. It is now *dragged* by a handle rather than
 * held, and a handle is a circle rather than a line: `tetherHandleCircle` in
 * `tether.ts` owns that hit test, beside the code that draws it.
 */
export function creatureAt(
  l: Layout,
  creatures: readonly Creature[],
  x: number,
  y: number,
  beatPhase: number,
): Creature | null {
  let best: Creature | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of creatures) {
    if (!isGrippable(c.kind)) continue;
    const { x: cx, y: cy } = creatureCenter(l, c, beatPhase);
    const reach = creatureRadius(l, c, beatPhase) * 1.6;
    const d = Math.hypot(x - cx, y - cy);
    if (d > reach || d >= bestDist) continue;
    best = c;
    bestDist = d;
  }
  return best;
}
