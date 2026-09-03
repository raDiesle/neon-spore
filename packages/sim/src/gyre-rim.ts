import { midCol, type SimConfig } from "./config.js";
import { livingKindForColor } from "./kinds.js";
import type { Color, Creature, CreatureKind } from "./types.js";

/**
 * THE GYRE's rim and its route, as arithmetic.
 *
 * Nothing here is stored, nothing is mutated and no world is needed: where a
 * mount stands, what colour it is, where the wheel has walked to and how far
 * it has sunk are all read off two integers and the config. `gyre.ts` next
 * door is what moves — the same split `warden-cycle.ts` has from `warden.ts`
 * and `vane-cycle.ts` from `vane.ts`, and for the same reason: render/ and the
 * shape sheet ask where the rim is without pulling a whole creature in.
 */

/** Tiles from the hub to the rim. Five columns wide, like THE WARDEN's ring. */
export const GYRE_RADIUS = 2;

/**
 * Positions around the rim, and **a table rather than a circle**.
 *
 * `Math.sin` is banned in `packages/sim` (`purity.test.ts`): two JS engines may
 * round it differently in the last bit, and a rim computed on the fly would
 * round into a stored column two phones disagree about. It is also the wrong
 * shape for this field even where it would be safe — at an arbitrary angle two
 * of the six mounts round onto tiles a whole radius from where the other four
 * land, and the wheel visibly buckles.
 *
 * So the rim is twelve tiles, exactly the twelve a circle of radius two passes
 * through, written down: `[dcol, drow]` from the hub, starting at the foot of
 * the wheel and going round. Twelve is what makes six mounts sit two apart
 * forever — the ring is a clock face and a mount is a hand on it.
 */
export const GYRE_RING: readonly (readonly [number, number])[] = [
  [0, 2],
  [1, 2],
  [2, 1],
  [2, 0],
  [2, -1],
  [1, -2],
  [0, -2],
  [-1, -2],
  [-2, -1],
  [-2, 0],
  [-2, 1],
  [-1, 2],
];

/** Positions in one whole turn. The ring *is* the count — never a literal. */
export const GYRE_CLICKS = GYRE_RING.length;

/** Bodies on the rim. Six, evenly spaced, so each sits two clicks from the next. */
export const GYRE_MOUNTS = 6;

/** Clicks between one mount and the next. Six mounts over twelve positions. */
export const GYRE_MOUNT_STEP = GYRE_CLICKS / GYRE_MOUNTS;

/** A whole turn, in thousandths of a click — what `gyreTurnMilli` wraps at. */
export const GYRE_TURN_MILLI = GYRE_CLICKS * 1000;

/** Columns and rows from the diamond's centre to each of its four corners. */
export const GYRE_DIAMOND = 2;

/** Beats one leg of the diamond takes, so a lap is four of them. */
export const GYRE_LEG_BEATS = 2;

/** Beats in one whole lap. */
export const GYRE_LAP_BEATS = 4 * GYRE_LEG_BEATS;

/**
 * The four corners of the walk, from the diamond's centre. The same way round
 * as the rim's own turn, so an eye reads one motion rather than two arguing.
 */
const CORNERS: readonly (readonly [number, number])[] = [
  [0, -GYRE_DIAMOND],
  [GYRE_DIAMOND, 0],
  [0, GYRE_DIAMOND],
  [-GYRE_DIAMOND, 0],
];

/**
 * The body a mount is drawn as: the slick or the bulb its colour names, read
 * through the one function that owns the pairing. `wornKind` calls it, so the
 * contour, the own-motion and the interior are an ordinary body's for free —
 * and that is the creature rather than a saving. A mount has to be a slick or
 * a bulb in every pixel, or an alternating rim is six new shapes to learn
 * instead of the two words the pair already has.
 *
 * A slick for a mount built without a colour, the fallback `claspBecomes` and
 * `echoBecomes` already make and for their reason: a body has to be drawn as
 * *some* body. Nothing builds one — `mountColor` gives every slot a colour.
 */
