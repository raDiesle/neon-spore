import { entriesPressure, type Wave, waveCols, wavePressure } from "@neon-spore/content";
import { waveGroups } from "./rail-groups.js";

/**
 * **A GROUP'S HEAD IS NO HARDER THAN ITS GENTLEST CHILD.**
 *
 * The owner, 17 October 2026: *why "first step" has higher difficulty than
 * child waves? fix that — also similar cases (where parent is more difficult
 * than children)*. FIRST STEP stood at 4.6 over a child at 2.4, and 37 heads
 * like it — each the wave that teaches a thing, written by hand with a climax
 * at its end, where `docs/spec/wave-curriculum.md` §4 asks the intro to come
 * at low pressure: the middle column, eight beats apart.
 *
 * So a head is softened the two ways that step names and no other: its
 * arrivals are pulled toward the middle column (`pull`, 1 leaving them where
 * they are and 0 putting all of them in it), and the beats between them are
 * opened to at least `gap`, everything after a widened gap moving later with
 * it — its pods and its faults too, so a fault still holds over the arrivals
 * it held. Same bodies, same colours, same order, same guide. Of every pull
 * and gap that bring it to its target and that `accept` passes, the one that
 * moves it least — `waves:soften` passes only what AUTO still clears clean,
 * since THE CHOKE spread to 76 beats under its steer fault was not.
 *
 * A head that cannot get there that way is left as it was and named:
 * CATCH AND AIM, whose red and cyan in turn cost a switch each however they
 * are placed, over a child with one colour.
 */

/** The pulls tried, from none to all the way. */
const PULLS = [1, 0.75, 0.5, 0.25, 0];
/** The widest gap opened: the intro step's own (§6's table, step I). */
const GAP_MOST = 8;
/** What a beat added to the wave weighs against a column moved, in choosing
 * the least change. */
const BEATS_PER_COLUMN = 4;

/** The wave with its arrivals pulled toward the middle and spread out. */
export function softened(wave: Wave, pull: number, gap: number): Wave {
  const middle = (waveCols(wave) - 1) / 2;
  const col = (c: number): number => Math.round(middle + (c - middle) * pull);
  const beats = [...new Set(wave.entries.map((e) => e.beat))].sort((a, b) => a - b);
  const moved = new Map<number, number>();
  let last = Number.NEGATIVE_INFINITY;
  let shift = 0;
  for (const b of beats) {
    const at = Math.max(b + shift, last + gap);
    shift = at - b;
    moved.set(b, at);
    last = at;
  }
  // How far a beat between arrivals moves: as far as the arrival before it.
  const later = (beat: number): number => {
    let by = 0;
    for (const b of beats) if (b <= beat) by = (moved.get(b) ?? b) - b;
    return by;
  };
  const out: Wave = {
    ...wave,
    entries: wave.entries.map((e) => ({
      ...e,
      beat: moved.get(e.beat) ?? e.beat,
      col: col(e.col),
    })),
  };
  if (wave.pods) {
    out.pods = wave.pods.map((p) => ({ ...p, beat: p.beat + later(p.beat), col: col(p.col) }));
  }
  if (wave.faults) {
    out.faults = wave.faults.map((f) => {
      if (f.at === undefined) return { ...f };
      const at = f.at + later(f.at);
      if (f.beats === undefined) return { ...f, at };
      const end = f.at + f.beats;
      return { ...f, at, beats: end + later(end) - at };
    });
  }
  return out;
}

/** How much a softening moved the wave: its columns, and its length in beats. */
function moved(from: Wave, to: Wave): number {
  let cols = 0;
  for (const [i, e] of from.entries.entries())
    cols += Math.abs((to.entries[i]?.col ?? e.col) - e.col);
  const span = (w: Wave) => Math.max(0, ...w.entries.map((e) => e.beat));
  return cols + (span(to) - span(from)) / BEATS_PER_COLUMN;
}

/** The softening that brings the wave to `target`, passes `accept` and moves
 * it least, or undefined when none does. */
export function soften(
  wave: Wave,
  target: number,
  accept: (wave: Wave) => boolean = () => true,
): Wave | undefined {
  const cols = waveCols(wave);
  const faults = wave.faults?.length ?? 0;
  let best: { wave: Wave; cost: number } | undefined;
  for (const pull of PULLS) {
    for (let gap = 1; gap <= GAP_MOST; gap++) {
      const next = softened(wave, pull, gap);
      if (entriesPressure(next.entries, cols, faults) > target) continue;
      const cost = moved(wave, next);
      if (!best || cost < best.cost) {
        if (!accept(next)) continue;
        best = { wave: next, cost };
      }
      break;
    }
  }
  return best?.wave;
}

/** The pressure of the gentlest wave folded under the head at `i`, if any. */
export function gentlestChild(waves: readonly Wave[], i: number): number | undefined {
  const { size } = waveGroups(waves);
  let least: number | undefined;
  for (let k = i + 1; k <= i + (size[i] ?? 0); k++) {
    const child = waves[k];
    const p = child && child.entries.length > 0 ? wavePressure(child) : undefined;
    if (p !== undefined && (least === undefined || p < least)) least = p;
  }
  return least;
}

/** Every head harder than its gentlest child: its index, its pressure and the
 * child's. */
export function hardHeads(waves: readonly Wave[]): { i: number; head: number; child: number }[] {
  const { head } = waveGroups(waves);
  return waves.flatMap((wave, i) => {
    if (head[i] !== -1) return [];
    const p = wavePressure(wave);
    const child = gentlestChild(waves, i);
    return p !== undefined && child !== undefined && p > child ? [{ i, head: p, child }] : [];
  });
}

/** The list with every hard head softened, and the ones that could not be.
 * `accept` is told the softened wave and where it stands. */
export function softenHeads(
  waves: readonly Wave[],
  accept: (wave: Wave, i: number) => boolean = () => true,
): { waves: Wave[]; stuck: number[] } {
  const out = [...waves];
  const stuck: number[] = [];
  for (const { i, child } of hardHeads(waves)) {
    const next = soften(waves[i] as Wave, child, (w) => accept(w, i));
    if (next) out[i] = next;
    else stuck.push(i);
  }
  return { waves: out, stuck };
}
