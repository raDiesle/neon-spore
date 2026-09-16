import type { BossEntry } from "./boss-entries.js";

/**
 * **The two questions asked about the union of bosses**, cut out of
 * `boss-entries.ts` on 14 September 2026 when that file stood one boss under
 * its limit — and these two are the half that does not grow a dozen lines per
 * round. A new boss is one interface next door and one name at the end of
 * `BOSS_KINDS` here.
 */

/**
 * Whether this boss *is* the wave, or only bends what the wave sends.
 *
 * All but one are the whole encounter and a creature placed beside one is
 * a wave nobody designed — THE GAUGE most of all, which does not draw a field
 * for a creature to stand on. THE VANE is the opposite — it spawns nothing at all,
 * and a wave without arrivals for it to throw is a mechanism turning over an
 * empty field. So the director's guard against a creature brush on a boss wave
 * asks this rather than `wave.boss !== undefined`, and there is one place the
 * answer lives.
 *
 * THE WELL is the second of those and the plainest: it is a projection, so it
 * spawns nothing, and a well with no arrivals is the field redrawn with nothing
 * standing in it (`well.ts`).
 *
 * THE REPRISE is the third and the one the question was invented for: every
 * body it puts on the field is a body the wave's own author wrote, sent a
 * second time, so a reprise over an empty wave is a mechanism sending nothing
 * again (`reprise.ts`).
 */
export function bossFillsWave(kind: BossEntry["kind"]): boolean {
  // THE STARE is the fourth of them and the plainest: nothing to shoot,
  // nothing to place, and no clock of its own that ends anything. What it does
  // is make the wave its author wrote cost more to play (`stare.ts`), so a
  // stare wave with no arrivals is an eye watching an empty field.
  // THE DIASTOLE is the fifth, and THE VANE's case exactly: a twin lobe
  // hanging above the grid that falls nothing and reaches nothing, whose whole
  // behaviour is deciding when a shot into the top of a column counts
  // (`diastole.ts`). A diastole wave with no arrivals would be two hearts
  // beating over an empty field — and worse, a boss nobody could author
  // pressure against, since the pressure *is* the wave.
  // THE BATON is the sixth: an arm hanging in one column that falls nothing
  // but its own dead segments, whose whole behaviour is whose turn it is
  // (`baton.ts`). The arrivals around it are the wave's own.
  return (
    kind !== "vane" &&
    kind !== "well" &&
    kind !== "reprise" &&
    kind !== "stare" &&
    kind !== "diastole" &&
    kind !== "baton"
  );
}

/**
 * **Whether a boss still installed holds its wave open.**
 *
 * `beat.ts` ends a wave when the script is spent and the field is empty, and
 * it asks this about whatever is still standing. Every boss but one answers
 * yes, and for two different reasons that come to the same thing: a fight the
 * pair has not finished is a wave that is not over, and a round that *has*
 * finished stays installed on purpose so its picture holds until the next wave
 * replaces it — that one ends its wave through `roundSpent` instead
 * (`wave-end.ts`).
 *
 * **THE WELL is the exception, and it is the only boss that could be one.** It
 * has no body, no health, no step and no state: `well.ts` says in as many
 * words that it is the first boss in this game that changes nothing but the
 * picture. There is nothing about it for the pair to finish, so a wave under
 * it ends exactly when the wave its author wrote ends — which is the claim
 * `well.test.ts` already makes about everything else in that world.
 *
 * Until 16 September 2026 there was no question here and `beat.ts` asked for
 * `world.boss === null`, so wave 70 of the shipped campaign could not be
 * passed at all: the pair cleared the field and the wave stood there with a
 * projection holding it. **It is deliberately not `!bossFillsWave(kind)`**,
 * which would answer the same for THE VANE — and a vane is nulled by its last
 * pin coming out (`vane.ts`), so making it stop holding its wave would let a
 * vane wave be passed without the mechanism ever being beaten. The two
 * questions look alike and are about different halves of a boss: one is what
 * it *sends*, this is what it still *asks*.
 */
export function bossHoldsWave(kind: BossEntry["kind"]): boolean {
  return kind !== "well";
}

/**
 * The bosses that exist, as data. `tools/director` reads this to say which of
 * the twelve names in `docs/spec/bosses.md` are actually in the game — the
 * same question `CREATURES` answers for the bestiary, and one a tool must
 * never answer from a list of its own.
 */
export const BOSS_KINDS: readonly BossEntry["kind"][] = [
  "queen",
  "mirror",
  "warden",
  "vane",
  "maze",
  "gauge",
  "fleet",
  "snake",
  "pinball",
  "pulse",
  // **Appended, never inserted.** This list is what `bossHashParts` tags a boss
  // with, so its order is a wire value exactly as `CREATURE_KINDS`' is: a name
  // slipped into the middle would renumber every boss after it, and a replay
  // recorded on yesterday's build would fingerprint as a different world.
  "cairn",
  "well",
  "splice",
  "scout",
  "reprise",
  "stare",
  "diastole",
  "baton",
];
