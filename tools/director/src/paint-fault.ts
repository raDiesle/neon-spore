import type { Wave } from "@neon-spore/content";
import type { MalfunctionKind } from "@neon-spore/sim";

/**
 * **A fault, laid across a beat row.** The column is ignored on purpose: a
 * malfunction has none — it is a row it enters on and a number of rows it
 * holds (`sim/fault-placed.ts`) — so a click anywhere along the row is a click
 * on the row.
 *
 * Painting the same kind on the same row again takes it off, which is the one
 * place in this file a brush is still its own eraser. `paint`'s own argument
 * against that is about a *cell*, where a click is how you point at what is
 * there; a fault has nothing to point at on the map but the row it is on, and
 * a second click is the only gesture left to take it away with.
 */
export function paintFault(wave: Wave, beat: number, kind: MalfunctionKind): void {
  const faults = wave.faults ?? [];
  const had = faults.find((f) => f.kind === kind && (f.at ?? 0) === beat);
  const left = had ? faults.filter((f) => f !== had) : [...faults, { kind, at: beat }];
  // Sorted by the row they enter on, so the list reads in the order it happens
  // whatever order it was painted in — `placedFaults`' own rule, applied here
  // as well so the *file* reads that way too.
  left.sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
  wave.faults = left.length > 0 ? left : undefined;
}
