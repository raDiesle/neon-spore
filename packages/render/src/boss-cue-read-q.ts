import { CAIRN_COLS, type CairnState, carryIsReady, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { cairnBody } from "./cairn.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * **What THE CAIRN is asking for** — page seventeen of the readings, and its own
 * page for the reason pages eleven, twelve, fifteen and sixteen have theirs: one
 * boss a page is where these files have been going, and page four — which this
 * reading was written onto — took THE SPLICE's `WAIT` the same day and has
 * sixty-three lines left of its 250 (`docs/queue.md`, the line-count entry).
 *
 * It is the shortest reading in the set and it is a page anyway, because what
 * had to be argued is not the word but the four things standing next to it that
 * may not be said. Its nearest kin are THE STARE's and THE SPLICE's on page
 * four: three fights answered by a thumb on the picture rather than by anything
 * on the band, and three words that mark no control.
 */

/** THE CHOIR's frame, in tiles: the size of this mark, doubled for a whole body. */
const HALF_W = 0.72;
const HALF_H = 0.66;

/**
 * THE CAIRN. **One word, either seat's, and it never moves, brightens or
 * arrives** — which is the whole of this reading's care.
 *
 * `CARRY` over `PULL`, on the middle of the pile, for as long as there is a
 * pile and a carry can be spent. It is the word for the gesture the boss is
 * *named after* and it had none: nothing on either band reaches this body — a
 * bolt fired up one of its columns goes past it to whatever is above
 * (`shot-reach.ts`) and the shield has nothing to turn on a thing that is not
 * falling — so the only answer to it is a grip held on the stack and carried
 * sideways, which drags one unit out of the side the finger went
 * (`sim/cairn.ts`, `pullFromCairn`). A pair meeting it with no word would
 * shoot at it, and the fight would open on both controls doing nothing.
 *
 * **`seat: null`, because the carry is** (`grip-push.ts`): a thumb on the pile
 * drags a rock out whoever it belongs to, both seats are drawn the stack whole,
 * and both are drawn the ring once a hand is on it (`cairn-hand.ts`). THE
 * CURTAIN's `SHOVE` is the same word on the same gesture and the same third
 * answer (`boss-cue-read.ts`). It goes quiet for the beat of quiet a carry
 * costs (`carryIsReady`), so the word stands only on a beat a hand can actually
 * spend, and that silence is symmetrical — a rock has just left, which both
 * screens saw, and `units` dropped, which both screens count.
 *
 * **And it is deliberately not timed on the clock, which is the finding of this
 * lane.** A stack that has stood `cairnShedBeats` without losing a unit lets one
 * go itself, into a column the rng drew — and that column, its lane and the ring
 * shaking on the stone that is going are drawn on **player 1's screen alone**
 * (`showsCairnSettle`, `cairn-settle.ts`). The useful word is obviously *pull
 * now, it is about to choose for you*; it is also forbidden. A word that
 * appeared, hurried or changed as the pile's patience ran out would be the
 * pilot's gauge read out on the navigator's glass by its own arrival, which is
 * THE LEAD's finding one boss on (`boss-cue-read-c.ts`): a word whose *absence*
 * reads is as bad as one that says too much. So the word is the same word on
 * beat one and on beat seven of the eight, on both screens, and the pressure is
 * a thing the pilot says out loud.
 *
 * **Five silences, and each of them is the fight.**
 *
 * - **The lane the pile chose.** The second sentence of this fight is a column
 *   said across the voice delay, which is THE GHOST's ask arriving in a boss
 *   (`bosses.md` §11.11), and #34's *never a column* would forbid it even if
 *   the split did not. The mark stands on the pile's own middle whatever
 *   `settleCol` holds.
 * - **Which side.** Pulled left the rock leaves the stack's left pair of
 *   columns, pulled right its right pair, four columns apart — and that is the
 *   one thing about this fight either of them decides. `LEFT` is the answer, not
 *   the verb, and it is the navigator's to ask for out loud because she holds
 *   the only dome.
 * - **How many.** The pile does not care how many rocks are already in the air,
 *   so *how much can you take right now* is the question this boss exists to
 *   make her answer. A count is the third thing #34 forbids outright.
 * - **The ward.** What comes away is a plain `meteor` falling a tile a beat in
 *   a lane like any other, and **no boss's reading cues an ordinary body** —
 *   THE GORGE's fourth silence in as many words (`boss-cue-read-n.ts`). With
 *   seven rocks able to be in the air at once, a frame on one of them would say
 *   that one is the dangerous one when what is dangerous is that there are
 *   several. The dome and the trigger are the guide's, and they stay written.
 * - **The trigger's own beat.** The dome is drawn to both screens alike —
 *   `drawHull` calls `drawShieldRim` with no role test, and THE WELL's own
 *   ring does the same. What `showsShield` gates is her strip, not the
 *   picture: the plate's column is not a fact hidden from him. So a `SHIELD`
 *   here would not be handing him anything he cannot already see, and the
 *   silence is not a second reason but **The ward**'s, said again: no boss's
 *   reading cues an ordinary body, and the body under this dome is one.
 */
export function cairnCues(l: Layout, world: World, s: CairnState): readonly BossCue[] {
  if (s.units <= 0) return [];
  const body = cairnBody(world, s);
  if (body === undefined || !carryIsReady(world, body)) return [];
  // The stack's own centre, spelled exactly as `cairn-units.ts` spells it, so
  // the frame stands on the stones rather than beside them — and wide, THE
  // CURTAIN's arrangement for a handle that is a whole body and not a tile.
  return [
    {
      seat: null,
      kind: "CARRY",
      word: "PULL",
      x: tileCX(l, body.col + (CAIRN_COLS - 1) / 2),
      y: tileCY(l, body.row),
      halfW: l.tile * HALF_W * 2,
      halfH: l.tile * HALF_H,
      seed: 85,
    },
  ];
}
