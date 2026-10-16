/**
 * THE POD's numbers: how a capsule shot loose falls, how it steers itself into
 * the maw, and how long the pair has to take one in (`pods.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-recoil.ts` and `config-carom.ts` already give: every call site still
 * reads `cfg.podDueBeats`, and the split is only about how much of one file a
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
   * How fast a pod that was authored to *cross* the field travels along its
   * row, in tiles per beat, when the wave does not say.
   *
   * It is the pair's clock on THE CLAW's panel: eleven columns at this speed is
   * how long they have between seeing a power-up enter and watching it leave,
   * and the arm's own travel out and back has to fit inside that twice over for
   * a second try to be worth asking for.
   */
  podCrossTilesPerBeat: number;
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
  /**
   * How many columns either side of the cannon's own the open maw still takes
   * a pod from, on the tick it reaches the hull. Nought is the cannon's column
   * alone, which is what it was until 16 October 2026; the steering in the
   * last `podHomeTiles` already pulls a pod most of a column and a half in, so
   * this is how much further the maw reaches beyond that.
   */
  podCatchCols: number;
  /**
   * Beats a real pod gives the pair to take it in, from the beat it appears,
   * when the wave does not say (`PodEntry.due`). The clock runs while it hangs
   * and while it falls; at nought with the pod still on the field the wave is
   * lost (`Pod.dueTicks`).
   */
  podDueBeats: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const POD_DEFAULTS: PodConfig = {
  podFallTilesPerBeat: 3,
  podDriftTilesPerBeat: 0.4,
  // Two tiles a beat: the eleven columns take five and a half beats to cross,
  // about three and a half seconds at 96 BPM, which is one spoken exchange
  // (`docs/spec/latency.md`) and one reach out and back with nothing to spare.
  podCrossTilesPerBeat: 2,
  podHomeTiles: 2,
  podHomeTilesPerBeat: 2,
  // Two either side, five columns in all: the owner asked for the catch to be
  // about two tiles wider each way to make taking a pod easier (16 October
  // 2026). Pulled in from up to nearly four columns out, with the steering.
  podCatchCols: 2,
  // Sixteen beats, ten seconds at 96 BPM: two spoken exchanges to agree on
  // the shot, and the fall from the top row (under five beats) after it, with
  // a little left over. A pod that waits for ever is not owed at all.
  podDueBeats: 16,
};
