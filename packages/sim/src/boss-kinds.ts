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
  return kind !== "vane" && kind !== "well" && kind !== "reprise";
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
];
