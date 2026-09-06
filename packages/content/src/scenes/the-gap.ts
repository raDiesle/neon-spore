import type { GuideScene } from "../scene-types.js";

/**
 * THE GAP's rehearsal: the wall moves its opening, and only one of them can
 * see where it went.
 *
 * THE FENCE, one wave earlier, is the same creature with its way through
 * nailed to the middle column — a wall the pair meets with their hands still.
 * This is the half that was taken out of it, and the owner asked for the two
 * to be separate waves: *then another wave, where the player needs to call and
 * the player moves accordingly.*
 *
 * So every wall here is open somewhere else, and the seat that is shown where
 * cannot move the dome an inch. The pilot reads a column off their own screen
 * and says it; the navigator, looking at a wire with no break in it anywhere,
 * takes the dome to a number they were told. It is the shortest sentence in
 * the game and it has to be said before the wire lands.
 *
 * **The last page is the price, and it is the one shared page this film is
 * allowed.** The third wall opens against the far side of the field while the
 * dome is standing where the second one left it, and nobody says anything: the
 * current earths through the ship and the bar drops. A film that only ever
 * showed the call being made would never say what happens in the silence,
 * which is the only thing this wave punishes.
 */
export const THE_GAP: GuideScene = {
  ticks: 1860,
  bpm: 120,
  seed: 1,
  // Three walls, each open in a different column and each one further from
  // where the last left the dome — so the film is three calls rather than one
  // call and two confirmations.
  entries: [
    { beat: 1, col: 1, kind: "fence", color: null },
    { beat: 11, col: 5, kind: "fence", color: null },
    { beat: 21, col: 0, kind: "fence", color: null },
  ],
  // A beat and a half after each page opens, so the words are read before the
  // dome starts sliding. The third page has none, which is its whole subject.
  acts: [
    { tick: 200, control: "shield", col: 1 },
    { tick: 800, control: "shield", col: 5 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 CALLS THE COLUMN", anchor: { at: "body" } },
    {
      tick: 600,
      seat: 2,
      text: "PLAYER 2 MOVES THE SHIELD",
      anchor: { at: "control", control: "shield" },
    },
    { tick: 1200, seat: 1, text: "NOBODY CALLED IT", anchor: { at: "health" } },
  ],
};
