/**
 * Every body that can stand on the field, as a name — and the fixed order that
 * name is written into the world fingerprint in.
 *
 * Split out of `types.ts` when THE CLASP arrived and that file was already at
 * its 250-line limit. The seam is real rather than a place to cut: `types.ts`
 * next door is the *shapes* a creature, a bullet and a pod are made of, and
 * `kinds.ts` is what a kind **means** — how fast it falls, how wide it is,
 * whether a hand may be put on it. This is the roster the other two are about,
 * and the one of the three with no dependencies at all.
 */

export type CreatureKind =
  | "slick"
  | "bulb"
  | "meteor"
  | "meteorMedium"
  | "meteorFast"
  | "meteorFaster"
  | "meteorFastest"
  | "torch"
  | "queen"
  | "warden"
  | "tether"
  /** A slick or a bulb on player 1's screen and a lure on player 2's: `wears`
   * is which body, `resolveLure` what a shot costs, `lureIsSpent` when it
   * goes. One truth here; the disguise belongs to render/ alone. */
  | "lure"
  /**
   * Swells and shrinks on the shared beat instead of carrying a colour.
   * `throbOpen` on the `Creature` says whether this beat is one it can be hit
   * on — see `throbIsOpen` in `creature-rules.ts`, which is the only place
   * that cycle is decided.
   */
  | "throb"
  /**
   * Armoured, two columns wide, and wearing one piece of shell in front of
   * each. Any colour chips a piece off; the body underneath has no colour at
   * all until the last one goes, and then it has one neither player has ever
   * seen. `shell.ts` holds the arithmetic and `shell-round.ts` the two phases.
   */
  | "shell"
  /**
   * A slick or a bulb inside a shield of its own: every shot is turned away
   * while it is on, and the ward opens it — player 2's column, player 1's
   * trigger. It does not die there, it *stops being a clasp*, and the body
   * underneath falls on as an ordinary slick or bulb. The kind is the whole
   * of the state; there is no `shielded` flag. See `clasp.ts`.
   */
  | "clasp"
  /**
   * The first body that does not hold its lane. It never falls straight down:
   * every other beat it takes a diagonal two rows and two columns to one side
   * or the other, and in between it hangs for exactly one beat. Both the side
   * it is taking and the one after it are chosen a beat ahead, and only player
   * 2 is shown either. `dart.ts` holds the cycle; `Creature.dartDir`,
   * `Creature.dartNext` and `Creature.dartFloat` are the whole of its state.
   */
  | "dart"
  /**
   * A thundercloud with a slick or a bulb inside it, and the body morphs from
   * one to the other every `veilMorphBeats`. Player 1 can see into the cloud
   * and player 2 cannot — the reverse of THE LURE, and the seat that can see
   * is the seat that cannot fire. `veil.ts` holds the whole of it:
   * `veilBecomes` is which body, `veilMorphs` when it turns over, and
   * `Creature.veilStruckTick` is the armour a wrong colour buys it.
   */
  | "veil"
  /**
   * Drawn on player 2's screen and on nobody else's, and never in the same
   * tile twice: every `wispDwellBeats` it stands somewhere else on the field,
   * drawn from the seeded rng. It does not fall, so it never reaches the hull
   * and never leaves on its own — the wave stays open until it is shot. The
   * whole of it is in `wisp.ts`, and it carries no state of its own: where it
   * is *is* `col` and `row`, and when it moves is the shared beat.
   */
  | "wisp";

/**
 * Every `CreatureKind`, in one fixed order, so a kind can be written into the
 * world fingerprint as a number (`hash.ts`).
 *
 * **Append only.** The index *is* the wire value: reordering this list changes
 * what every existing replay hashes to, and two devices on different builds
 * would disagree about a world they are playing identically. The `satisfies`
 * keeps the names honest and `KindsAreExhaustive` keeps the list complete — a
 * kind added to the union and not to the list is a build error rather than a
 * silent collision in the fingerprint.
 */
export const CREATURE_KINDS = [
  "slick",
  "bulb",
  "meteor",
  "meteorMedium",
  "meteorFast",
  "meteorFaster",
  "meteorFastest",
  "torch",
  "queen",
  "warden",
  "tether",
  "lure",
  "throb",
  "shell",
  "clasp",
  "dart",
  "veil",
  "wisp",
] as const satisfies readonly CreatureKind[];

/** Compile-time proof that the list above names every kind. */
type ListedKind = (typeof CREATURE_KINDS)[number];
export type KindsAreExhaustive = CreatureKind extends ListedKind ? true : never;
const KINDS_ARE_EXHAUSTIVE: KindsAreExhaustive = true;
void KINDS_ARE_EXHAUSTIVE;

/**
 * A kind as a stable small integer, for the world fingerprint. Never a ternary
 * chain at the call site: a kind added to the union and not to a chain would
 * hash as whatever the chain fell through to.
 */
export function kindCode(kind: CreatureKind): number {
  return CREATURE_KINDS.indexOf(kind);
}
