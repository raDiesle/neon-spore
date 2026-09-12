import type { GuideScene } from "../scene-types.js";

/**
 * FIRST STEP's rehearsal: the game's first exchange, in fourteen seconds, on the
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
  ticks: 1680,
  bpm: 120,
  seed: 1,
  // The second slick comes a beat after the first page has turned, never
  // before: a caption about a body finds the newest one on the field
  // (`render/caption-anchor.ts`), and a second arrival during the first page
  // would take the ring off the one the words are about.
  entries: [
    { beat: 0, col: 5, color: "red" },
    { beat: 9, col: 1, color: "red" },
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
    { tick: 570, control: "cannon", col: 3 },
    { tick: 600, control: "cannon", col: 4 },
    { tick: 630, control: "cannon", col: 5 },
    { tick: 660, control: "cannon", col: 5 },
    { tick: 810, control: "fireRed" },
  ],
  // Four pages, each one long enough to watch twice without being long enough
  // to wait through: four seconds, two, four, four at 120 ticks a second. Each begins where the one before it ends and is replayed from the
  // top of the loop, so what a page shows is the world as it really stood at
  // that tick and not a clip cut out of it.
  //
  // **The first page is the long one, and it holds with the body in the
  // middle of the screen.** It turned four beats in, with the slick three rows
  // down and the whole field empty under it — *when tutorials stop, the
  // explained enemy should be around the middle of the screen, not the top*
  // (the owner, 12 September 2026). Eight beats puts it on row seven of
  // fifteen, and the two pages after it do their work in the seven beats
  // left before it reaches the hull: the shot lands on row twelve.
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
      tick: 480,
      seat: 1,
      text: "PLAYER 1 MOVES CANNON",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 720,
      seat: 2,
      text: "PLAYER 2 FIRES RED",
      anchor: { at: "control", control: "fireRed" },
    },
    // The miss and what it costs are one page, not two: the second slick
    // reaches the hull on beat 25, which is tick 1500 at this tempo, so a page
    // that opens at 1200 says the words, then lets the pair watch the thing
    // arrive and the bar drop, with three beats left to look at what it cost.
    // It points at the bar rather than at the body, because the bar is the
    // half nobody notices on their own — and it is on player 1's screen
    // because the column that was never taken was player 1's to take.
    { tick: 1200, seat: 1, text: "A MISS LOSES THE WAVE", anchor: { at: "retries" } },
  ],
};
