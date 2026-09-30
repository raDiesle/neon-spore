import {
  type RatchetState,
  ratchetHeld,
  ratchetLoose,
  ratchetWorking,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { CUE_FRAME_WIDE, cueAimAt, cueFrame } from "./boss-cue-frame.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { ratchetCatchCircle, ratchetPadCircle, ratchetTakesHand } from "./ratchet-grip.js";
import { ratchetBoltAt } from "./ratchet-shape.js";

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
 * **`TAP` / `WHEN P2 SAYS SET` on his pad while a tooth is waiting.** Never
 * `TAP` alone: a press is never refused, and a word telling him to press
 * whenever the pad is lit would be the field asking for a burnt tooth. It said
 * `ON SET` until 30 September 2026, when the word became the thumb's (#34).
 * He is never shown her hand (§22), so the small line says the one thing his
 * screen cannot, which is what he is waiting for. It is shown whatever her catch is doing, so it gives away
 * nothing about it. It goes while his thumb is down.
 *
 * **The story between the teeth** (§22) asks with the same two hands. The
 * slip is her catch alone, so its word is the catch's own `HOLD`; the kick is
 * his pawl alone, so the catch says nothing and his pad says **`HOLD`** — a
 * press no longer burns a tooth there, so the word can ask for it; the bind
 * is both at once. The wind is her catch pumped, so its word never goes:
 * `HOLD` while it is up and **`LIFT`** while it is set, which is the pump.
 *
 * **And `FIRE` over the loose bolt, ahead of both**, at the hull under its
 * column, because a bolt left unshot is the one blow this boss lands on
 * the hull (`ratchetBoltBeats`). Either seat's and either colour's
 * (`sim/ratchet-shot.ts`), so it carries no seat. Its crosshair rides the
 * bolt as it falls (`ratchetBoltAt`, the drawing's own).
 */

export function ratchetCues(
  l: Layout,
  world: World,
  s: RatchetState,
  beatPhase: number,
): readonly BossCue[] {
  const out: BossCue[] = [];
  const cfg = world.cfg;
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  if (ratchetLoose(s)) {
    const x = fieldX(l, s.boltCol);
    const aim = cueAimAt(l, ratchetBoltAt(l, cfg, s, world.beat, beatPhase));
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 112 });
  }
  if (!ratchetTakesHand(s)) return out;
  const held = ratchetHeld(s, cfg);
  const wind = s.phase === "wind";
  if (s.phase !== "kick" && (wind || s.catchSpent || !held)) {
    const bar = ratchetCatchCircle(l, cfg, s);
    const word = s.catchSpent || (wind && held) ? "LIFT" : "HOLD";
    out.push({ seat: 2, kind: "CARRY", word, x: bar.x, y: bar.y, ...frame, seed: 113 });
  }
  if (s.pawlDown) return out;
  const pad = ratchetPadCircle(l, cfg);
  if (ratchetWorking(s)) {
    out.push({
      seat: 1,
      kind: "PRESS",
      word: "TAP",
      why: "WHEN P2 SAYS SET",
      x: pad.x,
      y: pad.y,
      ...frame,
      seed: 114,
    });
  } else if (s.phase === "kick" || s.phase === "bind") {
    out.push({ seat: 1, kind: "HOLD", word: "HOLD", x: pad.x, y: pad.y, ...frame, seed: 190 });
  }
  return out;
}
