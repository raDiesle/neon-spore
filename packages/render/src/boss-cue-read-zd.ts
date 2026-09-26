import { type KeelState, keelLit, keelSeat, keelThrown, midCol, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldX } from "./field-flip.js";
import { keelJointCircle } from "./keel-grip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE KEEL is asking for** — page thirty of the readings. Like THE
 * MANTLE, both seats are shown the same spine (`keel-draw.ts`), so nothing a
 * word could stand on is a secret, and `cueSeen` only keeps each word to the
 * thumb that can act on it.
 *
 * **`TAP` on the lit joint's ring, to the seat whose half it sits over**
 * (`sim/keel.ts` `keelSeat`), and nothing on the other screen: the wrong
 * seat's tap is refused silently, and a word over it would be the field
 * asking for one. A joint over the middle column is either seat's, so its
 * word carries none. The ring closing round it is already the window; the
 * word adds only what the thumb does.
 *
 * **`FIRE` at the hull under the middle column while the socket is open**,
 * to either seat. The socket wants its own colour, and the word never names
 * one: the socket flashes it on both screens, and which cannon is that colour
 * is the conversation.
 *
 * **And `FIRE` at the hull under the rock, ahead of both**, because a rock
 * left unshot is the blow this boss lands on the hull (`keelRockBeats`).
 * Either colour's and either seat's shot takes it (`sim/keel-shot.ts`), so it
 * carries no seat — THE MANTLE's spark, again (`boss-cue-read-zc.ts`).
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function keelCues(
  l: Layout,
  world: World,
  s: KeelState,
  beatPhase: number,
): readonly BossCue[] {
  const out: BossCue[] = [];
  const cfg = world.cfg;
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  if (keelThrown(s)) {
    const x = fieldX(l, s.rockCol);
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 119 });
  }
  if (s.phase === "socket") {
    const x = fieldX(l, midCol(cfg));
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 120 });
  }
  const ring = keelLit(s) ? keelJointCircle(l, cfg, s, world.beat, beatPhase) : null;
  if (ring !== null) {
    const seat = keelSeat(s, cfg.cols);
    out.push({ seat, kind: "PRESS", word: "TAP", x: ring.x, y: ring.y, ...frame, seed: 121 });
  }
  return out;
}
