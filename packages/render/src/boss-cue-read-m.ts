import { type CandleState, priming, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { candleGlowY } from "./candle-glow.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **What THE CANDLE is asking for** — page thirteen of the readings, and its
 * own page for page twelve's reason: `boss-cue-read.ts` was at 227 lines of
 * its 250 with four fights in it, and this one's reading grew.
 *
 * It said `FIRE` on the glow and `MOVE` on the cannon whenever the pilot was
 * standing in the column the flame is turned to, which was honest about the
 * half of this fight the pair must *say* and wrong about the half the field
 * may state outright.
 *
 * **The column was missing, and it is the whole of the pilot's job.** A bolt
 * and the beam both leave the cannon's own column (`fire.ts`), and a shot
 * only takes a step off the glow if it leaves the top of the column the glow
 * hangs over (`candleStruck`). That column *drifts*, one tile every
 * `candleMoveBeats` — THE ORRERY's core stands in one place for a whole
 * fight, so its `MOVE` is a park; this one is a chase. Nothing on his band
 * said so, and it was the guide's first line.
 *
 * **The glow is the one mark either seat may be given.** The halo is drawn on
 * every screen (`candle-glow.ts`) and in a black field it is the only steady
 * light there is, so a frame on it hands nobody the other's picture. The
 * cannon is the other, for the same reason: the ship keeps its own violet
 * glow through the dark (`candle-dark.ts`), so the pilot is looking at the
 * thing the word stands on.
 *
 * **And the column is his even when the trigger is hers.** While the cannon
 * is off the glow's column she is told nothing rather than told to `FIRE` up
 * a lane a bolt cannot reach it from — THE THROAT's pairing, one gesture
 * across two seats, and THE ORRERY's the wave before.
 *
 * **Three silences, and each is a decision.**
 *
 * - **The column it faces, and this is the one that matters.** From
 *   `candleEatSteps` down the boss swallows a bolt fired from the column it
 *   is turned to and puts the light back on its glow (`candleEats`), and the
 *   cone that says which column is drawn on the pilot's screen alone
 *   (`showsCandleFace`). `view-role-clocks.ts` says why in as many words:
 *   *the seat that fires cannot see which column not to fire from, and has to
 *   be told.* So `FIRE` goes on standing over the glow while the flame is
 *   turned at it, and the pilot's voice is the only thing that stops her. A
 *   word that went quiet there would be the cone read out on her screen — the
 *   one sentence this fight is made of, answered by the field.
 * - **The pilot's `MOVE` off the faced column, which shipped and comes out.**
 *   It stood whenever `cannonCol` met `faceCol` while it ate, and where the
 *   flame is turned at the glow's *own* column that is the field telling him
 *   to leave the only column a shot lands from. The beam is not eaten — only
 *   `launch` asks `candleEats`, and `lance-burn.ts` goes straight to
 *   `candleStruck` — so what that moment wants is the pilot standing his
 *   ground and saying *beam*, which is his to say and not the field's. Off
 *   the glow's column he is told `MOVE` anyway, by the rule above, which is
 *   every case the old word was right in.
 * - **While the lobe is filling.** `FIRE` goes quiet the moment a colour is
 *   held, for `gripBrakes`' reason: a word over something already being
 *   answered teaches the pair to stop reading the words. What is left on her
 *   screen then is the prime's own charge, and in the dark it is a light.
 *
 * Nothing at all in `dark` or `out`: the light is still going out in the
 * first, and in the second the boss is beaten and the frame is black for two
 * beats before the wave may end under it (`candle-step.ts`).
 *
 * **And two words the last two phases cannot do without.** At `last` the
 * trigger stops counting for anything (`candleStruck`), and a trigger that
 * quietly stopped working is THE LEAD's sentence — so the field says what
 * replaced it: `PULL`, on the flame, for the pilot's thumb. At `smoking` the
 * bolt still does nothing and only the beam reaches what is left, so the word
 * is `BURN` and it is hers. Both are four letters and both have shipped
 * before, which is the whole of why they were picked: two people who may not
 * share a language read these.
 */

/** THE CHOIR's frame, in tiles: the size of this mark wherever it stands. */
const HALF_W = 0.72;
const HALF_H = 0.66;

function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
): BossCue {
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W, halfH: l.tile * HALF_H, seed };
}

/**
 * THE CANDLE. Four moments, read in the order the fight makes them.
 *
 * **The flame comes first, because at `last` nothing else is true.** No shot
 * counts there, so nobody is sent anywhere and the column stops mattering:
 * the mark stands on the glow itself and asks the pilot for his thumb
 * (`candle-hand.ts`). It is the one word in this reading that is not behind
 * the cannon.
 *
 * **Then the column, in every phase that still has a shot in it.** `full` is
 * where the chase is the fight, `eating` is that and the cone at once, and
 * `smoking` is the chase again with a count running under it. Everything
 * below here is behind the cannon being under the light.
 *
 * **Then the flash, or the beam.** Either colour dims the glow and the beam
 * does too — the dark is difficulty enough without a colour rule on top of it
 * (`candleStruck`) — so the word is the press and never which button. Off the
 * wick it is the beam alone that reaches what is left, so the word turns from
 * `FIRE` to `BURN` and the seat stays hers.
 */
export function candleCues(l: Layout, world: World, c: CandleState): readonly BossCue[] {
  if (c.phase === "dark" || c.phase === "out") return [];
  if (c.phase === "last") {
    return [markAt(1, "CARRY", "PULL", tileCX(l, c.col), candleGlowY(l), l, 89)];
  }
  if (world.cannonCol !== c.col) {
    return [markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 31)];
  }
  if (priming(world)) return [];
  if (c.phase === "smoking") {
    return [markAt(2, "HOLD", "BURN", tileCX(l, c.col), candleGlowY(l), l, 90)];
  }
  return [markAt(2, "PRESS", "FIRE", tileCX(l, c.col), candleGlowY(l), l, 32)];
}
