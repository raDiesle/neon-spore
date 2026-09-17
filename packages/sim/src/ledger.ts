import type { SimConfig } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE LEDGER: whose body takes it.
 *
 * **The question no other boss asks.** Every fight in this game has one
 * direction of damage — the field hurts the ship — and this one inverts the
 * *consequence* without touching the controls. The pair still shoots it, it
 * still dies, and the bill for every shot is posted to their own hull: a
 * landed hit sends the same damage back down a cord into a socket in the
 * plating, `ledgerCadenceBeats` beats later, and the guard window they have
 * used on falling rock all game is pointed at something they caused
 * (`docs/spec/bosses-choreographed.md` §5).
 *
 * A tall body stands over `ledgerCols` columns at the top of the field with a
 * single thick cord running from its underside down into the hull. **The cord
 * is the mechanism**: it carries every return, it is the only thing in the
 * game that touches both bodies, and where it is rooted is the column the
 * plate has to be in.
 *
 * **Health is the seam.** A hit widens the split down its middle and at
 * `ledgerSeamHits` the two halves part company. There is no bar: the silhouette
 * is one body, then a body with a line down it, then two.
 *
 * **The rule is one sentence.** The seam shows a colour; a bolt of that colour
 * up the seam's own column widens it and starts a return down the cord; the
 * return lands in the socket `ledgerCadenceBeats` beats later, and the plate in
 * that column with the trigger on that beat wards it exactly the way it wards
 * a rock. A return nobody answered is a hit on the hull, which loses the wave
 * like every other hit in this game (`wave-fail.ts`). So the fight has a
 * forced order, and the pair always knows when the next return lands, because
 * they fired it: **act, consequence, answer the consequence, act again.**
 *
 * **And the socket walks.** Every return that reaches the hull roots the cord
 * `ledgerSocketStep` columns further along it, turning at the walls, so the
 * column to be warded is a new one every time and the pair says the same
 * sentence with a different number in it every few beats.
 *
 * The fight has five movements, read off the state rather than kept
 * (`ledgerPhase`):
 *
 * - **rooting** — the cord pays out and goes in. Nothing can be hit yet.
 * - **paying** — one shot, one return, and the whole rule in it.
 * - **whipping**, from `ledgerWhipSeam` hits — the cord bills **everything**
 *   the cannon does, so a shot at an arrival is a return as well, and a warded
 *   return is thrown back *up* the cord and widens the seam with no bill. From
 *   here the fight can be won without firing at the body at all.
 * - **taut**, at one hit from the end — the last return is on the cord and it
 *   is the one the pair is asked to **let through** (`ledger-step.ts`).
 * - **out** — the cord tears out of the ship, the halves part, and the boss
 *   stands `ledgerOutBeats` more so the wave cannot end on the same beat.
 *
 * **It is a fixture and not a body** (`bossFillsWave`): it falls nothing, and
 * the arrivals the pair has to choose whether to answer are the wave's own.
 * The clock is `ledger-step.ts`, the shot `ledger-shot.ts`, the fingerprint
 * `ledger-hash.ts`, the numbers `config-ledger.ts`.
 */

/** The movements, in the order render and the tests name them by. */
export const LEDGER_PHASES = ["rooting", "paying", "whipping", "taut", "out"] as const;

export type LedgerPhase = (typeof LEDGER_PHASES)[number];

/**
 * One return on its way down the cord.
 *
 * It carries **no column**. Where it lands is wherever the cord is rooted when
 * it gets there, which is the whole of why the socket walking is a mechanic
 * and not a decoration: a bead that remembered the socket it started from
 * would let the pair answer the fight from one column.
 */
export interface LedgerBead {
  /** `world.beat` it reaches the socket on. */
  beat: number;
  /** Beats it takes end to end, so a picture knows how far down it is. */
  span: number;
  /** The one that parts the halves: not the pair's to stop (`ledgerLetThrough`). */
  last: boolean;
}

