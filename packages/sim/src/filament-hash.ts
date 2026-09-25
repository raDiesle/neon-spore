import { FILAMENT_PHASES, type FilamentState } from "./filament.js";

/**
 * What THE FILAMENT puts into `hashWorld`, and nothing else.
 *
 * **The filaments go in whole**, the way THE INSTAR's script and THE SCOUT's
 * arenas do (`instar-hash.ts`, `scout-hash.ts`): they are copied onto the
 * state at install and two devices hung different filaments would be drawing
 * different lines. The count of filaments and the count of tiles on each go
 * in ahead of the tiles, so two states differing only in a length cannot
 * fold into the same number. The head, the tail and the two grabs are the
 * path lit so far — the *trace* the ledger asked to be hashed — and they go
 * in as the indices they are — the grab pair's length with them, because
 * `hash-coverage` tries a third thumb and a tuple cannot say no at runtime.
 */
export function filamentHashParts(s: FilamentState): number[] {
  const out = [
    s.tiles.length,
    s.cursor,
    FILAMENT_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.head,
    s.tail,
    s.headBeat,
    s.stillBeat,
    s.grab.length,
    s.grab[0],
    s.grab[1],
  ];
  for (const tiles of s.tiles) {
    out.push(tiles.length);
    for (const t of tiles) out.push(t.col, t.row);
  }
  return out;
}
