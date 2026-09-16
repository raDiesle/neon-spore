import type { WaveEntry } from "@neon-spore/content";
import type { PodKind } from "@neon-spore/sim";

/**
 * **THE MOULT's one per-arrival fact**: what it is carrying for the beats it is
 * wearing its cargo rather than its shell.
 *
 * Its own file rather than another export from `entry-fields.ts` for
 * `entry-fields-mine.ts`' reason exactly — that file stands at its limit — and
 * the seam is the same one: this is a fact about *a body a wave sent*, not
 * about how anything moves.
 *
 * **When it turns over is deliberately not here.** That is one clock off the
 * wave's own beat (`sim/moult.ts`), so it is not a thing an author sets on an
 * arrival at all — what an author sets is the beat, and the beat *is* the
 * answer. A second field saying the same thing would be a field that could
 * disagree with the first.
 */

/** The two a moult may carry. **A mend is not offered**, and that is the one
 * decision in this file: a mend pays back a hull the wave's own rule has
 * already spent — any hit loses the wave (`sim/wave-fail.ts`) — so a cargo
 * that mends is a cargo worth nothing on a creature whose whole question is
 * whether being under it is worth it. */
export const MOULT_CARGOES: readonly PodKind[] = ["ward", "purge"];

/** Whether this entry is a moult, and therefore has a cargo to set. The one
 * kind that does: `cargo` means nothing on anything else, and a row offered on
 * a rock would write a field the simulation never reads. */
export function hasMoultFields(entry: WaveEntry): boolean {
  return entry.kind === "moult";
}

/** What this one carries. Unset means a ward, which is the default
 * `moultOnSpawn` reads and the useful one: a ward holds the dome armed with no
 * trigger, which is exactly what the pair needs for the *other* half of the
 * same body on its next turn. */
export function moultCargoOf(entry: WaveEntry): PodKind {
  return entry.cargo ?? "ward";
}

/** Set it, with the ward written as no field at all — `setMineSeat`'s reason:
 * an arrival left where the panel opened it serialises exactly as it did. */
export function setMoultCargo(entry: WaveEntry, cargo: PodKind): void {
  entry.cargo = cargo === "ward" ? undefined : cargo;
}

/** A cargo said the way the pod brushes already say it in the palette. */
export function cargoLabel(kind: PodKind): string {
  return kind.toUpperCase();
}
