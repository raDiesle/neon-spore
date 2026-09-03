import { freshWaveId, type Wave } from "@neon-spore/content";

export type { BrushGroup } from "./brush-groups.js";
export { BRUSH_GROUPS } from "./brush-groups.js";
export type { Brush } from "./brushes.js";
export { BRUSHES, ROCK_BRUSHES } from "./brushes.js";
/**
 * The edits and the questions moved out when this file went over the line
 * limit — `paint.ts` is what a click does to a wave, `query.ts` is what is in
 * one. Re-exported here rather than repointed at every call site: `state.ts` is
 * the name every panel already imports, and which of the three files a function
 * happens to live in is not a fact any of them should have to know.
 */
export { byBeatThenCol, cellIsEmpty, eraseAt, paint } from "./paint.js";
export {
  beatCount,
  brushOf,
  CREATURE_BRUSHES,
  entryAt,
  isCreaturePlacementBlocked,
  podAt,
  podBrushOf,
} from "./query.js";

/**
 * The waves being edited.
 *
 * Kept apart from the panels that draw it for one reason: this is the only
 * module that decides what a wave *is*, and the serializer on the server has
 * to agree with it exactly. A panel may not invent an entry shape.
 */
export interface Store {
  waves: Wave[];
  /** Which wave is being edited. */
  index: number;
  /** Edited since the last save. */
  dirty: boolean;
}

export function currentWave(store: Store): Wave | undefined {
  return store.waves[store.index];
}

/**
 * A boss, deep enough. THE MIRROR carries an array of arrays, and a shallow
 * copy of it would leave the copy editing the original's sequences.
 */
function copyBoss(boss: Wave["boss"]): Wave["boss"] {
  if (!boss) return undefined;
  if (boss.kind === "mirror") return { ...boss, rounds: boss.rounds.map((r) => [...r]) };
  return { ...boss };
}

/**
 * A new wave, deliberately unnamed and unsentenced. The save refuses it until
 * both are written, which is the one-sentence test doing its job at the moment
 * the wave is made rather than in review.
 */
export function emptyWave(taken: Iterable<string> = []): Wave {
  return { id: freshWaveId(taken), name: "", sentence: "", entries: [] };
}

export function copyWave(wave: Wave, taken: Iterable<string> = []): Wave {
  return {
    // A copy is a different wave, so it is a different handle. Carrying the
    // original's would make two waves one thing to everything that points.
    id: freshWaveId(taken),
    name: `${wave.name} COPY`,
    sentence: wave.sentence,
    guide: wave.guide ? { ...wave.guide } : undefined,
    entries: wave.entries.map((e) => ({ ...e })),
    pods: wave.pods?.map((p) => ({ ...p })),
    boss: copyBoss(wave.boss),
  };
}

/** Why a wave cannot be saved, or null. */
export function refuse(waves: Wave[]): string | null {
  for (const [i, w] of waves.entries()) {
    if (!w.name.trim()) return `wave ${i + 1} has no name`;
    if (!w.sentence.trim()) return `wave ${i + 1} has no sentence — it is padding`;
    // A boss wave is the boss: it is the whole wave, not an entry in it.
    if (!w.entries.length && !w.boss) return `wave ${i + 1} is empty`;
    // THE MIRROR is nothing but its rounds, and a round nobody can answer
    // wrong is a round that costs the pair nothing to sit through.
    if (w.boss?.kind === "mirror") {
      if (!w.boss.rounds.length) return `wave ${i + 1}: the mirror has no rounds`;
      const empty = w.boss.rounds.findIndex((r) => r.length === 0);
      if (empty !== -1) return `wave ${i + 1}: the mirror's round ${empty + 1} is empty`;
    }
  }
  return null;
}
