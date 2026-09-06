import type { CreatureKind } from "./creature-kinds.js";
import type { Color } from "./types.js";

/**
 * What a `CreatureKind` *means*: which colour goes with which body, how fast
 * one falls, whether it is a rock, whether a hand may be put on it.
 *
 * Every function here is a rule the rest of the simulation must call rather
 * than re-derive — `purity.test.ts` holds several of them to that, because
 * each row in its table is a rule somebody has already written out by hand
 * once. `types.ts` next door is the *shapes*: what a creature, a bullet, a pod
 * and a command are made of, with no arithmetic in any of them.
 *
 * **How wide a body is lives in `span.ts`**, which was cut out of here when
 * THE GYRE arrived and this file was already at its limit. The seam is real
 * rather than convenient: everything here answers a question about a *kind*,
 * and a span stopped being one of those the day a rock's width became an
 * authored number rather than a fact about the tier it belongs to.
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
 * The other ammunition colour — the one a body that turns over becomes.
 *
 * One line, and it is here rather than written out at the two sites that turn
 * a body over for the reason every other rule in this file is: there are two
 * of them now. THE VEIL flips on the shared beat (`veilMorph`) and THE RECOIL
 * flips on the shot that failed to kill it (`recoilStruck`), and both mean the
 * same thing to the pair — *the colour you were holding has just expired*. A
 * third body that turns over would be a third hand-written ternary, and the
 * day `Color` gains a member every one of them is silently wrong.
 */
export function otherColor(color: Color): Color {
  return color === "red" ? "cyan" : "red";
}

/**
 * The five numbered tiers, in speed order, one tile per beat apart. `torch` is
 * a rock too but is not a tier — see `fallTilesPerBeat`, which is why it is
 * not in this list.
 *
 * Exported because the tier *order* is the rule: tier `n` falls `n + 1` tiles
 * a beat, so a tool offering "how fast does this rock come down" (the
 * director's own cell panel) reads its five choices off this list rather than
 * spelling out five kind names in an order it believes to be the speed order.
 */
export const METEOR_TIER_KINDS: readonly RockKind[] = [
  "meteor",
  "meteorMedium",
  "meteorFast",
  "meteorFaster",
  "meteorFastest",
];

/**
 * Every rock: the five tiers, the torch and THE VEER. Neither of the last two
 * is a tier — the torch has a speed of its own and a veer comes down at the
 * slowest tier's — so appending either to `METEOR_TIER_KINDS` would silently
 * make it tier six and hand it a speed nobody chose.
 */
const METEOR_KINDS: readonly CreatureKind[] = [...METEOR_TIER_KINDS, "torch", "veer"];

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
  | "torch"
  | "veer";

/**
 * True for any rock — dead, indestructible, warded rather than shot. Call
 * this instead of writing `kind === "meteor"` by hand: that shape checks only
 * the original, slowest tier and silently drops every rock added since.
 */
export function isMeteorKind(kind: CreatureKind): boolean {
  return METEOR_KINDS.includes(kind);
}

/**
 * **Whether the shield is what answers this body at all**, and therefore
 * whether a shot at it leaves a crater instead of a kill. Every rock, plus THE
 * VOLLEY, which is a rock with something alive sealed in it.
 *
 * One function for two questions because they are one question: a body the
 * shield turns is a body the cannon cannot break, and that has been true of
 * every warded thing in this game since the first meteor. `resolveHull` asks
 * it to decide which row to answer a body on, and `resolve` asks it to decide
 * what a bolt does — two readings of one rule rather than two lists.
 *
 * Call it instead of writing `isMeteorKind(kind) || kind === "volley"`: that
 * shape is the second copy, and the day a third warded body exists one of the
 * two call sites will have it and the other will not.
 */
export function isWardable(kind: CreatureKind): boolean {
  return isMeteorKind(kind) || kind === "volley";
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
  // The Warden's line is lowered once, by `attach`, and then hangs. It used to
  // come down at `meteorMedium`'s speed and break the hull at the bottom; the
  // whole "something falls and has to be held" concept came off the boss with
  // the clamp (docs/spec/bosses.md 11.4). Zero, not a small
  // number: a line that crept would eventually arrive.
  if (kind === "tether") return 0;
  // And the one body that neither falls nor travels: a wisp is somewhere else
  // every `wispDwellBeats` and nowhere in between (`stepWisp`). Zero here is
  // what makes it *arrive* rather than glide in — `onBeat` seeds `fromRow`
  // from this number, so a wisp's first frame is already on the tile it was
  // authored into, which is the only entrance a thing that teleports has.
  if (kind === "wisp") return 0;
  // THE GYRE, both halves of it: the hub walks its own route and the six on
  // its rim are carried by it (`stepGyre`), so neither has a fall for a number
  // here to describe.
  if (kind === "gyre" || kind === "mount") return 0;
  // And a link of THE CRAWLER, which walks the ship's surface sideways and
  // never comes down at all (`crawler-beat.ts`). Zero here is also what makes
  // one *arrive* rather than glide in — `spawnArrivals` seeds `fromRow` from
  // this number, and a worm coming over a wall has no fall to enter on.
  if (kind === "crawler") return 0;
  // THE FENCE, at the second tier's speed: twice everything else on the field
  // and the fastest a thing whose answer has to be *said out loud* can come
  // down. Thirteen rows at two a beat is a little over four seconds from the
  // top of the field to the shield's row, which is the floor a spoken exchange
  // needs (`.claude/skills/new-creature`, step 4). Called rather than written
  // as `2`, so a wall stays "twice a slick" if the tiers are ever re-spaced.
  if (kind === "fence") return fallTilesPerBeat("meteorMedium");
  const tier = (METEOR_TIER_KINDS as readonly CreatureKind[]).indexOf(kind);
  return tier === -1 ? 1 : tier + 1;
}

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

// **Whether a hand may be put on a body** — `isGrippable` and the kinds
// that refuse one — is `grippable.ts` next door, cut out when THE FENCE took
// this file over its limit. It is a question about a gesture rather than about
// a kind, and it was nine tenths of this file's length. `types.ts` exports it
// beside everything here, so nothing that reaches for it had to move.
