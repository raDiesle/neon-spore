import type { BossEntry, PodEntry, SpawnEntry } from "@neon-spore/sim";
import { kindForColor } from "./creatures.js";
import { WAVES, type Wave } from "./waves.js";

// The one question about a **boss** the remap has to answer, next door on
// line count (`queue-boss.ts`). Re-exported so nothing that asked this file
// for it had to move.
export { bossFromWave } from "./queue-boss.js";

import { bossFromWave } from "./queue-boss.js";

/** The field waves are authored against. The real `cols` is remapped from it. */
export const AUTHORED_COLS = 7;
/**
 * The last authored column index — authoring uses 0..AUTHORED_COL_MAX. Its own
 * export so that a bound check elsewhere calls it instead of writing
 * `AUTHORED_COLS - 1` by hand, which is also `mapCol`'s own arithmetic and
 * would otherwise trip the guard meant to catch that formula re-derived.
 */
export const AUTHORED_COL_MAX = AUTHORED_COLS - 1;

/** Waves are authored for 7 columns. Remap, never re-author. */
export function mapCol(col: number, cols: number): number {
  const mapped = Math.round((col * (cols - 1)) / AUTHORED_COL_MAX);
  return Math.max(0, Math.min(cols - 1, mapped));
}

/**
 * Turn a wave into a spawn queue. Seeded by the wave index, so the same wave
 * always plays out the same way — see the randomness rule in
 * docs/spec/structure.md: only what one player knows and the other does not
 * may be random.
 *
 * Past the last authored wave there is nothing: the run ends there
 * (`apps/game/waves.ts`, 12 September 2026). Until then an index beyond
 * `WAVES` got a seeded filler wave, and a run went on until the hull gave
 * out; the run is measured in time and retries now, over the authored waves
 * and no others (`sim/wave-fail.ts`).
 */
export function buildQueue(waveIndex: number, cols: number): SpawnEntry[] {
  const wave: Wave | undefined = WAVES[waveIndex];
  if (!wave) return [];
  return queueFromWave(wave, cols);
}

/**
 * The same translation, for a wave that is not in `WAVES` — the one the
 * director is editing before it has been saved.
 *
 * It asks for `entries` and nothing else, so a *rehearsal* can be put through
 * the same translation as a wave (`scenes.ts`). A guide's scene is a handful
 * of arrivals authored in the same 7 columns, and remapping them by hand there
 * would be the second copy of `mapCol` this file exists to prevent.
 */
