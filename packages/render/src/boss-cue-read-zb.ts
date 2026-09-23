import {
  type RatchetState,
  ratchetHeld,
  ratchetLoose,
  ratchetWorking,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { ratchetCatchCircle, ratchetPadCircle, ratchetTakesHand } from "./ratchet-grip.js";

/**
 * **What THE RATCHET is asking for**: page twenty-eight of the readings, and
 * THE HASP's arrangement again. Two hands, one per seat, each given its own
 * word on its own screen, and `cueSeen` gives each seat the one that is its own.
 *
 * **`HOLD` on her catch while it is up**, and **`LIFT` while it is spent**.
 * The gesture is the bar carried down its rail and kept there, so the kind
 * is `CARRY`. The one thing she has to learn is that a clean tooth spends
 * the catch, and a hand still down holds nothing until it has come back up
 * past the notch (`sim/ratchet-hand.ts`). So the word on a spent catch is the
 * way out of it. Once she is holding, the word goes: what she says next is
 * `SET`, out loud, and the field must not say it for her.
 *
 * **`ON SET` on his pad while a tooth is waiting.** Not `PRESS`: a press is
 * never refused, and a word telling him to press whenever the pad is lit
 * would be the field asking for a burnt tooth. He is never shown her hand
 * (§22), so the word says the one thing his screen cannot, which is what he
 * is waiting for. It is shown whatever her catch is doing, so it gives away
 * nothing about it. It goes while his thumb is down.
 *
 * **And `FIRE` over the loose bolt, ahead of both**, at the hull under its
 * column, because a bolt left unshot is the one blow this boss lands on
 * the hull (`ratchetBoltBeats`). Either seat's and either colour's
 * (`sim/ratchet-shot.ts`), so it carries no seat.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function ratchetCues(l: Layout, world: World, s: RatchetState): readonly BossCue[] {
  const out: BossCue[] = [];
  const cfg = world.cfg;
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  if (ratchetLoose(s)) {
    const x = fieldX(l, s.boltCol);
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 112 });
  }
  if (!ratchetTakesHand(s)) return out;
  if (s.catchSpent || !ratchetHeld(s, cfg)) {
    const bar = ratchetCatchCircle(l, cfg, s);
    const word = s.catchSpent ? "LIFT" : "HOLD";
    out.push({ seat: 2, kind: "CARRY", word, x: bar.x, y: bar.y, ...frame, seed: 113 });
  }
  if (ratchetWorking(s) && !s.pawlDown) {
    const pad = ratchetPadCircle(l, cfg);
    out.push({ seat: 1, kind: "PRESS", word: "ON SET", x: pad.x, y: pad.y, ...frame, seed: 114 });
  }
  return out;
}
