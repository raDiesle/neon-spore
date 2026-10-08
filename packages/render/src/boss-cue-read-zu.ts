import { type LatchState, latchLitStep, latchRearing, type World } from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { latchGripPlayer } from "./latch-grip.js";
import { latchKnobAt } from "./latch-shape.js";
import type { Layout } from "./layout.js";

/**
 * **What THE LATCH is asking for**, page forty-seven of the readings. Both
 * screens draw the one colony and both grips (`latch-draw.ts`), so nothing a
 * word could stand on is a secret, and `cueSeen` keeps each word to the seat
 * whose grip it stands on.
 *
 * **`PULL` on the grip whose turn it is**, to its seat, until the thumb has
 * started to carry it down — a word over a knob already moving would be the
 * pull made for them. **`HOLD` on the other grip**, to its seat, while no
 * thumb is on it: the rope is let go of by both if it is not. **While the
 * colony rears for a yank both grips say `HOLD`** to a seat not yet on its
 * own — a pull begun then is a hand off on the yank.
 *
 * Nothing is said while the colony drops in, rests between levels or is
 * torn loose.
 */
export function latchCues(l: Layout, world: World, s: LatchState): readonly BossCue[] {
  if (latchLitStep(s) === null) return [];
  const cfg = world.cfg;
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const rearing = latchRearing(world, s);
  const out: BossCue[] = [];
  for (const grip of [0, 1] as const) {
    const seat = latchGripPlayer(s, grip);
    const at = latchKnobAt(l, cfg, s, grip);
    const pulls = grip === s.turn && !rearing;
    if (pulls && s.depthMilli[grip] === 0) {
      const seed = 240 + grip;
      out.push({ seat, kind: "CARRY", word: "PULL", x: at.x, y: at.y, ...frame, seed });
    } else if (!pulls && !s.down[grip]) {
      const seed = 242 + grip;
      out.push({ seat, kind: "HOLD", word: "HOLD", x: at.x, y: at.y, ...frame, seed });
    }
  }
  return out;
}
