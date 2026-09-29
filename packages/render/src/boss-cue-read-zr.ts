import {
  midCol,
  type SeamState,
  seamLitStep,
  seamStepCol,
  seamWantsShield,
  seamWantsShot,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE SEAM is asking for**, page forty-four of the readings. Both
 * screens draw the same ridge, crack, grit and rock (`seam-draw.ts`), so no
 * word stands on anything secret, and every word goes to either seat: which
 * seat answers a step is the colour it asks for, and either may take the
 * shield.
 *
 * **`FIRE` at the hull under the column the lit step's shot is wanted in**
 * until that shot lands. For a point or the glow that is the middle column,
 * under the ridge; for a rock it is the rock's own column (`seamStepCol`).
 * The colour is never named: the point and the rock already wear it on both
 * screens, and which cannon is that colour is the conversation.
 *
 * **`SHIELD` at the hull under the middle column** while grit is falling and
 * has not been taken, the blind throw included: with the ridge turned away,
 * the grit is the only thing left to read. A step of grit and a rock at once
 * says both words, in two columns, and each goes out when its half is
 * answered.
 *
 * **Nothing on the false point or the dark** (`seamHoldsFire`): the answer
 * is to send nothing, and any word there would ask for the press that loses.
 * Nothing between steps either.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function seamCues(l: Layout, world: World, s: SeamState): readonly BossCue[] {
  const step = seamLitStep(s);
  if (step === null) return [];
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  const out: BossCue[] = [];
  if (seamWantsShield(s)) {
    const x = fieldX(l, midCol(world.cfg));
    out.push({ seat: null, kind: "PRESS", word: "SHIELD", x, y: l.hullY, ...frame, seed: 210 });
  }
  if (seamWantsShot(s)) {
    const x = fieldX(l, seamStepCol(world, step));
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 211 });
  }
  return out;
}
