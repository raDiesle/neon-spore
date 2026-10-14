import {
  type HydraState,
  hydraHeadOf,
  hydraLitStep,
  hydraMawCol,
  hydraNext,
  type World,
} from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame, markAt } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import {
  hydraCoilKnob,
  hydraEyeMark,
  hydraMarkAsks,
  hydraMarkPlayer,
  hydraMarkTakes,
  hydraNeckKnob,
} from "./hydra-grip.js";
import { hydraCentre, hydraMawAt } from "./hydra-shape.js";
import type { Layout } from "./layout.js";

/**
 * **What THE HYDRA is asking for**, page fifty of the readings, a word for
 * each kind of head. Both screens draw the one hydra and every mark
 * (`hydra-draw.ts`), the open maw shown to the navigator and the fire's
 * colour to the pilot.
 *
 * - **The biting heads: `SWIPE`** on each side's neck knob, to that side's
 *   seat, until a thumb is on it — the knob wears the way.
 * - **The coils: `TURN`** on each side's lever, to that side's seat, until
 *   a thumb is turning it.
 * - **The eyes: `TAP`** on each side's eye while it is open, to that side's
 *   seat — a shut eye says nothing, and that is the whole of the timing.
 * - **The maws: `COLOUR`** at the throat, **to the pilot alone**, who sees
 *   the fire in it: a CALL; and **`FIRE`** at the hull under the open maw,
 *   aimed at it, to the navigator, who sees which maw is open but not its
 *   colour — that is the sentence the pair has to say.
 *
 * Nothing while the body comes in, rears or is beaten. A word on a new head
 * is a new word, by its seed.
 */
export function hydraCues(l: Layout, world: World, s: HydraState): readonly BossCue[] {
  const step = hydraLitStep(s);
  if (step === null) return [];
  const cfg = world.cfg;
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const out: BossCue[] = [];
  if (step.head !== "maw") {
    for (const side of [0, 1] as const) {
      const pair = step.head === "bite" ? 0 : step.head === "coil" ? 2 : 4;
      const mark = (pair + side) as 0 | 1 | 2 | 3 | 4 | 5;
      if (!hydraMarkTakes(s, mark)) continue;
      const seat = hydraMarkPlayer(mark);
      const seed = 2700 + 20 * (pair / 2) + hydraHeadOf(s, side);
      if (step.head === "bite") {
        if (s.down[side]) continue;
        const at = hydraNeckKnob(l, cfg, s, side);
        out.push({ seat, kind: "CARRY", word: "SWIPE", x: at.x, y: at.y, ...frame, seed });
      } else if (step.head === "coil") {
        if (s.turning[side]) continue;
        const at = hydraCoilKnob(l, cfg, s, side);
        out.push({ seat, kind: "TURN", word: "TURN", x: at.x, y: at.y, ...frame, seed });
      } else if (hydraMarkAsks(s, mark)) {
        const at = hydraEyeMark(l, cfg, s, side);
        out.push({ seat, kind: "PRESS", word: "TAP", x: at.x, y: at.y, ...frame, seed });
      }
    }
    return out;
  }
  const next = hydraNext(s);
  if (next < 0) return out;
  const throat = hydraCentre(l, cfg);
  const seed = 2760 + next;
  out.push(markAt(1, "CALL", "COLOUR", throat.x, throat.y + l.tile, l, seed));
  out.push({
    seat: 2,
    kind: "PRESS",
    word: "FIRE",
    x: fieldX(l, hydraMawCol(world, s, next)),
    y: l.hullY,
    ...frame,
    aim: hydraMawAt(l, cfg, step, next),
    seed: seed + 10,
  });
  return out;
}
