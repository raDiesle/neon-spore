import {
  midCol,
  type TrivetState,
  trivetChordHeld,
  trivetLitStep,
  trivetStepCol,
  trivetTipSide,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { trivetFootStanding } from "./trivet-grip.js";

/**
 * **What THE TRIVET is asking for** — page thirty-four of the readings, THE
 * VISE's page (`boss-cue-read-zf.ts`) spent on a chord instead of a pinch.
 * Both seats are shown the whole stand (`trivet-draw.ts`), the lit sockets
 * included, so nothing a word could stand on is a secret, and `cueSeen` only
 * keeps each word to the fingers that can act on it.
 *
 * **`HOLD` on each foot a lit chord asks for** — the front one's is Player
 * 1's and the rear one's Player 2's (`trivet-grip.ts`), one of them on a
 * single foot and both on a `both` step. It stands on the foot as its leg
 * has it swung, where the ghost thumb does, and goes the moment every lit pad
 * is down: a word over a chord already held could only say *keep going*,
 * which the foot swinging home under it already says. A chord let go before
 * its count is up is owed the word again. The word never says how many
 * fingers: the lit sockets do, on both screens.
 *
 * **`FIRE` at the hull under the middle column while the hub is lit**, to
 * either seat. The hub wants its own colour and the word never names one —
 * THE VISE's kernel, again. **On a lurch** it stands under the column the hub
 * swung over instead, and the leaning foot's seat is shown `HOLD` on it until
 * its chord is down, the way a plant is.
 *
 * **`SHIELD` at the hull under a needle's column**, to either seat: the
 * navigator slides it there, and the pilot is the one who can see which
 * column to say, both screens drawing the same needle.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function trivetCues(
  l: Layout,
  world: World,
  s: TrivetState,
  beatPhase: number,
): readonly BossCue[] {
  const out: BossCue[] = [];
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  const step = trivetLitStep(s);
  if (step === null) return out;
  const col = trivetStepCol(midCol(world.cfg), step);
  if (step.ask === "needle") {
    const x = fieldX(l, col);
    out.push({ seat: null, kind: "PRESS", word: "SHIELD", x, y: l.hullY, ...frame, seed: 144 });
  }
  for (const seat of [1, 2] as const) {
    const side = seat === 1 ? 0 : 1;
    const asked =
      step.ask === "both" ||
      step.ask === (seat === 1 ? "front" : "rear") ||
      (step.ask === "tip" && trivetTipSide(step) === side);
    if (!asked || trivetChordHeld(s, side, step.pads)) continue;
    const foot = trivetFootStanding(l, world, s, seat, beatPhase);
    const seed = seat === 1 ? 142 : 143;
    out.push({ seat, kind: "HOLD", word: "HOLD", x: foot.x, y: foot.y, ...frame, seed });
  }
  // After the holds: on a lurch the shot is not heard until the leaning foot is held.
  if ((step.ask === "fire" || step.ask === "tip") && s.hubLit) {
    const x = fieldX(l, col);
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 141 });
  }
  return out;
}
