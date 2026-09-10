import type { GuideScene } from "../scene-types.js";

/**
 * THE TELL's rehearsal: it shows you what it is about to throw, and each of
 * you can see half of it.
 *
 * Three rungs rather than the ladder's five. The round is a climb and the film
 * is a picture of the rules: what a pair has to be shown is that the ring on
 * the boss is a *tell*, that the two halves of it are on two different
 * screens, and that one throw beats another. Five rungs of that is the round.
 *
 * The boss draws at random on a rung that answers nothing, so the seed is what
 * decides the three throws it makes — a bolt, then a plate, then a maw in
 * cyan, which the plate, the mouth and a cyan bolt answer in that order. Three
 * exchanges, one verb each, and each seat has thrown everything that is theirs
 * by the end of it: the pilot the plate and the mouth, the navigator the bolt.
 *
 * The navigator's third page is the throw the first two pages were reading
 * for. A thumb on a colour sends `prime` down and up, and the round hears the
 * lift as the bolt in that colour (`sim/tell-round.ts`) — the same lift that is
 * the shot everywhere else. It has to be **cyan**: the boss wears cyan on that
 * rung, a red bolt would splash off into a stand-off, and which colour it is
 * is the one thing only player 2's screen can see.
 */
export const THE_TELL: GuideScene = {
  ticks: 1500,
  bpm: 120,
  seed: 8,
  entries: [],
  boss: { kind: "tell", rungs: [{ beats: 4 }, { beats: 4 }, { beats: 4 }], beats: 40 },
  acts: [
    // Each throw inside its own exchange's window, which the round's own clock
    // fixes: four beats of lead, then four of tell, then the reveal. The boss
    // draws at random on a rung that answers nothing, so the seed is what
    // makes it a plate, then a mouth, then a bolt — one throw each, which is
    // the only reason there are three rungs here. The colour is a tap on the
    // lobe: the press starts the fill and the lift, six ticks on, is the shot.
    { tick: 380, control: "guard" },
    { tick: 800, control: "intake" },
    { tick: 1220, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "PLAYER 2 SEES THE COLOUR", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "THE PLATE BEATS A BOLT",
      anchor: { at: "control", control: "guard" },
    },
    { tick: 480, seat: 2, text: "ONLY THEY SEE THE LOBE", anchor: { at: "body" } },
    {
      tick: 690,
      seat: 1,
      text: "THE MOUTH DRINKS A PLATE",
      anchor: { at: "control", control: "intake" },
    },
    {
      tick: 1080,
      seat: 2,
      text: "THE CYAN BOLT FILLS A MOUTH",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
