import { nameHash } from "./hash.js";

/**
 * **Every glancing thing its own temper** — the owner, 14 October 2026, the day
 * every boss took its glance: *they should vary somehow ... they should be not
 * exactly equal*.
 *
 * A style (`glance-styles.ts`) is written against one steady six-second round.
 * A temper is how one boss — or, later, one enemy — plays it: rounds a little
 * longer or shorter than six seconds, COCK cocking two, three or four times a
 * round, and a short cycle of rounds that differ from each other in length and
 * reach, so no two things glance in step and no one thing repeats itself
 * exactly from one round to the next.
 *
 * It is read off the thing's name (or id) by a hash, so it is the same on
 * every run, on both phones, and in every test. Every round still begins and
 * ends at the middle with the part level, so one round hands over to the next
 * without a jump whatever their lengths and reaches.
 *
 * **A round never reaches past the size it is given**: the shipped size is the
 * widest a boss's hit tests allow (`gimbal-glance.ts`), so the variety is in
 * how much less a round reaches, and one round in every cycle reaches it all.
 */

/** Seconds of the steady round a style is written against. */
export const GLANCE_ROUND = 6;

export interface GlanceTemper {
  /** Seconds one round takes before its own share below. */
  round: number;
  /** How many times COCK cocks a round. */
  cocks: number;
  /** The cycle: each round's length, as a share of `round`, and its reach, as a share of the size. */
  rounds: readonly { length: number; gain: number }[];
}

/** Every round alike: six seconds, three cocks, the whole reach. What a style is judged against. */
export const STEADY: GlanceTemper = {
  round: GLANCE_ROUND,
  cocks: 3,
  rounds: [{ length: 1, gain: 1 }],
};

/** The shortest and longest a tempered round is before its own share, seconds. */
const SHORTEST = 4.8;
const LONGEST = 7.8;
/** COCK's cocks a round, picked from; three twice, the count the owner first took. */
const COCKS = [2, 3, 3, 4] as const;
/** Rounds in a cycle before it repeats. */
const CYCLE = 5;
/** How far a round's length is off its temper's, either way, as a share. */
const LENGTH_SPREAD = 0.15;
/** The least a round reaches, as a share of the size. */
const LEAST_GAIN = 0.75;

/** The temper of the thing called `name` — a boss's id, or an enemy's. */
export function temperOf(name: string | number): GlanceTemper {
  const key = String(name);
  const round = SHORTEST + (LONGEST - SHORTEST) * nameHash(key, 0);
  const cocks = COCKS[Math.floor(nameHash(key, 1) * COCKS.length)] ?? 3;
  const full = Math.floor(nameHash(key, 2) * CYCLE);
  const rounds = Array.from({ length: CYCLE }, (_, i) => ({
    length: 1 + LENGTH_SPREAD * (2 * nameHash(key, 10 + i) - 1),
    gain: i === full ? 1 : LEAST_GAIN + (1 - LEAST_GAIN) * nameHash(key, 20 + i),
  }));
  return { round, cocks, rounds };
}

/**
 * Where a part on `temper` is `time` seconds in: how far through the steady
 * round its own round is, in that round's seconds, and how far that round
 * reaches.
 */
export function temperedAt(temper: GlanceTemper, time: number): { t: number; gain: number } {
  let cycle = 0;
  for (const r of temper.rounds) cycle += r.length * temper.round;
  let left = time - Math.floor(time / cycle) * cycle;
  for (const r of temper.rounds) {
    const seconds = r.length * temper.round;
    if (left < seconds) return { t: (left / seconds) * GLANCE_ROUND, gain: r.gain };
    left -= seconds;
  }
  return { t: 0, gain: 1 };
}
