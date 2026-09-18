import type { QueenState } from "./boss-state.js";
import { nextInt } from "./rng.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * The mark itself: the two vulnerable spots cradled under her middle, one
 * tile either side of her own column with a one-tile gap between them where
 * nothing stands. Only one of the two is ever real, and both stay armoured
 * until the moment it opens — at which point that one, and only that one,
 * loses its armour.
 *
 * **The two halves of knowing it are split between the two screens**, and
 * that is the whole boss. What is coming — the creature and its colour — is
 * player 1's to read; *where* it will open is player 2's. Neither can act on
 * their own half: player 1 holds the cannon but does not know which column,
 * player 2 knows the column but does not fire. See `queen-weakpoint.ts` in
 * render/, which is where the split is actually drawn.
 *
 * So what is coming is chosen the moment the last bloom closed, not the
 * moment the next is announced (`pickNextBloom`): her body is never showing
 * nothing, and `announce` only ever adds the *timing* to something already
 * on it. That is also what lets the mark morph from one creature into the
 * other rather than cutting between them.
 *
 * `boss.ts` calls `announce`, `openBloom` and `closeBloom` from `stepBoss`
 * on every beat; nothing else here runs on its own clock.
 */

/**
 * Beats between one scripted rock and the next. Fixed for the whole fight —
 * not tied to her phase or her health, so it is one thing the pair can learn
 * once and rely on from her very first beat to her last. Owned here, not
 * `boss.ts`: the mark's own timing is derived from it (`ROCK_MID`), and
 * `boss.ts` imports it back for the rock clock itself (`spitCycle`).
 */
export const ROCK_CYCLE = 8;

/**
 * The beat, within a rock cycle, the mark opens on — exactly halfway between
 * one rock landing and the next. `announce` derives the announce beat from
 * this and a phase's own `tell`, so the open beat itself never moves: only
 * how much warning it gets does. A pair is never asked to answer a rock and
 * take the mark in the same beat.
 */
const ROCK_MID = ROCK_CYCLE / 2;

/**
 * The three phases, tightening the mark's telegraph as she loses petals.
 * These numbers are the boss rather than a knob on it — changing one writes
 * a different fight, not a different difficulty — so they live here as
 * choreography and not in `SimConfig`.
 *
 * There used to be a `cycle` here too, a phase's own announce-to-announce
 * spacing. It is gone: the mark now always opens at `ROCK_MID`, so only
 * `tell` and `openBeats` are still a phase's to set.
 */
/**
 * **What a phase asks of a thumb**, and each phase asks something different
 * — the owner's ask of 18 September 2026 (`.claude/skills/new-boss` §6.2),
 * that a boss change state more than once and not answer to one gesture on
 * the panel the whole way down. `shoot` is the panel: the mark opens on its
 * own clock and the pair fires. `pry` and `hold` are on **her picture**, and
 * both are player 1's, because he is the seat that is *not* shown which
 * mark is real — a thumb from the seat that knows the side would answer the
 * bloom with nobody speaking (`queen-hand.ts`).
 */
export const QUEEN_GESTURES = ["shoot", "pry", "hold"] as const;
export type QueenGesture = (typeof QUEEN_GESTURES)[number];

export interface Phase {
  /** She is in this phase while her petals are above this number. */
  above: number;
  /** Beats between the announcement and the opening. */
  tell: number;
  /** Beats a bloom stands open — under `hold`, by herself, before a thumb has to keep it. */
  openBeats: number;
  /** What opens the mark, or keeps it open, in this phase. */
  gesture: QueenGesture;
}

/**
 * CROWN, BROOD, SCREAM. The third stands open one beat on its own: a bloom
 * that short is hers to snap shut, and a thumb held on the real mark is what
 * keeps it from doing so (`holdBloom`), up to `queenHoldBeats` in all.
 */
export const PHASES: readonly Phase[] = [
  { above: 7, tell: 2, openBeats: 2, gesture: "shoot" },
  { above: 4, tell: 2, openBeats: 2, gesture: "pry" },
  { above: 0, tell: 1, openBeats: 1, gesture: "hold" },
];

/** The phase she is in, read the way `boss.ts` reads it — her first beat, at `-1`, is the crown's. */
export function queenPhase(boss: QueenState): Phase {
  return PHASES[boss.phase] ?? PHASES[0]!;
}

/** What her current phase asks of the thumb. */
export function queenGesture(boss: QueenState): QueenGesture {
  return queenPhase(boss).gesture;
}

/** Blooms announced so far. Decides the colour, which alternates cyan first. */
const BLOOMS = 0;

