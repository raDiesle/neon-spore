import type { Rng } from "./rng.js";
import { nextInt } from "./rng.js";
import { TELL_THROWS, type TellRung, type TellState, type TellThrow } from "./tell.js";

/**
 * The ring, and who wins an exchange. Everything in this file is pure over the
 * numbers it is handed — no world, no tick, no hull — because it is the part a
 * test wants to hold on its own and the part the picture has to agree with.
 *
 * **The ring is odd or it is not a ring.** Every throw beats exactly as many
 * as it loses to, so with `n` throws each beating `k` and losing to `k`, every
 * throw meets `n - 1` others and `n - 1 = 2k`: `n` is always odd. Three, five,
 * seven — never four. That is why THE TELL's panel carries four buttons and
 * three throws rather than four of anything, and `tellRingIsBalanced` below is
 * the assertion rather than the paragraph.
 */

/**
 * What each throw beats. One entry per throw, in `TELL_THROWS` order, and the
 * *only* copy of the ring in the game — `tellResolve`, the picture and the
 * panel all read it rather than each spelling out three cases.
 */
export const TELL_BEATS: Record<TellThrow, TellThrow> = {
  // The plate is what a bolt is stopped by, every wave of the game.
  plate: "bolt",
  // A mouth open when a bolt arrives swallows it.
  bolt: "maw",
  // A plate is a charge, and the maw is the cannon lobe turned inside out —
  // `intake` empties a lance fill today (`lance.ts`).
  maw: "plate",
};

/**
 * Whether the ring is a ring: every throw beats one, loses to one, and no
 * throw beats itself.
 *
 * Here rather than only in a test because it is the one rule of this boss that
 * a fifth throw would break silently — a table with two arrows into the same
 * node still type-checks and still draws, and the round would simply have a
 * throw that is better than the others. `test/tell.test.ts` calls it, and so
 * does nothing else: it is a statement about the table, not about a tick.
 */
export function tellRingIsBalanced(): boolean {
  if (TELL_THROWS.length % 2 === 0) return false;
  const beaten = new Set<TellThrow>();
  for (const t of TELL_THROWS) {
    const loser = TELL_BEATS[t];
    if (loser === t || beaten.has(loser)) return false;
    beaten.add(loser);
  }
  return beaten.size === TELL_THROWS.length;
}

/** A throw's index in `TELL_THROWS`. -1 for nothing, which is what a fumble is. */
export function tellIndex(t: TellThrow): number {
  return TELL_THROWS.indexOf(t);
}

/** The throw at an index, or null for -1. Narrowing in one place rather than six. */
export function tellThrowAt(i: number): TellThrow | null {
  return TELL_THROWS[i] ?? null;
}

/** The throw that beats this one — what a boss answering the pair plays. */
export function tellBeatenBy(t: TellThrow): TellThrow {
  for (const other of TELL_THROWS) if (TELL_BEATS[other] === t) return other;
  throw new Error(`nothing beats ${t}, so the ring is not a ring`);
}

/**
 * How the exchange came out, as a `TELL_OUTCOMES` index.
 *
 * **The colour is the second axis and it can never help.** A bolt in the
 * boss's own colour lands; a bolt in the other one splashes off, so a win
 * becomes a stand-off — and a loss stays a loss, which is the owner's decision
 * on 8 September 2026 and the only version that holds together. Were a wrong
 * colour to excuse a loss, throwing the wrong colour into PLATE would be
 * *better* than throwing the right one, and player 2's half of the tell would
 * be worth reading backwards.
 *
 * `thrown` is -1 for a fumble or for a window nobody answered, and that is a
 * loss rather than a stand-off: the ship has to throw.
 */
export function tellResolve(
  thrown: number,
  thrownColor: number,
  bossThrow: number,
  bossColor: number,
): number {
  const ours = tellThrowAt(thrown);
  const theirs = tellThrowAt(bossThrow);
  if (ours === null || theirs === null) return 3;
  const raw = ours === theirs ? 2 : TELL_BEATS[ours] === theirs ? 1 : 3;
  // Only a bolt carries a colour, and only a winning bolt can lose one.
  if (raw === 1 && ours === "bolt" && thrownColor !== bossColor) return 2;
  return raw;
}

/**
 * The beat of a rung's tell that a feinting boss shivers on: the last one, the
 * same beat it changes its mind.
 *
 * One line and its own function because two readers need the same answer — the
 * simulation moves `bossShown` on it and the picture draws the contour going
 * tight on it, and a shiver drawn a beat away from the switch is a tell that
 * lies about itself.
 */
export function tellShivers(windowBeats: number): number {
  return Math.max(0, windowBeats - 1);
}

/**
 * How long this rung's window actually is, after the stand-offs it has earned.
 *
 * Never below one beat: a window of nought is a rung nobody can answer, and a
 * pair that has tied four times in a row should be under pressure rather than
 * dead.
 */
export function tellWindow(rung: TellRung, shorten: number): number {
  return Math.max(1, rung.beats - shorten);
}

/**
 * What the boss throws this rung, and what its tell shows.
 *
 * Two numbers rather than one, because a feint is exactly the case where they
 * differ: `shown` is what player 1 reads for the whole window bar its last
 * beat, and `real` is what arrives at the reveal.
 *
 * **A rung that answers does not touch the Rng at all**, which is the point of
 * it: the round becomes a machine the pair can model rather than a bag they
 * draw from. A rung that answers with nothing to answer — the first one, or
 * one after a fumble — falls back to the draw, because there is no third
 * behaviour worth inventing for a case that happens once.
 */
export function tellPick(
  rng: Rng,
  rung: TellRung,
  lastThrow: number,
): { real: number; shown: number } {
  const answered = tellThrowAt(rung.answers === true ? lastThrow : -1);
  const real =
    answered === null ? nextInt(rng, TELL_THROWS.length) : tellIndex(tellBeatenBy(answered));
  if (rung.feint !== true) return { real, shown: real };
  // It shows one of the other two, drawn so the feint itself is not a tell.
  const offset = 1 + nextInt(rng, TELL_THROWS.length - 1);
  return { real, shown: (real + offset) % TELL_THROWS.length };
}

/** The colour the boss wears this rung. Drawn every rung, feint or not. */
export function tellPickColor(rng: Rng): number {
  return nextInt(rng, 2) + 1;
}

/** The rung being played. Clamped, so a state read past the last one answers. */
export function tellCurrent(state: TellState): TellRung {
  const rung = state.rungs[Math.min(state.rung, state.rungs.length - 1)];
  if (rung === undefined) throw new Error("a tell round with no rungs left to play");
  return rung;
}
