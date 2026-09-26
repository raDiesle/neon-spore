import {
  type MantleState,
  mantleBracing,
  mantleFinale,
  mantleLeaking,
  mantlePulling,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { mantleCoreCircle, mantleKnobCircle, mantleSide } from "./mantle-grip.js";

/**
 * **What THE MANTLE is asking for** — page twenty-nine of the readings, and
 * the first where both seats are shown the same picture: the sum is one
 * number, and every mark on this boss is on both screens (`mantle-handle.ts`).
 * So nothing a word could stand on is a secret, and `cueSeen` is only keeping
 * each seat's word to the thumb that can act on it.
 *
 * **`PULL` on each seat's own knob while the handles are lit and that knob
 * is not held**, one word a seat — the left knob is Player 1's and the right
 * Player 2's (`sim/mantle-hand.ts`). The gesture is the knob carried down its
 * groove and kept there, so the kind is `CARRY`. **It goes the moment the
 * thumb is on**, below the floor or above it: *how far* is the whole of the
 * conversation, and the grey end of the cord already says a thumb is counting
 * for nothing (`drawCord`). A word on a held knob could only say *further*,
 * which is the other seat's line.
 *
 * **`HOLD` on each seat's own knob while the shell braces and that side is
 * let go** (§23 rows 7 and 8): the gesture is a thumb laid on and kept still,
 * so the kind is `HOLD`, and it goes the moment the thumb is down — a lift
 * brings it back, which is the whole of what the slip needs to say.
 *
 * **`TAP` on the core ring for the seat whose tap the finish is waiting on**
 * (`heartbeatNext`), and nothing on the other screen: a wrong-seat tap is
 * refused silently, and a word over it would be the field asking for one.
 * The ring's lit half already says whose turn it is on both screens, so the
 * word gives nothing away the picture does not.
 *
 * **And `FIRE` at the hull under the leaking spark, ahead of both**, because
 * a spark left unshot is the one blow this boss lands on the hull
 * (`mantleSparkBeats`). Either seat's shot puts it out, so it carries no
 * seat — THE RATCHET's loose bolt, again (`boss-cue-read-zb.ts`).
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function mantleCues(
  l: Layout,
  world: World,
  s: MantleState,
  beatPhase: number,
): readonly BossCue[] {
  const out: BossCue[] = [];
  const cfg = world.cfg;
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  if (mantleLeaking(s)) {
    const x = fieldX(l, s.sparkCol);
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 115 });
  }
  if (mantlePulling(s)) {
    for (const seat of [1, 2] as const) {
      if (s.depthMilli[seat === 1 ? 0 : 1] > 0) continue;
      const knob = mantleKnobCircle(l, cfg, s, mantleSide(seat), world.beat, beatPhase);
      const seed = seat === 1 ? 116 : 117;
      out.push({ seat, kind: "CARRY", word: "PULL", x: knob.x, y: knob.y, ...frame, seed });
    }
  }
  if (mantleBracing(s)) {
    for (const seat of [1, 2] as const) {
      if (s.held[seat === 1 ? 0 : 1]) continue;
      const knob = mantleKnobCircle(l, cfg, s, mantleSide(seat), world.beat, beatPhase);
      const seed = seat === 1 ? 128 : 129;
      out.push({ seat, kind: "HOLD", word: "HOLD", x: knob.x, y: knob.y, ...frame, seed });
    }
  }
  if (mantleFinale(s)) {
    const ring = mantleCoreCircle(l, cfg);
    const seat = s.heartbeatNext === 0 ? 1 : 2;
    out.push({ seat, kind: "PRESS", word: "TAP", x: ring.x, y: ring.y, ...frame, seed: 118 });
  }
  return out;
}
