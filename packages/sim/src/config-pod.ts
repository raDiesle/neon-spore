/**
 * THE POD's numbers: how a capsule shot loose falls, how it steers itself into
 * the maw, and what swallowing one is worth to the ship (`pods.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-recoil.ts` and `config-carom.ts` already give: every call site still
 * reads `cfg.podRepair`, and the split is only about how much of one file a
 * reader has to hold at once.
 *
 * **It is the first group cut out of `SimConfig`'s own body rather than out of
 * `config-creatures.ts`**, and the file it left was over its limit when THE
 * VOLLEY arrived. The seam is the one every other `config-*.ts` already uses:
 * a mechanic whose numbers are argued **together**. How fast a loose pod
 * sinks, how far it slides, when it stops sliding and starts steering and how
 * fast it steers are one decision about whether a pod can be caught at all,
 * and a reader who moves one has to check the other three against it. What is
 * left in `config.ts` is the field, the clock, the hull and the two damages —
 * numbers argued one at a time, and the shortest list that file has held.
 *
 * `intakeWindowMs` is deliberately **not** here. It is the maw's window and
 * not the pod's — the sibling of `guardWindowMs`, argued against it, and the
 * director's own cards keep the two apart for the same reason
 * (`tools/director/src/ship-fields.ts`).
 */
export interface PodConfig {
  /** How fast a pod that has been shot loose sinks, in tiles per beat. */
  podFallTilesPerBeat: number;
  /**
   * How far a falling pod slides sideways, in tiles per beat. The direction is
   * drawn from the seeded rng when the shot lands, so the cannon has to chase
   * what it just freed rather than wait under it.
   */
  podDriftTilesPerBeat: number;
  /**
   * How close to the hull, in tiles, a falling pod has to be before it starts
   * steering toward the cannon's column instead of drifting on its own.
   */
  podHomeTiles: number;
  /**
   * Sideways speed while steering toward the cannon, in tiles per beat. Once a
   * pod is inside `podHomeTiles` of the hull this replaces
   * `podDriftTilesPerBeat` entirely — the two never apply on the same tick.
   */
  podHomeTilesPerBeat: number;
  /** Hull points a swallowed pod gives back. The energy boost, as a number. */
  podRepair: number;
  /** Beats a `ward` pod keeps the shield armed without a trigger. */
  wardBeats: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const POD_DEFAULTS: PodConfig = {
  podFallTilesPerBeat: 3,
  podDriftTilesPerBeat: 0.4,
  podHomeTiles: 2,
  podHomeTilesPerBeat: 2,
  podRepair: 18,
  wardBeats: 6,
};
