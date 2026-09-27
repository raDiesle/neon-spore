import { type ValveState, valveLeaking, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { valveLivePinCircle, valveSocketCircle, valveWheelCircle } from "./valve-grip.js";

/**
 * **What THE VALVE is asking for**: page forty-two of the readings. Both
 * screens draw the whole drum (`valve-draw.ts`), so nothing a word could
 * stand on is a secret, and `cueSeen` keeps each word to the seat it is for.
 * Every word stands on the circle its grip answers at (`valve-grip.ts`), so
 * the word and the thumb land in the same place.
 *
 * **`TURN` on the wheel, to the pilot, while it is his to turn** and not yet
 * on its mark. Once it holds, the word goes: the pilot's part is to keep it
 * there, and a word saying *turn* would move it off.
 *
 * **`FREEZE` on the socket, to the navigator, while the wheel holds** — the
 * one tap that counts is hers (`sim/valve-hand.ts`), and the pilot's there
 * does nothing, so nothing is said to him.
 *
 * **`PULL` on the live pin while frozen, to either seat**: either thumb may
 * draw it (§25, *Colour*). The depth is not said; the plate hanging long is.
 *
 * **`FIRE` at the hull under the spark while it falls, ahead of the rest**,
 * to either seat, since either colour takes it — a spark left alone is the
 * blow this boss lands. The story between the pins says its own words, the
 * second half of this page.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function valveCues(
  l: Layout,
  world: World,
  s: ValveState,
  beatPhase: number,
): readonly BossCue[] {
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  const { cfg, beat } = world;
  const out: BossCue[] = [];
  if (valveLeaking(s)) {
    const x = fieldX(l, s.sparkCol);
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 180 });
  }
  if (s.phase === "turn") {
    const { x, y } = valveWheelCircle(l, cfg, s, beat, beatPhase);
    out.push({ seat: 1, kind: "TURN", word: "TURN", x, y, ...frame, seed: 181 });
  }
  if (s.phase === "hold") {
    const { x, y } = valveSocketCircle(l, cfg, s, beat, beatPhase);
    out.push({ seat: 2, kind: "PRESS", word: "FREEZE", x, y, ...frame, seed: 182 });
  }
  const pin = valveLivePinCircle(l, cfg, s, beat, beatPhase);
  if (pin !== null) {
    out.push({ seat: null, kind: "HOLD", word: "PULL", x: pin.x, y: pin.y, ...frame, seed: 183 });
  }
  return out;
}
