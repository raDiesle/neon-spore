import type { GuideScene } from "../scene-types.js";

/**
 * FIRST STEP's rehearsal: the game's first exchange, in eleven seconds, on the
 * two screens it actually happens on.
 *
 * Two slicks fall. The pair takes the first — player 1 slides the cannon into
 * its column, the film switches to player 2's screen and fires red, which is
 * the whole of what one seat can teach the other: a column and a colour, one
 * per person. The second is left alone on purpose, so the last thing the pair
 * is shown is what a miss costs. Nothing here is staged: both are ordinary
 * arrivals in an ordinary world, and the hull bar drops because the hull was
 * really hit.
 */
export const FIRST_STEP: GuideScene = {
  ticks: 1380,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 5, color: "red" },
    { beat: 4, col: 1, color: "red" },
  ],
  // A finger arrives at a column on the tick the world hears about it, and the
  // lobe eases after it — so the steps are close together: a hand two columns
  // ahead of the cannon for half a second is a hand that is not dragging it.
  // Every press sits a beat and a half after the page that asks for it opens.
  // The owner watched the hand start moving as the words arrived and asked for
  // the other order — *before the slider starts moving it should briefly stay
  // with the text, then slide with the text* — because a pair reading "slide to
  // its column" while the column is already being slid to has been shown the
  // answer rather than asked the question.
  acts: [
    { tick: 330, control: "cannon", col: 3 },
    { tick: 360, control: "cannon", col: 4 },
    { tick: 390, control: "cannon", col: 5 },
    { tick: 420, control: "cannon", col: 5 },
    { tick: 690, control: "fireRed" },
  ],
  // Four pages, each one long enough to watch twice without being long enough
  // to wait through: two seconds, three, two and a half, four at 120 ticks a
  // second. Each begins where the one before it ends and is replayed from the
  // top of the loop, so what a page shows is the world as it really stood at
  // that tick and not a clip cut out of it.
  //
  // **Three of the four are about one seat's own screen, and the fourth is the
  // consequence.** The fourth was cut once — *the game scene shows exactly the
  // same for both players, just the ship and control set colour is different,
  // and that is not relevant for the tutorial* — and asked for again a day
  // later, in the same words it had been written in: *the step is missing to
  // show that the enemy hits the ship and it loses health.* Both instructions
  // are right about their own half, and the rule that reconciles them is in
  // `test/scenes.test.ts`: a film may spend **one** page on what both screens
  // share, and every other page has to belong to a seat. A film made of shared
  // pages teaches a pair nothing about holding two different halves; a film
  // with none of them never says what the game costs when they get it wrong.
  steps: [
    // ENEMY and not SLICK: it is the first thing either of them has ever seen
    // on this field, and a name for a kind of enemy teaches nothing until there
    // is a second kind to tell it from. The owner's own correction.
    { tick: 0, seat: 1, text: "ENEMY", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 MOVES CANNON",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 600,
      seat: 2,
      text: "PLAYER 2 FIRES RED",
      anchor: { at: "control", control: "fireRed" },
    },
    // The miss and what it costs are one page, not two: the second slick
    // reaches the hull on beat 19, which is tick 1140 at this tempo, so a page
    // that opens at 900 says the words, then lets the pair watch the thing
    // arrive and the bar drop, with four beats left to look at what it cost. It
    // points at the bar rather than at the body, because the bar is the half
    // nobody notices on their own — and it is on player 1's screen because the
    // column that was never taken was player 1's to take.
    { tick: 900, seat: 1, text: "A MISS COSTS THE HULL", anchor: { at: "health" } },
  ],
};
