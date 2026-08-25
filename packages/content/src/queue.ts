import {
  type BossEntry,
  type Color,
  createRng,
  next,
  nextInt,
  type PodEntry,
  type SpawnEntry,
} from "@neon-spore/sim";
import { kindForColor } from "./creatures.js";
import { WAVES, type Wave } from "./waves.js";

const COLORS: Color[] = ["red", "cyan"];
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
 */
export function buildQueue(waveIndex: number, cols: number): SpawnEntry[] {
  const wave: Wave | undefined = WAVES[waveIndex];
  if (!wave) return buildContinuation(waveIndex, cols);
  return queueFromWave(wave, cols);
}

/**
 * The same translation, for a wave that is not in `WAVES` — the one the
 * director is editing before it has been saved.
 */
export function queueFromWave(wave: Wave, cols: number): SpawnEntry[] {
  const queue: SpawnEntry[] = [];
  for (const e of wave.entries) {
    const color = e.color;
    // The colour decides the silhouette; the wave never names both.
    const kind = color ? kindForColor(color) : (e.kind ?? "meteor");
    queue.push({ beat: e.beat, col: mapCol(e.col, cols), kind, color });
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

  // Beyond the authored waves, every third one carries a pod. Seeded off the
  // wave index like everything else, and off a different stream from the
  // spawns, so the pod does not land under the same creature every time.
  const beyond = waveIndex - WAVES.length;
  if (beyond % 3 !== 0) return [];
  const rng = createRng(waveIndex + 9973);
  return [{ beat: 1 + nextInt(rng, 3), col: nextInt(rng, cols), row: 2 + nextInt(rng, 3) }];
}

/** `buildPods` for an unsaved wave. The sibling of `queueFromWave`. */
export function podsFromWave(wave: Wave, cols: number): PodEntry[] {
  return (wave.pods ?? []).map((p) => ({ ...p, col: mapCol(p.col, cols) }));
}

/** The boss of an authored wave, remapped onto the real field, or null. */
export function buildBoss(waveIndex: number, cols: number): BossEntry | null {
  const wave: Wave | undefined = WAVES[waveIndex];
  if (wave) return bossFromWave(wave, cols);
  return null;
}

/** `buildBoss` for an unsaved wave. The sibling of `podsFromWave`. */
export function bossFromWave(wave: Wave, cols: number): BossEntry | null {
  if (!wave.boss) return null;
  return { ...wave.boss, col: mapCol(wave.boss.col, cols) };
}

/** Beyond the authored waves: reproducible filler, clearly marked as such. */
function buildContinuation(waveIndex: number, cols: number): SpawnEntry[] {
  const rng = createRng(waveIndex);
  const beyond = waveIndex - WAVES.length;
  const creatures = Math.min(9, 3 + Math.floor(beyond / 2));
  const rocks = Math.min(3, 1 + Math.floor(beyond / 4));
  const queue: SpawnEntry[] = [];
  for (let k = 0; k < creatures + rocks; k++) {
    const isRock = k >= creatures;
    const color = isRock ? null : COLORS[nextInt(rng, COLORS.length)]!;
    queue.push({
      beat: Math.floor(k * 1.6 + next(rng) * 1.4),
      col: nextInt(rng, cols),
      kind: color ? kindForColor(color) : "meteor",
      color,
    });
  }
  return queue.sort((a, b) => a.beat - b.beat);
}
