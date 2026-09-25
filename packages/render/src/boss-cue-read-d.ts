import type { SpliceState, StareState, World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import type { Layout } from "./layout.js";
import { spliceFlightAt, spliceMouthR, spliceMouthY } from "./splice-straws.js";
import { stareLidRest } from "./stare-lid.js";
import { stareEye, stareGazeFootY } from "./stare-shape.js";

/**
 * **What the bosses whose ask is a stop are asking for** — page four of the
 * readings, opened for THE STARE and joined on 19 September 2026 by THE
 * SPLICE, whose one word is the same kind.
 *
 * The three pages before this one each mark the place a thumb goes; the two
 * words that open this one mark a place a thumb must **not**. What THE STARE
 * wants from the watched seat is that no thumb goes anywhere for as long as the
 * look lasts, and what THE SPLICE wants from the seat holding the maw is that it
 * is not pressed a second time while the answer to the first is still coming
 * down — so both are the fifth kind (`boss-cue.ts`, `CueKind`), the one the
 * simulation can tell was *not* done. Each page has a gesture of its own beside
 * it: THE STARE's lid, below, and on THE SPLICE nothing at all, which is the
 * argument over `spliceCues`.
 *
 * **When THE STARE's may be said, and when it may not.** The eye's tell — the seven
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
 * **How far the frame reaches from the number in flight**, in tiles.
 *
 * Not THE CHOIR's `HALF_W`/`HALF_H` above, which are a body's: what this mark
 * stands on is a coin with one digit in it, `spliceNumberAt` drawn at a little
 * under half a tile (`splice-draw.ts`), and a frame of a body's width round it
 * would read as a frame round the *straw* — which is a line the navigator is
 * tracing and the one thing on this field a box must not claim.
 */
const TOKEN_HALF = 0.45;

/**
 * **THE SPLICE.** One word, and it is the fifth kind: `WAIT` over the number
 * coming down its straw, on the seat holding the maw. Everything else this
 * fight could be told is the answer to it.
 *
 * **The panel, first, because the boss's own file had it the wrong way round
 * until 19 September 2026** (`sim/splice.ts`, `content/src/scenes/the-splice.ts`).
 * The strip is player 1's and the **only** SUCK is player 2's — `["cannon",
 * "mawTake"]`, THE CLAW's arrangement reached from the other end
 * (`content/src/control-sets-table.ts`) — and player 2 is also the seat shown
 * the tangle, the numbers and the round's clock (`showsSpliceTangle`). So the
 * one press in the fight is hers, she is shown no cannon at all, and he is
 * shown a hand's width of straw over each mouth and nothing above it. A feed is
 * two sentences, *the third mouth from the left* and *I am on it*, and neither
 * seat can say both.
 *
 * **`WAIT`, for the beats a number is in the air.** `spliceHeard` drops a suck
 * while `feedFrom` is set, because a maw with something already coming down it
 * is busy: for `spliceFeedBeats` her one button does nothing at all
 * (`sim/splice-round.ts`). That is the trigger that has quietly stopped working
 * which this whole family exists to say, and on this boss it is also the
 * failure the film was built around — *a pair that presses again while one is
 * in the air has not understood that the answer is still coming*
 * (`content/src/scenes/the-splice.ts`). The word is not the kind here, unlike
 * THE STARE's and THE LEAD's: this stillness has an end she can see coming, so
 * `STILL` says which of the five it is and the verb says what to do with the
 * three beats.
 *
 * **The mark rides the number and never the mouth.** It is put at
 * `spliceFlightAt`, the same point the picture draws the token at, so the frame
 * is *on* the thing she is already watching and moves with it. A frame on the
 * mouth the number is coming **to** was the obvious place and is forbidden: it
 * would stand there from the first beat of the flight and trace the straw to
 * its end for her, and tracing the straw is the entire fight. On the token
 * nothing is given away that her own picture has not already given — the digit
 * leaves its top end when the feed starts (`drawNumbers`) and the curve it
 * rides is the curve she has been following.
 *
 * **The last stretch is written over the mark and not under it.** A flight
 * ends with the number sitting in the mouth it was fed to, so the verb hung
 * `halfH + WORD_GAP` under the token spent its final beat across the mouth's
 * own ring — a smear, and a smear at the moment a thumb is likeliest to press
 * again, which is the whole of what the word is for. The top of that ring is
 * this cue's `wordFloor`, and the flip `cueWordY` already had for the plating
 * does the rest: `WAIT` steps over the coin for the last stretch and `STILL`
 * follows it up. The mouths are two tiles clear of the hull, so the default
 * floor `bossCue()` stamps on says nothing about them — seen at tempo, 21
 * September 2026.
 *
 * **And it is hers because it could not be his.** On his screen the straw above
 * the mouths does not exist and neither does the number on it until the last
 * stretch (`drawFlight`), so a word there would hang over an empty field; and
 * the three beats are not his to wait through at all — the maw being busy is
 * exactly when he should be sliding to the mouth she names next, which is the
 * guide's sentence and not the field's.
 *
 * **What it never says.** Four silences, and they are most of the design.
 *
 * - **No `SUCK`.** The verb of the fight has one place — the mouth the cannon
 *   is standing under — and she is not shown the cannon. A mark there would
 *   hand her his half of the sentence, and a word that went out only while he
 *   was under a mouth would hand her the same thing by its own absence, which
 *   is THE LEAD's finding (`boss-cue-read-c.ts`).
 * - **Nothing to the pilot, ever.** His gesture is the carry and *which mouth*
 *   is the whole of the answer; the picture already refuses to mark the one
 *   owed on either screen (`drawMouths`), and a cue would be that refusal
 *   undone.
 * - **Nothing about the clock.** `N OF M · beats left` is drawn on her screen
 *   alone and reddens at four (`drawClock`), and a hurry-up on his would be her
 *   gauge read out on his glass — THE SURGE's rule (`surge-word.ts`).
 * - **Nothing on the verdict or the settle.** Both are drawn to both seats, the
 *   burst on the mouth and every ring and digit turning good, and a word over a
 *   round already won is a word about nothing.
 */
export function spliceCues(
  l: Layout,
  world: World,
  s: SpliceState,
  beatPhase: number,
): readonly BossCue[] {
  const at = spliceFlightAt(l, world.cfg, s, world.beat + beatPhase);
  if (at === null) return [];
  return [
    {
      seat: 2,
      kind: "STILL",
      word: "WAIT",
      x: at.x,
      y: at.y,
      halfW: l.tile * TOKEN_HALF,
      halfH: l.tile * TOKEN_HALF,
      seed: 93,
      wordFloor: spliceMouthY(l, world.cfg) - spliceMouthR(l),
    },
  ];
}
