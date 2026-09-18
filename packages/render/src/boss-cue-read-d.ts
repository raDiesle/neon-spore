import type { StareState, World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import type { Layout } from "./layout.js";
import { stareLidRest } from "./stare-lid.js";
import { stareEye, stareGazeFootY } from "./stare-shape.js";

/**
 * **What THE STARE is asking for** — page four of the readings, opened for
 * the one boss whose cue is not a gesture.
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
