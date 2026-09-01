import type { World } from "./world.js";

/**
 * The balance sheet: what the two of you were like together, once the run is
 * over (docs/spec/structure.md 7.2).
 *
 * Every number here is shared. Not one of them can be read backwards to say
 * who missed — that is the whole rule the spec puts on this screen, because a
 * sub-value that names a player turns the screen after the run into an
 * apportioning of blame, and a pair that is being blamed does not start over.
 *
 * What makes a number shareable is that it takes both of them to move it. A
 * ward needs player 2's column and player 1's moment; a pod needs player 1
 * under it and player 1 open, but only player 2 can shoot it loose in the
 * first place; a colour needs player 2 to see it and player 1 to call it. So
 * the sheet counts *joint moments* — occasions the pair either met or did not
 * — and the SYNC value is simply the share of them that went right.
 *
 * The counters live in the world because the world is the only thing both
 * devices agree about; the arithmetic lives here because a percentage is not
 * state. Nothing in this file stores anything.
 */

/** One line of the balance sheet: how many of how many. */
export interface Tally {
  good: number;
  of: number;
}

/**
 * The rest of the balance sheet — everything countable that is not a ward.
 * Run-scoped exactly like `GuardStats`: cleared by `resetRun`, carried across
 * waves by `startWave`, and read for display by `balanceSheet`.
 *
 * The wards stay in `GuardStats` rather than moving in here, because the HUD
 * reads them every frame while a run is going and this is the record of one
 * that has ended.
 */
export interface RunStats {
  /** Pods a shot knocked loose. The chances the pair made for itself. */
  podsFreed: number;
  /** Pods that reached the maw with the cannon under them and open. */
  podsTaken: number;
  /** Pods that reached the maw and broke on the skin. */
  podsLost: number;
  /** Shots that met a living creature in its own colour. */
  colorHits: number;
  /** Shots that met one in the other colour. */
  colorMisses: number;
  /** Joint moments met in a row, right now. */
  streak: number;
  /** The longest such run of the whole run. A shared memory, not a score. */
  bestStreak: number;
  /** Waves the pair got to the end of. */
  wavesCleared: number;
}

export interface BalanceSheet {
  /**
   * The one shared percentage, or null when the run had no joint moment in it
   * at all — a run that ended before anything was asked of the pair has no
   * sync value, and inventing 0% or 100% for it would be a lie either way.
   */
  sync: number | null;
  /** How many joint moments the run contained. The denominator of `sync`. */
  moments: number;
  /** Meteors warded off, of every meteor that reached the hull. */
  wards: Tally;
  /**
   * Of the wards where the shield *was* in the column, the ones that were also
   * in time. The interesting failure class: they agreed on where and missed on
   * when, which is what a voice delay actually breaks.
   */
  timing: Tally;
  /** Shots that burst a creature, of every shot that met one. */
  color: Tally;
  /** Pods taken in, of every pod that reached the maw. */
  pods: Tally;
  /** Pods a shot knocked loose. The chances the pair made for itself. */
  podsFreed: number;
  /** Longest run of joint moments with nothing missed. A shared memory. */
  bestStreak: number;
  wavesCleared: number;
  score: number;
}

/** A tally as a whole percentage, or null when there was nothing to count. */
export function share(t: Tally): number | null {
  return t.of === 0 ? null : Math.round((t.good * 100) / t.of);
}

/** Everything the after-run screen shows, derived from the world and stored nowhere. */
export function balanceSheet(world: World): BalanceSheet {
  const g = world.guard;
  const b = world.balance;
  const podsArrived = b.podsTaken + b.podsLost;
  const shots = b.colorHits + b.colorMisses;
  const good = g.deflected + b.podsTaken + b.colorHits;
  const moments = g.tries + podsArrived + shots;

  return {
    sync: share({ good, of: moments }),
    moments,
    wards: { good: g.deflected, of: g.tries },
    timing: { good: g.deflected, of: g.deflected + g.mistimed },
    color: { good: b.colorHits, of: shots },
    pods: { good: b.podsTaken, of: podsArrived },
    podsFreed: b.podsFreed,
    bestStreak: b.bestStreak,
    wavesCleared: b.wavesCleared,
    score: world.score,
  };
}

/**
 * A joint moment resolved. Called from the three places one can happen — the
 * hull, the maw and a shot — so the streak is one definition rather than three
 * copies of the same `+= 1`.
 */
export function markMoment(world: World, met: boolean): void {
  const b = world.balance;
  if (!met) {
    b.streak = 0;
    return;
  }
  b.streak += 1;
  if (b.streak > b.bestStreak) b.bestStreak = b.streak;
}

/**
 * A shot met a creature in its own colour. A joint moment: player 2 is the
 * only one who can see the colour and player 1 is the only one who can load
 * it, so the shot is the pair agreeing out loud (docs/spec/couplings.md).
 *
 * A rock is not counted either way — it has no colour to get right.
 *
 * **Here rather than in `bullet-hit.ts`, where they were written.** Three
 * files now book these moments without meeting a body the way that file's
 * `resolve` does — THE VANE, whose bearing hangs above the field and is
 * answered where a bullet runs out of it, and THE VEIL, whose rule is its own
 * file because `bullet-hit.ts` is at its length limit. The second of those
 * would have had to import from the file that imports it, which is a cycle
 * bought for nothing: the two counters are the balance sheet's, `markMoment`
 * is already here, and nothing in either line is about a bullet. Every caller
 * still calls them rather than writing `colorHits += 1` a second time
 * somewhere else.
 */
export function metColor(world: World): void {
  world.balance.colorHits += 1;
  markMoment(world, true);
}

/** The same moment, missed: the wrong colour went up the column. */
export function missedColor(world: World): void {
  world.balance.colorMisses += 1;
  markMoment(world, false);
}

/** A fresh sheet. `resetRun` and `createWorld` build the run's counters here. */
export function emptyRunStats(): RunStats {
  return {
    podsFreed: 0,
    podsTaken: 0,
    podsLost: 0,
    colorHits: 0,
    colorMisses: 0,
    streak: 0,
    bestStreak: 0,
    wavesCleared: 0,
  };
}
