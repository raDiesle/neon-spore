import type { ThroatState, World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { cueFrame } from "./boss-cue-frame.js";
import type { Layout } from "./layout.js";
import { throatAimCircle, throatCarrying, throatPumpCircle, throatPumping } from "./throat-grip.js";
import { THROAT_WHY } from "./throat-say.js";

/**
 * **What THE THROAT is asking for**, the eleventh page of the readings: one
 * word on each seat's handle, while that handle is idle.
 *
 * Since the rework of 1 October 2026, the fight is two hands and four colours.
 * The navigator carries the mouth, the pilot pumps it open, and each seat sets
 * two of the colours (`sim/throat-hand.ts`). So there are two gestures to ask
 * for and two seats to ask, and each word stands on its own seat's handle
 * (`throat-grip.ts`). The colour is never said. *Which* colour the body in the
 * circle needs is the sentence the pair has to say out loud, and the field
 * that said it would be playing the fight for them (`docs/decisions.md` #34).
 *
 * **Silent once the thumb is on it.** A word over a handle that is already
 * being worked teaches the pair to stop reading the words. **Silent while the
 * tube everts**: both handles are gone, and the simulation hears neither
 * (`throatHeard`).
 */

function markAt(seat: 1 | 2, word: string, x: number, y: number, l: Layout, seed: number): BossCue {
  return { seat, kind: "CARRY", word, x, y, ...cueFrame(l), seed, why: THROAT_WHY[word] };
}

export function throatCues(
  l: Layout,
  world: World,
  b: ThroatState,
  _beatPhase: number,
): readonly BossCue[] {
  if (b.phase !== "sucks") return [];
  const cues: BossCue[] = [];
  if (!throatCarrying(b)) {
    const at = throatAimCircle(l, world.cfg, b);
    cues.push(markAt(2, "PULL", at.x, at.y, l, 51));
  }
  if (!throatPumping(b)) {
    const at = throatPumpCircle(l, world.cfg);
    cues.push(markAt(1, "PUMP", at.x, at.y, l, 52));
  }
  return cues;
}
