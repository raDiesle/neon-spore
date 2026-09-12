import type { GuideScene } from "../scene-types.js";

/**
 * THE DART's rehearsal: the column you were given is the column it has already
 * left.
 *
 * A dart never falls straight. Every other beat it takes a diagonal two rows
 * down and two columns to one side, and in between it hangs for a beat with
 * the next side already decided (`sim/dart.ts`). Only player 2 is shown which
 * way, so the column player 1 has to be standing in is a column only the other
 * seat can name — and it expires while it is being said.
 *
 * The first two pages are the same instant on the two phones, which is the
 * shape every film about a split ends up with: an arrow over the body on hers,
 * a body and nothing else on his. Then he moves to where it is *going* rather
 * than to where it is, waits a beat for it to arrive there, and she fires.
 *
 * **The cannon is early on purpose.** It reaches the column a beat before the
 * dart does and stands there — *be standing there before the beat turns
 * over*. A film that slid the cannon across as the dart landed would be
 * showing a reaction, and a reaction is exactly what this wave has taken away.
 * It was two beats early until the pages about the body were made to hold
 * with it in the middle of the screen (12 September 2026); the beat that
 * went was the one between the slide and the hang it is standing under.
 */
export const THE_DART: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  // Column 2 rather than the middle: this seed's dart, started there, hangs in
  // the middle column from beat six to beat eleven and then steps to the one
  // the cannon can be authored into — measured, like the columns below.
  entries: [{ beat: 0, col: 2, kind: "dart", color: "red" }],
  acts: [
    // Authored column 4 is where the dart hangs on beats twelve and thirteen.
    // Which side it takes is drawn from the seeded rng rather than authored —
    // that is the creature — so the number here is a measurement of this
    // seed's dart and not a decision. `test/scenes.test.ts` walks the whole
    // film and fails if the shot ever stops landing, which is what makes a
    // measured number safe to write down.
    { tick: 660, control: "cannon", col: 4 },
    // Forty ticks after its page opens rather than the beat and a half every
    // other press waits: the hang the bolt has to meet ends at 840, and the
    // three pages before this one are each at the shortest a page may be.
    { tick: 820, control: "fireRed" },
  ],
  // The two pages about the body hold with it on rows six and ten — the
  // middle of the screen, where the owner asked for the explained enemy to
  // stand when a tutorial stops. Every page is at the shortest a page may be,
  // because the shot has to land on the last hang before the hull.
  steps: [
    { tick: 0, seat: 2, text: "PLAYER 2 SEES THE SIDE", anchor: { at: "body" } },
    { tick: 420, seat: 1, text: "PLAYER 1 SEES ONLY A BODY", anchor: { at: "body" } },
    {
      tick: 600,
      seat: 1,
      text: "STAND WHERE IT IS GOING",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 780,
      seat: 2,
      text: "PLAYER 2 FIRES RED",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
