import type { Color, Creature, CreatureKind } from "./types.js";

/**
 * What a `CreatureKind` *means*: which colour goes with which body, how fast
 * one falls, how wide it is, whether a hand may be put on it.
 *
 * Every function here is a rule the rest of the simulation must call rather
 * than re-derive — `purity.test.ts` holds several of them to that, because
 * each row in its table is a rule somebody has already written out by hand
 * once. `types.ts` next door is the *shapes*: what a creature, a bullet, a pod
 * and a command are made of, with no arithmetic in any of them.
 */

/**
 * The single source of the colour-to-silhouette pairing. `packages/content`
 * checks its own bestiary against this, and nothing may spell the mapping out
 * by hand a second time.
 */
export function livingKindForColor(color: Color): CreatureKind {
  if (color === "red") return "slick";
  return "bulb";
}

/**
 * The five numbered tiers, in speed order, one tile per beat apart. `torch` is
 * a rock too but is not a tier — see `fallTilesPerBeat`, which is why it is
 * not in this list.
 */
const METEOR_TIER_KINDS: readonly CreatureKind[] = [
  "meteor",
  "meteorMedium",
  "meteorFast",
  "meteorFaster",
  "meteorFastest",
];

/** Every rock: the five tiers plus the torch. */
const METEOR_KINDS: readonly CreatureKind[] = [...METEOR_TIER_KINDS, "torch"];

/**
 * The `CreatureKind` values `isMeteorKind` accepts, spelled out once so a
 * wave that names a rock kind (`packages/content/src/waves.ts`) can be typed
 * against exactly that set instead of the bare `CreatureKind` union, which
 * would let a wave author a living kind where only a rock belongs.
 */
export type RockKind =
  | "meteor"
  | "meteorMedium"
  | "meteorFast"
  | "meteorFaster"
  | "meteorFastest"
  | "torch";

/**
 * True for any rock — dead, indestructible, warded rather than shot. Call
 * this instead of writing `kind === "meteor"` by hand: that shape checks only
 * the original, slowest tier and silently drops every rock added since.
 */
export function isMeteorKind(kind: CreatureKind): boolean {
  return METEOR_KINDS.includes(kind);
}

/**
 * Tiles a creature falls each beat. Only the rock kinds ever differ from one
 * — five tiers, one tile per beat apart, `meteor` the original and slowest.
 *
 * `torch` is deliberately not appended to `METEOR_TIER_KINDS`: that would
 * silently make it tier six, one beat faster than intended, and drift the
 * next time a tier is added. It stays the fastest thing in the field instead,
 * by calling this function rather than repeating the number — `+ 8` is as
 * fast as it can go without dropping the fall from two beats to one: a torch
 * can be shot full of holes while it falls (`torch.test.ts`), and a one-beat
 * fall leaves nowhere near enough of the flight in range for that to still
 * be a thing a player can do, not just a thing that is technically possible.
 */
export function fallTilesPerBeat(kind: CreatureKind): number {
  if (kind === "torch") return fallTilesPerBeat("meteorFastest") + 8;
  // The Warden's tether comes down at a named rock's speed rather than at a
  // number of its own — that is what lets `bosses.md` 11.4 say "reaching the
  // hull on cycle beat 6" and have it stay true if the tier is ever retuned.
  if (kind === "tether") return fallTilesPerBeat("meteorMedium");
  const tier = METEOR_TIER_KINDS.indexOf(kind);
  return tier === -1 ? 1 : tier + 1;
}

/**
 * Columns wide a kind occupies. Every kind is one tile except the torch,
 * which is two — twice a plain rock's width — and the Warden, which is five:
 * a fixture rather than an arrival, and wide enough that the column its pupil
 * is in is a thing the pair has to name (docs/spec/bosses.md 11.4).
 */
export function colSpan(kind: CreatureKind): number {
  if (kind === "warden") return WARDEN_COLS;
  return kind === "torch" ? 2 : 1;
}

/**
 * Columns the Warden's ring covers. Odd, so the body has a whole column at its
 * centre and "dead centre" is a place rather than a rounding — and five rather
 * than three because the pupil's travel is the fight: a hole with one column
 * either side of home is a hole that twitches, not one that looks around.
 */
export const WARDEN_COLS = 5;

/**
 * A boss that stands where it was installed. The queen holds her row until
 * petals make her descend, the Warden never moves at all — so neither is
 * carried by the beat's fall loop, and neither can be gripped: a hand on
 * something that was never falling drags at nothing while showing every sign
 * of working.
 *
 * One function for both questions because they are one question. `beat.ts`
 * and `isGrippable` call it; nothing may name the two kinds a second time.
 */
export function isBossBody(kind: CreatureKind): boolean {
  return kind === "queen" || kind === "warden";
}

/**
 * Whether a hand may be put on this kind at all. The tether is the reason it
 * exists as a rule rather than as one exclusion in `setGrip`: it is the first
 * thing in the game that is *only* answered by a hand, and it stands beside a
 * boss body that may never be held.
 */
export function isGrippable(kind: CreatureKind): boolean {
  return !isBossBody(kind);
}

/**
 * Whether a creature occupies the given column — true for every column its
 * span covers, not only `col` itself. Call this instead of `c.col === col`
 * wherever a column test decides a hit, a hull impact or a shield match: a
 * one-column comparison silently misses the torch's second column.
 *
 * `c.col` is always the *leftmost* column a creature occupies — a span wider
 * than one tile has no single integer column at its centre, so there is
 * nothing else `col` could consistently mean once a kind spans an even
 * number of tiles. See `spanCenterCol` for where the centre is needed.
 */
export function occupiesCol(c: Creature, col: number): boolean {
  return col >= c.col && col < c.col + colSpan(c.kind);
}

/** Clamp a spawn column so a wide creature's whole span stays on the field. */
export function clampSpanCol(col: number, cols: number, kind: CreatureKind): number {
  return Math.max(0, Math.min(cols - colSpan(kind), Math.round(col)));
}

/**
 * The tile column at a creature's visual centre, in tile units. Needed
 * anywhere a wide creature (only the torch, today) must be drawn or reported
 * as one thing rather than as its leftmost column — `col` itself is always
 * an integer, but a two-wide creature's centre sits half a tile past it.
 */
export function spanCenterCol(kind: CreatureKind, col: number): number {
  return col + (colSpan(kind) - 1) / 2;
}
