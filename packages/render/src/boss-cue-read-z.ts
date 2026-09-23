import { type HaspState, haspHeld, haspLoose, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldX } from "./field-flip.js";
import { haspLatchCircle, haspLatchTakes, haspWheelCircle } from "./hasp-grip.js";
import { haspFree } from "./hasp-pose.js";
import type { Layout } from "./layout.js";

/**
 * **What THE HASP is asking for** — page twenty-six of the readings, and
 * THE GIMBAL's arrangement next door: two hands, one per seat, each owed its
 * own word on its own screen, and `cueSeen` hands each the one that is its.
 *
 * **`HOLD` on his latch, and only while it is up.** The gesture is the bar
 * carried down its rail and kept there, so the kind is `CARRY` and the verb
 * is the part a pilot gets wrong — the keeping. Once the bar is past the grip
 * the word goes: a word telling a thumb to do what it is already doing is the
 * prompt this family exists to close, and a word still standing on a held
 * latch would be the one place the field could say *not yet* about the fuse,
 * which is his to read off the colour and to say (§20). Silent while the
 * latch is burnt, too, because it would refuse the hand (`hasp-grip.ts`).
 *
 * **`TURN` on her wheel, and only while it is free.** A rim turned against a
 * lifted latch seizes and the turning is lost, so a verb on a seized wheel
 * would be the field asking for the waste. Her screen already shows the wheel
 * free or seized; the word adds only what her thumb does about it. Neither
 * word counts anything: how much winding is left is on the wheel's creep,
 * and how long his hand has is on his screen alone.
 *
 * **And `FIRE` over the loose bolt, ahead of both**, at the hull under its
 * column, because it is the only thing on this boss that ends the wave.
 * Either seat's and either colour's (`sim/hasp-shot.ts`), so it carries no
 * seat — THE GIMBAL's seam, and for its reason.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function haspCues(l: Layout, world: World, s: HaspState): readonly BossCue[] {
  const out: BossCue[] = [];
  const cfg = world.cfg;
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  if (haspLoose(s)) {
    const x = fieldX(l, s.boltCol);
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 101 });
  }
  if (haspLatchTakes(s) && !haspHeld(s, cfg)) {
    const bar = haspLatchCircle(l, cfg, s);
    out.push({ seat: 1, kind: "CARRY", word: "HOLD", x: bar.x, y: bar.y, ...frame, seed: 102 });
  }
  if (haspFree(s, cfg)) {
    const w = haspWheelCircle(l, cfg, s);
    out.push({ seat: 2, kind: "TURN", word: "TURN", x: w.x, y: w.y, ...frame, seed: 103 });
  }
  return out;
}
