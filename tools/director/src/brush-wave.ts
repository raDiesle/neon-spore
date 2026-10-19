import { type MechanicId, mechanicsInWave, WAVES, type Wave } from "@neon-spore/content";
import type { BlisterGesture } from "@neon-spore/sim";
import { BRUSH_KIND, type Brush, CONTROL_BRUSHES } from "./brushes.js";
import { controlGestureOf, controlWaveId } from "./control-brushes.js";

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
 * `BRUSH_KIND` (`brushes.ts`) widened to include the two pod kinds it
 * leaves out, since its only consumer there (`categoryOf`) takes a
 * `CreatureKind` and a pod is not one. `ERASE` paints nothing and carries no
 * entry.
 */
export const BRUSH_MECHANIC: Partial<Record<Brush, MechanicId>> = {
  ...BRUSH_KIND,
  pod: "pod",
  husk: "husk",
  // The faults, which are mechanics like everything else in the palette —
  // `mechanics-wave.ts` has a row per kind and `FAULT_MECHANIC` is the pairing,
  // so Ctrl-clicking one lands on the wave it first appears in exactly as a
  // creature's brush does.
  //
  // **The last two point at a creature's row**, which is `FAULT_MECHANIC`'s own
  // answer and not a shortcut taken here: the body a leech pencil fires is the
  // body the bestiary already describes, and what the pencil changed is how it
  // arrives. A mechanic row does not describe that.
  "fault:cannon": "cannonFault",
  "fault:shield": "shieldFault",
  "fault:steer": "steerFault",
  "fault:codex": "codexFault",
  "fault:handover": "handoverFault",
  "fault:swap": "handoverFault",
  "fault:flip": "flipFault",
  "fault:dark": "darkFault",
  "fault:leech": "leech",
  "fault:limpet": "limpet",
  // The CONTROLS brushes are all THE BLISTER, which is one mechanic.
  ...Object.fromEntries(CONTROL_BRUSHES.map((brush) => [brush, "blister"])),
};

export interface FirstWave {
  /** 1-based, the number the rail draws beside the name. */
  number: number;
  name: string;
  /** A CONTROLS brush's own wave rather than the first to carry it
   * (`controlWave`). */
  own?: true;
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
  const gesture = controlGestureOf(brush);
  const own = gesture ? controlWave(gesture) : undefined;
  if (own) return own;
  const id = BRUSH_MECHANIC[brush];
  return id ? firstWaveByMechanic().get(id) : undefined;
}

/** Blisters a wave needs, all wearing one gesture, to be that control's own. */
const OWN_WAVE_BLISTERS = 4;

/**
 * **A CONTROLS brush lands on its control's own wave** (the owner, 15 October
 * 2026: a Ctrl-click on TURN went to THE BLISTER, which has no turn in it) —
 * the one `bun run waves:controls` composed for it, by id, or failing that the
 * first with at least four blisters and every one of them wanting that
 * gesture. Every control brush paints the same mechanic, so the first wave to
 * carry it would answer all seven alike.
 */
function controlWave(gesture: BlisterGesture): FirstWave | undefined {
  const id = controlWaveId(gesture);
  const composed = WAVES.findIndex((w) => w.id === id);
  const at = (i: number): FirstWave => ({ number: i + 1, name: WAVES[i]?.name ?? "", own: true });
  if (composed !== -1) return at(composed);
  for (const [i, wave] of WAVES.entries()) {
    const blisters = wave.entries.filter((e) => e.kind === "blister");
    if (blisters.length < OWN_WAVE_BLISTERS) continue;
    if (blisters.every((e) => (e.gesture ?? "tap") === gesture)) return at(i);
  }
  return undefined;
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
