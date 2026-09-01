import { kindForColor, type Wave, type WaveEntry } from "@neon-spore/content";
import { bossFillsWave, type Color, isMeteorKind, type PodEntry } from "@neon-spore/sim";
import { type Brush, LIVING_BRUSH_KINDS, ROCK_BRUSHES } from "./brushes.js";

/**
 * What is in a wave: the questions, with no answer that changes anything.
 *
 * Split from `state.ts` alongside `paint.ts` when that file went over the line
 * limit — the store and the wave shapes stayed there, the edits went next door,
 * and these are what both of them ask. Kept apart from `paint.ts` on purpose:
 * this half has no way to write a wave, so a panel that only needs to *read*
 * one cannot reach an edit by accident.
 */

/** Spare beats kept below the last one, so there is always somewhere to paint. */
const SPARE_BEATS = 4;
const MIN_BEATS = 10;

/** How many beat rows the grid shows: everything used, plus room to grow. */
export function beatCount(wave: Wave): number {
  let last = 0;
  for (const e of wave.entries) last = Math.max(last, e.beat);
  for (const p of wave.pods ?? []) last = Math.max(last, p.beat);
  return Math.max(MIN_BEATS, last + 1 + SPARE_BEATS);
}

export function entryAt(wave: Wave, beat: number, col: number): WaveEntry | undefined {
  return wave.entries.find((e) => e.beat === beat && e.col === col);
}

export function podAt(wave: Wave, beat: number, col: number): PodEntry | undefined {
  return (wave.pods ?? []).find((p) => p.beat === beat && p.col === col);
}

/**
 * What the cell currently holds, as the brush that would have made it. A
 * rock or a colourless living creature names its own kind in `entry.kind`; a
 * coloured one never does — `kindForColor` is what turns its `color` back into
 * the kind, the same rule `wave-types.ts` names on `WaveEntry.kind`.
 *
 * **Every meteor tier reads back as the one `METEOR` brush.** The five tiers
 * are still five kinds in the wave file and in the bestiary — the speed *is*
 * the kind — but they are no longer five tools: a rock's speed is a number on
 * the arrival, set in the panel under the map (`cell-config.ts`). Asking
 * `ROCK_BRUSHES` alone would answer `undefined` for four of the five and fall
 * through to the line below, which would hand back `"meteorFast"` — a string
 * that type-checks as a `Brush` and that no button, silhouette or tooltip in
 * the tool knows anything about.
 */
export function brushOf(entry: WaveEntry): Brush {
  if (entry.kind && isMeteorKind(entry.kind)) return entry.kind === "torch" ? "torch" : "rock";
  if (entry.kind) return entry.kind;
  return kindForColor(entry.color as Color);
}

/** What kind of pod a cell holds, as the brush that would have made it. */
export function podBrushOf(pod: PodEntry): Brush {
  return pod.kind ?? "mend";
}

/** The brushes that place a living creature or a rock, never a pod. */
export const CREATURE_BRUSHES: readonly Brush[] = [
  ...LIVING_BRUSH_KINDS,
  ...ROCK_BRUSHES.map(([brush]) => brush),
];

/**
 * A wave that carries a boss is the boss's wave: nothing about her design says
 * what a regular creature arriving alongside her would mean, and the one that
 * exists was authored with none. Erasing and placing pods both still work —
 * the queen's own wave hangs a pod for the pair to salvage.
 */
export function isCreaturePlacementBlocked(wave: Wave): boolean {
  // Not "has a boss": THE VANE spawns nothing and only bends what the wave
  // sends, so its wave has to be allowed creatures. The simulation owns which
  // bosses are the whole encounter (`bossFillsWave` in entries.ts).
  return wave.boss !== undefined && bossFillsWave(wave.boss.kind);
}