export function gyreBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/**
 * The colour of the mount in slot `slot`. Alternating, and **not authored**:
 * the whole creature is that the rim carries both colours in a fixed order, so
 * a wave that could set them would be a wave that could switch the mechanic
 * off. Even slots are red, which pairs with `livingKindForColor` to make slot
 * zero — the one at the foot of the wheel on the beat it arrives — a slick.
 */
export function mountColor(slot: number): Color {
  return slot % 2 === 0 ? "red" : "cyan";
}

/** Which of the twelve rim positions the wheel has turned to. */
export function gyreClick(c: Creature): number {
  return Math.floor((c.gyreTurnMilli ?? 0) / 1000) % GYRE_CLICKS;
}

/** Which rim position a mount stands in, given the wheel's own. */
export function mountClick(click: number, slot: number): number {
  return (click + slot * GYRE_MOUNT_STEP) % GYRE_CLICKS;
}

/**
 * Where a mount stands, as an offset from its hub. Call this rather than
 * indexing `GYRE_RING` at a draw site or a hit site: the rim, the spokes, the
 * shot that lands and the mount that reaches the hull are four readings of one
 * table, and a second copy of the modulo is how they come to disagree about
 * which tile a body is in.
 */
export function mountOffset(click: number, slot: number): readonly [number, number] {
  return GYRE_RING[mountClick(click, slot)] ?? GYRE_RING[0]!;
}

/** How many beats a gyre has been on the field. Zero on the beat it enters. */
export function gyreStep(c: Creature): number {
  return c.gyreStep ?? 0;
}

/**
 * The row the diamond is centred on before it has sunk at all — the middle of
 * the field, which is also how many beats the wheel spends falling to reach
 * it, since it comes down a row a beat like anything else.
 */
export function gyreRestRow(cfg: SimConfig): number {
  return Math.floor(cfg.rows / 2);
}

/** The column the diamond is centred on. Dead centre, for THE VANE's reason. */
export function gyreRestCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/**
 * Laps completed, which is also how far the whole circuit has sunk. Capped at
 * `gyreSinkLaps`, and the cap is load-bearing rather than tidy: at the cap the
 * foot of the rim reaches exactly the hull row while the hub stops two rows
 * short of it, so the wheel grinds against the ship without the hub ever
 * arriving at one — which is what lets `resolveHull` answer a mount by the
 * ordinary rule and never see a hub at all.
 */
export function gyreLap(cfg: SimConfig, step: number): number {
  const patrol = step - gyreRestRow(cfg);
  if (patrol <= 0) return 0;
  return Math.min(cfg.gyreSinkLaps, Math.floor(patrol / GYRE_LAP_BEATS));
}

/**
 * Where the hub stands on this beat: falling while it is still on its way to
 * the middle, and walking the diamond from then on.
 *
 * One function for both halves because they are one path — the fall is its
 * first leg — and a caller that had to ask which phase it was in would be a
 * second copy of the boundary between them.
 */
export function gyreAt(cfg: SimConfig, step: number): { col: number; row: number } {
  const restRow = gyreRestRow(cfg);
  const col = gyreRestCol(cfg);
  if (step <= restRow) return { col, row: step };

  const at = (step - restRow) % GYRE_LAP_BEATS;
  const leg = Math.floor(at / GYRE_LEG_BEATS);
  const from = CORNERS[leg]!;
  const to = CORNERS[(leg + 1) % CORNERS.length]!;
  // Halfway along the leg on its odd beat. Two corners are two columns and two
  // rows apart, so the midpoint is a whole tile in each and the wheel drifts
  // exactly one of both per beat — no rounding, and nothing for two devices to
  // disagree about (`docs/architecture.md`).
  const part = at % GYRE_LEG_BEATS;
  const dcol = from[0] + ((to[0] - from[0]) * part) / GYRE_LEG_BEATS;
  const drow = from[1] + ((to[1] - from[1]) * part) / GYRE_LEG_BEATS;
  return { col: col + dcol, row: restRow + gyreLap(cfg, step) + drow };
}
