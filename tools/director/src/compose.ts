import { isRegularWave, type Wave, wavePressure } from "@neon-spore/content";
import { createRng } from "@neon-spore/sim";
import { type Block, leadingBlock } from "./compose-block.js";
import { autoClears, paperFaults } from "./compose-check.js";
import { grownStep, notchOf } from "./compose-grow.js";
import { placeStep } from "./compose-place.js";
import { chooseRamp } from "./compose-ramp.js";
import { GENTLEST_QUANTILE, START_RISE, type Step, stepsToCompose } from "./compose-steps.js";

/**
 * **A block's regular waves, composed** — `docs/spec/wave-curriculum.md` §6.
 *
 * Each step is drawn from the seeded `Rng` a few hundred times and the draws
 * that pass on paper are kept (`compose-check.ts`). Then the block's pressures
 * are chosen together (`compose-ramp.ts`) — low for R1, a small rise each
 * step after, a dip for R5 — and each step keeps a draw at its pressure that
 * AUTO clears.
 * The seed is the block's intro and the step, so the same block composes the
 * same way every time, and a re-roll is a new `seed`.
 */

/** Draws tried for each step. */
const DRAWS = 400;

export interface Composed {
  step: Step;
  wave?: Wave;
  pressure?: number;
  /** The beat AUTO cleared it on. */
  cleared?: number;
  /** Why no draw was kept, when none was. */
  faults: string[];
}

/** A number from a string, for a seed nobody has to choose. */
function hashOf(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** Where the gentlest step aims: low among its own draws, but not the
 * flattest — a wave of nothing but even eight-beat gaps. */
function gentlest(pressures: readonly number[]): number {
  const sorted = [...pressures].sort((a, b) => a - b);
  return sorted[Math.floor(GENTLEST_QUANTILE * (sorted.length - 1))] ?? 0;
}

/** Every draw of a step that passes on paper, with its pressure. */
function drawsOf(block: Block, step: Step, introId: string, seed: number) {
  const rng = createRng(hashOf(`${introId}:${step.id}:${seed}`));
  const kept: { wave: Wave; pressure: number }[] = [];
  const misses = new Map<string, number>();
  for (let draw = 0; draw < DRAWS; draw++) {
    const wave: Wave = {
      id: `${introId}${step.name}`,
      name: `${introId.toUpperCase()} ${step.name.toUpperCase()}`,
      variant: true,
      ...placeStep(block, step, rng),
      ...(block.controls ? { controls: block.controls } : {}),
    };
    const faults = paperFaults(wave, step, block);
    for (const f of faults) misses.set(f, (misses.get(f) ?? 0) + 1);
    if (faults.length === 0) kept.push({ wave, pressure: wavePressure(wave) ?? 0 });
  }
  const worst = [...misses].sort((a, b) => b[1] - a[1])[0]?.[0];
  return { kept, worst };
}

/** The pressure of the block's first regular wave already written, which the
 * composed ones lead up to. */
function nextWritten(waves: readonly Wave[], block: Block): number | undefined {
  const next = waves[block.insertAt];
  return next && isRegularWave(waves, block.insertAt) ? wavePressure(next) : undefined;
}

/** A block's regular waves, composed: see `composeBlockAt`. */
export function composeBlock(
  waves: readonly Wave[],
  block: Block,
  introId: string,
  seed = 0,
): Composed[] {
  return composeBlockAt(waves, block, introId, seed).composed;
}

/** Seeds tried, from the one asked for, before the block's written waves are
 * put first. THE COIL's seven fit under its written wave on the fourth. */
const SEEDS = 4;

/**
 * A block's regular waves, the block they were composed for and the seed
 * they were drawn with. A ramp that does not fit is drawn again on the next
 * seed, a few times; then the same block is tried with its written regular
 * waves leading (`leadingBlock`), whose `insertAt` is where the composed
 * ones go.
 */
export function composeBlockAt(
  waves: readonly Wave[],
  block: Block,
  introId: string,
  seed = 0,
): { block: Block; composed: Composed[]; seed: number } {
  const whole = (c: readonly Composed[]) => c.length > 0 && c.every((x) => x.wave);
  const lead = leadingBlock(waves, block);
  let first: Composed[] | undefined;
  for (const b of lead ? [block, lead] : [block]) {
    for (let k = 0; k < SEEDS; k++) {
      const composed = composeFor(waves, b, introId, seed + k);
      first ??= composed;
      if (whole(composed) || composed.length === 0) return { block: b, composed, seed: seed + k };
    }
  }
  return { block, composed: first ?? [], seed };
}

function composeFor(
  waves: readonly Wave[],
  block: Block,
  introId: string,
  seed: number,
): Composed[] {
  const notch = notchOf(block.sinceTutorial);
  const steps = stepsToCompose(block.tutorial, block.existing, block.leads).map((s) =>
    grownStep(s, notch),
  );
  const draws = steps.map((step) => drawsOf(block, step, introId, seed));
  for (const [i, d] of draws.entries()) {
    if (d.kept.length > 0) continue;
    const why = `no draw passed on paper — most often: ${d.worst ?? "nothing placed"}`;
    return failed(steps, i, why);
  }
  // A pressure whose every draw AUTO loses is struck off, and the ramp is
  // chosen again without it.
  const reach = draws.map((d) => [...new Set(d.kept.map((k) => k.pressure))]);
  // Low among the first step's draws, and a little above the block before's
  // gentlest wave, so each tooth starts higher than the last.
  const low = gentlest(draws[0]?.kept.map((k) => k.pressure) ?? []);
  const start = block.floor === undefined ? low : Math.max(low, block.floor + START_RISE);
  const after = block.leads ? undefined : nextWritten(waves, block);
  for (;;) {
    const chosen = chooseRamp(steps, reach, start, after, block.after);
    if (typeof chosen === "number") {
      return failed(steps, chosen, "no pressure in reach keeps the ramp (decision 6)");
    }
    const out: Composed[] = [];
    for (const [i, step] of steps.entries()) {
      const pressure = chosen[i] ?? 0;
      const fits = draws[i]?.kept.filter((k) => k.pressure === pressure) ?? [];
      const won = fits.slice(0, 10).find((k) => autoClears(k.wave, block) !== -1);
      if (!won) {
        reach[i] = (reach[i] ?? []).filter((v) => v !== pressure);
        break;
      }
      out.push({
        step,
        wave: won.wave,
        pressure,
        cleared: autoClears(won.wave, block),
        faults: [],
      });
    }
    if (out.length === steps.length) return out;
  }
}

function failed(steps: readonly Step[], at: number, why: string): Composed[] {
  const step = steps[at];
  return step ? [{ step, faults: [why] }] : [];
}
