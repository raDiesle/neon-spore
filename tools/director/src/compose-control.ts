import { type Wave, type WaveEntry, wavePressure } from "@neon-spore/content";
import { createRng, livingKindForColor } from "@neon-spore/sim";
import { type Block, type Motif, readBlock } from "./compose-block.js";
import { autoClears, paperFaults } from "./compose-check.js";
import { placeStep } from "./compose-place.js";
import type { Step } from "./compose-steps.js";
import { controlWaveId } from "./control-brushes.js";
import {
  type BlisterGesture,
  blisterWaysOf,
  setBlisterBy,
  setBlisterGesture,
  setBlisterWay,
} from "./entry-fields-blister.js";

/**
 * **A wave for one on-screen control** — the owner, 15 October 2026: a
 * Ctrl-click on a CONTROLS brush should land on a wave with *several of
 * those controls of the same type, mixing some bulb and slick in it*.
 *
 * The composer's own block (`compose-block.ts`), THE BLISTER's, with its
 * blister motifs swapped for one gesture's — every blister the wave places
 * wears it, for either seat's hand and every way it can go — and one step in
 * which half the arrivals are slicks and bulbs. Placed, checked on paper and
 * cleared by AUTO exactly as a block's regular waves are (`compose.ts`).
 */

const INTRO = "theBlister";

/** Draws tried for each control. */
const DRAWS = 400;

/** The step: R5's mix, with room for four or five of the control. */
export const CONTROL_STEP: Step = {
  id: "R5",
  name: "Controls",
  cols: [1, 9],
  gaps: [4, 6],
  span: [32, 44],
  arrivals: [8, 11],
  mix: "xb",
  ramp: "rise",
};

/** The name a control's wave is written with; its id is `controlWaveId`. */
export function controlWaveName(gesture: BlisterGesture): string {
  return `BLISTERS TO ${gesture.toUpperCase()}`;
}

/** THE BLISTER's arrivals, each worn with this gesture by either hand and
 * every way the gesture goes. */
function motifsFor(base: readonly Motif[], gesture: BlisterGesture): Motif[] {
  const ways = blisterWaysOf(gesture);
  const out: Motif[] = [];
  for (const motif of base) {
    for (const by of [1, 2] as const) {
      for (const way of ways.length > 0 ? ways : [undefined]) {
        const entries = motif.entries.map((e): WaveEntry => {
          const worn: WaveEntry = { ...e, gesture: undefined, way: undefined };
          setBlisterGesture(worn, gesture);
          setBlisterBy(worn, by);
          if (way) setBlisterWay(worn, way);
          return Object.fromEntries(
            Object.entries(worn).filter(([, v]) => v !== undefined),
          ) as WaveEntry;
        });
        out.push({ ...motif, entries });
      }
    }
  }
  return out;
}

/** The control's wave to stand at `insertAt`, or why none could be found. */
export function composeControlWave(
  waves: readonly Wave[],
  gesture: BlisterGesture,
  insertAt: number,
  seed = 0,
): { wave: Wave; pressure: number; cleared: number } | string {
  const read = readBlock(waves, INTRO);
  if (typeof read === "string") return read;
  const motifs = new Map(read.motifs);
  motifs.set(read.x, motifsFor(read.motifs.get(read.x) ?? [], gesture));
  const block: Block = { ...read, motifs, insertAt, controls: waves[insertAt - 1]?.controls };
  const rng = createRng(seed * 7919 + insertAt);
  const kept: { wave: Wave; pressure: number }[] = [];
  const misses = new Map<string, number>();
  for (let draw = 0; draw < DRAWS; draw++) {
    const wave: Wave = {
      id: controlWaveId(gesture),
      name: controlWaveName(gesture),
      variant: true,
      ...placeStep(block, CONTROL_STEP, rng),
      ...(block.controls ? { controls: block.controls } : {}),
    };
    const blisters = wave.entries.filter((e) => e.kind === "blister").length;
    const wrong = paperFaults(wave, CONTROL_STEP, block);
    if (blisters < 4) wrong.push("fewer than four of the control");
    for (const color of ["red", "cyan"] as const) {
      if (!wave.entries.some((e) => e.kind === undefined && e.color === color)) {
        wrong.push(`no ${livingKindForColor(color)}`);
      }
    }
    for (const f of wrong) misses.set(f, (misses.get(f) ?? 0) + 1);
    if (wrong.length === 0) kept.push({ wave, pressure: wavePressure(wave) ?? 0 });
  }
  // The middle of what was drawn first, outward: neither the flattest wave
  // nor the hardest.
  const sorted = kept.sort((a, b) => a.pressure - b.pressure);
  const mid = Math.floor(sorted.length / 2);
  const order = sorted
    .map((k, i) => ({ k, d: Math.abs(i - mid) }))
    .sort((a, b) => a.d - b.d)
    .map((x) => x.k);
  for (const k of order.slice(0, 30)) {
    const cleared = autoClears(k.wave, block);
    if (cleared !== -1) return { ...k, cleared };
  }
  const worst = [...misses].sort((a, b) => b[1] - a[1])[0]?.[0];
  return kept.length === 0
    ? `no draw passed on paper — most often: ${worst ?? "nothing placed"}`
    : "AUTO cleared none of the draws it was given";
}
