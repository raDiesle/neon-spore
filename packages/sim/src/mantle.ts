import type { World } from "./world.js";

/**
 * THE MANTLE: a hinged carapace shell, closed over a soft core, pried open by
 * two hands pulling **together** — and the boss that asks whether a shared
 * number still needs two hands (`docs/spec/bosses-choreographed.md` §23).
 *
 * THE SINEW and THE SURGE both split one gauge across two screens, his zone
 * and her sum, neither the other's (`SplitGauge`). This keeps the same
 * number on both screens — the true combined pull — and answers the shared
 * brief's new clause, that both screens read the same thing at the same
 * time: nothing here is ever shown to one seat and hidden from the other.
 *
 * **The rule is one sentence**: pull both handles down at once, hard enough
 * and together enough, and a plate-pair shears. `mantleLeft` is always
 * Player 1's handle and `mantleRight` always Player 2's — geometry, not a
 * seat number, says so, the way THE GIMBAL's two rings and THE BALLOON's two
 * grips already do.
 *
 * **The sum is floor-checked.** `PulledMagnitude`/`ChargeSum` from the
 * reusable library, spent for the first time: a pair-shear needs the summed
 * depth of both handles past that movement's threshold **while both depths
 * sit above `mantleFloorMilli` at once** — one thumb parked at maximum while
 * the other is at nought never shears anything, which is the whole of what
 * makes this a two-hand mechanic rather than an arm-wrestle either seat could
 * win alone. Letting go resets that handle to nought at once; there is no
 * drift to bank progress against, on purpose, because the pull is a decision
 * made together or not made at all.
 *
 * **Its health is four plate-pairs**, always shed as a pair — one off each
 * valve, together, the instant the pair beneath them is pried. A shell with
 * no plates left splits down its own seam and the bare core beneath answers
 * an alternating single-tap finish, the one place on this page the pair has
 * to stop pulling together to finish the fight.
 */

export const MANTLE_PHASES = [
  "still",
  "pull",
  "spark",
  "heartbeat",
  "dark",
  "brace",
  "buckle",
  "vent",
  "cross",
  "turn",
] as const;
export type MantlePhase = (typeof MANTLE_PHASES)[number];

/** The seam has no spark leaking from it. */
export const NO_SPARK = -1;

/** What a wave authors: the four pull-together thresholds, and nothing else. */
export interface MantleEntry {
  kind: "mantle";
  /** One entry a plate-pair, the summed depth (both handles, thousandths of a
   * tile) that shears it. Its own length is the health: `thresholds.length`
   * pairs, `thresholds.length * 2` plates. */
  thresholds: readonly number[];
}

export interface MantleState {
  kind: "mantle";
  /** Copied at install and never written to again (`mantle-hash.ts`). */
  thresholds: number[];
  /** Plate-pairs sheared so far; `thresholds.length` once the shell is split. */
  cursor: number;
  phase: MantlePhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** Each handle's live pull depth, thousandths of a tile; nought while the
   * thumb is off. Index 0 is `mantleLeft` (Player 1), 1 is `mantleRight`
   * (Player 2) — always, by geometry. */
  depthMilli: [number, number];
  /** The column the bared core's hazard spark leaks in, `NO_SPARK` while shut. */
  sparkCol: number;
  /** `world.beat` the spark began leaking. */
  sparkBeat: number;
  /** Whose tap the alternating finish is waiting on: 0 is Player 1, 1 is
   * Player 2. Flips on every landed tap; a tap from the other seat is
   * silently refused, the ordinary rule. */
  heartbeatNext: 0 | 1;
  /** Taps landed so far in the finish; `mantleHeartbeatTaps` ends the fight. */
  heartbeatDone: number;
  /** Whether each handle has a thumb on it, in any phase — the chord the
   * brace reads (`CHORD`). Index as `depthMilli`. */
  held: [boolean, boolean];
  /** Beats the brace has been held by both thumbs at once, or the buckle
   * pressed flat by both; nought again the moment either lifts. */
  braceBeats: number;
}

export function mantleBoss(world: World): MantleState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "mantle" ? boss : null;
}

/** How many plate-pairs are left — the one health this boss has. */
export function mantlePairsLeft(s: MantleState): number {
  return Math.max(0, s.thresholds.length - s.cursor);
}

/** Whether the handles count at all: lit, and nothing else under way. */
export function mantlePulling(s: MantleState): boolean {
  return s.phase === "pull";
}

/** The shell shuddering before the last pair: both handles held, not pulled. */
export function mantleBracing(s: MantleState): boolean {
  return s.phase === "brace";
}

/** The weakened valve bulging out: both thumbs down and eased off, not pulled. */
export function mantleBuckling(s: MantleState): boolean {
  return s.phase === "buckle";
}

/** A vent hissing open along the crack: one tap on it shuts it. */
export function mantleVenting(s: MantleState): boolean {
  return s.phase === "vent";
}

/** The split halves swinging open: both handles pulled once more, gently. */
export function mantleTurning(s: MantleState): boolean {
  return s.phase === "turn";
}

/** Whether the pull under way is the last pair's, the one with a window. */
export function mantleLastPull(s: MantleState): boolean {
  return mantlePulling(s) && s.thresholds.length > 1 && mantlePairsLeft(s) === 1;
}

/** Whether the bared core's spark is leaking and there is something to shoot. */
export function mantleLeaking(s: MantleState): boolean {
  return s.sparkCol !== NO_SPARK;
}

/** The shell split, the core bared, the alternating finish under way. */
export function mantleFinale(s: MantleState): boolean {
  return s.phase === "heartbeat";
}

/** The core gone dark: the fight is over and the hatch is only hanging. */
export function mantleDone(s: MantleState): boolean {
  return s.phase === "dark";
}

/**
 * Whether the summed pull crosses this movement's threshold right now —
 * `PulledMagnitude`/`ChargeSum`, floor-checked. Both handles must clear
 * `mantleFloorMilli` **at once**; a thumb below the floor contributes nothing
 * to the sum, so it cannot be papered over by the other thumb alone.
 */
export function mantleCharged(s: MantleState, floorMilli: number): boolean {
  const need = s.thresholds[s.cursor];
  if (need === undefined) return false;
  const [left, right] = s.depthMilli;
  if (left < floorMilli || right < floorMilli) return false;
  return left + right >= need;
}