export function queueFromWave(wave: Pick<Wave, "entries">, cols: number): SpawnEntry[] {
  const queue: SpawnEntry[] = [];
  for (const e of wave.entries) {
    const color = e.color;
    // A named kind wins, and the colour decides the silhouette only when the
    // entry does not say. That order is what THE LURE needs and no other kind
    // has ever exercised: a lure names both, because its colour is the
    // disguise's rather than its own (`wave-types.ts`). For everything else
    // the two are still never written together, so the `??` never fires and
    // this reads exactly as it always did.
    const kind = e.kind ?? (color ? kindForColor(color) : "meteor");
    // Which body a lure wears follows from the colour it was authored in,
    // exactly as a real arrival's does — one call, not a second copy of the
    // pairing. That is the whole disguise: a lure is a *correct* body in a
    // *correct* colour, and a bulb in red would be the one tell nothing else
    // in the game could produce. `e.wears` overrides it, and today nothing
    // does; a wave that ever did would be authoring a mismatch on purpose.
    const wears = kind === "lure" && color ? (e.wears ?? kindForColor(color)) : e.wears;
    // **THE FENCE has no column of its own** — it is every column at once, so
    // `col` is 0 and its span is the field's width (`spawnSpan`). What the
    // author painted is the way *through*: a wall whose entry names no gaps
    // has exactly one, in the cell it was placed in, which is what makes the
    // brush read the way it looks on the map. Remapped through `mapCol` like
    // any other column, so a gap authored for seven columns lands where the
    // arrival authored beside it does.
    const gaps = kind === "fence" ? (e.gaps ?? [e.col]).map((gap) => mapCol(gap, cols)) : undefined;
    // And where it is cracked — the columns a bolt opens, remapped the same
    // way. A wall with **no gaps at all** and no crack authored on it gets one
    // red crack in the cell it was painted in: that is `gaps`' own default
    // said about the other answer, and without it the brush can paint a wall
    // the pair has no way past at all.
    const cracked = kind === "fence" && gaps !== undefined;
    const bare = cracked && gaps.length === 0 && !e.cracksRed?.length && !e.cracksCyan?.length;
    const cracksRed = cracked
      ? (bare ? [e.col] : (e.cracksRed ?? [])).map((col) => mapCol(col, cols))
      : undefined;
    const cracksCyan = cracked ? (e.cracksCyan ?? []).map((col) => mapCol(col, cols)) : undefined;
    queue.push({
      beat: e.beat,
      col: gaps ? 0 : mapCol(e.col, cols),
      kind,
      color,
      wears,
      // The authored width, under the name everything downstream of here uses
      // for it (`SpawnEntry.span`). Only when the wave asked for one: an
      // absent span means "the kind's own", which is what `spanOf` answers.
      ...(e.size === undefined ? {} : { span: e.size }),
      // A ghost's path, on the same terms: only when the wave asked for
      // something other than the fall every other body takes, so a ghost
      // authored `"down"` — or written before crossing existed — carries no
      // field at all and produces the identical world.
      ...(e.path === undefined || e.path === "down" ? {} : { path: e.path }),
      // How long a thread is, on the same terms: only when the wave asked for
      // a length, so a strand left at the default carries no field at all and
      // `strandBeadCount` is the one place that default is read.
      ...(e.beads === undefined ? {} : { beads: e.beads }),
      // How many beats a box asks for, on the same terms as the fields above:
      // absent means the shipped count, read in `beatboxOnSpawn`.
      ...(e.beats === undefined ? {} : { beats: e.beats }),
      // How long a worm is and which wall it comes over, on the same terms
      // again: a crawler left at the shipped length and at the side its own
      // column implies carries neither field, and `crawlerSegmentCount` and
      // `crawlerSide` are the one place each of those defaults is read.
      ...(e.segments === undefined ? {} : { segments: e.segments }),
      ...(e.side === undefined ? {} : { side: e.side }),
      // Where the wall is open, on the real field. Written for a fence and
      // never for anything else, so every wave in the game is byte-for-byte
      // the same queue it was before this creature existed.
      ...(gaps === undefined ? {} : { gaps }),
      // Where the wall is cracked, on the real field. Written for a fence and
      // never for anything else, and only when there is one — so every wave in
      // the game is byte-for-byte the same queue it was before cracks existed,
      // apart from the solid walls that now arrive answerable.
      ...(cracksRed?.length ? { cracksRed } : {}),
      ...(cracksCyan?.length ? { cracksCyan } : {}),
      // How fast a balloon climbs, on the same terms as the fields above — a
      // count of rows, so `mapCol` has nothing to say about it.
      ...(e.rise === undefined ? {} : { rise: e.rise }),
      // Which way a rock crosses the field and the row it crosses along: only
      // when the wave asked for one, so a rock that falls carries neither. The
      // row is a row and never goes through `mapCol` — that function remaps
      // *columns*, and a field is remapped across, never down.
      ...(e.cross === undefined ? {} : { cross: e.cross }),
      ...(e.row === undefined ? {} : { row: e.row }),
    });
  }
  return queue.sort((a, b) => a.beat - b.beat);
}

/**
 * The pods of a wave, remapped onto the real field the same way the spawns are.
 * A separate call rather than a second return value, because a pod queue is a
 * separate thing to the simulation: `startWave` takes them apart.
 */
export function buildPods(waveIndex: number, cols: number): PodEntry[] {
  const wave: Wave | undefined = WAVES[waveIndex];
  if (wave) return podsFromWave(wave, cols);
  return [];
}

/**
 * `buildPods` for an unsaved wave. The sibling of `queueFromWave`, and narrowed
 * to the one field it reads for that function's own reason: a guide's
 * **rehearsal** hangs pods in its field too (`scenes/`), and remapping them by
 * hand over there would be the second copy of `mapCol` this file exists to
 * prevent.
 */
export function podsFromWave(wave: Pick<Wave, "pods">, cols: number): PodEntry[] {
  return (wave.pods ?? []).map((p) => ({ ...p, col: mapCol(p.col, cols) }));
}

/** The boss of an authored wave, remapped onto the real field, or null. */
export function buildBoss(waveIndex: number, cols: number): BossEntry | null {
  const wave: Wave | undefined = WAVES[waveIndex];
  if (wave) return bossFromWave(wave, cols);
  return null;
}
