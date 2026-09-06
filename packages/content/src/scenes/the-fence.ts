import type { GuideScene } from "../scene-types.js";

/**
 * THE FENCE's rehearsal: a wall the width of the field, and the one thing that
 * has to be true when it lands.
 *
 * This wave used to be the whole creature at once — four walls, gaps in four
 * different columns and two rocks in among them — and the guide in front of it
 * was three paragraphs of prose. The owner cut both: *change THE FENCE, the
 * first wave with a fence, to be very simple. The first fence should be in the
 * middle, and the text says: do not move, the gap is in the middle.* So every
 * wall in the wave is open in the middle column, which is where the dome
 * already stands, and the pair's first fence costs them nothing at all.
 *
 * **A wave nobody can lose is the right first fence**, because the thing being
 * taught is not an answer, it is a *fact*: the wire is coming down across every
 * column, the trigger has nothing to say to it, and where it is broken is
 * where the ship lives. A pair who have never seen one need to watch that
 * happen once with their hands still.
 *
 * **The film has no acts in it, and that is the lesson.** Not one thumb moves
 * in fifteen seconds. Every other rehearsal in the game shows a hand doing the
 * thing the page is about; this one shows the hand doing nothing while a wall
 * goes over the ship, which is the only way to draw *stay where you are*.
 *
 * Three pages, one wall each. The first is the fact and it is on the pilot's
 * screen, because that is the screen the way through is drawn on. The second
 * is the split — the same wall, on the navigator's phone, unbroken from wall
 * to wall — and it is the whole reason this creature needs two people. The
 * third is the instruction, pointed at the strip the navigator is *not* going
 * to touch. Where the gaps move and somebody has to say a number is THE GAP,
 * one wave later.
 */
export const THE_FENCE: GuideScene = {
  ticks: 1860,
  bpm: 120,
  seed: 1,
  // One wall per page, arriving a beat after the page opens and coming to rest
  // on the ship a beat before it closes — the owner's rule about a page not
  // moving before its words have been read, said about a body that falls
  // rather than about a thumb. Column three is the middle of the seven every
  // wave is authored in, and a fence with no `gaps` of its own is open in the
  // cell it was painted in (`queueFromWave`).
  entries: [
    { beat: 1, col: 3, kind: "fence", color: null },
    { beat: 11, col: 3, kind: "fence", color: null },
    { beat: 21, col: 3, kind: "fence", color: null },
  ],
  acts: [],
  steps: [
    { tick: 0, seat: 1, text: "THE WIRE MUST MISS THE DOME", anchor: { at: "body" } },
    { tick: 600, seat: 2, text: "PLAYER 2 SEES ONE WIRE", anchor: { at: "body" } },
    {
      tick: 1200,
      seat: 2,
      text: "THE GAP IS IN THE MIDDLE",
      anchor: { at: "control", control: "shield" },
    },
  ],
};
