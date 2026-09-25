import type { SpliceState, StareState, World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import type { Layout } from "./layout.js";
import { stareLidRest } from "./stare-lid.js";
import { stareEye, stareGazeFootY } from "./stare-shape.js";

/**
 * **What the bosses whose ask is a stop are asking for** — page four of the
 * readings, opened for THE STARE. THE SPLICE joined it on 19 September 2026
 * with a `WAIT` and left it silent on 25 September (below).
 *
 * The three pages before this one each mark the place a thumb goes; THE
 * STARE's word marks a place a thumb must **not**. What it wants from the
 * watched seat is that no thumb goes anywhere for as long as the look lasts,
 * so it is the fifth kind (`boss-cue.ts`, `CueKind`), the one the simulation
 * can tell was *not* done — and here the stillness is the rule itself, which
 * the picture alone does not say. Its gesture is the lid, below.
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
 * **THE SPLICE says nothing, since 25 September 2026.** A `WAIT` rode the
 * number down its straw, on the seat holding the maw, for the beats a second
 * suck would do nothing. The owner took it off: *for the player it is clear to
 * wait* — the number is in the air, on the curve she has been tracing, and the
 * frame round it only covered the thing she was watching.
 *
 * **And what it never said.** Four silences, and they were most of the design.
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
  _l: Layout,
  _world: World,
  _s: SpliceState,
  _beatPhase: number,
): readonly BossCue[] {
  return [];
}
