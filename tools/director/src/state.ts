import { CREATURES, kindForColor, type Wave, type WaveEntry } from "@neon-spore/content";
import {
  bossFillsWave,
  type Color,
  type CreatureKind,
  type PodEntry,
  type RockKind,
} from "@neon-spore/sim";
import { type Brush, LIVING_BRUSH_KINDS } from "./brushes.js";

export type { Brush, BrushGroup } from "./brushes.js";
export { BRUSH_GROUPS, BRUSHES } from "./brushes.js";

/**
 * The rock brushes, paired with the kind each one paints. One table instead
 * of a chain of `if`s in both directions, so a sixth tier is one row here.
 */
const ROCK_BRUSHES: readonly [Brush, RockKind][] = [
  ["rock", "meteor"],
  ["rockMedium", "meteorMedium"],
  ["rockFast", "meteorFast"],
  ["rockFaster", "meteorFaster"],
  ["rockFastest", "meteorFastest"],
  ["torch", "torch"],
];

/**
 * The waves being edited, and the operations the grid performs on them.
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

/** Row a new pod hangs at. Never the hull row, and never the top one either. */
const POD_DEFAULT_ROW = 3;

/** Spare beats kept below the last one, so there is always somewhere to paint. */
const SPARE_BEATS = 4;
const MIN_BEATS = 10;

export function currentWave(store: Store): Wave | undefined {
  return store.waves[store.index];
}

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
 * rock or a colourless living creature (a Runt, a Throb) names its own kind
 * in `entry.kind`; a coloured one never does — `kindForColor` is what turns
 * its `color` back into the kind, the same rule `wave-types.ts` names in the
 * comment on `WaveEntry.kind`.
 */
export function brushOf(entry: WaveEntry): Brush {
  const rock = ROCK_BRUSHES.find(([, kind]) => kind === entry.kind);
  if (rock) return rock[0];
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

/**
 * Paint one cell. Painting what is already there removes it, so the brush is
 * also its own eraser and the common correction costs no trip to the palette.
 *
 * The guard against a creature brush on a boss wave lives here and not only in
 * the palette that hides the buttons — a stale selection carried over from
 * another wave must not be able to place one either.
 */
export function paint(wave: Wave, beat: number, col: number, brush: Brush): void {
  if (isCreaturePlacementBlocked(wave) && CREATURE_BRUSHES.includes(brush)) return;

  if (brush === "mend" || brush === "purge" || brush === "ward") {
    paintPod(wave, beat, col, brush);
    return;
  }
  if (brush === "erase") {
    removeEntry(wave, beat, col);
    removePod(wave, beat, col);
    return;
  }

  const existing = entryAt(wave, beat, col);
  if (existing && brushOf(existing) === brush) {
    removeEntry(wave, beat, col);
    return;
  }
  removeEntry(wave, beat, col);
  wave.entries.push(makeEntry(beat, col, brush));
  sortEntries(wave);
}

/**
 * The brushes that make an entry. `pod` and `erase` are the two that do not:
 * a pod is not an entry, and an erase is not a thing but the absence of one.
 */
type EntryBrush = Exclude<Brush, "mend" | "purge" | "ward" | "erase">;
type PodBrush = Extract<Brush, "mend" | "purge" | "ward">;

function makeEntry(beat: number, col: number, brush: EntryBrush): WaveEntry {
  const rock = ROCK_BRUSHES.find(([b]) => b === brush);
  if (rock) return { beat, col, kind: rock[1], color: null };

  // A living brush left: its own `CreatureKind` — every rock literal was
  // handled above, so the cast only narrows to what the runtime already
  // knows. A coloured one is named by its colour and no kind at all —
  // `color` is what a wave author says out loud, and `kindForColor` turns it
  // back into a shape — while a colourless one (Runt, Throb) has no colour to
  // name, so it carries its kind instead. `WaveEntry.kind`'s hand-written
  // union in `packages/content/src/wave-types.ts` has to grow the day a third
  // colourless kind joins `CREATURES`; `brushes.test.ts`'s round trip is what
  // catches the day someone forgets, since the cast below cannot.
  const kind = brush as CreatureKind;
  const color = CREATURES[kind].color;
  if (color) return { beat, col, color };
  return { beat, col, kind: kind as WaveEntry["kind"], color: null };
}

function removeEntry(wave: Wave, beat: number, col: number): void {
  wave.entries = wave.entries.filter((e) => !(e.beat === beat && e.col === col));
}

function paintPod(wave: Wave, beat: number, col: number, brush: PodBrush): void {
  const existing = podAt(wave, beat, col);
  if (existing) {
    if (podBrushOf(existing) === brush) {
      removePod(wave, beat, col);
      return;
    }
    existing.kind = brush === "mend" ? undefined : brush;
    return;
  }
  const pods = wave.pods ?? [];
  pods.push({ beat, col, row: POD_DEFAULT_ROW, kind: brush === "mend" ? undefined : brush });
  wave.pods = pods.sort(byBeatThenCol);
}

function removePod(wave: Wave, beat: number, col: number): void {
  const left = (wave.pods ?? []).filter((p) => !(p.beat === beat && p.col === col));
  // An empty list and no list are the same wave. Dropping the field keeps the
  // saved file free of `pods: []` on the nine waves that have never had one.
  if (left.length) wave.pods = left;
  else wave.pods = undefined;
}

function sortEntries(wave: Wave): void {
  wave.entries.sort(byBeatThenCol);
}

function byBeatThenCol(a: { beat: number; col: number }, b: { beat: number; col: number }): number {
  return a.beat - b.beat || a.col - b.col;
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
export function emptyWave(): Wave {
  return { name: "", sentence: "", hint: "", entries: [] };
}

export function copyWave(wave: Wave): Wave {
  return {
    name: `${wave.name} COPY`,
    sentence: wave.sentence,
    hint: wave.hint,
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
    if (!w.hint.trim()) return `wave ${i + 1} has no hint`;
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
