import { bodyPhase } from "@neon-spore/content";
import {
  bodyCenterCol,
  type Creature,
  isMeteorKind,
  rindLayersLeft,
  type SimConfig,
  spanOf,
  type World,
} from "@neon-spore/sim";
import { beatboxBodyMul } from "./beatbox.js";
import { depthScale, drawnCol, drawnRow } from "./depth.js";
import { bodyX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";
import { rockRadius } from "./rock-size.js";
import { WELL_BODY, wellShown } from "./well.js";
import { wellBodyAt } from "./well-body.js";

type XY = { x: number; y: number };

/**
 * Where a creature is on screen, between beats, **on the picture this screen
 * is drawing**. The one place the glide is written down: the grip's ring is
 * drawn around the same shape the player is looking at, so both have to agree
 * about where the thing actually is.
 *
 * The world goes in so the question can be asked of the right picture. Until
 * 13 September 2026 this took none and placed every body on the flat grid
 * whichever screen was up — so on THE WELL, where the same body stands at its
 * hour on its row's circle, every mark drawn *around* a body the world still
 * holds (a grip's ring, the lock's frame, a clasp's shell) would have stood in
 * the empty middle of the picture, and `drawWellBodies` drew none of them.
 * On the well the answer is `wellBodyAt`, the same call the body is drawn by.
 */
export function creatureCenter(l: Layout, world: World, c: Creature, beatPhase: number): XY {
  if (wellShown(l, world)) {
    const at = wellBodyAt(l, world.cfg, c, beatPhase);
    return { x: at.x, y: at.y };
  }
  return flatCenter(l, c, beatPhase);
}

/**
 * The flat field's placement, whatever this screen shows — for the one layer
 * that is handed a field and never a world (`touch.ts`, through `creatureAt`),
 * and which asks THE WELL's own hit test when the well is up
 * (`touch-well.ts`). A draw site asks `creatureCenter`.
 */
export function flatCenter(l: Layout, c: Creature, beatPhase: number): XY {
  // One tile per beat, linear (`drawnRow`). No easing: the movement must read
  // as an even glide so that "it lands on the four" is a statement both
  // players can act on. Exactly linear, and it stays that way — the depth cues
  // in `depth.ts` change how big a body draws, never where it is.
  const row = drawnRow(c, beatPhase);
  // The same glide sideways, for the one kind that has one: a dart crosses two
  // columns over the beat it moves, and `drawnCol` is where that is written
  // down. Every other body has no `fromCol` to come from and lands on `c.col`
  // exactly, so the lane read is untouched.
  return centerAt(l, c, row, drawnCol(c, beatPhase));
}

/**
 * The pixel a body stands at for a fractional row and column — the one
 * formula under `creatureCenter` and under THE RECOIL's throw, which places a
 * body off a clock of its own (`recoil-leap.ts`) and must land on the pixel
 * the glide would have. `c.col` is a wide kind's leftmost column (see
 * `spanCenterCol` in sim/types.ts) — every kind is drawn at its visual centre.
 */
export function centerAt(l: Layout, c: Creature, row: number, col: number): XY {
  // `bodyX` is THE FLIP, and this is the only place it is applied to a body.
  // A turned screen draws a body in the mirror of the column it is really in,
  // until two tiles above the hull, where it draws the true column. Every mark
  // drawn *around* a body comes through here too, so a ring cannot end up
  // where the shape is not (`field-flip.ts`).
  return { x: bodyX(l, bodyCenterCol(c, col), row), y: tileCY(l, row) };
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
 * How wide a living body is drawn, in pixels, before distance is spent on it.
 *
 * Two fifths of a tile, and this is the only place that number is written. It
 * was in three: `creatureRadius` here, the body's own draw in `living-draw.ts`,
 * and — the day something wanted to draw the *pieces* of a body after it was
 * gone (`debris.ts`) — nearly a fourth. A footprint spelled out at a second
 * site is a body whose grip ring, whose paint and whose wreckage are three
 * sizes the moment anybody tunes one of them.
 */
export function livingRadius(tile: number, mul: number): number {
  return tile * 0.4 * mul;
}

/**
 * Contour units to pixels for one silhouette at that radius — the other half
 * of the same rule, and split from it because `living-draw.ts` needs the radius
 * on its own as well (a halo, a trail and a line width are all measured in it).
 */
export function livingScale(
  shape: { rx: number; ry: number; sizeMul?: number },
  r: number,
): number {
  return (r / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1);
}

/**
 * How much of a living body's usual footprint this one draws at.
 *
 * One for everything but the two kinds whose size *is* their silhouette. An
 * echo is a slick or a bulb —
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
 * THE RIND is the other, and it is the echo's argument arrived at from the
 * other side: a body one size per layer it still wears, stepping *down* to an
 * ordinary one as it is shot. Nothing else says how much is left of it — there
 * is no bar and no count on the field — so this number is the health readout,
 * and `rindLayersLeft` in the simulation is the one thing it reads.
 *
 * A creature and not a `CreatureKind`, which it took until THE RIND to become:
 * an echo's size is a fact about its kind, a rind's is a fact about the body
 * standing there, and a size that could not see the body could only ever draw
 * the first of the three.
 *
 * Deliberately not `CreatureSilhouette.sizeMul` next door: `sizeMul` belongs
 * to a *contour*, and both of these share theirs with the full-size slick and
 * bulb they are drawn as.
 */
export function livingBodyMul(c: Creature): number {
  if (c.kind === "echo") return ECHO_BODY_MUL;
  if (c.kind === "rind") return 1 + rindLayersLeft(c) * RIND_LAYER_MUL;
  // THE BEATBOX is the third, and it is THE RIND's argument run the other way:
  // a rind starts large and steps down as it is shot, a box starts small and
  // steps *up* as the pair gets beats right. Both are the same kind of fact —
  // a size that is a readout of the body's own state and holds for a whole
  // frame — which is what separates them from the swell, a picture that
  // changes several times a beat and must not move a hit test (`beatbox.ts`).
  if (c.kind === "beatbox") return beatboxBodyMul(c);
  if (c.kind === "throb") return THROB_BODY_MUL;
  return 1;
}

/** THE THROB's share: twice a body, for one that is two tiles by two by the
 * owner's word (12 September 2026) — four fifths of its two tiles across, as a
 * single body is of its one. `colSpan` (sim/span.ts) is the other half. */
const THROB_BODY_MUL = 2;

/**
 * What one of THE RIND's layers is worth in footprint. A whole body: the
 * arrival wears two, so it comes down three times the size of a slick and each
 * shed is a step of one, which is as plain a jump as this game can draw.
 *
 * A step and not an ease, and the shape sheet's own `shed` card makes the
 * argument (`tools/shape-sheet/src/forms/spanning.ts`): a size that eases is a
 * body breathing, which every creature here already does, and a size that
 * jumps is an event. The pair has to see an event to say *again*.
 */
const RIND_LAYER_MUL = 1;

/**
 * The footprint the body had **one layer ago** — what a rind was wearing on
 * the frame before the shed that just happened.
 *
 * Here rather than in `rind-shed.ts` because it is the same rule as
 * `livingBodyMul` read one step back, and `RIND_LAYER_MUL` is the whole of the
 * step. A husk drawn at a size spelled out by hand at its own draw site is a
 * second copy of how big a layer is, and the day the step stops being a whole
 * body it is the skin that quietly stops fitting the body it came off.
 *
 * Defined for any creature, and one whole layer above `livingBodyMul` for all
 * of them: nothing but a rind ever sheds, so nothing else asks.
 */
export function rindPrevBodyMul(c: Creature): number {
  return livingBodyMul(c) + RIND_LAYER_MUL;
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
 * How big it draws, on the picture this screen is drawing. A rock has its own
 * sizes; everything living is one tile — both then times the row's
 * perspective scale, because a ring drawn around a body that grew is a ring
 * that has to grow with it — and on THE WELL times `WELL_BODY`, the share of
 * its flat footprint a body is drawn at there (`well-draw.ts`).
 *
 * `beatPhase` is optional so that a caller with none still gets the shape the
 * game draws rather than the flat one: phase 0 puts the body on the row it
 * left, 0.9% of a radius from where it is mid-glide.
 */
export function creatureRadius(l: Layout, world: World, c: Creature, beatPhase = 0): number {
  const flat = flatRadius(l, world.cfg, c, beatPhase);
  return wellShown(l, world) ? flat * WELL_BODY : flat;
}

/** The flat field's size — `flatCenter`'s reason, for the same two callers. */
export function flatRadius(l: Layout, cfg: SimConfig, c: Creature, beatPhase: number): number {
  const flat = isMeteorKind(c.kind)
    ? rockRadius(l, spanOf(c))
    : livingRadius(l.tile, livingBodyMul(c));
  return flat * depthScale(cfg, l, drawnRow(c, beatPhase));
}
