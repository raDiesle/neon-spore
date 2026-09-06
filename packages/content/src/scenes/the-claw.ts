import type { GuideScene } from "../scene-types.js";

/**
 * THE CLAW's rehearsal: one of you has every button and none of the map.
 *
 * The field is gone. A rail over a row of sockets, a claw hanging from it, and
 * the wreckage buried underneath — player 2 is shown what is in every socket
 * and has no control at all, player 1 has all three and is shown nothing but
 * the sockets. It is the only panel in the game where one seat's half is
 * empty, and the film has to say that in as many words or a pair will spend
 * the first grab looking for a button that is not there.
 *
 * So the first two pages are the same rail on the two phones, which is the
 * shape every film about a split ends up with, and here it is the whole wave.
 * Then he walks the claw two sockets on her word and drops it.
 *
 * **Two steps and a grab, not one step and a grab.** A single press would read
 * as *she names it and he presses once*, which is what THE FLEET's chart lets
 * a pair do and what this round has no vocabulary for. Two is the smallest
 * number that shows counting, and counting out loud is all either of them has.
 *
 * **And then the wreck moves, and the film lets it.** The drift falls on beat
 * ten, which is between the second step and the drop, so the pair arrives on a
 * socket that is empty by the time they get there and has to be sent one back.
 * That is not the film being unlucky — it is the round's one idea, and a
 * rehearsal that grabbed cleanly would have taught THE FLEET instead. The page
 * over it says the two things a pair has to learn together: *it moved*, and
 * *only one of you can tell*.
 *
 * **The claw opens on an empty socket**, and that is the round's own doing
 * rather than the film's — `clawDeal` holds the middle back from the deal, so
 * a first grab pressed without a word said can never come up holding anything
 * (`sim/claw-field.ts`). The film walks away from it for the reason THE
 * FLEET's walks away from its opening square: a round teaches the opposite of
 * itself when the untaught move happens to work.
 */
export const THE_CLAW: GuideScene = {
  ticks: 1020,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "claw" },
  acts: [
    // Two sockets right, then one back left after the field has shifted under
    // them, then the drop. Nothing here is held: a step is one socket and a
    // grab is one drop (`content/src/control-command.ts`).
    { tick: 480, control: "clawRight" },
    { tick: 545, control: "clawRight" },
    { tick: 700, control: "clawLeft" },
    { tick: 880, control: "clawGrab" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "PLAYER 2 SEES THE WRECKS", anchor: { at: "hull" } },
    { tick: 210, seat: 1, text: "PLAYER 1 SEES ONLY SOCKETS", anchor: { at: "hull" } },
    {
      tick: 430,
      seat: 1,
      text: "PLAYER 1 COUNTS IT ACROSS",
      anchor: { at: "control", control: "clawRight" },
    },
    {
      tick: 640,
      seat: 1,
      text: "IT MOVED — ONE BACK LEFT",
      anchor: { at: "control", control: "clawLeft" },
    },
    {
      tick: 830,
      seat: 1,
      text: "PLAYER 1 DROPS ON THEIR WORD",
      anchor: { at: "control", control: "clawGrab" },
    },
  ],
};
