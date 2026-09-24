import type { SimConfig } from "./config.js";
import { midCol } from "./config.js";
import type { World } from "./world.js";

/**
 * THE BELLOWS: a double-chambered lung slung across the top of the field, and
 * **the one boss whose question is whether you can push while she is
 * pulling** (`docs/spec/bosses-choreographed.md` §19).
 *
 * THE SINEW and THE SURGE both want two hands doing the same thing in the
 * same moment. This one wants the opposite and spends the whole fight
 * training it out of the pair: the pilot's handle draws his chamber open, the
 * navigator's handle pushes hers shut, and the two may never work in the same
 * beat. **`Alternation`, refusing whoever did *not* just act** — THE BATON's
 * primitive read backwards, which is the finding this boss is worth keeping
 * for. Acting out of turn jams both handles and spends the exchange.
 *
 * **The rule is one sentence**: he pulls, then she pushes, and a seam parts.
 *
 * **Its health is the waist's four seams.** Three part on a clean exchange,
 * one to a movement, and the fourth parts in the finale — which is the one
 * beat in the fight the pair is asked to act *together*, after eleven of
 * being told not to. No bar: the waist narrows, and a gap is a seam gone.
 *
 * **Two ordinary hazards, once each.** The second split leaks a spark from
 * the new gap, shot out in either colour inside `bellowsSparkBeats`
 * (`bellows-shot.ts`, row 8); the third forces a breath of the lung's own
 * straight down the pilot's column, which is a body and so the shield's
 * (`bellows-step.ts`, row 10). Both reach the hull unanswered, which is the
 * wave.
 *
 * **The wave authors nothing.** The shape of the fight is the four seams and
 * every tempo in it is a `SimConfig` field, so THE BELLOWS is one of the
 * clocks that take an entry with a `kind` and no data
 * (`boss-entries-clocks.ts`) — unlike THE GIMBAL next door, whose alignments
 * are the wave's because a drum could honestly be hung with different turns
 * in it. A lung is a lung.
 */

/** A handle with no hand on it, and the depth that says so. */
export const NO_HAND = -1;
/** No spark leaking, and the column value that says so. */
export const NO_SPARK = -1;
/** Nobody's lift pending, and the tick that says so. */
export const NO_LIFT = -1;

/**
 * The seams in the waist at the top of the fight — the health, and a figure
 * of the **silhouette** rather than a tuning, which is why it is here rather
 * than in `config-bellows.ts`: the picture draws four gaps down a waist and a
 * wave that hung a lung with five would be a different lung.
 */
export const BELLOWS_SEAMS = 4;

/**
 * Where the scene is: the waist tight and both chambers still, his beat, her
 * beat, both handles jammed by someone acting out of turn, a seam parting,
 * the last seam with both handles glowing, or the whole held breath venting.
 */
export const BELLOWS_PHASES = ["still", "pull", "push", "jam", "seam", "last", "vent"] as const;
export type BellowsPhase = (typeof BELLOWS_PHASES)[number];

export interface BellowsState {
  kind: "bellows";
  phase: BellowsPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** `world.beat` this exchange's marks lit — what the shared window of the
   * third exchange is counted from, since that one window spans two phases. */
  exchangeBeat: number;
  /** Clean rounds this exchange has had, of `bellowsExchanges`: nought until
   * the shared window's first push, since no other exchange asks for two. */
  exchanged: number;
  /** Seams left in the waist: `BELLOWS_SEAMS` down to nought. */
  seams: number;
  /** How deep each hand has carried its handle, pilot then navigator, in
   * thousandths of the reach; `NO_HAND` while the hand is off it. */
  handMilli: [number, number];
  /** The column the spark leaks in, `NO_SPARK` while nothing is leaking. */
  sparkCol: number;
  /** `world.beat` the spark started leaking. */
  sparkBeat: number;
  /** The tick the **first** of the two hands came off in the finale, and
   * `NO_LIFT` with both on or both off — the reference the second is judged
   * against, `surge.ts`' own shape (`bellows-hand.ts`). */
  liftTick: number;
}

export function bellowsBoss(world: World): BellowsState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "bellows" ? boss : null;
}

/** Whether the handles are being worked at all: one seat's beat is up. */
export function bellowsWorking(s: BellowsState): boolean {
  return s.phase === "pull" || s.phase === "push";
}

/**
 * **Whose beat it is**, and the whole of `Alternation` as this boss spends
 * it: 1 while the pilot's chamber is still shut, 2 once he has drawn it open,
 * and 0 in every phase where neither handle counts. A hand worked when this
 * does not name its seat is the jam.
 */
export function bellowsTurn(s: BellowsState): 1 | 2 | 0 {
  if (s.phase === "pull") return 1;
  if (s.phase === "push") return 2;
  return 0;
}

/** Whether a seat's hand is on its handle at all. */
export function bellowsHeld(s: BellowsState, player: 1 | 2): boolean {
  return (s.handMilli[player - 1] ?? NO_HAND) !== NO_HAND;
}

/** How deep a seat has carried its handle, nought with the hand off. */
export function bellowsDepthMilli(s: BellowsState, player: 1 | 2): number {
  const at = s.handMilli[player - 1] ?? NO_HAND;
  return at === NO_HAND ? 0 : at;
}

/** His chamber drawn open and hers not yet shut — the middle of an exchange. */
export function bellowsOpen(s: BellowsState): boolean {
  return s.phase === "push";
}

/** Both handles jammed by someone acting out of turn, and nothing to do. */
export function bellowsJammed(s: BellowsState): boolean {
  return s.phase === "jam";
}

/**
 * **Whether this exchange is the one inside a single window** (row 9).
 *
 * The third exchange, and it is read off the seams rather than counted in a
 * field of its own: two left is two parted, which is exactly the movement the
 * design tightens. One fact, in one place, and a state that cannot disagree
 * with itself about which movement it is in.
 */
export function bellowsShared(s: BellowsState): boolean {
  return s.seams === BELLOWS_SEAMS - 2;
}

/**
 * Beats left in the shared window, or `NO_HAND` when this exchange has no
 * window at all — which is every exchange but the third. The earlier ones
 * have no clock on them: a missed pull costs nothing and the lung waits,
 * which is the design's *nothing, clock runs on*.
 */
export function bellowsWindowLeft(s: BellowsState, cfg: SimConfig, beat: number): number {
  if (!bellowsShared(s) || !bellowsWorking(s)) return NO_HAND;
  return Math.max(0, cfg.bellowsWindowBeats - (beat - s.exchangeBeat));
}

/** Whether a spark is leaking from the new gap and there is something to shoot. */
export function bellowsLeaking(s: BellowsState): boolean {
  return s.sparkCol !== NO_SPARK;
}

/** The last seam, both handles glowing, and the one beat they act together. */
export function bellowsLast(s: BellowsState): boolean {
  return s.phase === "last";
}

/** The waist split in two and the whole held breath going across the field. */
export function bellowsVenting(s: BellowsState): boolean {
  return s.phase === "vent";
}

/**
 * The column a seat's chamber hangs over: his off the left of the waist, hers
 * off the right, fixed — **geometry says whose handle is whose**, THE CHOIR's
 * rule, so nothing on either screen has to label a handle with a seat.
 */
export function bellowsChamberCol(cfg: SimConfig, player: 1 | 2): number {
  const mid = midCol(cfg);
  const col = mid + (player === 1 ? -cfg.bellowsChamberCols : cfg.bellowsChamberCols);
  return Math.max(0, Math.min(cfg.cols - 1, col));
}
