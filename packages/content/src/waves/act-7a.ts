import type { Wave } from "../wave-types.js";

/**
 * Three waves, between the two halves of act seven: **THE CHOKE**, then
 * **THE LIMPET** and **THE LEECH**.
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
 * **THE LIMPET and THE LEECH are the fourth thing**, and the one that makes
 * *standing still* the mistake. Each falls like the choke, cannot be shot or
 * warded, lands, and takes hold of a control — the limpet the plate, the
 * leech the cannon — and from then on it is a fuse that runs while that
 * control stands in one column and is put back by a beat it stands in
 * another; `limpetStillBeats` of them is a heavy hit on the hull and the wave
 * lost, `limpetShakeMoves` moves and it lets go. What the two waves teach is
 * the split: the seat that moves the control is not shown the fuse, and the
 * seat that is shown it has nothing to press — the word *move*, said by the
 * one who can see the count to the one who can move, is the whole answer
 * (`sim/cling.ts`, `render/cling-fuse.ts`). THE LIMPET carries rocks,
 * because a rock is the thing that asks the plate to *stand* somewhere, and a
 * plate that has to meet a rock and be gone on the next beat is the lesson
 * with its teeth in; THE LEECH carries ordinary targets for the same reason —
 * parking the cannon under a body to line the shot up is the thing it
 * punishes. Both are on the standard panel: nothing new is pressed.
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
      { beat: 6, col: 3, kind: "choke", color: null },
      { beat: 14, col: 2, color: "red" },
      { beat: 18, col: 5, color: "cyan" },
      { beat: 38, col: 1, kind: "choke", color: null },
      { beat: 42, col: 4, color: "cyan" },
      { beat: 48, col: 2, color: "red" },
    ],
  },
  {
    id: "theLimpet",
    name: "THE LIMPET",
    sentence: "The one where a plate that stands still is the mistake.",
    guide: {
      both: "A round body with hooks, falling straight down one lane. No shot touches it and the shield does not stop it: it lands on the ship and takes hold of the plate. From then on it is counting, and it counts while the plate stands still — every beat the plate is found in the column it was in a beat before is one more, and when the count runs out it goes off against the hull and the wave is over. A beat the plate is somewhere new puts the count back and loosens it by one; enough of those and it lets go.",
      p1: "You can see the count — the row of lights over the body, going out one a beat. Player 2 cannot. Say *move* the moment it is on the plate and keep saying it; when the lights are down to two, shout it.",
      p2: "You cannot see how long you have. Keep the plate moving, a column a beat, and do not park it — not even under a rock. Meet the rock on the beat it lands and be gone on the next.",
    },
    entries: [
      { beat: 0, col: 2, kind: "meteor", color: null },
      { beat: 6, col: 3, kind: "limpet", color: null },
      { beat: 16, col: 1, kind: "meteor", color: null },
      { beat: 22, col: 5, kind: "meteor", color: null },
      { beat: 30, col: 2, kind: "meteor", color: null },
      { beat: 34, col: 4, kind: "limpet", color: null },
      { beat: 44, col: 0, kind: "meteor", color: null },
      { beat: 50, col: 5, kind: "meteor", color: null },
    ],
  },
  {
    id: "theLeech",
    name: "THE LEECH",
    sentence: "The one where a cannon that stands still is the mistake.",
    guide: {
      both: "The same body on the cannon, four needles instead of hooks: it lands wherever the cannon is and drives them into the swelling. It counts while the cannon stands in one column, and when the count runs out it goes off against the hull and the wave is over. A beat the cannon is found in a new column puts the count back and loosens it; enough of those and it comes off.",
      p1: "You cannot see the count. Keep the cannon walking, a column a beat — parking it under a body to give player 2 the shot is the mistake. Fire comes from wherever it is.",
      p2: "You can see the count over the body and player 1 cannot. Say *move* while it is on, and how many lights are left. Fire on the pass, and call the bodies so player 1 walks the cannon through them.",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 1, color: "cyan" },
      { beat: 8, col: 4, kind: "leech", color: null },
      { beat: 18, col: 0, color: "red" },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 28, col: 2, color: "red" },
      { beat: 36, col: 2, kind: "leech", color: null },
      { beat: 42, col: 5, color: "cyan" },
      { beat: 48, col: 1, color: "red" },
    ],
  },
];
