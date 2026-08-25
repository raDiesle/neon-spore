import { CREATURES, type Wave, type WaveEntry } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import type { PodEntry } from "@neon-spore/sim";

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

/**
 * What a click paints. A brush rather than a cell that cycles through six
 * states: authoring a wave means putting the same thing in several columns,
 * and a cycle makes that six clicks instead of one.
 */
export type Brush = "red" | "cyan" | "rock" | "mend" | "purge" | "ward" | "erase";

export const BRUSHES: {
  brush: Brush;
  label: string;
  /** SUBJECTS names drawn on the card. Two means the brush resolves to either. */
  subjects: string[];
  stroke: string;
  note: string;
}[] = [
  {
    brush: "red",
    label: "SLICK",
    subjects: ["SLICK"],
    stroke: PALETTE.red,
    note: CREATURES.slick.blurb,
  },
  {
    brush: "cyan",
    label: "BULB",
    subjects: ["BULB"],
    stroke: PALETTE.cyan,
    note: CREATURES.bulb.blurb,
  },
  {
    brush: "rock",
    label: "METEOR",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteor.blurb,
  },
  {
    brush: "mend",
    label: "MEND",
    subjects: ["POD"],
    stroke: PALETTE.pod,
    note: "restores hull — the pod as it has always been",
  },
  {
    brush: "purge",
    label: "PURGE",
    subjects: ["POD"],
    stroke: PALETTE.ember,
    note: "clears every creature on the field",
  },
  {
    brush: "ward",
    label: "WARD",
    subjects: ["POD"],
    stroke: PALETTE.shieldRim,
    note: "holds the shield armed for a few beats, no trigger needed",
  },
  {
    brush: "erase",
    label: "ERASE",
    subjects: [],
    stroke: "#574d84",
    note: "takes back whatever is in the cell, entry or pod",
  },
];

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

/** What the cell currently holds, as the brush that would have made it. */
export function brushOf(entry: WaveEntry): Brush {
  if (entry.kind === "meteor") return "rock";
  return entry.color === "cyan" ? "cyan" : "red";
}

/** What kind of pod a cell holds, as the brush that would have made it. */
export function podBrushOf(pod: PodEntry): Brush {
  return pod.kind ?? "mend";
}

/** The three brushes that place a living creature or a rock, never a pod. */
export const CREATURE_BRUSHES: readonly Brush[] = ["red", "cyan", "rock"];

/**
 * A wave that carries a boss is the boss's wave: nothing about her design says
 * what a regular creature arriving alongside her would mean, and the one that
 * exists was authored with none. Erasing and placing pods both still work —
 * the queen's own wave hangs a pod for the pair to salvage.
 */
export function isCreaturePlacementBlocked(wave: Wave): boolean {
  return wave.boss !== undefined;
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
  // Only the rock names a kind. Everything else is named by its colour, and the
  // silhouette follows — `kindForColor`, the rule in packages/content.
  if (brush === "rock") return { beat, col, kind: "meteor", color: null };
  return { beat, col, color: brush };
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
    boss: wave.boss ? { ...wave.boss } : undefined,
  };
}

/** Why a wave cannot be saved, or null. */
export function refuse(waves: Wave[]): string | null {
  for (const [i, w] of waves.entries()) {
    if (!w.name.trim()) return `wave ${i + 1} has no name`;
    if (!w.sentence.trim()) return `wave ${i + 1} has no sentence — it is padding`;
    if (!w.hint.trim()) return `wave ${i + 1} has no hint`;
    // A boss wave is the boss: she is the whole wave, not an entry in it.
    if (!w.entries.length && !w.boss) return `wave ${i + 1} is empty`;
  }
  return null;
}
