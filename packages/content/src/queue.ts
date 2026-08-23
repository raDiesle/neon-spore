import { type Color, createRng, next, nextInt, type SpawnEntry } from "@neon-spore/sim";
import { WAVES, type Wave } from "./waves.js";

const COLORS: Color[] = ["red", "cyan"];
const AUTHORED_COLS = 7;

/** Waves are authored for 7 columns. Remap, never re-author. */
export function mapCol(col: number, cols: number): number {
  const mapped = Math.round((col * (cols - 1)) / (AUTHORED_COLS - 1));
  return Math.max(0, Math.min(cols - 1, mapped));
}

/**
 * Turn a wave into a spawn queue. Seeded by the wave index, so the same wave
 * always plays out the same way — see the randomness rule in
 * docs/spec/structure.md: only what one player knows and the other does not
 * may be random.
 */
export function buildQueue(waveIndex: number, cols: number): SpawnEntry[] {
  const rng = createRng(waveIndex);
  const wave: Wave | undefined = WAVES[waveIndex];
  if (!wave) return buildContinuation(waveIndex, cols);

  let alt = next(rng) < 0.5 ? 0 : 1;
  const queue: SpawnEntry[] = [];
  for (const e of wave.entries) {
    let color: Color | null = null;
    if (e.color === "alt") color = COLORS[alt++ % COLORS.length]!;
    else if (e.color === "any") color = COLORS[nextInt(rng, COLORS.length)]!;
    else color = e.color;
    queue.push({ beat: e.beat, col: mapCol(e.col, cols), kind: e.kind, color });
  }
  return queue.sort((a, b) => a.beat - b.beat);
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
    queue.push({
      beat: Math.floor(k * 1.6 + next(rng) * 1.4),
      col: nextInt(rng, cols),
      kind: isRock ? "meteor" : k % 2 === 0 ? "manta" : "jelly",
      color: isRock ? null : COLORS[nextInt(rng, COLORS.length)]!,
    });
  }
  return queue.sort((a, b) => a.beat - b.beat);
}
