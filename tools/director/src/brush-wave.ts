import { type MechanicId, mechanicsInWave, WAVES, type Wave } from "@neon-spore/content";
import { BRUSH_KIND, type Brush } from "./brushes.js";

/**
 * Which wave a brush is first seen in, and how to get there.
 *
 * One derivation answering two questions: the hover card names the wave
 * (`brush-tooltip.ts`), and a Ctrl-click on the brush opens it (`palette.ts`,
 * `main.ts`). A second table for the jump would be a second place the answer
 * is decided, and the two would drift the first time a wave moved.
 */

/**
 * The mechanic id a brush paints, for every brush that paints one at all —
 * `BRUSH_KIND` (`brushes.ts`) widened to include the three pod kinds it
 * leaves out, since its only consumer there (`categoryOf`) takes a
 * `CreatureKind` and a pod is not one. `ERASE` paints nothing and carries no
 * entry.
 */
export const BRUSH_MECHANIC: Partial<Record<Brush, MechanicId>> = {
  ...BRUSH_KIND,
  mend: "mend",
  purge: "purge",
  ward: "ward",
};

export interface FirstWave {
  /** 1-based, the number the rail draws beside the name. */
  number: number;
  name: string;
}

/**
 * Every mechanic's first wave, built in one pass over `WAVES` and kept.
 * Asking `mechanicsInWave` per brush would walk the campaign once per button
 * and the palette rebuilds on every edit; `WAVES` is a bundled constant, so
 * the answer cannot go stale under the memo.
 */
let firstWaves: Map<MechanicId, FirstWave> | null = null;

function firstWaveByMechanic(): Map<MechanicId, FirstWave> {
  if (firstWaves) return firstWaves;
  const map = new Map<MechanicId, FirstWave>();
  for (const [i, wave] of WAVES.entries()) {
    for (const id of mechanicsInWave(wave)) {
      if (!map.has(id)) map.set(id, { number: i + 1, name: wave.name });
    }
  }
  firstWaves = map;
  return map;
}

/**
 * The wave that first puts what this brush paints on the field, off the exact
 * derivation `packages/content/test/waves.test.ts` asserts against — `WAVES`
 * in order, `mechanicsInWave` asked of each — rather than a second table that
 * could drift from it. `undefined` means either the brush paints nothing
 * (`ERASE`) or no wave carries it yet, both of which are real answers.
 */
export function firstWaveFor(brush: Brush): FirstWave | undefined {
  const id = BRUSH_MECHANIC[brush];
  return id ? firstWaveByMechanic().get(id) : undefined;
}

/**
 * Where a Ctrl-click on a brush lands, as an index into the waves the
 * director is actually editing — found by name, the same two steps DEMOS
 * takes (`demo-panel.ts`): the campaign says which wave, the store says where
 * it sits. `undefined` when this copy has no wave of that name, which is what
 * an author who renamed or deleted it should see rather than a jump to
 * whatever is at that number now.
 */
export function jumpWaveIndex(waves: readonly Wave[], brush: Brush): number | undefined {
  const first = firstWaveFor(brush);
  if (!first) return undefined;
  const index = waves.findIndex((w) => w.name === first.name);
  return index === -1 ? undefined : index;
}
