import { type SpoolState, spoolHeld, spoolPaying, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import type { Layout } from "./layout.js";
import { spoolKnobCircle } from "./spool-grip.js";

/**
 * **What THE SPOOL is asking for** — page twenty-seven of the readings, and
 * the shortest: one handle, one seat, one word.
 *
 * **`HOLD` on the pilot's knob while the line runs and nobody is holding
 * it.** The gesture is the knob carried down its rail and kept there, so the
 * kind is `CARRY`, and the verb is the part a pilot gets wrong: letting go is
 * not neutral, and a brake with no hand on it pays the line out fastest of
 * all (`sim/spool-hand.ts`). THE HASP's word on THE HASP's gesture.
 *
 * **Gone the moment he has hold of it**, because what is left is *how deep*,
 * and that is the whole conversation — the zone is on her screen and never
 * on his, and a word on a held knob could only say *deeper* or *shallower*,
 * which is the answer she is there to give (§21). And silent outside a
 * movement: while the spool is taut, easing a rib or slipped, nothing runs
 * and the brake is asked for nothing.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function spoolCues(
  l: Layout,
  world: World,
  s: SpoolState,
  beatPhase: number,
): readonly BossCue[] {
  if (!spoolPaying(s) || spoolHeld(s)) return [];
  const knob = spoolKnobCircle(l, world.cfg, s, world.beat, beatPhase);
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  return [{ seat: 1, kind: "CARRY", word: "HOLD", x: knob.x, y: knob.y, ...frame, seed: 111 }];
}
