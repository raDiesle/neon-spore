import { midCol, type RimeState, rimeIcicleCol, rimeLitStep, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE RIME is asking for** — page thirty-three of the readings, THE
 * VISE's page (`boss-cue-read-zf.ts`) spent on a pane of frost. Both seats
 * are shown the whole pane (`rime-draw.ts`), so `cueSeen` only keeps each word
 * to the thumb that can act on it.
 *
 * **`FIRE` at the hull under the middle column while the core is lit**, to
 * either seat. The core wants its own colour and the word never names one.
 *
 * **`SHIELD` at the hull under the column the shield is wanted in**: under
 * the lens on a surge, and under the icicle's column on an icicle, where its
 * notch is (`rime-story.ts`).
 *
 * **No word on a half yet.** A rub is a thumb turned back and forth on a
 * half, and no touch on the field sends one until THE RIME's hands land
 * (`on-field-controls.test.ts` lists both halves as unbuilt); a word asking
 * for a gesture the field cannot take is a word the pair cannot obey. The lit
 * halves, one or both, glow white on both screens meanwhile.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function rimeCues(l: Layout, world: World, s: RimeState): readonly BossCue[] {
  const step = rimeLitStep(s);
  if (s.phase !== "lit" || step === null) return [];
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  const mid = midCol(world.cfg);
  if (step.ask === "fire" && s.bared) {
    const x = fieldX(l, mid);
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 139 }];
  }
  if (step.ask === "shield" || step.ask === "icicle") {
    const x = fieldX(l, step.ask === "icicle" ? rimeIcicleCol(mid, step) : mid);
    return [{ seat: null, kind: "PRESS", word: "SHIELD", x, y: l.hullY, ...frame, seed: 140 }];
  }
  return [];
}
