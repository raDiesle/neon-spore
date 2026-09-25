import type { PlacedFault } from "./fault-placed.js";

/**
 * **The faults and what they leave behind them on the world.** Every field of
 * `World` that is a malfunction's: the placements themselves, the two
 * harpoons' stillness counters and bodies, and THE DARK's lit tiles.
 *
 * Cut out of `world.ts` for `world-ship.ts`'s reason: that file was seven
 * lines under its 250-line ceiling and THE DARK needed a field. `World`
 * extends this, so `world.faults` still reads as it always did.
 */
export interface FaultState {
  /**
   * **The faults placed on this wave's map**, each with the beat it enters on
   * and the number of beats it holds — empty for every wave played straight.
   * Installed by `startWave` from the wave's own list, exactly the way the
   * arrivals are, and never written again while the wave runs.
   *
   * It was one `Malfunction | null` for the whole wave until 15 September
   * 2026, when the owner asked for a fault to be *a pencil placed on the map*
   * (`fault-placed.ts`). Read through `faultsNow`, `faultOn` and
   * `faultWindow` rather than by index: what is in force has been a question
   * about the beat rather than about the wave ever since.
   */
  faults: PlacedFault[];

  /**
   * Ticks the cannon has stood still with a leech on it, and the plate with a
   * limpet — nought while neither is there and nought again on every move.
   *
   * Two fields rather than a record, for `guardTick`'s reason: the world's own
   * counters are numbers with names, and a map keyed by a union is a second
   * thing to keep in step with that union. Ticks and not beats because the
   * count is a beat and a half (`harpoon.ts`).
   */
  leechStillTicks: number;
  limpetStillTicks: number;

  /**
   * The id of the body each harpoon fault has out, or `NO_HARPOON`.
   *
   * By id, because the same two bodies still arrive as creatures on the waves
   * that spawn them: a fault that reeled in whatever it found of the right
   * kind would take away one a wave had placed (`harpoon.ts`).
   */
  leechHarpoonId: number;
  limpetHarpoonId: number;

  /**
   * **The squares of a dark field a finger has lit**, each with the tick its
   * light goes out on (`dark.ts`). World state and hashed, because a light
   * either seat makes is lit on both screens — two devices that disagreed
   * about it would be showing the pair two different fields.
   */
  lit: LitTile[];
}

/** One lit square of THE DARK's field, in the simulation's whole tiles. */
export interface LitTile {
  col: number;
  row: number;
  /** The first tick it is dark again. */
  untilTick: number;
}

export function newFaultState(): FaultState {
  return {
    faults: [],
    leechStillTicks: 0,
    limpetStillTicks: 0,
    leechHarpoonId: 0,
    limpetHarpoonId: 0,
    lit: [],
  };
}
