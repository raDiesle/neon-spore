import {
  type FlueState,
  flueLitStep,
  flueResters,
  flueSteady,
  flueTapper,
  midCol,
  type World,
} from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import { FLUE_DAMPER, flueCentre, flueCoreR, flueEmberAt, flueUnitAt } from "./flue-shape.js";
import type { Layout } from "./layout.js";

/**
 * **What THE FLUE is asking for**: page forty-one of the readings. Both
 * screens draw the whole flue, the ember, the studs and the damper
 * (`flue-draw.ts`), so nothing a word could stand on is a secret, and
 * `cueSeen` keeps each word to the seat it is for.
 *
 * **`STILL` at the flue's middle, to the seats the lit step asks to keep
 * still**: the vent's rester, both seats on a damper. THE STARE's word, and
 * for its reason: the fight counts beats with nothing sent, so a word saying
 * *hold* would put a thumb on the glass. It stands on the middle rather than
 * on the ember, which glides, so the word holds still while the hand does.
 * THE HALTER's rester is told nothing; this one is told, because here a
 * rester's single press costs the taps already landed, and a word is cheaper
 * than learning that.
 *
 * **`TAP` on the steady ember, to the vent's tapper**, and only once it has
 * stopped: a word over a gliding ember would say *now* when the answer is
 * *wait*. It jumps with the ember to each notch, a new mark each time. The count is not said —
 * the studs over the slot are counting.
 *
 * **`FIRE` at the hull under the middle column on a fire step, once the core
 * is bared**, to either seat. The step's colour is never named. Nothing is
 * said between steps. **It rings the core** in the damper's unit, where
 * `flue-draw.ts` bares it (`flueUnitAt`).
 */

export function flueCues(l: Layout, world: World, s: FlueState): readonly BossCue[] {
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const step = flueLitStep(s);
  if (step === null) return [];
  if (step.ask === "fire") {
    if (!s.bared) return [];
    const x = fieldX(l, midCol(world.cfg));
    const aim = { ...flueUnitAt(l, world.cfg, FLUE_DAMPER), r: flueCoreR(l) };
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 167 }];
  }
  const mid = flueCentre(l, world.cfg);
  const resters = flueResters(s);
  const seat = resters.length === 1 ? (resters[0] ?? null) : null;
  const said: BossCue[] = [
    { seat, kind: "STILL", word: "STILL", x: mid.x, y: mid.y, ...frame, seed: 168 },
  ];
  const tapper = flueTapper(s);
  if (tapper !== null && flueSteady(world, s)) {
    const at = flueEmberAt(l, world.cfg, s.emberMilli);
    // A seed a tap, so the word jumping to the next notch is a new mark and
    // not a moved one (`boss-hush.test.ts`).
    const seed = 169 + s.taps;
    said.push({ seat: tapper, kind: "PRESS", word: "TAP", x: at.x, y: at.y, ...frame, seed });
  }
  return said;
}
