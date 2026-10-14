import { arrivalJob, type Wave } from "@neon-spore/content";
import { clearBeat } from "../../probe/measure-waves.ts";
import { worldOf } from "../../probe/world.ts";
import type { Block } from "./compose-block.js";
import { isBasic } from "./compose-place.js";
import { gapRule, needsBasics, type Step } from "./compose-steps.js";

/**
 * **Whether a composed wave is one to keep** — the checks of
 * `docs/spec/wave-curriculum.md` §6, step 3. A wave that misses one is drawn
 * again, never shipped. Each check says what it found, so a block the
 * composer cannot fill says why in words.
 */

interface Arrival {
  beat: number;
  job: string;
  pod: boolean;
}

function arrivals(wave: Pick<Wave, "entries" | "pods">): Arrival[] {
  return [
    ...wave.entries.map((e) => ({ beat: e.beat, job: arrivalJob(e), pod: false })),
    ...(wave.pods ?? []).map((p) => ({ beat: p.beat, job: `pod:${p.kind}`, pod: true })),
  ].sort((a, b) => a.beat - b.beat);
}

/** Beats from the first arrival to the last, pods counted. */
export function spanOf(wave: Pick<Wave, "entries" | "pods">): number {
  const beats = arrivals(wave).map((a) => a.beat);
  return beats.length === 0 ? 0 : Math.max(...beats) - Math.min(...beats);
}

const inside = (n: number, [lo, hi]: readonly [number, number]) => n >= lo && n <= hi;

/**
 * What is wrong with a wave on paper, or nothing — every check but two: its
 * pressure, which is judged against the waves beside it (`compose.ts`), and
 * AUTO's, which is the slow one and is asked last (`autoClears`).
 */
export function paperFaults(wave: Wave, step: Step, block: Block): string[] {
  const out: string[] = [];
  const all = arrivals(wave);
  const span = spanOf(wave);
  if (!inside(span, step.span)) out.push(`span ${span}, wants ${step.span.join("–")}`);
  if (!inside(all.length, step.arrivals)) {
    out.push(`${all.length} arrivals, wants ${step.arrivals.join("–")}`);
  }
  // Decision 2. A pod's own bodies are spaced the way its intro's author
  // spaced them, and are not this rule's to move.
  const rule = gapRule(block.number);
  for (let i = 1; i < all.length; i++) {
    const [a, b] = [all[i - 1], all[i]];
    if (!a || !b || a.pod || a.job === b.job || b.beat - a.beat >= rule) continue;
    out.push(`${a.job} then ${b.job} ${b.beat - a.beat} beats apart, wants ${rule}`);
    break;
  }
  // A pod after the last body hangs over a wave that is already over.
  if (all[all.length - 1]?.pod) out.push("ends on a pod");
  if (needsBasics(step) && wave.entries.filter(isBasic).length * 2 < all.length) {
    out.push("fewer than half are slicks and bulbs");
  }
  return out;
}

/** The beat AUTO clears the wave on, played where it will stand in the list,
 * or -1 when AUTO loses it. */
export function autoClears(wave: Wave, block: Block): number {
  return clearBeat(worldOf(wave, block.insertAt));
}
