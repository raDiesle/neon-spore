import { firstOnPanel } from "./control-sets.js";
import { mechanic, mechanicsInWave } from "./mechanics.js";
import { waveTeaches } from "./wave-hints.js";
import type { Wave } from "./wave-types.js";

/**
 * **Which waves are regular**: the ones that bring nothing new.
 *
 * The owner, 14 October 2026: *a filter in the waves list for regular waves,
 * which do not introduce anything special, and do not require a tutorial at
 * all.* A regular wave is the one `docs/spec/wave-curriculum.md` asks for
 * eight of after every new thing — a recombination of what the pair already
 * knows, a small step harder than the one before it.
 *
 * Regular means all three of: no boss, no guide, and nothing in it the pair
 * has not met on an earlier wave — no creature, pod, fault or other mechanic
 * seen for the first time, and not the first wave on its panel. Those last two
 * are the same two questions `test/waves.test.ts` asks to decide which waves
 * must carry a guide, so a wave this calls regular is one that test would not
 * ask a guide of. A fault or a panel met before does not stop a wave being
 * regular: it is a known lever, used again.
 *
 * Takes its list as an argument, as `firstOnPanel` does: the director asks it
 * of a list that is not on disk yet.
 */

/** What each wave of `waves` is the first in it to carry: the mechanics met
 * for the first time, by id, and `panel` when it is the first wave on its
 * panel. Empty for a wave that brings nothing new. One pass over the list —
 * a caller asking of every index uses this, not `waveIntroduces` in a loop,
 * which reads the list from the start each time (`docs/queue.md`, 16
 * October 2026: `bossOrder` took two seconds over 578 waves that way). */
export function waveIntroductions(waves: readonly Wave[]): string[][] {
  const before = new Set<string>();
  return waves.map((wave, index) => {
    const found = mechanicsInWave(wave);
    const out: string[] = [];
    for (const id of found) {
      // A `run` mechanic is on for the whole game or none of it, so no wave
      // introduces one (the same exception the guide test makes).
      if (mechanic(id).reach === "run" || before.has(id)) continue;
      out.push(id);
    }
    for (const id of found) before.add(id);
    if (firstOnPanel(waves, index)) out.push("panel");
    return out;
  });
}

/** What the wave at `index` is the first in `waves` to carry
 * (`waveIntroductions`). */
export function waveIntroduces(waves: readonly Wave[], index: number): string[] {
  if (!waves[index]) return [];
  return waveIntroductions(waves.slice(0, index + 1))[index] ?? [];
}

/** Whether a wave that brings `fresh` is regular: no boss, no guide, nothing new. */
function regular(wave: Wave | undefined, fresh: () => readonly string[]): boolean {
  if (!wave || wave.boss || waveTeaches(wave)) return false;
  return fresh().length === 0;
}

/** Whether the wave at `index` is regular: no boss, no guide, nothing new. */
export function isRegularWave(waves: readonly Wave[], index: number): boolean {
  return regular(waves[index], () => waveIntroduces(waves, index));
}

/** `isRegularWave` of every index, in one pass (`waveIntroductions`). */
export function regularWaves(
  waves: readonly Wave[],
  introductions = waveIntroductions(waves),
): boolean[] {
  return waves.map((wave, i) => regular(wave, () => introductions[i] ?? []));
}
