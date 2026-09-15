import { isName, normalizeName } from "@neon-spore/net";
import { DEFAULT_DIFFICULTY, type Difficulty, isDifficulty } from "@neon-spore/sim";

/**
 * WHAT A DEVICE REMEMBERS ABOUT THE PEOPLE IT HAS PLAYED WITH, and the rules
 * for changing that list. No storage and no DOM: `pairing.ts` holds the key,
 * the room a pair share, and the four lines that read and write it.
 *
 * The owner asked for the PLAY page to be a list of people to carry on with —
 * *Continue game with David · wave 7* — which turns a stored name into a
 * record: a wave number is a fact about the pair rather than about the device,
 * and `progress.ts`'s one `furthest` cannot tell two evenings with two
 * different people apart.
 *
 * Every rule here is pure and every one of them is a rule somebody could get
 * wrong: a partner played with again keeps the wave they were on, a wave only
 * ever goes up, and a list written by a build that stored plain names reads as
 * those names at wave zero — which is what they were.
 */

/** How many partners a device remembers. The most recent is the one offered. */
export const PARTNERS_KEPT = 4;

/**
 * What this device remembers about one person it has played with.
 *
 * The room is not among the fields: it follows from the pair of names
 * (`roomForPair`) and this device always knows its own, so storing it would be
 * a second copy of something derivable — and one that would go stale the day
 * the derivation changed.
 */
export interface Partner {
  name: string;
  /** The furthest wave the two of them reached, counted from 0 as `world.wave` is. */
  furthest: number;
  /** The tempo they played it at — the room's own level (`sim/difficulty.ts`). */
  level: Difficulty;
}

/** Somebody met but not yet played with: the shape a bare name reads as. */
export function newPartner(name: string): Partner {
  return { name, furthest: 0, level: DEFAULT_DIFFICULTY };
}

/**
 * Whatever was stored, read as a list of records. Unreadable means none.
 *
 * **A string is a record at wave zero.** Every device that played before this
 * existed has a list of plain names under this key, and the honest reading of
 * one is the person, no wave and the default tempo — which is exactly what
 * their row will say until the two of them play again. Forgiving in that one
 * direction only, the way `progress.ts` is: an entry of any other shape, or a
 * name that is not one, is dropped rather than guessed at.
 */
export function parsePartners(raw: string | null): Partner[] {
  if (raw === null) return [];
  try {
    const read = JSON.parse(raw) as unknown;
    if (!Array.isArray(read)) return [];
    return read
      .map(asPartner)
      .filter((one): one is Partner => one !== null)
      .slice(0, PARTNERS_KEPT);
  } catch {
    return [];
  }
}

/** One stored entry, of either shape, or null when it is not a partner at all. */
function asPartner(entry: unknown): Partner | null {
  if (typeof entry === "string") {
    const name = normalizeName(entry);
    return isName(name) ? newPartner(name) : null;
  }
  if (entry === null || typeof entry !== "object") return null;
  const held = entry as Partial<Partner>;
  const name = normalizeName(typeof held.name === "string" ? held.name : "");
  if (!isName(name)) return null;
  const far = held.furthest;
  return {
    name,
    furthest: typeof far === "number" && Number.isFinite(far) && far > 0 ? Math.floor(far) : 0,
    level: isDifficulty(held.level) ? held.level : DEFAULT_DIFFICULTY,
  };
}

/**
 * The list after playing with `partner`, most recent first.
 *
 * Pure, so the rule can be tested: a partner played with again moves to the
 * front rather than appearing twice **and keeps the wave they were on**, which
 * is the whole of what the list is for; the list is capped — a device that has
 * played with thirty people does not need to remember twenty-six of them to
 * offer the last one. A level of `null` is a room that has not said which
 * tempo it is on yet, and says nothing about the one they last played at.
 *
 * **`fresh` is NEW GAME**, and it is the one thing that takes a wave away. The
 * owner, 15 September 2026: a game that already exists does not change its
 * difficulty, and the way to another tempo is to start over — which overrides
 * the game these two had. So the wave goes back to nothing and the tempo is
 * whatever the new room settles on; keeping the old furthest wave beside a new
 * tempo would offer them a wave they cleared at a speed they are no longer
 * playing at.
 */
export function afterPlayingWith(
  kept: readonly Partner[],
  partner: string,
  level: Difficulty | null = null,
  fresh = false,
): Partner[] {
  const name = normalizeName(partner);
  if (!isName(name)) return [...kept];
  const held = kept.find((one) => one.name.toLowerCase() === name.toLowerCase());
  const rest = kept.filter((one) => one.name.toLowerCase() !== name.toLowerCase());
  const was = held ?? newPartner(name);
  return [
    { ...was, name, level: level ?? was.level, furthest: fresh ? 0 : was.furthest },
    ...rest,
  ].slice(0, PARTNERS_KEPT);
}

/**
 * The list after the two of them reached `wave` together.
 *
 * Only ever up, for `progress.ts`'s reason: jumping to wave three from the
 * WAVES list is not losing wave seven, and neither is starting over. A partner
 * the list does not hold is not added here — the list is written where a room
 * holds two named people, and a wave reached is not evidence of who it was
 * with.
 */
export function afterReaching(kept: readonly Partner[], partner: string, wave: number): Partner[] {
  const name = normalizeName(partner).toLowerCase();
  if (!Number.isFinite(wave)) return [...kept];
  const far = Math.floor(wave);
  return kept.map((one) =>
    one.name.toLowerCase() === name && far > one.furthest ? { ...one, furthest: far } : one,
  );
}
