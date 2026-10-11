import { bossFromWave, mapCol, waveCols } from "./queue.js";
import type { Wave } from "./waves.js";

/**
 * A wave moved off the seven authored columns onto every tile of a field
 * `cols` wide, playing exactly as it did.
 *
 * Seven columns land on tiles 0, 2, 3, 5, 7, 8 and 10 of eleven, and the
 * owner asked on 11 October 2026 to be able to place on the four between
 * them as well. Re-authoring every wave was never the answer — `mapCol`
 * exists so that nobody does — so a wave that wants the whole field is
 * translated once, by the same remap the game runs, and says `cols` from
 * then on. Every column it held lands on the tile it was already played on,
 * so its queue is the same queue (`test/wave-tiles.test.ts`).
 */
export function onEveryTile(wave: Wave, cols: number): Wave {
  const from = waveCols(wave);
  if (from === cols) return wave;
  const at = (col: number) => mapCol(col, cols, from);
  const boss = bossFromWave(wave, cols);
  return {
    ...wave,
    cols,
    entries: wave.entries.map((e) => ({
      ...e,
      col: at(e.col),
      ...(e.gaps ? { gaps: e.gaps.map(at) } : {}),
      ...(e.cracksRed ? { cracksRed: e.cracksRed.map(at) } : {}),
      ...(e.cracksCyan ? { cracksCyan: e.cracksCyan.map(at) } : {}),
    })),
    ...(wave.pods ? { pods: wave.pods.map((p) => ({ ...p, col: at(p.col) })) } : {}),
    ...(boss ? { boss } : {}),
  };
}

/**
 * Whether a wave can be put on every tile. Not THE SCOUT's: its arenas are
 * drawn and edited on a grid of their own seven (`scout-editor-grid.ts`), and
 * a wave counted on eleven would put every mote the editor showed somewhere
 * else.
 */
export function canTakeEveryTile(wave: Pick<Wave, "boss">): boolean {
  return wave.boss?.kind !== "scout";
}
