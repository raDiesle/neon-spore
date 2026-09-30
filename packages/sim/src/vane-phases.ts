/**
 * **THE VANE's phases**: which gesture the bearing asks for, read off the pins
 * and nothing else (`docs/spec/bosses.md` §11.5, *Three phases, three
 * gestures*). Split off `vane-cycle.ts` on 30 September 2026, which is the
 * clock; this is what the pins do to it.
 */

/**
 * **What a phase asks of the pair that the one before did not** — the gesture
 * the pins add (`docs/spec/bosses.md` §11.5, *Three phases, three gestures*).
 *
 * - `shoot`: the bearing as it was built. The housing splits at each end of
 *   the sweep, on this table's own clock, and the shot is the whole answer.
 * - `pin`: the stops have worn. The housing no longer splits at the ends at
 *   all; the pilot's thumb on the arm holds it where it stands, and *that* is
 *   what splits the housing — which also stops the fold line moving for as
 *   long as he keeps it there (`vane-open.ts`).
 * - `haul`: the bearing has seized. A pinned arm is no longer enough — the
 *   housing is jammed, and the navigator has to haul it open with her other
 *   hand before the shot counts (`vane-hand.ts`).
 */
export type VaneGesture = "shoot" | "pin" | "haul";

/**
 * A phase, which follows from the pins and nothing else.
 *
 * The reach is the health bar. Every pin taken out of the bearing lets the arm
 * slip further out, so the boss answers damage by folding *more* of the field —
 * the same bargain the Bulb Queen makes when she sinks a tile per petal. The
 * timing never moves: holds and sweeps are the same length in every phase, so a
 * pair that learned the cycle on its first turn has learned the *cycle* for the
 * whole fight (`docs/spec/bosses.md`'s *fixed and learnable*). What does move,
 * since 18 September 2026, is **what the bearing asks for**: the first gesture
 * is never taken away, and each pair of pins puts another beside it.
 * `above` reads as `WARDEN_PHASES` does.
 */
export interface VanePhase {
  name: string;
  above: number;
  /** Columns the tip stands out from the bearing at the end of a sweep. */
  reach: number;
  asks: VaneGesture;
}

export const VANE_PHASES: readonly VanePhase[] = [
  { name: "SWING", above: 3, reach: 2, asks: "shoot" },
  { name: "VEER", above: 1, reach: 4, asks: "pin" },
  { name: "SEIZE", above: -1, reach: 5, asks: "haul" },
];

/**
 * Whether the housing still splits on the cycle's own clock this phase. Only
 * SWING's does: from VEER on, an opening is something the pair makes with a
 * thumb rather than something the table hands them (`vane-open.ts`).
 */
export function vaneSplitsOnCycle(phase: VanePhase): boolean {
  return phase.asks === "shoot";
}

/** The phase these pins put it in. Never stored — pins are the whole of it. */
export function vanePhase(pins: number): VanePhase {
  return VANE_PHASES.find((p) => pins > p.above) ?? VANE_PHASES[VANE_PHASES.length - 1]!;
}
