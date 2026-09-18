import { placedFaults, type Wave, type WaveFault } from "@neon-spore/content";
import {
  DEFAULT_CONFIG,
  faultCovers,
  type MalfunctionKind,
  type PlacedFault,
  TO_THE_END,
} from "@neon-spore/sim";
import { faultTitle } from "./fault-notes.js";

/**
 * **A fault, laid across a beat row**, and everything the row it is on can be
 * asked or told.
 *
 * The column is ignored on purpose: a malfunction has none — it is a row it
 * enters on and a number of rows it holds (`sim/fault-placed.ts`) — so a click
 * anywhere along the row is a click on the row.
 *
 * Painting the same kind on the same row again takes it off, which is the one
 * place in this file a brush is still its own eraser. `paint`'s own argument
 * against that is about a *cell*, where a click is how you point at what is
 * there; a fault has nothing to point at on the map but the row it is on, and
 * a second click is the only gesture left to take it away with.
 *
 * **The reading lives here beside the writing**, rather than in `query.ts`
 * with the rest of the asking. The split next door is worth its two files
 * because both halves are long and neither is about one subject; this is nine
 * lines about one — which faults are on this row, and what may be changed
 * about one — and a second file for three filters would be a seam with
 * nothing on either side of it.
 */

/**
 * Place a fault on a beat row, or take it off again if that kind is already
 * there.
 *
 * **A fresh HANDOVER is the one placement that arrives with a length.** Every
 * other fault with no `beats` means *to the end of the wave*, which is a
 * reading THE HANDOVER cannot have: the panels would change screens and never
 * come home, and the simulation reads no fallback of its own any more
 * (`sim/config-malfunction.ts`). So the pencil puts the game's own hold on it,
 * which is the job those two numbers have left, and the author moves it on the
 * row like any other.
 */
export function paintFault(wave: Wave, beat: number, kind: MalfunctionKind): void {
  const faults = wave.faults ?? [];
  const had = faults.find((f) => f.kind === kind && (f.at ?? 0) === beat);
  const fresh: WaveFault =
    kind === "handover"
      ? { kind, at: beat, beats: DEFAULT_CONFIG.handoverHoldBeats }
      : { kind, at: beat };
  const left = had ? faults.filter((f) => f !== had) : [...faults, fresh];
  // Sorted by the row they enter on, so the list reads in the order it happens
  // whatever order it was painted in — `placedFaults`' own rule, applied here
  // as well so the *file* reads that way too.
  left.sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
  wave.faults = left.length > 0 ? left : undefined;
}

/** The faults that **enter** on this beat row — the ones the row owns, and
 * therefore the ones its panel edits. */
export function faultsAt(wave: Wave, beat: number): WaveFault[] {
  return (wave.faults ?? []).filter((f) => (f.at ?? 0) === beat);
}

/** One placement, as the map labels it: its name and the rows it covers. */
export interface FaultSpan {
  /** The fault's name, the way the palette names it. */
  name: string;
  /** The first beat row it holds. */
  from: number;
  /** The last beat row it holds, or null for one with no end written. */
  to: number | null;
}

/** What one beat row of the map has to say about the faults on it. */
export interface FaultMark {
  /** The faults **entering** here — the row owns them, and labels them. */
  enters: FaultSpan[];
  /** Whether any placement is **in force** over this row, entered here or
   * earlier — which is how long a malfunction lasts, drawn. */
  holds: boolean;
  /** Whether a placement's **last** row is this one, so the bracket down the
   * map can be closed rather than left running off the bottom. */
  ends: boolean;
}

/**
 * The last row a placement holds, or null for one that runs to the end of the
 * wave.
 *
 * Walked with `faultCovers` rather than worked out as `at + beats - 1`. The
 * arithmetic is one subtraction and it would still be a second copy of where a
 * window stops, which is exactly the kind of rule `purity.test.ts` keeps a
 * table against — and this is a label an author reads a length off, so the two
 * disagreeing would be a map that lies quietly. A wave is tens of rows long
 * and the walk is over in a few steps.
 */
function lastHeld(fault: PlacedFault): number | null {
  if (fault.beats === TO_THE_END) return null;
  let last = fault.at;
  while (faultCovers(fault, last + 1)) last++;
  return last;
}

/**
 * One mark per beat row of the wave, so the map can draw where a fault starts
 * and how far down it reaches.
 *
 * `faultCovers` rather than the same comparison written again: the fallbacks
 * and the meaning of a `beats` of zero are the simulation's, and a second copy
 * of them is a map that draws a window the game does not play
 * (`sim/fault-placed.ts`, `content/wave-faults.ts`). The whole wave in one
 * pass rather than a call per row, because the settling `placedFaults` does is
 * per wave and asking it sixty-four times a stroke is sixty-three wasted.
 */
export function faultMarks(wave: Wave, beats: number): FaultMark[] {
  const placed = placedFaults(wave.faults);
  const spans: FaultSpan[] = placed.map((f) => ({
    name: faultTitle(f.kind),
    from: f.at,
    to: lastHeld(f),
  }));
  const marks: FaultMark[] = [];
  for (let beat = 0; beat < beats; beat++) {
    marks.push({
      enters: spans.filter((s) => s.from === beat),
      holds: placed.some((f) => faultCovers(f, beat)),
      ends: spans.some((s) => s.to === beat),
    });
  }
  return marks;
}

/** Take one placement off the wave — the panel's own verb, for a hand that
 * would rather press a button than find the pencil again. */
export function liftFault(wave: Wave, fault: WaveFault): void {
  const left = (wave.faults ?? []).filter((f) => f !== fault);
  wave.faults = left.length > 0 ? left : undefined;
}
