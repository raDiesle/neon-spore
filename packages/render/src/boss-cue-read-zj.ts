import {
  type GrindstoneState,
  grinding,
  grindstoneJawHeld,
  grindstoneLitStep,
  midCol,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import { fieldX } from "./field-flip.js";
import { grindstoneAxleStanding, grindstoneStanding } from "./grindstone-grip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE GRINDSTONE is asking for** — page thirty-six of the readings,
 * THE TRIVET's page (`boss-cue-read-zh.ts`) with a rub in front of it. Both
 * seats are shown the whole wheel (`grindstone-draw.ts`), the lit flat
 * included, so nothing a word could stand on is a secret, and `cueSeen` only
 * keeps each word to the thumb that can act on it.
 *
 * **`RUB` on the lit flat**, to its seat — the left flat is Player 1's and
 * the right Player 2's (`grindstone-grip.ts`) — its red line the flat's whole
 * face (`rubHalf`). It is a `CARRY`, a thumb taken
 * back and forth across the glass, and the verb is already the motion, so no
 * kind line is written over it (`saysKind`). It stays up for the whole pass:
 * the grit thinning under the thumb is what says it is working, and a word
 * taken off mid-pass would read as *done* while the flat still regrows.
 *
 * **`HOLD` on each jaw a lit clamp asks for**, to its seat, where the ghost
 * thumb stands — gone the moment both its pads are down, and owed again to a
 * jaw let go before the count is up, THE TRIVET's foot. The word never says
 * how many fingers: the caliper's two pads do, on both screens.
 *
 * **`FIRE` at the hull under the middle column while the axle is lit**, to
 * either seat: a fire step with the caliper locked, which is the only shot
 * `grindstone-shot.ts` hears. The axle wants its own colour and the word never
 * names one — THE VISE's kernel, again.
 *
 * **`FIRE` rings the axle** (`grindstoneAxleStanding`), where the shot must
 * land once the caliper is locked.
 */

export function grindstoneCues(
  l: Layout,
  world: World,
  s: GrindstoneState,
  beatPhase: number,
): readonly BossCue[] {
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const step = grindstoneLitStep(s);
  if (step === null) return [];
  const at = (target: Parameters<typeof grindstoneStanding>[3]) =>
    grindstoneStanding(l, world.cfg, s, target, world.beat, beatPhase);
  const side = grinding(s);
  if (side !== null) {
    const flat = at(side === 0 ? "grindFlatLeft" : "grindFlatRight");
    const seat = side === 0 ? 1 : 2;
    const seed = side === 0 ? 152 : 153;
    const { x, y, r: rubHalf } = flat;
    return [{ seat, kind: "CARRY", word: "RUB", x, y, ...frame, rubHalf, seed }];
  }
  if (step.ask === "clamp") {
    const out: BossCue[] = [];
    for (const seat of [1, 2] as const) {
      const jawSide = seat === 1 ? 0 : 1;
      if (grindstoneJawHeld(s, jawSide)) continue;
      const jaw = at(seat === 1 ? "grindJawLeft" : "grindJawRight");
      const seed = seat === 1 ? 154 : 155;
      out.push({
        seat,
        kind: "HOLD",
        word: "HOLD",
        x: jaw.x,
        y: jaw.y,
        ...frame,
        seed,
        chord: true,
      });
    }
    return out;
  }
  if (step.ask !== "fire" || !s.locked) return [];
  const x = fieldX(l, midCol(world.cfg));
  const aim = grindstoneAxleStanding(l, world.cfg, s, world.beat, beatPhase);
  return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 156 }];
}
