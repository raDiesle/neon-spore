import type { Wave } from "../wave-types.js";

/**
 * One wave, between the two halves of act seven: **THE CHOKE**.
 *
 * `7a` for `act-7b.ts`'s reason — the order of the files is the order of the
 * game, and this one stands after THE COIL and before THE TWITCH, which is
 * where the owner put it. Its own file rather than a fourth entry in either
 * neighbour because both are at the 250-line ceiling and neither has room
 * for a wave carrying a guide.
 *
 * It is the third thing the act's faults can do to a control, and the one
 * the two before it leave open. THE JAM took the trigger and left the
 * steering; THE COIL took the trigger the other way, stuck down. This takes
 * the **steering** and leaves the trigger: a strand falls, cannot be shot or
 * warded, lands, and takes the cannon by the throat — the strip is dead and
 * the cannon walks wall to wall a column a beat — and the answer is not a
 * place to stand but a thing to keep doing. Player 1 taps the dead strip, a
 * lift between each, `chokeTaps` times; player 2 fires from a cannon neither
 * of them is steering, on the beat it passes under a body. The mistake it
 * punishes is a thumb that taps once and waits, and a trigger that waits for
 * a cannon that is not coming back (`sim/choke.ts`).
 *
 * 1. Beats 0–4, two plain bodies, so the strip is used once before it is
 *    taken and the pair has a cannon to miss.
 * 2. Beat 6, the choke, alone, down the middle. It lands around beat 21 and
 *    from there the cannon is walking; a body every few beats after it gives
 *    player 2 something to hit on the pass while player 1 taps.
 * 3. Beat 38, a second one, so a pair that got the first off quickly is
 *    asked to do it again with less room — and a pair that did not has two
 *    on the hull, the second waiting for the first to let go.
 *
 * The prose about the wave lives **here, above the array**, and not beside
 * the entry: `tools/director/src/serialize.ts` regenerates everything from
 * `export const WAVES_ACT_7A` down every time somebody saves a wave in the
 * editor, and a comment inside the array is gone the first time they do.
 */
export const WAVES_ACT_7A: Wave[] = [
  {
    id: "theChoke",
    name: "THE CHOKE",
    sentence:
      "The one where the gun steers itself, and a thumb that taps once and waits is the mistake.",
    guide: {
      both: "A strand falling straight down one lane. No shot touches it and the shield does not stop it: it lands on the ship and takes the cannon. The cannon strip goes dead and the cannon walks wall to wall, a column a beat, until it is off. Getting it off takes both of you — one tapping, the other still firing.",
      p1: "You cannot steer. Tap the dead strip, lift, tap again — every tap loosens its grip by one and it takes more than thirty. Count out loud, so player 2 knows when the cannon is yours again.",
      p2: "Your trigger still works and the cannon is walking. Fire on the pass: watch which column it will be in on the next beat, and call the bodies out loud — player 1 is looking at the strip, not the field.",
    },
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 5, color: "cyan" },
      { beat: 6, col: 3, kind: "choke", color: null },
      { beat: 14, col: 2, color: "red" },
      { beat: 18, col: 5, color: "cyan" },
      { beat: 24, col: 3, color: "red" },
      { beat: 28, col: 0, color: "cyan" },
      { beat: 32, col: 6, color: "red" },
      { beat: 38, col: 1, kind: "choke", color: null },
      { beat: 42, col: 4, color: "cyan" },
      { beat: 48, col: 2, color: "red" },
      { beat: 54, col: 5, color: "cyan" },
      { beat: 58, col: 3, color: "red" },
    ],
  },
];
