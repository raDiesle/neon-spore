import { authorsBodyColor, CREATURES, type Wave, type WaveEntry } from "@neon-spore/content";
import type { CreatureKind } from "@neon-spore/sim";
import { type Brush, ROCK_BRUSHES } from "./brushes.js";
import { setBody } from "./entry-fields.js";
import {
  brushOf,
  CREATURE_BRUSHES,
  entryAt,
  isCreaturePlacementBlocked,
  podAt,
  podBrushOf,
} from "./query.js";

/**
 * The edits: what a click does to a wave, and what takes it back.
 *
 * Split out of `state.ts` when that file went over the line limit. The division
 * is the one that was already there in spirit — `query.ts` and `state.ts` say
 * what a wave *is* and what is in it, and this says how it changes. Nothing
 * here reads the DOM and nothing here knows a panel exists.
 */

/** Row a new pod hangs at. Never the hull row, and never the top one either. */
const POD_DEFAULT_ROW = 3;

/**
 * Paint one cell. **Idempotent: painting what is already there leaves it
 * alone.**
 *
 * It used to remove it instead, so that the brush was its own eraser and the
 * common correction cost no trip to the palette. That made the commonest
 * gesture in the tool destructive — a click on a cell to see what is in it took
 * the thing away — and left no way to point at an entry at all, which is
 * exactly what a per-entry config panel needs (`cell-panel.ts`). Removal is now
 * its own verb: `eraseAt`, reached by `Delete`, by a held press, by the ERASE
 * brush and by the panel's own button.
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
    eraseAt(wave, beat, col);
    return;
  }

  const existing = entryAt(wave, beat, col);
  // Already this exact thing: nothing to do. Not a removal any more, and not a
  // rebuild either — replacing it with an identical entry would throw away the
  // per-entry configuration hanging off it the moment those fields exist.
  if (existing && brushOf(existing) === brush) return;
  removeEntry(wave, beat, col);
  wave.entries.push(makeEntry(beat, col, brush));
  sortEntries(wave);
}

/**
 * Take back whatever is in a cell — the entry, the pod, or both. The one
 * removal path, so the key, the held press, the ERASE brush and the panel's
 * own button cannot come to disagree about what "empty this cell" means.
 */
export function eraseAt(wave: Wave, beat: number, col: number): void {
  removeEntry(wave, beat, col);
  removePod(wave, beat, col);
}

/** Whether a cell holds anything at all, so a caller can refuse to offer a
 * removal that would do nothing. */
export function cellIsEmpty(wave: Wave, beat: number, col: number): boolean {
  return !entryAt(wave, beat, col) && !podAt(wave, beat, col);
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
  // back into a shape — while a colourless one has no colour to name, so it
  // carries its kind instead. `WaveEntry.kind`'s hand-written union in
  // `packages/content/src/wave-types.ts` has to grow the day a third
  // colourless kind joins `CREATURES`; `brushes.test.ts`'s round trip is what
  // catches the day someone forgets, since the cast below cannot.
  const kind = brush as CreatureKind;
  const color = CREATURES[kind].color;
  if (color) return { beat, col, color };
  // A kind whose colour is a fact about the *arrival* rather than about the
  // kind — the lure's disguise, the shell's core, the clasp's prisoner, the
  // dart's side. It arrives on the slick, and the panel under the map is where
  // it is turned into a bulb (`entry-fields.ts`). Placing one with no colour at
  // all is what the palette used to do, and it authored a body the game then
  // had to fall back to a grey stand-in for.
  if (authorsBodyColor(kind)) {
    const entry: WaveEntry = { beat, col, kind: kind as WaveEntry["kind"], color: null };
    setBody(entry, "slick");
    return entry;
  }
  return { beat, col, kind: kind as WaveEntry["kind"], color: null };
}

function removeEntry(wave: Wave, beat: number, col: number): void {
  wave.entries = wave.entries.filter((e) => !(e.beat === beat && e.col === col));
}

/**
 * Idempotent for `paint`'s reason: a pod painted where that pod already hangs
 * stays. Painting a *different* pod kind over one changes the kind in place
 * rather than making a second — a cell holds one pod, and the row it hangs at
 * is worth keeping across a change of mind about what it gives.
 */
function paintPod(wave: Wave, beat: number, col: number, brush: PodBrush): void {
  const existing = podAt(wave, beat, col);
  if (existing) {
    if (podBrushOf(existing) === brush) return;
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

export function byBeatThenCol(
  a: { beat: number; col: number },
  b: { beat: number; col: number },
): number {
  return a.beat - b.beat || a.col - b.col;
}
