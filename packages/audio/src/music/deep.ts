/**
 * Three pieces for a deep sea underground: TIDE, CAVERN, SILT.
 *
 * The six in `themes.ts` can already say *deep* — `deepCurrent` turns a bass
 * figure over, `pressure` walks a saw down. What none of them can say is
 * **fluid**, and the reason is structural rather than a matter of taste: `line`,
 * `pulse` and `again` all take beat positions, so every note in every theme
 * sits on a grid, and water is not metrical. `drift.ts` is the answer and
 * carries the reasoning; `deep-cells.ts` holds the three instruments these
 * pieces added. Nothing in `cells.ts` or `themes.ts` changed shape — decision
 * 24, the owner decides later what is adopted, kept, reused or dropped.
 *
 * **The oscillator's own pitch does glide**, which was worth establishing
 * before designing around it. `Layer.freq` → `toFreq` survives into
 * `PlannedVoice` and `engine.ts` puts a real `exponentialRampToValueAtTime` on
 * the oscillator node — it is how `thud` falls through the floor. So the drift
 * did not have to hide in the filter and the amplitude: `SURGE` and `GLIMMER`
 * bend their actual pitch, and a body that will not hold a note is most of
 * what separates this from a pad.
 *
 * **For once the band rule and the mood want the same thing.** `band.ts` keeps
 * 300–3000 Hz clear because talking is the control scheme, and it fails a sound
 * that holds a tone in there. Water is broadband noise, which is exactly the
 * forbidden middle — so a water piece here has to be a low body and a high
 * glitter with a hole between them. That *is* deep water: a pressure rumble
 * under scattered high glints, with nothing in the middle because nothing in
 * the middle survives the distance. The next person will assume the band fought
 * this lane. It did not; it wrote the piece, and all three measure 0.00 seconds
 * per minute inside it.
 */

import { BELL, BREATH, DUST, GRIND, HEART, STAR, WASH } from "./cells.js";
import { GLIMMER, SPECK, SURGE } from "./deep-cells.js";
import { echo, wander } from "./drift.js";
import { line, type Note, type Theme } from "./model.js";

const join = (...parts: Note[][]): Note[] => parts.flat();

/**
 * The bed. Two slow swells on periods of 7 and 4.5 beats, which meet once
 * every 63 and so never inside the piece — the one theme here that does not
 * tell you where the beat is. There are two heartbeats in thirty-three seconds,
 * eleven beats apart, so that even the pulse misses.
 *
 * Eighteen onsets in thirty-three seconds, and every one of them six seconds
 * long, so there is almost always something sounding and almost never anything
 * landing. That length is what hides the loop: the piece is 22 beats and its
 * last swell starts on beat 21, so the tail runs four and a half seconds past
 * the point the player comes back to the top and overlaps the piece's own
 * opening. `test/deep.test.ts` measures the gaps and refuses one longer than a
 * second — a bed with a hole in it announces where the loop was. Measured, the
 * worst hole in it is 0.42 s.
 */
const tide: Theme = {
  id: "music.tide",
  title: "Tide",
  blurb: "Two low swells on rates that never meet, with far high glints falling between them.",
  use: "Under a wave that should feel submerged, and the title screen. It states no beat at all.",
  bpm: 40,
  beats: 22,
  notes: join(
    wander(SURGE, {
      from: 0,
      every: 7,
      count: 4,
      degrees: [0, 0, 5, 3, 7, 5],
      turn: 0.618,
      swell: 11,
      depth: 0.22,
      gain: 0.9,
    }),
    wander(SURGE, {
      from: 0.9,
      every: 4.5,
      count: 5,
      degrees: [7, 12, 10, 5],
      turn: 0.382,
      swell: 8.5,
      depth: 0.3,
      sway: 13,
      gain: 0.55,
    }),
    wander(WASH, {
      from: 4.9,
      every: 6.1,
      count: 4,
      degrees: [0, 2, 5, 3],
      turn: 0.723,
      swell: 6.7,
      depth: 0.35,
      sway: 9.3,
      gain: 0.5,
    }),
    wander(GLIMMER, {
      from: 2.6,
      every: 8.9,
      count: 3,
      degrees: [0, 7, 5, 12],
      turn: 0.618,
      swell: 9.7,
      depth: 0.3,
      sway: 7.1,
      gain: 0.6,
    }),
    wander(HEART, { from: 3, every: 11, count: 2, degrees: [0], turn: 0.5, gain: 0.4 }),
  ),
};

