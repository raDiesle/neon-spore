/**
 * **Which arena list each scout wave owns**, and the file it lives in.
 *
 * THE SCOUT and THE HAUL are one round with two sets of levels, and a save
 * writes each wave's levels back into its own list: `serializeBoss` names the
 * list in the wave file, and `writeArenas` regenerates the list where it lives
 * (`serialize-scout.ts`). A scout wave not in this table is a wave nobody has
 * given a list yet — its boss is written as the first list's name and its
 * levels are not written at all, and the save says so in the log rather than
 * guessing a file.
 */
export interface ScoutList {
  /** The wave's `id`. */
  readonly wave: string;
  /** The exported array's name in its file. */
  readonly name: string;
  /** The file, repository-relative. */
  readonly rel: string;
}

export const SCOUT_LISTS: readonly ScoutList[] = [
  { wave: "theScout", name: "SCOUT_ARENAS", rel: "packages/content/src/scout-arenas.ts" },
  { wave: "theHaul", name: "SCOUT_HAUL_ARENAS", rel: "packages/content/src/scout-haul-arenas.ts" },
];

/** The list `waveId` is written as, or `null` for a scout wave with none. */
export function scoutList(waveId: string): ScoutList | null {
  return SCOUT_LISTS.find((l) => l.wave === waveId) ?? null;
}
