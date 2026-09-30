import type { VaneState } from "./boss-state.js";
import type { SimConfig } from "./config.js";
import { vanePivotCol } from "./vane-arm.js";
import type { World } from "./world.js";

/**
 * **THE VANE's guard arms**: the thing each new form adds, turning round the
 * hub and standing across a mouth for `vaneGuardCoverBeats` of every turn
 * (`docs/spec/bosses.md` §11.5, *Four forms*). The owner, 30 September 2026:
 * *another arm appears and rotates around it, and maybe some more arms appears
 * in further levels which make it harder and harder to hit*.
 *
 * Arithmetic on the beat and nothing stored, like the cycle: a guard is where
 * the wave's beat says it is, so render/ draws the one the rule refuses a shot
 * with and the hand waits for the same one to pass (`hands/boss-hands-shots.ts`).
 *
 * A guard's place is counted in beats round its turn. At 0 it lies across the
 * mouth to the right of the pivot, at half a turn across the one to the left;
 * the guards of one form are spaced evenly, so the pair can count the gaps.
 */

/** How many guard arms turn round the hub: one per form after the first. */
export function vaneGuardCount(b: VaneState): number {
  return b.form;
}

/**
 * Where guard `k` of `count` stands this beat, in beats round its turn —
 * 0 across the right mouth, half a turn across the left one.
 */
export function vaneGuardBeat(cfg: SimConfig, count: number, k: number, waveBeat: number): number {
  const turn = cfg.vaneGuardTurnBeats;
  const spacing = Math.floor(turn / Math.max(1, count));
  return (((waveBeat + k * spacing) % turn) + turn) % turn;
}

/**
 * Whether a guard stands across the mouth in `col` on this beat. Only the two
 * columns beside the pivot are mouths; the pivot itself is never one, so
 * nothing covers it.
 */
export function vaneGuardedAt(
  cfg: SimConfig,
  b: VaneState,
  col: number,
  waveBeat: number,
): boolean {
  const pivot = vanePivotCol(cfg);
  if (col === pivot) return false;
  const at = col > pivot ? 0 : Math.floor(cfg.vaneGuardTurnBeats / 2);
  const count = vaneGuardCount(b);
  for (let k = 0; k < count; k++) {
    const p = vaneGuardBeat(cfg, count, k, waveBeat);
    if (p >= at && p < at + cfg.vaneGuardCoverBeats) return true;
  }
  return false;
}

/** The same question said about a world, which is how the shot asks it. */
export function vaneGuarded(world: World, b: VaneState, col: number): boolean {
  return vaneGuardedAt(world.cfg, b, col, world.waveBeat);
}
