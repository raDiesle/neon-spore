import {
  type ChrysalisState,
  chrysalisLitStep,
  chrysalisNext,
  chrysalisPieceCol,
  chrysalisQuillOf,
  chrysalisRubsOf,
  midCol,
  type World,
} from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame, markAt } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import {
  chrysalisKnobAt,
  chrysalisMarkPlayer,
  chrysalisMarkTakes,
  chrysalisRubAt,
} from "./chrysalis-grip.js";
import { chrysalisCentre, chrysalisPoreAt } from "./chrysalis-shape.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE CHRYSALIS is asking for**, page forty-nine of the readings, a
 * word for each skin's job. Both screens draw the one cocoon and every mark
 * (`chrysalis-draw.ts`), the heart alone shown to the pilot.
 *
 * - **The slime: `RUB`** on each half, to that half's seat, wearing THE RUB
 *   LAB's drop — its strokes lit by the turns the half has had, and its call
 *   stopped while the thumb is on it (`rub-drop.ts`).
 * - **The quills: `PULL`** on each side's knob, to that side's seat, until a
 *   thumb is on it — THE BASTION's slab, word for word.
 * - **The sacs: `SHIELD`** at the hull under the sac swelling, to either
 *   seat — the swelling sac on both screens is the whole of the tell.
 * - **The heart: `COLOUR`** at the pore, **to the pilot alone**, who sees
 *   it: a CALL, the colour his to say; and **`FIRE`** at the hull under the
 *   heart, aimed at it, to the navigator, whose fire button is never told
 *   the colour — that is the sentence the pair has to say.
 *
 * Nothing while the cocoon comes in, sheds or grows a skin back. A word on
 * a new piece is a new word, by its seed.
 */
export function chrysalisCues(l: Layout, world: World, s: ChrysalisState): readonly BossCue[] {
  const step = chrysalisLitStep(s);
  if (step === null) return [];
  const cfg = world.cfg;
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const out: BossCue[] = [];
  if (step.skin === "slime") {
    for (const side of [0, 1] as const) {
      const mark = side === 0 ? 2 : 3;
      if (!chrysalisMarkTakes(s, mark)) continue;
      const at = chrysalisRubAt(l, cfg, side);
      const seat = chrysalisMarkPlayer(mark);
      const rubs = { turns: chrysalisRubsOf(s), done: s.rubbed[side], held: s.rubAt[side] >= 0 };
      const seed = 2600 + 2 * s.cursor + side;
      out.push({ seat, kind: "CARRY", word: "RUB", x: at.x, y: at.y, ...frame, rubs, seed });
    }
    return out;
  }
  if (step.skin === "quills") {
    for (const side of [0, 1] as const) {
      if (!chrysalisMarkTakes(s, side) || s.down[side]) continue;
      const at = chrysalisKnobAt(l, cfg, s, side);
      const seat = chrysalisMarkPlayer(side);
      const seed = 2620 + chrysalisQuillOf(s, side);
      out.push({ seat, kind: "CARRY", word: "PULL", x: at.x, y: at.y, ...frame, seed });
    }
    return out;
  }
  const next = chrysalisNext(s);
  if (next < 0) return out;
  const col = chrysalisPieceCol(world, s, next);
  const x = fieldX(l, col);
  if (step.skin === "sacs") {
    if (s.sprayBeat < 0) return out;
    const seed = 2640 + next;
    out.push({ seat: null, kind: "PRESS", word: "SHIELD", x, y: l.hullY, ...frame, seed });
    return out;
  }
  const pore = chrysalisPoreAt(l, cfg, chrysalisCentre(l, cfg), col - midCol(cfg));
  const seed = 2660 + next;
  out.push(markAt(1, "CALL", "COLOUR", pore.x, pore.y, l, seed));
  out.push({
    seat: 2,
    kind: "PRESS",
    word: "FIRE",
    x,
    y: l.hullY,
    ...frame,
    aim: pore,
    seed: seed + 10,
  });
  return out;
}
