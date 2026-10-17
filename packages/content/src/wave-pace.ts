import { WAVE_COLS, waveCols } from "./queue.js";
import type { Wave, WaveEntry } from "./wave-types.js";

/**
 * **Pace: how fast the cannon has to cross the field between two actions.**
 *
 * The owner, 17 October 2026: *one of the hardest situations is action —
 * move fast a long distance — action again, because the next enemy is too
 * close behind the one before.* A wave may ask for that, but **rarely**, as
 * its one hard moment, and the pace slows after it; when in doubt, the next
 * enemy waits longer. Pressure (`wave-pressure.ts`) already charges for
 * travel; it does not stop a wave doing it ten times in a row. This does.
 *
 * Two arrivals `d` columns apart need `paceBeats(d)` beats between them: the
 * slide, two columns a beat, and the two beats it takes to see the next one,
 * say it and act. Closer than that in time, three columns or more apart, is a
 * **fast slide**. Arrivals on
 * the same beat (a twin across the field) are one moment, measured from
 * whichever of them is nearest the next.
 */

/** Columns a cannon is slid across in one beat, with time to aim. */
export const PACE_COLS_PER_BEAT = 2;

/** Beats to see the next arrival, say it and act, on top of the slide. */
export const PACE_READY_BEATS = 2;

/** The fewest columns that are a slide at all: closer than three, the cannon
 * is already there, and how quickly it may fire again is the gap rule's. */
export const PACE_FAR_COLS = 3;

/** The least gap after a fast slide: the pace slows, two exchanges' worth. */
export const PACE_REST_BEATS = 8;

/** The beats two actions `cols` columns apart need between them. */
export function paceBeats(cols: number): number {
  return PACE_READY_BEATS + Math.ceil(cols / PACE_COLS_PER_BEAT);
}

/** One fast slide: from the arrival at `beat` to the one `gap` beats on,
 * `cols` columns away, and the gap after that (`undefined` at the end). */
export interface FastSlide {
  beat: number;
  gap: number;
  cols: number;
  rest?: number;
}

/**
 * Every fast slide among `entries` authored on `cols` columns, measured on
 * the eleven-tile field as pressure measures travel.
 */
export function fastSlides(
  entries: readonly Pick<WaveEntry, "beat" | "col">[],
  cols: number = WAVE_COLS,
): FastSlide[] {
  const scale = (WAVE_COLS - 1) / Math.max(1, cols - 1);
  const byBeat = new Map<number, number[]>();
  for (const e of entries) byBeat.set(e.beat, [...(byBeat.get(e.beat) ?? []), e.col * scale]);
  const beats = [...byBeat.keys()].sort((a, b) => a - b);
  const out: FastSlide[] = [];
  for (let i = 1; i < beats.length; i++) {
    const [from, to] = [beats[i - 1] as number, beats[i] as number];
    const near = Math.min(
      ...(byBeat.get(from) ?? []).flatMap((a) =>
        (byBeat.get(to) ?? []).map((b) => Math.abs(a - b)),
      ),
    );
    const d = Math.round(near);
    if (d < PACE_FAR_COLS || to - from >= paceBeats(d)) continue;
    const after = beats[i + 1];
    out.push({
      beat: from,
      gap: to - from,
      cols: d,
      ...(after === undefined ? {} : { rest: after - to }),
    });
  }
  return out;
}

/** A wave's fast slides, or none for a boss wave. */
export function waveFastSlides(wave: Wave): FastSlide[] {
  return wave.boss ? [] : fastSlides(wave.entries, waveCols(wave));
}
