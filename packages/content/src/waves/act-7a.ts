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
 * the **steering** and leaves the trigger: the same thing hangs from the top
 * of the field, its beam is on the cannon strip, and for the whole wave the
 * strip is dead and the cannon walks wall to wall a column a beat
 * (`sim/malfunction.ts`, `steerCol`). Nothing falls to cause it and nothing
 * gets it off — a fault, THE JAM's and THE COIL's kind, authored on the wave
 * and not a body — so the answer is not a place to stand but a beat to
 * fire on. Player 2 fires from a cannon neither of them is steering, on the
 * beat it passes under a body; player 1, the only seat shown the light
 * along the hull toward the column it steps to next (`render/choke-hull.ts`),
 * calls that column ahead. The mistake it punishes is a trigger that waits
 * for a cannon that is not coming back, and a pilot who says nothing
 * because there is nothing to press.
 *
 * It was a body once — a strand that fell, took the cannon, and was tapped
 * off — and the owner asked for it to be the same kind of thing as the
 * other two faults. The tap-off is on the NOT BUILT YET page.
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
 * 1. Beats 0–8, plain bodies down the lanes the cannon walks through in
 *    its first sweep, so the first pass is a shot that can be made.
 * 2. Beats 14–30, bodies further from the middle, timed a beat or two off
 *    the cannon's pass under them, so player 2 has to wait a pass or fire
 *    early rather than on sight.
 * 3. Beats 38–48, two at once on opposite walls: only one is under the
 *    cannon this sweep, and which is player 1's call.
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
      "The one where the gun steers itself, and a trigger that waits for it to come back is the mistake.",
    guide: {
      both: "Something is hanging from the top of the field, and it has the steering. Its beam is on the cannon strip, and the cannon walks by itself, a column a beat, wall to wall and back, for the whole wave. The strip is dead and nothing reaches the thing holding it. The trigger still works.",
      p1: "You cannot steer. The light off the cannon shows you where it goes next, and only you see it: call the column it will be under on the next beat, out loud, before it gets there — and say when it turns at a wall.",
      p2: "Your trigger works and the cannon is walking. Fire on the pass: the shot that lands is the one fired on the beat the cannon is under a body, so wait for the call, not the sight of it.",
    },
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 5, color: "cyan" },
      { beat: 8, col: 2, color: "red" },
      { beat: 14, col: 1, color: "cyan" },
      { beat: 20, col: 6, color: "red" },
      { beat: 26, col: 3, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
      { beat: 42, col: 6, color: "red" },
      { beat: 44, col: 0, color: "cyan" },
      { beat: 48, col: 2, color: "cyan" },
    ],
    malfunction: { kind: "steer" },
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
