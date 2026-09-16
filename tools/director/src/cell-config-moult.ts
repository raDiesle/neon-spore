import type { WaveEntry } from "@neon-spore/content";
import type { PodKind } from "@neon-spore/sim";
import { choiceRow } from "./cell-config-rows.js";
import { cargoLabel, MOULT_CARGOES, moultCargoOf, setMoultCargo } from "./entry-fields-moult.js";

/**
 * **THE MOULT's one row under the selected cell**: what it is carrying for the
 * half of its fall it spends as a cargo.
 *
 * Its own file rather than a branch in `cell-config.ts`, for
 * `cell-config-mine.ts`' reason and at the same line of that file: every
 * future per-arrival number is a row there and nothing at all in the half that
 * draws one, so the growing half goes next door as it arrives.
 *
 * A row here rather than a kind in the bestiary is `PodEntry.kind`'s argument
 * word for word — a pair watching one turn over has to be able to tell what
 * catching it is worth before deciding whether to stand under it — and what a
 * wave does *not* set is when it turns over, which is one clock off the wave's
 * own beat and is therefore answered by the entry's beat alone.
 */
export function moultRows(entry: WaveEntry, onEdit: () => void): HTMLElement[] {
  return [
    choiceRow("CARGO", MOULT_CARGOES, moultCargoOf(entry), cargoLabel, (cargo: PodKind) => {
      setMoultCargo(entry, cargo);
      onEdit();
    }),
  ];
}
