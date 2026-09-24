import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE HASP's latch and wheel, as rows of the ON THE FIELD tab.
 *
 * Two rows, one seat each, and they are the only pair here that are **worked
 * at the same time on purpose and do two entirely different things**. THE
 * GIMBAL's rims are offered together and have to agree; THE BELLOWS's bars
 * take turns and jam if they do not; THE SINEW's two add into one number.
 * These two are a hand that does nothing and a hand that does all of it: his
 * latch moves no part of the boss ever, and her wheel is the only thing that
 * opens a clasp — and her wheel only answers while his latch is down.
 *
 * So the fact the rows have to carry is a **level, not an act**. Nothing about
 * his row is a moment; there is no stroke in it, no edge, no threshold he
 * crosses to make something happen. What he is doing is *still doing it*, and
 * the only thing he can decide is when to stop, against a clock only he is
 * shown (`docs/spec/bosses.md` §11.37).
 *
 * **Neither row says how long his hand lasts**, because the two seats are not
 * shown the same clock: the heat is on his screen and the winding is on hers,
 * and the sentence the pair has to say is made of exactly those two numbers
 * being in one head each.
 */
export const HASP_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE HASP'S LATCH",
    where:
      "on the bar of the latch standing off the door of clasps hung over the middle of the field, on player 1's screen, from the beat a clasp lights until it swings — never while his hand is burnt, and never on a door already open",
    seat: "player 1 — the latch is the pilot's, fixed by the target's name and never negotiated, and it is drawn on his screen alone",
    gesture: "grab and drag",
    does:
      "Carries the latch **down** its bar, and the latch stands at the depth " +
      "the thumb has it. The act is a **level**: past haspGripMilli of " +
      "haspReachMilli he is holding, short of it he is not, and every tick " +
      "the wheel next door asks that one question and nothing else " +
      "(sim/hasp-hand.ts). It moves no part of the boss — the door does not " +
      "open, no clasp goes, nothing is spent. His hand burns haspHoldBeats " +
      "after he took hold, haspLastHoldBeats on the last clasp, and then it " +
      "is off the bar for haspBurnBeats whatever he does; a hand lifted and " +
      "put back is a fresh hold, which is the whole of what he can do about " +
      "it. **THE SLOW spans every grip**, for its fuse, and shuts the tick " +
      "the grip ends, so the two seats play the ask at the same slow rate. " +
      "No desk key: the bar is a carry, not a turn.",
    source: "handles.ts — haspHandleUnder() under handleUnder(); hasp-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "haspLatch",
    sends: ["drag"],
    pose: "HASP · THE LATCH UNDER A THUMB",
  },
  {
    name: "THE HASP'S WHEEL",
    where:
      "on the rim of the wheel across the door's face, on player 2's screen, whenever a clasp is lit — burnt latch or not, seized or free, because her place on the rim is what makes *go* one word",
    seat: "player 2 — the wheel is the navigator's, and she is never shown his latch nor he her rim",
    gesture: "grab and drag",
    does:
      "A **bearing** round the rim, THE GIMBAL's gesture and THE ORRERY's: " +
      "the grab carries none and every sample after it is where her thumb " +
      "is, so a finger four times round is four turns rather than none " +
      "(sim/bearing.ts). **It is wound by travel, not turned to a mark** — " +
      "haspWindMilli of turning for the first clasp and haspWindStepMilli " +
      "more for each after it, either way round, so there is no number she " +
      "has to be told and the thing she does is *keep turning*. The wheel " +
      "moves only while his latch is down: a rim turned against a lifted " +
      "latch **seizes**, and the turning is lost rather than banked. Her " +
      "place on the rim is not: the hand is still read, so the instant he " +
      "takes hold again the wheel picks up exactly where it stopped and her " +
      "thumb does not have to go back for it (sim/hasp-hand.ts). From the " +
      "second clasp a bolt works loose in the middle column and is shot with " +
      "either colour like anything else; haspBoltBeats unanswered is the " +
      "hull, which is the wave.",
    source: "handles.ts — haspRimUnder() under handleUnder(); hasp-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "haspWheel",
    sends: ["drag"],
    pose: "HASP · THE WHEEL UNDER A THUMB",
  },
];