/**
 * Mythical rather than merely sad. The six existing themes sit on 0/3/5/7/10,
 * which is minor and familiar; this one opens the fourth and the fifth and
 * never fills them in — no third anywhere, so nothing resolves. The room is the
 * two echoes at 1.37 and 2.91 beats, neither a subdivision of anything, so the
 * reflections arrive from a wall whose distance you cannot work out.
 */
const cavernBells = wander(BELL, {
  from: 3,
  every: 5.7,
  count: 5,
  degrees: [12, 17, 7, 12, 19],
  turn: 0.618,
  swell: 12.3,
  depth: 0.25,
  sway: 8.9,
  gain: 0.7,
});

const cavern: Theme = {
  id: "music.cavern",
  title: "Cavern",
  blurb: "Open fourths and fifths hanging unresolved, each bell answered twice from further off.",
  use: "A boss below the floor, and the pause after one. Ancient is an interval, not a slower tempo.",
  bpm: 48,
  beats: 28,
  notes: join(
    line(GRIND, 0, 9, [0, 5, -5], { gain: 0.7 }),
    line(BREATH, 2, 13, [5, 7], { gain: 0.8 }),
    wander(SURGE, {
      from: 0.5,
      every: 6.5,
      count: 5,
      degrees: [0, 7, 5, 12],
      turn: 0.618,
      swell: 13,
      depth: 0.25,
      gain: 0.85,
    }),
    cavernBells,
    echo(cavernBells, 1.37, 0.4),
    echo(cavernBells, 2.91, 0.2),
    wander(STAR, {
      from: 1.8,
      every: 4.3,
      count: 6,
      degrees: [7, 12, 17, 5],
      turn: 0.382,
      swell: 10.1,
      depth: 0.3,
      sway: 11.3,
      gain: 0.5,
    }),
  ),
};

/**
 * Fluid made of grain rather than tone. Grains every 1.7 beats against ticks
 * every 1.1 — seventeen against eleven, so the two lines cross once in
 * eighteen and a half beats and the piece is 26 long, which means they never
 * cross twice in the same place. Written last and against
 * the test, because scattered noise is the one thing here that could walk into
 * the voice: everything in it is highpassed at 7.4 kHz or bandpassed above
 * 5 k, and the only body is a 41 Hz saw with its harmonics taken off.
 */
const silt: Theme = {
  id: "music.silt",
  title: "Silt",
  blurb: "Grain scattered on two rates that cross once a phrase, over a rumble too low to place.",
  use: "Under a wave in a flooded level, where something is stirred up and has not settled.",
  bpm: 84,
  beats: 26,
  notes: join(
    wander(SPECK, {
      from: 0,
      every: 1.7,
      count: 16,
      degrees: [0, 2, 5, 7],
      turn: 0.618,
      swell: 7.3,
      depth: 0.4,
      sway: 5.1,
      gain: 0.7,
    }),
    wander(DUST, {
      from: 0.37,
      every: 1.1,
      count: 22,
      degrees: [0, 3, 7],
      turn: 0.723,
      swell: 4.9,
      depth: 0.45,
      sway: 8.3,
      gain: 0.5,
    }),
    wander(WASH, {
      from: 0.9,
      every: 2.9,
      count: 9,
      degrees: [0, 2, 4],
      turn: 0.382,
      swell: 6.1,
      depth: 0.35,
      sway: 11.7,
      gain: 0.45,
    }),
    wander(GRIND, {
      from: 0.6,
      every: 5.3,
      count: 4,
      degrees: [0, -2, -5, -3],
      turn: 0.618,
      swell: 9.1,
      depth: 0.2,
      gain: 0.6,
    }),
  ),
};

/** In the order they are worth hearing: the bed first, then the room, then the grain. */
export const DEEP_THEMES: readonly Theme[] = [tide, cavern, silt];
