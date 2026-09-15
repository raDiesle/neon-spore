import { type MalfunctionKind, type PlacedFault, TO_THE_END } from "@neon-spore/sim";

/**
 * **A fault as an author writes it**: the kind, the beat row it enters on, and
 * how many beat rows it holds.
 *
 * The owner asked for it on 14 September 2026 — *all malfunctions are not
 * attached to the wave, but a pencil to be placed on the map, so I can define
 * when it enters the wave (what beat row) and when it ends.* Before that a wave
 * carried one fault as a field beside its boss, on for the whole of itself, and
 * only THE HANDOVER could say when.
 *
 * `at` and `beats` are both optional here and neither is in the world's own
 * `PlacedFault`: the fallbacks are settled once, by `placedFaults` below, on the
 * way in. That is the queue's arrangement and it is here for the queue's reason
 * — a default spelled a second time downstream is a wave that plays one way in
 * the game and another in the director.
 */
export interface WaveFault {
  kind: MalfunctionKind;
  /** The runaway cannon's ammunition, and nothing else reads it. */
  color?: "red" | "cyan" | "alternating";
  /** The beat row it enters on. Missing is the wave's first beat. */
  at?: number;
  /** How many beat rows it holds. Missing is *to the end of the wave*. */
  beats?: number;
}

/**
 * The faults of a wave, with every fallback settled — what `startWave` takes.
 *
 * Sorted by the beat they enter on, so a wave's faults are read in the order
 * they happen whatever order they were painted in. Two placed on the same beat
 * keep the order the author wrote them, which is the only thing left that
 * could distinguish them.
 */
export function placedFaults(faults: readonly WaveFault[] | undefined): PlacedFault[] {
  if (!faults) return [];
  return faults
    .map(
      (f): PlacedFault =>
        ({
          ...(f.kind === "cannon" ? { kind: "cannon", color: f.color ?? "red" } : { kind: f.kind }),
          at: Math.max(0, Math.round(f.at ?? 0)),
          beats: Math.max(0, Math.round(f.beats ?? TO_THE_END)),
        }) as PlacedFault,
    )
    .sort((a, b) => a.at - b.at);
}
