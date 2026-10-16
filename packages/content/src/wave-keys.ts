import { controlSet, setLance } from "./control-sets.js";
import { mechanic, mechanicsInWave } from "./mechanics.js";
import type { Wave } from "./wave-types.js";

/**
 * **Nothing is used before it is taught**, in the order of the wave list.
 *
 * The owner, 16 October 2026: *disallow to use something what was not
 * introduced before in a wave in order of wave list.* A wave *uses* its keys
 * (`waveKeys`): every mechanic it carries — bodies, pods, faults, and what a
 * boss brings along — its panel, every button on that panel, and the hold.
 * The first wave in the list to carry a key is the one that introduces it,
 * and only two kinds of wave may:
 * - **a wave with a guide** that is not a boss, which says what it brings
 *   (`docs/spec/briefings.md`);
 * - **a boss, for what is its own** and nothing else, guide or not — a key no
 *   wave but a boss ever carries, which the fight teaches by being fought. A
 *   boss's guide is about the boss: one first to carry a slick, or a panel an
 *   ordinary wave plays, has jumped ahead of the wave that teaches it.
 *
 * `untaughtKeys` names every key the list uses before that; empty is the
 * rule held. `test/wave-keys.test.ts` holds the list on disk to it, and every
 * write the director makes refuses a list it does not hold for
 * (`tools/director/src/waves-acts.ts`), so no generator can save one.
 */

/** What a wave needs taught, by key: mechanics, the panel, its buttons, the hold. */
export function waveKeys(wave: Wave): string[] {
  const keys: string[] = [...mechanicsInWave(wave)].filter((id) => mechanic(id).reach !== "run");
  const set = controlSet(wave.controls);
  keys.push(`panel ${set.id}`, ...set.controls.map((c) => `button ${c}`));
  if (setLance(set)) keys.push("the hold");
  return keys;
}

export interface Untaught {
  /** The wave's index in the list. */
  index: number;
  name: string;
  /** The keys it is the first to carry and may not introduce. */
  keys: string[];
}

/** Every wave that is first to carry a key it may not introduce, in list order. */
export function untaughtKeys(waves: readonly Wave[]): Untaught[] {
  const ordinary = new Set<string>();
  for (const w of waves) if (!w.boss) for (const k of waveKeys(w)) ordinary.add(k);
  const seen = new Set<string>();
  const out: Untaught[] = [];
  waves.forEach((wave, index) => {
    const keys: string[] = [];
    for (const k of new Set(waveKeys(wave))) {
      if (seen.has(k)) continue;
      seen.add(k);
      if (wave.boss ? !ordinary.has(k) : wave.guide) continue;
      keys.push(k);
    }
    if (keys.length > 0) out.push({ index, name: wave.name, keys });
  });
  return out;
}

/** The violations in words, one line a wave, or `null` when there are none. */
export function untaughtComplaint(waves: readonly Wave[]): string | null {
  const found = untaughtKeys(waves);
  if (found.length === 0) return null;
  return [
    "refused: a wave uses what no wave before it taught",
    ...found.map((u) => `  wave ${u.index + 1} · ${u.name}: ${u.keys.join(", ")}`),
  ].join("\n");
}