/** The column of one of the two marks — one tile either side of her own. */
export function queenMarkCol(queenCol: number, side: -1 | 1): number {
  return queenCol + side;
}

/**
 * Whether a bullet's column lands on either mark. Call this instead of
 * `occupiesCol` for a `"queen"` creature: she is not a wide creature in the
 * `colSpan` sense — nothing stands in her own column, where a shot would
 * ordinarily land on a single-tile kind — so the generic column test cannot
 * be asked to cover her.
 */
export function queenOccupiesCol(queenCol: number, col: number): boolean {
  return col === queenMarkCol(queenCol, -1) || col === queenMarkCol(queenCol, 1);
}

/**
 * No bloom announced, and none open — the *timing* forgotten, and only the
 * timing. What is coming (`tellColor`, `weakSide`) is deliberately left
 * standing: it is chosen a whole bloom ahead by `pickNextBloom` and is what
 * her body shows the entire time she is between blooms.
 */
export function forget(boss: QueenState): void {
  boss.tellCol = -1;
  boss.openBeat = -1;
  boss.closeBeat = -1;
  boss.pryBeat = -1;
}

/**
 * Choose the next bloom: its colour, and which of the two marks is real.
 * Both are drawn from the same seeded rng as her rocks, and both are chosen
 * a full bloom in advance, so there is never a moment where her body has
 * nothing to say. Called when a bloom closes and when she enters a phase —
 * which includes her very first beat, so the first bloom is chosen there.
 *
 * The colour alternates, cyan first, which is what makes the mark's morph
 * always a slick↔bulb one: consecutive blooms are never the same creature.
 */
export function pickNextBloom(world: World, boss: QueenState): void {
  boss.tellColor = boss.scratch[BLOOMS]! % 2 === 0 ? "cyan" : "red";
  boss.weakSide = nextInt(world.rng, 2) === 0 ? -1 : 1;
  boss.pickBeat = world.beat;
  boss.scratch[BLOOMS]! += 1;
}

/**
 * The bloom is over once this beat has *reached or passed* its close — not on
 * equality. A shot that lands moves the close beat back to the beat of the
 * hit, which is already behind us by the time this runs again, and an
 * announcement that is never cleared is one she never blooms or walks out of.
 *
 * A miss just closes it. There is no punishment here — her rocks are their
 * own thing, on `spitCycle`'s clock, not a consequence of a missed mark.
 */
export function closeBloom(world: World, boss: QueenState, queen: Creature): void {
  if (boss.openBeat === -1) return;
  if (world.beat < boss.closeBeat) return;
  queen.color = null;
  // Which mark never opened, recorded before the next bloom overwrites
  // `weakSide`. render/ has no other way to know which of the two it is
  // still growing back out of a ball.
  boss.spentSide = boss.weakSide === 1 ? -1 : 1;
  forget(boss);
  pickNextBloom(world, boss);
}

/**
 * She opens. That is all this beat does now — the mark, nothing riding on it.
 * Under `pry` she does not: the clock still runs, from the announcement to
 * `closeBeat`, but the mark stays armoured until a thumb has it open
 * (`pryMark`), and a window nobody pried is a miss like any other.
 */
export function openBloom(world: World, boss: QueenState, queen: Creature): void {
  if (world.beat !== boss.openBeat) return;
  if (queenGesture(boss) === "pry") return;
  queen.color = boss.tellColor;
}

/**
 * Under `hold`, an open mark stays open one more beat for as long as player
 * 1's thumb is on the real one — and not past `queenHoldBeats` from the
 * opening, so a thumb that never lifts is not a bloom that never closes.
 * Read before `closeBloom` on the beat, so the beat the window would have
 * closed on is the beat the hold is asked for.
 */
export function holdBloom(world: World, boss: QueenState, queen: Creature): void {
  if (queenGesture(boss) !== "hold" || queen.color === null) return;
  if (boss.holdSide !== boss.weakSide) return;
  if (world.beat >= boss.openBeat + world.cfg.queenHoldBeats) return;
  if (boss.closeBeat <= world.beat) boss.closeBeat = world.beat + 1;
}

/**
 * The announcement puts a clock on what her body has been showing since the
 * last bloom closed. Her column is the one she is standing in, because she
 * stops walking for the length of the bloom — that is the whole reason the
 * tell is worth saying out loud.
 */
export function announce(world: World, boss: QueenState, queen: Creature, plan: Phase): void {
  if (boss.openBeat !== -1) return;
  if (world.waveBeat % ROCK_CYCLE !== ROCK_MID - plan.tell) return;
  boss.tellCol = queen.col;
  boss.openBeat = world.beat + plan.tell;
  boss.closeBeat = boss.openBeat + plan.openBeats;
}
