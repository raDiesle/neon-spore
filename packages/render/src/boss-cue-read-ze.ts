import {
  midCol,
  type OculusState,
  oculusHolding,
  oculusLitStep,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { oculusHalfStanding } from "./oculus-grip.js";

/**
 * **What THE OCULUS is asking for** — page thirty-one of the readings. Both
 * seats are shown the whole lens (`oculus-draw.ts`), THE KEEL's way, so
 * nothing a word could stand on is a secret, and `cueSeen` only keeps each
 * word to the thumb that can act on it.
 *
 * **`HOLD` on each seat's half of the lens while a pair is lit**, the shut
 * and the reseal alike — the left half is Player 1's leaf and the right
 * Player 2's (`oculus-grip.ts`). A hold asks both seats at once, so both are
 * owed the word, and each goes the moment that seat's thumb is down, THE
 * MANTLE's brace (`boss-cue-read-zc.ts`): a word over a held leaf could only
 * say *keep going*, which the pair sliding shut already says.
 *
 * **`FIRE` at the hull under the middle column while the core is lit**, to
 * either seat. The core wants its own colour, and the word never names one:
 * the core is lit in it on both screens, and which cannon is that colour is
 * the conversation — THE KEEL's socket, again (`boss-cue-read-zd.ts`).
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function oculusCues(
  l: Layout,
  world: World,
  s: OculusState,
  beatPhase: number,
): readonly BossCue[] {
  const out: BossCue[] = [];
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  if (oculusLitStep(s)?.ask === "fire") {
    const x = fieldX(l, midCol(world.cfg));
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 130 });
  }
  if (oculusHolding(s)) {
    for (const seat of [1, 2] as const) {
      if (s.held[seat === 1 ? 0 : 1]) continue;
      const half = oculusHalfStanding(l, world, s, seat, beatPhase);
      const seed = seat === 1 ? 131 : 132;
      out.push({ seat, kind: "HOLD", word: "HOLD", x: half.x, y: half.y, ...frame, seed });
    }
  }
  return out;
}
