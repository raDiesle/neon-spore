import { regularWaves, type Wave, waveIntroductions } from "@neon-spore/content";

/**
 * **What each wave of a list brings, read once per list** — for the
 * composers and boss placement, which ask it of every index.
 *
 * `waveIntroduces` and `isRegularWave` read the list from its start for the
 * one index they are asked about, and every block start (`compose-starts.ts`)
 * asks both, so a loop over the starts was quadratic in the waves:
 * `bossOrder` took 1.6 s and `nextReview` 2.8 s over 578 waves at a load of
 * sixty (`docs/queue.md`, 16 October 2026). Here the list is read in one
 * pass (`waveIntroductions`) and each index answered from it.
 *
 * Kept by the list itself, which the composers never change in place — each
 * step makes a new array (`waves-order.ts`) — and read again if its length
 * moved. The director's page asks content directly, since it edits waves
 * where they stand.
 */

interface Reading {
  length: number;
  introduces: string[][];
  regular: boolean[];
}

const READ = new WeakMap<readonly Wave[], Reading>();

function readingOf(waves: readonly Wave[]): Reading {
  const had = READ.get(waves);
  if (had && had.length === waves.length) return had;
  const introduces = waveIntroductions(waves);
  const reading = { length: waves.length, introduces, regular: regularWaves(waves, introduces) };
  READ.set(waves, reading);
  return reading;
}

/** `waveIntroduces`, answered from the list's one reading. */
export function introducesAt(waves: readonly Wave[], index: number): string[] {
  return readingOf(waves).introduces[index] ?? [];
}

/** `isRegularWave`, answered from the list's one reading. */
export function regularAt(waves: readonly Wave[], index: number): boolean {
  return readingOf(waves).regular[index] ?? false;
}
