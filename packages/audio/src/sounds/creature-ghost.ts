import { after, air, metal } from "../grain.js";
import type { SoundDef } from "../types.js";

/**
 * THE GHOST, heard — and the only creature in the game with three voices.
 *
 * Its own file rather than three more rows in `creature.ts`, which was at its
 * 250-line limit the day these arrived. The seam is the honest one: every
 * entry next door is *one* creature's own-motion, a single sound standing for
 * a whole body, and the three here are three moments of one creature that the
 * pair has to be able to tell apart while looking at something else. Two of
 * them are heard by a player who cannot see the thing making them, which is a
 * constraint no other sound in the catalogue is written under.
 *
 * **The pan is the thing to be careful about.** Player 1 is never told which
 * column a ghost is in, and a cue panned to where it happened is that column
 * said in sound — so `bind-creatures.ts` gives the turn no pan at all. The
 * other two happen on beats the body is visible on both screens, and are
 * placed like anything else.
 */
export const CREATURE_GHOST_SOUNDS: SoundDef[] = [
  {
    id: "creature.ghostRelease",
    family: "creature",
    blurb: "A knot letting go: a rush of air rising, thinning as it climbs, and gone.",
    status: "bound",
    use: "THE GHOST, shot — the body lets go and climbs out of the top of the field (`ghostRelease`). Both devices, because it is the one moment player 1 sees the thing they have been firing at.",
    level: 0.28,
    layers: [
      // The body, going out of it: down and fluttering, and kept under 300 Hz
      // where every body in this catalogue lives.
      {
        source: "sine",
        freq: 260,
        toFreq: 70,
        gain: 0.4,
        attack: 0.02,
        hold: 0.04,
        release: 0.32,
        filter: { type: "lowpass", freq: 300, toFreq: 140, q: 1.2 },
        wobble: { rate: 11, cents: 90 },
      },
      // And the climb, which is the half that has to *rise* — nothing else in
      // this catalogue does. It is carried above the voice rather than through
      // it: the same split the whole palette is built on, a body below the
      // band and the movement above it.
      air(5600, 9000, 0.3, 0.22, 2),
    ],
  },
  {
    id: "creature.ghostTurn",
    family: "creature",
    blurb: "A held breath turning over: one dull knock, and something tightening under it.",
    status: "bound",
    use: "A crossing ghost reaching a wall and turning back (`ghostTurn`). Dead centre on both devices — a pan would say which wall, and the column is the one thing player 1 is not told.",
    level: 0.22,
    layers: [
      metal(90, 0.18, 0.4, 200),
      after(0.06, {
        source: "triangle",
        freq: 150,
        toFreq: 190,
        gain: 0.35,
        attack: 0.03,
        hold: 0.06,
        release: 0.2,
        filter: { type: "lowpass", freq: 420, q: 1.6 },
      }),
    ],
  },
  {
    id: "creature.ghostCharge",
    family: "creature",
    blurb: "Patience running out: a low tone dropping away under a short, bright intake.",
    status: "bound",
    use: "A crossing ghost giving up on prowling and coming down at the ship (`ghostCharge`). Both devices and no longer a secret — this is the beat it stops hiding on either screen.",
    level: 0.34,
    layers: [
      // A saw is its fundamental plus everything over it, so the lid comes
      // down hard: at 260 Hz falling to 110 the whole thing stays under the
      // voice, which is `metal`'s own argument next door made by hand because
      // this one has to *slide* rather than ring.
      {
        source: "sawtooth",
        freq: 180,
        toFreq: 62,
        gain: 0.42,
        attack: 0.02,
        hold: 0.08,
        release: 0.34,
        filter: { type: "lowpass", freq: 260, toFreq: 110, q: 2.2 },
      },
      // The intake over the top of it, above the band rather than across it.
      after(0.04, air(7200, 5600, 0.24, 0.24, 1.8)),
    ],
  },
];
