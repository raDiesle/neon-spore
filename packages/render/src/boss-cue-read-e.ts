import {
  type GaugeState,
  gaugeSeated,
  type MazeState,
  type MirrorState,
  mazeCurrent,
  mirrorGesture,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { gaugeNeedleTip } from "./gauge.js";
import { gaugeDial } from "./gauge-round.js";
import { type Layout, tileCX } from "./layout.js";
import { mazeDoorMouth } from "./maze-door.js";
import { mazeStringCircle, mazeStringHandle } from "./maze-string.js";
import { mirrorHullY } from "./mirror.js";

/**
 * **What the rounds are asking for** — page five of the readings: THE MIRROR,
 * THE MAZE, THE GAUGE. A round is a minigame with rules of its own
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

/** The same builder the four pages before this one carry, for the same
 * reason: a frame's size is a fact about the mark and not about the boss. */
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
 * THE MIRROR. It performs a sequence of the pair's own moves and wants the
 * whole of it back, in order — on the panel, then on its own ship, then
 * pinned (`MIRROR_GESTURES`, `sim/simon.ts`): three arms, one a gesture.
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
 * The last round is `reflect` — the same word, the kind `CARRY`, because the
 * answer has moved onto the picture and a carry is what the first of its
 * lobes takes; still neither the step nor the seat. `hold` is the one arm
 * that is a gesture and not a round: `PIN` on each seat's own lobe of it,
 * player 1's cannon and player 2's shield, the pin being both or nothing.
 *
 * Nothing in `lead` or `show`: the band is drawn dead while the mirror holds
 * the controls (`mirrorHoldsControls`, `band.ts`), and a cue over a thumb the
 * ship is refusing would be worse than none. Nothing in `verdict` either —
 * the echo or the scar is the field's answer, and it needs no word.
 */
export function mirrorCues(l: Layout, world: World, m: MirrorState): readonly BossCue[] {
  const y = mirrorHullY(l, world.cfg);
  const gesture = mirrorGesture(m);
  if (gesture === "hold") {
    return [
      markAt(1, "HOLD", "PIN", tileCX(l, m.cannonCol), y, l, 64),
      markAt(2, "HOLD", "PIN", tileCX(l, world.shieldCol), y, l, 65),
    ];
  }
  if (m.phase !== "listen") return [];
  if (gesture === "reflect")
    return [markAt(null, "CARRY", "REPEAT", tileCX(l, m.cannonCol), y, l, 63)];
  return [markAt(null, "PRESS", "REPEAT", tileCX(l, m.cannonCol), y, l, 62)];
}

/**
 * THE MAZE. Two verbs, one per seat, and the round is nothing but which of
 * them is wanted now — so the cue is read off the lock and never off the
 * corridor behind it.
 *
 * **Only in `read`.** `lead` is the quiet before a fresh wheel, `travel` is
 * the pair watching a shot crawl, and `verdict` is what it found; in all
 * three the string is not even drawn (`maze-string.ts`), and a word over a
 * handle the ship has taken away is an invitation to press nothing.
 *
 * **Nothing here is an answer, because this round has no secret.** The owner
 * was asked three times whether the wheel should keep a knowledge split and
 * said no three times (`sim/maze.ts`): the lit door is on both screens, the
 * shot's walk is on both screens, and the heart's colour beats in the middle
 * of the drum where both of them can see it. What divides the pair is the
 * *verbs* — one turns and cannot fire, the other fires and cannot turn — so a
 * word naming a seat's own verb takes nothing away from the sentence they
 * have to say, which is *now*.
 *
 * **Three marks, in the order they expire.**
 *
 * - `CARRY` / `TURN` on the string's handle, the pilot's, while nothing has
 *   clicked. The handle is drawn on both screens so the navigator can watch
 *   the pull, but only player 1 may turn it (`mazeStringHeard`), so the cue is
 *   seat 1's and the navigator's screen keeps the word `maze-string.ts`
 *   already gives it.
 * - `CARRY` / `MOVE` on the cannon where it stands, the pilot's, once a way in
 *   has clicked and the cannon is not under it. On the cannon and never on the
 *   lit column: the mark is on the thing that moves, which is also the only
 *   place the pilot can act, and the column is lit for both of them anyway.
 *   It goes out when the cannon arrives, which answers nothing — the door said
 *   where to go before the cue did.
 * - `PRESS` / `FIRE` on the lit doorway, the navigator's, for as long as one
 *   stands. Not `once the cannon is under it`: the cannon is drawn on the
 *   pilot's screen and not on hers (`showsCannon`), so a word that came out at
 *   the moment he arrived would hand her the one thing he has to say. It says
 *   her verb and leaves the timing where the round put it.
 *
 * Nothing says the colour. The heart takes its own and only its own
 * (`mazeHeartColor`), and which one that is is the pair's read off a thing
 * beating in front of them both — the film says so in its one remaining page
 * about her half, and the field never will.
 */
export function mazeCues(l: Layout, world: World, m: MazeState): readonly BossCue[] {
  if (m.phase !== "read") return [];
  const wheel = mazeCurrent(m);
  if (wheel === null) return [];
  const out: BossCue[] = [];

  if (m.lockedCol === -1) {
    const handle = mazeStringHandle(l, world.cfg, m);
    out.push(markAt(1, "CARRY", "TURN", handle.x, mazeStringCircle(l, world.cfg).y, l, 65));
    return out;
  }

  if (world.cannonCol !== m.lockedCol) {
    out.push(markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 66));
  }
  const mouth = mazeDoorMouth(l, world.cfg, m, wheel, m.lockedWay);
  out.push(markAt(2, "PRESS", "FIRE", mouth.x, mouth.y, l, 67));
  return out;
}

/**
 * THE GAUGE. One word, hers, and the pilot gets none — which is the finding
 * of this reading rather than a gap left in it.
 *
 * **He cannot be told anything true.** The valve is his and the two marks are
 * not on his screen at all (`showsGaugeMarks`), so the only word the field
 * could write over his thumb is `TURN`, and the moment it wanted would be
 * *which way* and *how far* — the answer, and hers to say. Nor is there a beat
 * when a turn is owed: the needle is parked on purpose while the band walks
 * toward it, so a word that came out whenever he was still would be telling
 * him to undo a thing the pair had just agreed. He keeps the film's one page
 * about his half, and the field says nothing to him for the whole round.
 *
 * **She is told her own verb, at the moment it will land.** `PRESS` / `CALL`
 * on the end of the needle while it stands between the marks — both of which
 * are drawn on her screen, so the mark stands on something she is already
 * shown, and the word says what her thumb does rather than where the needle
 * has to go. It is not the round's difficulty: seeing that the needle is
 * inside the band is the easy half of her job, and the hard half — talking him
 * there before it arrives — happens in the beats when there is no cue at all.
 *
 * **And it goes out while the call is resting.** Two calls inside
 * `gaugeCallRestBeats` cost the rest between them whether the first landed or
 * not (`gaugeHeard`), so a word over a button that is refusing would be an
 * invitation to press nothing — THE MAZE's argument about a handle the ship
 * has taken away, on a button instead.
 */
export function gaugeCues(
  l: Layout,
  world: World,
  g: GaugeState,
  clearTop: number | undefined,
): readonly BossCue[] {
  if (g.phase !== "play") return [];
  if (world.beat - g.calledBeat < world.cfg.gaugeCallRestBeats) return [];
  if (!gaugeSeated(world, g)) return [];
  const tip = gaugeNeedleTip(gaugeDial(l, clearTop), g);
  return [markAt(2, "PRESS", "CALL", tip.x, tip.y, l, 68)];
}
