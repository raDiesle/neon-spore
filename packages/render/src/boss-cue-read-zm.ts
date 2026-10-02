import {
  type GallState,
  gallLitStep,
  gallPincher,
  gallShut,
  midCol,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import { fieldX } from "./field-flip.js";
import { gallPointCircle } from "./gall-grip.js";
import { gallRootAt, gallRootR } from "./gall-shape.js";
import type { Layout } from "./layout.js";

/**
 * **What THE GALL is asking for** — page thirty-nine of the readings, THE
 * VISE's (`boss-cue-read-zf.ts`) with the pinch moving. Both screens draw the
 * whole seam and the gall where it sits (`gall-draw.ts`), so nothing a word
 * could stand on is a secret, and `cueSeen` keeps it to the thumb that can
 * act on it.
 *
 * **`PINCH` on the nodule, to the seat whose half it sits on**, while a close
 * is lit, on the point's round where the ghost thumb stands. It goes the
 * moment the gap is under the shut line — a word over a pinch already shut
 * could only say *keep going* — and a pinch let slip is owed it again. **When
 * the gall jumps the word jumps with it**, on the frame it lands, to whichever
 * seat is nearer there: *where did it go* is the pair's to say out loud, and
 * the word is only ever on the screen of the one who has to move. The kind is
 * `HOLD`: the close wants beats of it, not a moment.
 *
 * **`FIRE` at the hull under the middle column on the bared root**, to either
 * seat. The step's colour is never named — the root is lit in it, on both
 * screens. Nothing is said between steps. **It rings the root** where it is
 * drawn (`gallRootAt`), its ripple left out.
 */

export function gallCues(l: Layout, world: World, s: GallState): readonly BossCue[] {
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const step = gallLitStep(s);
  if (step === null) return [];
  if (step.ask === "fire") {
    if (!s.bared) return [];
    const x = fieldX(l, midCol(world.cfg));
    const aim = { ...gallRootAt(l, world.cfg), r: gallRootR(l) };
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 162 }];
  }
  if (gallShut(world, s)) return [];
  const at = gallPointCircle(l, world.cfg, s.point);
  const seat = gallPincher(s);
  return [{ seat, kind: "HOLD", word: "PINCH", x: at.x, y: at.y, ...frame, seed: 163 }];
}
