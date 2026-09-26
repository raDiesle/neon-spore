import { midCol, type ViseState, viseLitStep, viseShut, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { viseLobeStanding } from "./vise-grip.js";

/**
 * **What THE VISE is asking for** — page thirty-two of the readings, THE
 * OCULUS's page (`boss-cue-read-ze.ts`) spent on a pinch instead of a hold.
 * Both seats are shown the whole case (`vise-draw.ts`), so nothing a word
 * could stand on is a secret, and `cueSeen` only keeps each word to the thumb
 * that can act on it.
 *
 * **`SHUT` on each lobe a lit pinch asks for** — the left one's is Player 1's
 * and the right one's Player 2's (`vise-grip.ts`), one of them on a single
 * seam and both on a `both` step. It stands on the lobe's round, where the
 * ghost thumb does, and goes the moment that lobe's gap is pinched under the
 * shut line: a word over a lobe already shut could only say *keep going*,
 * which the seam cracking down under it already says. A lobe let go before
 * its count is up is owed the word again. The kind is `HOLD`, THE GORGE's
 * pinch's (`boss-cue-read-n.ts`): the gesture is two fingertips kept
 * together, and the seam wants beats of it, not a moment.
 *
 * **`FIRE` at the hull under the middle column while the kernel is lit**, to
 * either seat. The kernel wants its own colour and the word never names one:
 * the kernel is lit in it on both screens, and which cannon is that colour is
 * the conversation — THE OCULUS's core, again.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function viseCues(
  l: Layout,
  world: World,
  s: ViseState,
  beatPhase: number,
): readonly BossCue[] {
  const out: BossCue[] = [];
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  const ask = viseLitStep(s)?.ask;
  if (ask === "fire") {
    const x = fieldX(l, midCol(world.cfg));
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 135 });
  }
  for (const seat of [1, 2] as const) {
    const side = seat === 1 ? 0 : 1;
    const asked = ask === "both" || ask === (seat === 1 ? "left" : "right");
    if (!asked || viseShut(world, s, side)) continue;
    const lobe = viseLobeStanding(l, world, s, seat, beatPhase);
    const seed = seat === 1 ? 136 : 137;
    out.push({ seat, kind: "HOLD", word: "SHUT", x: lobe.x, y: lobe.y, ...frame, seed });
  }
  return out;
}