/** Everything THE LEDGER remembers between beats. */
export interface LedgerState {
  kind: "ledger";
  /** The leftmost column the body covers; the seam is `ledgerSeamCol`. */
  col: number;
  /** The hull column the cord is rooted in: where every return lands. */
  socket: number;
  /** Which way the root walks, `1` or `-1`, turned at the wall. */
  walk: number;
  /** The colour the seam is showing, which is the only one that widens it. */
  want: Color;
  /** Hits down the seam. At `ledgerSeamHits` the last return is on the cord. */
  seam: number;
  /** Returns on the cord, in the order they started. */
  beads: LedgerBead[];
  /** Returns the pair warded in the socket: what the fight is really counting. */
  warded: number;
  /** `world.beat` the cord rooted on. */
  rootBeat: number;
  /** `world.beat` the cord tore out on; `-1` while it holds. */
  outBeat: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than six. */
export function ledgerBoss(world: World): LedgerState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "ledger" ? boss : null;
}

/** The column the seam runs down: the middle of the body, and the only target. */
export function ledgerSeamCol(t: LedgerState, cfg: SimConfig): number {
  return t.col + Math.floor(Math.min(cfg.ledgerCols, cfg.cols) / 2);
}

/** Whether the body covers this column at all — the plating either side. */
export function ledgerCovers(t: LedgerState, cfg: SimConfig, col: number): boolean {
  return col >= t.col && col < t.col + Math.min(cfg.ledgerCols, cfg.cols);
}

/**
 * Which movement the fight is in, read off what has happened to it.
 *
 * **The beat is a parameter** and not read off a world, because the first
 * movement is the only thing about this boss that is a clock rather than a
 * count: the cord takes `ledgerRootBeats` to go in, and after that every
 * question is the seam's. `echoSplitPhase`'s arrangement, for the same reason
 * — a reader that took a world could not be asked about a state on its own,
 * which is what half the tests do.
 */
export function ledgerPhase(t: LedgerState, cfg: SimConfig, beat: number): LedgerPhase {
  if (t.outBeat >= 0) return "out";
  if (t.seam >= cfg.ledgerSeamHits) return "taut";
  if (t.seam >= cfg.ledgerWhipSeam) return "whipping";
  if (beat - t.rootBeat < cfg.ledgerRootBeats) return "rooting";
  return "paying";
}

/**
 * How many beats a return takes down the cord **now**: one beat less per hit,
 * floored at `ledgerCadenceMinBeats`.
 *
 * The design's *the cord roots deeper and the next return comes in three beats,
 * not four* — moved off the miss and onto the hit. A miss cannot tighten
 * anything any more, because a miss is a hit on the hull and the wave is over
 * (`wave-fail.ts`); the seam is the only counter left that grows, and it grows
 * exactly when the pair earns it. So the fight gets faster the better they are
 * doing, which is the same pressure the design wanted from the other end.
 */
export function ledgerCadence(t: LedgerState, cfg: SimConfig): number {
  return Math.max(cfg.ledgerCadenceMinBeats, cfg.ledgerCadenceBeats - t.seam);
}

/**
 * Whether the cord bills every shot, not only the ones that reach the body —
 * and, the same question from the other side, whether a warded return is
 * thrown back **up** the cord and widens the seam.
 *
 * One predicate for both because they are one movement: from
 * `ledgerWhipSeam` hits the cord is the whole fight, and a pair that has
 * understood it stops firing at the body and starts warding it to death.
 */
export function ledgerWhips(t: LedgerState, cfg: SimConfig, beat: number): boolean {
  const phase = ledgerPhase(t, cfg, beat);
  return phase === "whipping" || phase === "taut";
}

/**
 * The next return to land, or `null` while the cord is empty — what the pilot
 * is shown coming and the navigator is shown the column of.
 */
export function ledgerNext(t: LedgerState): LedgerBead | null {
  let soonest: LedgerBead | null = null;
  for (const b of t.beads) if (soonest === null || b.beat < soonest.beat) soonest = b;
  return soonest;
}

/**
 * **The one return the pair is asked not to ward**, and the whole payoff of the
 * fight: the fifth bill is the one that tears the cord out of the ship.
 *
 * A pair that has spent ten minutes learning that a return must be answered is
 * told, once, to take their hands off it. Warding it does not fail anything —
 * it is refused, thrown back up the cord, and comes down again on the next
 * cadence, so the fight simply holds open until they let go (`ledger-step.ts`).
 */
export function ledgerLetThrough(t: LedgerState): boolean {
  return t.beads.some((b) => b.last);
}
