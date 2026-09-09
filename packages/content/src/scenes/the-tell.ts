import type { GuideScene } from "../scene-types.js";

/**
 * THE TELL's rehearsal: it shows you what it is about to throw, and each of
 * you can see half of it.
 *
 * Two rungs rather than the ladder's five. The round is a climb and the film is
 * a picture of the rules: what a pair has to be shown is that the ring on the
 * boss is a *tell*, that the two halves of it are on two different screens, and
 * that one throw beats another. Five rungs of that is the round.
 *
 * The boss draws at random on a rung that answers nothing, so the seed is what
 * decides the two throws it makes — a bolt and then a plate, which the plate
 * and the mouth answer in that order. Two exchanges, one verb each, and the
 * pilot has met both of the throws that are theirs by the end of it.
 *
 * The navigator's two pages are the reading rather than a throw, and that is
 * **not** the shape this film should have. Their bolt is their only throw, and
 * a scene cannot make one: a thumb on a colour sends `prime`, and
 * `tell-round.ts` only hears `{kind:"fire"}`, which nothing but the swipe on
 * the ship sends — so the trigger on the round's own panel does not reach the
 * round at all. That is a defect in the round and not in the film;
 * `docs/queue.md` carries it, and the page to add here once it is fixed is the
 * navigator throwing the colour they alone can see.
 */
export const THE_TELL: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 8,
  entries: [],
  boss: { kind: "tell", rungs: [{ beats: 4 }, { beats: 4 }], beats: 40 },
  acts: [
    // Each throw inside its own exchange's window, which the round's own clock
    // fixes: four beats of lead, then four of tell, then the reveal. The boss
    // draws at random on a rung that answers nothing, so the seed is what
    // makes it a plate and then a mouth — one throw each, which is the only
    // reason there are two rungs here.
    { tick: 380, control: "guard" },
    { tick: 800, control: "intake" },
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
  ],
};
