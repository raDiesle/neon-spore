import type { GuideScene } from "../scene-types.js";

/**
 * THE THROAT's rehearsal: what it takes, and the one thing that hurts it.
 *
 * The mouth stands still in the middle lane (`throatHomeCol`) and inhales every
 * six beats from beat 0, so the film runs on that clock. A red creature falls
 * down the mouth's own column and stops at its row, and player 2 shoots it
 * before the inhale at beat 12 — the shot leaves at tick 630 and reaches row
 * five with forty ticks to spare, which is the *clear that column before the
 * count runs out* of the guide. A rock is dropped down the same column and
 * left: it stops at beat 16 and the inhale at 18 takes it, and nothing heals
 * because nothing is slack yet. Then the gum: a hand on it is the fling and
 * not a brake, so it keeps falling under the thumb, and the carry has to be
 * finished on the beat it reaches the mouth's row (`carryGrips` settles a
 * carry on the beat, `gumSwiped` flies it along the row it is on). Arriving
 * at beat 21 it is on row five at beat 26, so the drag runs from tick 1500 to
 * the beat at 1560, with the hand still down.
 *
 * It falls in the leftmost column and not next to the mouth, because the
 * sweep is three columns a beat and one flung from three columns away chokes
 * on the beat it is flung — the flight would never be seen. From column 0 it
 * flies to 3 for one whole beat and chokes crossing the mouth on the next,
 * and the last two pages are the mouth sliding a column a beat with a ring
 * gone slack.
 *
 * Every page but the shot's and the swipe's is anchored on the boss itself
 * (`render/caption-anchor-boss-e.ts`, 21 September 2026): `mouths` for the two
 * about a body stopped in it, `ring` for the muscle that has gone, `tally` for
 * NEXT INHALE — which is the navigator's alone, so the page that says so is
 * pointed at a thing the pilot's screen does not draw and the pilot's ring is
 * simply absent — and the gullet whole for the swallow. They were all on the
 * hull, which is the middle of the plating: the mouth is there only while the
 * boss is still, and the last two pages are it sliding away from there. A body
 * held in the mouth stands on row five, and a page about a body has to hold
 * with it below row six (`scene-pages.test.ts`).
 */
export const THE_THROAT: GuideScene = {
  ticks: 2100,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 1, col: 3, color: "red" },
    { beat: 10, col: 3, kind: "meteor", color: null },
    { beat: 20, col: 0, kind: "gum", color: null },
  ],
  boss: { kind: "throat" },
  acts: [
    { tick: 630, control: "fireRed" },
    { tick: 1470, grip: 1, col: 0, until: 1620 },
    { tick: 1500, drag: "gripBody", dir: 1, by: 1560, until: 1620 },
  ],
  steps: [
    {
      tick: 0,
      seat: 2,
      text: "ONLY PLAYER 2 SEES THE COUNT",
      anchor: { at: "boss", part: "tally" },
    },
    {
      tick: 300,
      seat: 1,
      text: "A BODY STOPS IN THE MOUTH",
      anchor: { at: "boss", part: "mouths" },
    },
    // Two pages here said a verb the fight now writes itself, 19 September
    // 2026 (`boss-cue-read-k.ts`): the shot into the mouth, and the fling.
    // Both keep their tick, their seat and their anchor, because each is the
    // only page of its seat over an act of its seat and a deleted one would
    // hand the ghost hand to the other screen (`new-tutorial`, *take the verb
    // out, not always the page*).
    //
    // This one says why her trigger is worth anything at all in there, which
    // is the thing the word `FIRE` cannot: the mouth is not a ward, so a
    // living body standing in it is still an ordinary kill. The rock at beat
    // 16 is the other half of that sentence and the film shows it rather than
    // saying it (`isWardable`).
    {
      tick: 540,
      seat: 2,
      text: "A SHOT STILL KILLS IT THERE",
      anchor: { at: "control", control: "fireRed" },
    },
    { tick: 900, seat: 1, text: "LEFT ALONE · IT IS SWALLOWED", anchor: { at: "boss" } },
    { tick: 1200, seat: 1, text: "ONLY A GUM HURTS IT", anchor: { at: "boss", part: "mouths" } },
    // The field says `FLING` on the beat the gum crosses the mouth's row and
    // never a word about which side of it to start from or how far to carry —
    // that is the pair's own arithmetic. So the page says the rule underneath
    // it instead: the swipe is a direction, and the row it leaves on is the
    // line it flies along (`gumSwiped`).
    { tick: 1380, seat: 1, text: "IT FLIES THE WAY YOU SWIPE", anchor: { at: "held" } },
    {
      tick: 1680,
      seat: 2,
      text: "ONE RING SLACK · IT SLIDES",
      anchor: { at: "boss", part: "ring" },
    },
    {
      tick: 1860,
      seat: 2,
      text: "PLAYER 2 SAYS THE COLUMN",
      anchor: { at: "boss", part: "tally" },
    },
  ],
};
