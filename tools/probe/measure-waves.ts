#!/usr/bin/env bun
import { WAVES, type Wave } from "@neon-spore/content";
import { failHolds, type World } from "@neon-spore/sim";
import { page } from "./measure-waves-page.js";
import { playedBeat, waveWorld } from "./world.js";

/**
 * `bun run waves:measure` — every wave and every boss, measured, written to
 * `docs/spec/wave-curriculum-today.md`.
 *
 * The evidence the curriculum is planned against (`docs/spec/wave-curriculum.md`):
 * what each wave introduces, how long it is, how long AUTO takes to clear it,
 * and its pressure. It was three scratch probes on 14 October 2026, and a table
 * copied out of scratch goes stale with the first wave edited; this rewrites
 * the whole page from the tree, so the numbers on it are always the tree's.
 *
 * **AUTO is a lower bound.** It plays both seats with perfect hands and never
 * talks (`playedBeat`), so a pair takes longer — the curriculum's guess, which
 * the owner accepted on 14 October 2026, is twice as long. A wave AUTO loses is
 * written *AUTO fails* rather than given a number.
 */

/** Past this many beats a wave is taken as never clearing — the longest boss
 * today clears in about 550. */
const LIMIT_BEATS = 900;

export interface Measured {
  wave: Wave;
  index: number;
  /** The beat the field was clear with AUTO playing, or -1 when AUTO lost. */
  clearBeat: number;
}

/** Plays one wave with AUTO on both seats until its field is clear. */
export function measureWave(index: number): Measured {
  const wave = WAVES[index];
  if (!wave) throw new Error(`no wave at ${index}`);
  return { wave, index, clearBeat: clearBeat(waveWorld(wave.id)) };
}

/**
 * The beat a world stood at a wave's start is clear with AUTO on both seats,
 * or -1 when AUTO loses it. The composer asks the same of a wave it has not
 * written yet (`tools/director/src/compose-check.ts`).
 */
export function clearBeat(world: World): number {
  for (let beat = 1; beat <= LIMIT_BEATS; beat++) {
    playedBeat(world);
    if (world.restBeat !== 0) return beat;
    if (failHolds(world)) break;
  }
  return -1;
}

if (import.meta.main) {
  const all = WAVES.map((_, i) => measureWave(i));
  const out = new URL("../../docs/spec/wave-curriculum-today.md", import.meta.url);
  const day = new Date().toISOString().slice(0, 10);
  await Bun.write(out, page(all, day));
  // The same beats by id, for the director's live table (`waves-table.ts`).
  const clear = Object.fromEntries(all.map((m) => [m.wave.id, m.clearBeat]));
  const json = new URL("../../docs/spec/wave-curriculum-today.json", import.meta.url);
  await Bun.write(json, `${JSON.stringify({ day, clear }, null, 2)}\n`);
  const lost = all.filter((m) => m.clearBeat < 0).map((m) => m.wave.name);
  console.log(`wrote docs/spec/wave-curriculum-today.md and .json — ${all.length} waves`);
  if (lost.length) console.log(`AUTO loses ${lost.length}: ${lost.join(", ")}`);
}
