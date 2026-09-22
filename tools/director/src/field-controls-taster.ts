import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE TASTER's three thumbs on its own fan**, in a file of its own, the
 * split every boss since THE INSTAR has made.
 *
 * Three rows on three targets, and the first set here that is **one hand per
 * movement**: the pin is offered only while the fan is `fanning`, the wipe
 * only while it is `hurrying`, the pry only on the `closed` interlock. No two
 * of them are ever on a screen together, so the fan can hand each of them the
 * whole crest rather than a corner of it — and each ring stands where its own
 * movement's problem is.
 *
 * The boss's own split is **two numbers and not two pictures**: the fan is
 * drawn whole on both phones, and what differs is the ledger on hers and the
 * column coming next on his (`render/taster-read.ts`). That is why the seat
 * column below reads like a division of labour rather than of the screen — the
 * question was never which seat can *see* a blade, only which seat's hand the
 * movement wants.
 *
 * **The rules shipped first and the pictures came after.** All three gestures
 * were heard by `sim/taster-hand.ts` from 18 September 2026 with nothing drawn
 * to take hold of, which is why there were no rows here and
 * `on-field-controls.test.ts` had `tasterBlade`, `tasterGap` and `tasterLock`
 * as `unbuilt`.
 */
export const TASTER_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE TASTER'S PIN",
    where:
      "on the root of a blade that is out of the crest and has not decided " +
      "yet — the ring covers the bottom third of it and leaves the tip and " +
      "its lit edge standing, because that edge is the one thing both seats " +
      "read off this boss. Only while the fan is fanning, which is when three " +
      "blades grow at once (render/taster-grip.ts)",
    seat: "player 1 only — his spare thumb, while his hands are the cannon",
    gesture: "grab and drag",
    does:
      "Pins that blade out of its decision: the press alone does it, and it " +
      "holds for tasterPinBeats (sim/taster-hand.ts, tasterPinnable). Three " +
      "blades grow at once in this movement and all three read the same " +
      "ledger, so all three arrive in one colour — the pin is the window the " +
      "navigator turns that ledger over in. One pin: a thumb landing on a " +
      "second growing blade moves it and the count starts again. Held past " +
      "the count the blade decides anyway and comes up thick, so it is a bet " +
      "and not a pause — which is what its dial says, filling toward the beat " +
      "the bet is lost.",
    source: "touch.ts — tasterGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "tasterBlade",
    sends: ["drag"],
    pose: "THE TASTER · FANNING",
  },
  {
    name: "THE TASTER'S WIPE",
    where:
      "in the air just above the notch a blade was struck off in, one ring " +
      "per gap — over the notch rather than on it, so the row of them never " +
      "covers how wet the gaps are, which is the fight's own progress bar. " +
      "Only while the fan is hurrying, and only until the crest is cut " +
      "through for good (render/taster-grip.ts)",
    seat: "player 2 only — the seat whose colours the boss is tasting",
    gesture: "grab and drag",
    does:
      "Cuts that soft column by hand: a carry of at least tasterWipeMilli " +
      "across it, either way, and the crest takes the same cut a bolt would " +
      "make (sim/taster-hand.ts, tasterWipable). **The only cut in this fight " +
      "that spends no colour at all** — every shot into a soft column is a " +
      "colour the boss then tastes, so the pair's own cutting is what keeps " +
      "re-edging the fan they are cutting to stop, and this is the answer to " +
      "that trap. One cut per grab: the ring's dial fills when this carry has " +
      "spent its cut, and the next one wants the thumb up and down again.",
    source: "touch.ts — tasterGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "tasterGap",
    sends: ["drag"],
    pose: "THE TASTER · HURRYING",
  },
  {
    name: "THE TASTER'S PRY",
    where:
      "on the middle of the crest, under the last blades where they lean " +
      "across each other — the column the fight's own event names. Only while " +
      "the interlock is closed, and it goes out the instant the interlock " +
      "stands open (render/taster-grip.ts)",
    seat: "player 1 only — one seat hauls, the other has to be free to fire",
    gesture: "grab and drag",
    does:
      "Hauls the interlock apart: a carry of tasterPryMilli **downward** from " +
      "where he grabbed — a carry upward is no carry — and the last blades " +
      "stand open for tasterPryBeats (sim/taster-hand.ts, tasterPryable). " +
      "Inside that window the navigator's beam, in the colour the ledger says " +
      "they have spent least of, is what finishes the fight; outside it " +
      "nothing reaches the body at all. He may let go the moment it is open, " +
      "because the window is a beat count and not a hold and his hands are " +
      "still the cannon she is firing over. The dial is the carry itself, and " +
      "a second one inside the window is refused rather than restarting it.",
    source: "touch.ts — tasterGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "tasterLock",
    sends: ["drag"],
    pose: "THE TASTER · CLOSED",
  },
];
