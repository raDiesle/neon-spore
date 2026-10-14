import { type ThroatState, throatPumpDone, type World } from "@neon-spore/sim";
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
 * **The carry's word is silent once the thumb is on it.** A word over a
 * handle that is already being worked teaches the pair to stop reading the
 * words. **The pump is a rub**, and wears what every rub wears: THE RUB LAB's
 * drop with ZIGZAG on it, `RUB`, its strokes lit by how many turns full the
 * pump is and going out again as it drains — standing still under the
 * pilot's thumb, and there all the while, because the strokes are what he
 * reads (`rub-drop.ts`; the owner, 14 October 2026: *use default "rub"
 * instead for less variants*). **Silent while the tube everts**: both
 * handles are gone, and the simulation hears neither (`throatHeard`).
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
  const at = throatPumpCircle(l, world.cfg);
  const rubs = {
    turns: world.cfg.throatPumpTurns,
    done: throatPumpDone(world.cfg, b),
    held: throatPumping(b),
  };
  cues.push({ ...markAt(1, "RUB", at.x, at.y, l, 52), rubs });
  return cues;
}
