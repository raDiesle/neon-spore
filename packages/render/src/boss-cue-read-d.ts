import {
  CAIRN_COLS,
  type CairnState,
  carryIsReady,
  type StareState,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { cairnBody } from "./cairn.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { stareLidRest } from "./stare-lid.js";
import { stareEye, stareGazeFootY } from "./stare-shape.js";

/**
 * **What THE STARE and THE CAIRN are asking for** — page four of the readings,
 * opened for the one boss whose cue is not a gesture.
 *
 * **THE CAIRN joined it on 19 September 2026** rather than opening a sixteenth
 * page, and the two fights sit together for more than the eighty-six lines this
 * page had spare of its 250. Neither word stands on a control: one is drawn at
 * the foot of a look and the other on a body no bolt reaches, and both fights
 * are answered by a thumb on the picture rather than by anything on the band.
 * They are also the two shortest readings in the set — one word each per screen,
 * with the whole of the rest of each fight deliberately unsaid.
 *
 * The three pages before this one each mark the place a thumb goes. THE
 * STARE has no such place: what it wants from the watched seat is that no
 * thumb goes anywhere, for as long as the look lasts, and what it wants from
 * the other seat is the ordinary game, which the panel already says. So the
 * page carries one reading and one word, and the word is the fifth kind
 * (`boss-cue.ts`, `CueKind`).
 *
 * **When it may be said, and when it may not.** The eye's tell — the seven
 * beats of `turning` — is the fight: the seat about to be frozen is *not*
 * shown that it is (`view-role-clocks-b.ts`, `showsStareTarget`), and the
 * other seat has that long to say so. A cue on the watched seat during the
 * tell would say it for them, which is the one thing #34 forbids — the
 * field says the verb, never the answer, and here *who* is the answer. The
 * cue comes out only once the look has landed and the gaze is on the
 * watched seat's own field; by then the telling is over, and the word is
 * what the gaze already means, said in letters for the seat that did not
 * hear it (`docs/spec/bosses.md` §11.16).
 *
 * **And the lid, since 18 September 2026**, which is the boss's one gesture:
 * `SHUT` over the ring on the eye's brow, on the seat the eye is *not*
 * looking at, for as long as the look lasts and no thumb is on it yet. The
 * two cues are on two screens by construction — the watched seat is told to
 * be still, the other is offered the lid — so a screen never carries both,
 * and the order below is only which one the test screen reads first.
 */

/** THE CHOIR's frame, in tiles — the same as the three pages before. */
const HALF_W = 0.72;
const HALF_H = 0.66;

/**
 * THE STARE. `STILL`, on the watched seat, at the foot of the gaze — the
 * lowest row the red reaches — while the eye is `looking` and nowhere else.
 *
 * On the watched seat's screen the gaze is drawn (`showsStareWatched`), so
 * the mark stands on something that seat is already shown; on the other seat
 * nothing is drawn there and nothing is marked. The word is the kind and the
 * kind is the word: `boss-cue-text.ts` skips the line over the frame when
 * the two are the same, so the screen says one thing. The cannon's own
 * cues, if the wave had any, would be after this one, which is what
 * *most urgent first* means for a boss whose ask is a stop.
 */
export function stareCues(l: Layout, world: World, s: StareState): readonly BossCue[] {
  if (s.phase !== "looking" || s.watching === 0) return [];
  const eye = stareEye(l, world.cfg);
  const cues: BossCue[] = [
    {
      seat: s.watching,
      kind: "STILL",
      word: "STILL",
      x: eye.cx,
      y: stareGazeFootY(l),
      halfW: l.tile * HALF_W,
      halfH: l.tile * HALF_H,
      seed: 61,
    },
  ];
  // The lid's word goes out the moment a thumb is on the ring, the way the
  // sinew's does: the ring filling is the picture's own answer, and a word
  // under a hand already doing it would be the second prompt.
  if (s.lidSeat === 0) {
    const rest = stareLidRest(l, world.cfg);
    cues.push({
      seat: s.watching === 1 ? 2 : 1,
      kind: "CARRY",
      word: "SHUT",
      x: rest.x,
      y: rest.y,
      halfW: rest.r,
      halfH: rest.r,
      seed: 62,
      framed: false,
    });
  }
  return cues;
}

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
 * - **The trigger's own beat.** The plate is on her screen and not his
 *   (`showsShield`), so a `GUARD` that went out when the dome was under a rock
 *   would hand him the column he is never shown. BULB QUEEN's `GUARD` says
 *   nothing about *when* for this reason (`boss-cue-read.ts`); here there is no
 *   word at all, because the body under it is an ordinary rock.
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
