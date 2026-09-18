import type { MirrorState, World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { type Layout, tileCX } from "./layout.js";
import { mirrorHullY } from "./mirror.js";

/**
 * **What the rounds are asking for** — page five of the readings, starting
 * with THE MIRROR. A round is a minigame with rules of its own
 * (`docs/spec/interludes.md`), so what it wants is rarely one of the field's
 * six verbs, and the words on this page are the round's own.
 *
 * The rules are `boss-cue.ts`'s. The one that decides everything below is
 * #34's third — **it says the verb and never the answer** — and for a memory
 * game the answer is nearly everything: which step comes next, whose thumb it
 * is on, whether it is a press or a slide. So the cue here is one word for the
 * whole of the pair's turn, and it is read off the *phase*, never off the step
 * the round is waiting for.
 */

/** THE CHOIR's frame, in tiles: the one shipped frame of this shape. */
const HALF_W = 0.72;
const HALF_H = 0.66;

/**
 * THE MIRROR. It performs a sequence of the pair's own moves and wants the
 * whole of it back, in order, and that is the only thing it ever asks for.
 *
 * `REPEAT` stands over its cannon lobe — the thing that just performed — for
 * the beats of `listen`, on **both** screens, because the mirror is drawn on
 * every screen (`boss-draw.ts`) and the sequence is answered from both seats.
 * The seat is `null` and the kind is a flat `PRESS` on purpose: reading the
 * next wanted step and putting `CARRY` on the pilot for a slide, or `PRESS`
 * on the navigator for a guard, would say whose move comes next and what
 * kind it is, which is the sentence the fight exists to make them say. The
 * kind line is not drawn for a word it equals, and here it is a stand-in
 * that says only *now*.
 *
 * Nothing in `lead` or `show`: the band is drawn dead while the mirror holds
 * the controls (`mirrorHoldsControls`, `band.ts`), and a cue over a thumb the
 * ship is refusing would be worse than none. Nothing in `verdict` either —
 * the echo or the scar is the field's answer, and it needs no word.
 */
export function mirrorCues(l: Layout, world: World, m: MirrorState): readonly BossCue[] {
  if (m.phase !== "listen") return [];
  return [
    {
      seat: null,
      kind: "PRESS",
      word: "REPEAT",
      x: tileCX(l, m.cannonCol),
      y: mirrorHullY(l, world.cfg),
      halfW: l.tile * HALF_W,
      halfH: l.tile * HALF_H,
      seed: 62,
    },
  ];
}
