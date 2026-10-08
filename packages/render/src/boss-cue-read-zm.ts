import { type GallState, gallCharged, gallLitStep, gallPresser, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import { gallPointCircle } from "./gall-grip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE GALL is asking for** — page thirty-nine of the readings, THE
 * VISE's (`boss-cue-read-zf.ts`) with the hand on it moving. Both screens draw
 * the alien where it sits (`gall-draw.ts`), so nothing a word could stand on
 * is a secret, and `cueSeen` keeps it to the thumb that can act on it.
 *
 * **`TAP` on the alien, to the seat whose half it sits on**, while a leap is
 * lit and its taps are not all in, and **`PULL`** once they are. When it leaps
 * the word goes with it, on the frame it lands, to whichever seat is nearer
 * there, and nothing is said while it is in the air.
 *
 * **`FIRE` at the hull under the alien's column**, to either seat, ringing
 * the alien where it sits. The step's colour is never named — the alien is
 * lit in it, on both screens.
 */
export function gallCues(l: Layout, world: World, s: GallState): readonly BossCue[] {
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const step = gallLitStep(s);
  if (step === null) return [];
  const at = gallPointCircle(l, world.cfg, s.point);
  if (step.ask === "fire") {
    return [
      {
        seat: null,
        kind: "PRESS",
        word: "FIRE",
        x: at.x,
        y: l.hullY,
        ...frame,
        aim: at,
        seed: 162,
      },
    ];
  }
  const seat = gallPresser(s);
  if (gallCharged(s)) {
    return [{ seat, kind: "CARRY", word: "PULL", x: at.x, y: at.y, ...frame, seed: 163 }];
  }
  return [{ seat, kind: "PRESS", word: "TAP", x: at.x, y: at.y, ...frame, seed: 163 }];
}
