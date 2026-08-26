import type { BossState } from "./boss-state.js";
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
interface Phase {
  /** She is in this phase while her petals are above this number. */
  above: number;
  /** Beats between the announcement and the opening. */
  tell: number;
  /** Beats a bloom stands open. */
  openBeats: number;
}

export const PHASES: readonly Phase[] = [
  { above: 7, tell: 2, openBeats: 2 },
  { above: 4, tell: 2, openBeats: 2 },
  { above: 0, tell: 1, openBeats: 2 },
];

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
export function forget(boss: BossState): void {
  boss.tellCol = -1;
  boss.openBeat = -1;
  boss.closeBeat = -1;
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
export function pickNextBloom(world: World, boss: BossState): void {
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
export function closeBloom(world: World, boss: BossState, queen: Creature): void {
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

/** She opens. That is all this beat does now — the mark, nothing riding on it. */
export function openBloom(world: World, boss: BossState, queen: Creature): void {
  if (world.beat !== boss.openBeat) return;
  queen.color = boss.tellColor;
}

/**
 * The announcement puts a clock on what her body has been showing since the
 * last bloom closed. Her column is the one she is standing in, because she
 * stops walking for the length of the bloom — that is the whole reason the
 * tell is worth saying out loud.
 */
export function announce(world: World, boss: BossState, queen: Creature, plan: Phase): void {
  if (boss.openBeat !== -1) return;
  if (world.waveBeat % ROCK_CYCLE !== ROCK_MID - plan.tell) return;
  boss.tellCol = queen.col;
  boss.openBeat = world.beat + plan.tell;
  boss.closeBeat = boss.openBeat + plan.openBeats;
}
