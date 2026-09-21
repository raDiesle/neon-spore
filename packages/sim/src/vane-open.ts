import type { VaneState } from "./boss-state.js";
import type { SimConfig } from "./config.js";
import { vanePivotCol, vaneTipCol, vaneWeakCol } from "./vane-arm.js";
import {
  VANE_CYCLE,
  vaneOpening,
  vanePhase,
  vaneReachMilli,
  vaneSplitsOnCycle,
  vaneStageIndex,
} from "./vane-cycle.js";
import type { World } from "./world.js";

/**
 * **Where THE VANE's arm is standing and whether the bearing is open** — one
 * place, read by the fold, the shot, the cues and the director, because the
 * three phases answer both questions three ways and a rule spelled out at
 * every call site would drift apart (`docs/spec/bosses.md` §11.5, *Three
 * phases, three gestures*).
 *
 * - Under **SWING** the cycle is the whole of it: the arm is where
 *   `vane-arm.ts` says it is and the housing splits at each end of the sweep.
 * - Under **VEER** the stops have worn and the ends split nothing. The arm
 *   stands where the pilot's thumb pinned it, and the housing is split for as
 *   long as the pin holds.
 * - Under **SEIZE** the pin still holds the arm, and the housing is jammed on
 *   top of it: it opens only once the navigator has hauled it, which she can
 *   only do to an arm that is standing still.
 *
 * Nothing here eases or rounds. A pinned arm is a column, not a position, and
 * the whole point of pinning it is that the column stops moving for long
 * enough to be said out loud (`docs/spec/latency.md`).
 */

/**
 * Whether the pilot's thumb is still holding the arm on this beat.
 *
 * The numbers rather than a `World`, because the picture has to ask the same
 * question off a `Field` — a hit test is handed the boss, the config and the
 * beat and never a world (`render/touch-field.ts`), and the *one* place that
 * knows how long a pin lasts has to be reachable from both or the ring is
 * offered on a beat the rule would refuse.
 */
export function vanePinnedAt(cfg: SimConfig, b: VaneState, beat: number): boolean {
  return b.pinBeat >= 0 && beat < b.pinBeat + cfg.vanePinBeats;
}

/** The same question said about a world, which is how the simulation asks it. */
export function vanePinned(world: World, b: VaneState): boolean {
  return vanePinnedAt(world.cfg, b, world.beat);
}

/**
 * Which way the arm was loaded when it was pinned, as -1, 0 or 1 — the sign
 * `vaneWeakCol` reads to put the split on the side away from the load.
 *
 * The stage's own direction rather than `Math.sign(vaneReachMilli)` alone: an
 * arm pinned as it crosses the pivot has a reach of nought and a side all the
 * same, and a split that fell on the pivot there would be the one column the
 * arm is standing in.
 */
export function vanePinSide(waveBeat: number): number {
  const m = vaneReachMilli(waveBeat);
  if (m !== 0) return Math.sign(m);
  const stage = VANE_CYCLE[vaneStageIndex(waveBeat)]!;
  return Math.sign(stage.to - stage.from) || 1;
}

/**
 * The column the arm's tip stands in this beat — the fold line. The cycle's
 * answer while the arm is sweeping, and the column it was pinned in while a
 * thumb is on it.
 *
 * This is the one thing a pin buys that the pair can feel: the fold line stops
 * moving, so a column named against the arm survives the sentence it takes to
 * say (§11.5's own argument for the holds at the ends of the sweep, handed to
 * the pilot once the ends stop giving it).
 */
export function vaneTipAt(cfg: SimConfig, b: VaneState, beat: number, waveBeat: number): number {
  if (vanePinnedAt(cfg, b, beat)) return b.pinCol;
  return vaneTipCol(cfg, b.pins, waveBeat);
}

/** The same column said about a world. */
export function vaneTipNow(world: World, b: VaneState): number {
  return vaneTipAt(world.cfg, b, world.beat, world.waveBeat);
}

/**
 * The column a shot has to leave the top of the field in to reach the bearing,
 * or -1 while there is nothing to reach.
 *
 * The cycle's own under SWING; the side away from the load the arm was pinned
 * under otherwise. Either way it is the fold's direction in miniature, which
 * is the rule taught by a column rather than by a card.
 */
export function vaneSplitCol(world: World, b: VaneState): number {
  if (vaneSplitsOnCycle(vanePhase(b.pins))) return vaneWeakCol(world.cfg, world.waveBeat);
  if (!vanePinned(world, b)) return -1;
  const pivot = vanePivotCol(world.cfg);
  return Math.max(0, Math.min(world.cfg.cols - 1, pivot - b.pinSide));
}

/**
 * Whether the bearing stands open this instant, before the opening's one shot
 * is taken into account — the phase's gesture and nothing else.
 */
export function vaneBearingOpen(world: World, b: VaneState): boolean {
  switch (vanePhase(b.pins).asks) {
    case "shoot":
      return vaneOpening(world.waveBeat) !== -1;
    case "pin":
      return vanePinned(world, b);
    case "haul":
      return vanePinned(world, b) && b.hauled;
  }
}

/**
 * Whether *this* opening has already spent its shot. A spray may not skip a
 * pin, in any phase; what identifies an opening changes with the phase and the
 * rule does not.
 *
 * Under SWING an opening is a stage of the cycle, numbered from the start of
 * the wave. From VEER on it is the beat the pilot's thumb landed on, which is
 * the same thing said about a window the pair made rather than one the table
 * handed them.
 */
export function vaneOpeningSpent(world: World, b: VaneState): boolean {
  if (vaneSplitsOnCycle(vanePhase(b.pins))) return vaneOpening(world.waveBeat) === b.spentOpening;
  return b.pinBeat >= 0 && b.pinBeat === b.spentPin;
}
