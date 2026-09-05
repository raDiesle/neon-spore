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

/**
 * Whether a hand may be put on this kind at all — meaning the grip, which is
 * only ever a brake on a fall (`grip.ts`).
 *
 * The tether is refused for the queen's own reason: it does not fall, so a hand
 * on it would drag at nothing while showing every sign of working. It is still
 * the one thing in the game a hand is the only answer to — it is *dragged*
 * rather than held now, by its handle, and that is a different verb with its
 * own hit test (`render/src/tether.ts`).
 *
 * The dart is refused for the same reason arrived at from the other side. It
 * *does* come down the field, but not by falling: `stepDart` moves it two rows
 * on the beats it moves and none on the beats it hangs, and it never goes near
 * `grippedFallTiles`. A brake scales a rate, and a dart has no rate to scale —
 * a hand on one would be the tether's defect wearing a body that visibly
 * travels, which is worse.
 *
 * The wisp is refused for all three reasons at once, and for a fourth that is
 * the whole creature: player 1 cannot see one, so a hand could only ever be
 * put on it by the seat that already knows where it is — which is a way of
 * marking the tile for the other player without saying anything, and saying it
 * out loud is the game.
 *
 * THE GYRE is refused on both halves, and it is the dart's refusal twice over:
 * a hub walks a diamond and a mount is carried around a rim, so neither has a
 * rate for a brake to scale. The pair's answer to a wheel is the maw, which
 * slows the *turn* and is the coupling the creature was built around
 * (`gyreSucked`).
 *
 * THE CAROM is refused for the dart's reason exactly: it crosses the field on
 * a diagonal rather than falling, so there is no rate for a brake to scale.
 * The rock it becomes is grippable again the instant the crust comes off, and
 * that is the creature rather than an inconsistency — a hand is worth nothing
 * against the half of it the cannon answers and buys the shield a beat against
 * the half it does not.
 *
 * THE CHUTE is refused for the third time on the same grounds, and it is the
 * one that most looks like it wants a hand: a body drifting down under a
 * canopy is exactly what a thumb reaches for. But it does not *fall* — it
 * takes a whole row on the beats `chuteFalls` names and none at all on the
 * others — so there is no rate for a brake to scale, and a hand on one would
 * drag at nothing while showing every sign of working. That is the tether's
 * defect wearing the most inviting body in the game, which is worse.
 *
 * A list rather than a chain of `!==`, now that there are eight of them: a
 * chain that long is one somebody extends by pattern rather than by argument.
 */
// THE VOLLEY is refused for THE CAROM's reason exactly: it crosses on a
// diagonal and climbs on a ward rather than falling, so `stepVolley` never
// goes near `grippedFallTiles` and there is no rate for a brake to scale. The
// body that comes out of the shell is grippable again the instant it is a
// slick or a bulb, which is the creature rather than an inconsistency — a hand
// is worth nothing against the half the shield answers and buys the cannon a
// beat against the half it does not.
const UNGRIPPABLE: readonly CreatureKind[] = [
  "tether",
  "dart",
  "wisp",
  "gyre",
  "mount",
  "carom",
  "chute",
  "volley",
];

export function isGrippable(kind: CreatureKind): boolean {
  return !isBossBody(kind) && !UNGRIPPABLE.includes(kind);
}
