import type { GuideScene } from "../scene-types.js";

/**
 * THE CAIRN's rehearsal: the rock you did not pull is the one that lands.
 *
 * The pile is answered by *a hand carried sideways* — the grip's second
 * gesture (`sim/grip-push.ts`), which the game has taught only on a falling
 * rock — and a still finger on it is worth nothing at all. So the film opens
 * on exactly that: the pilot's thumb resting on the pile through a whole page
 * and nothing happening, and then the same thumb carried right and one rock
 * leaving the right of the pile (`sim/cairn.ts`, `pullFromCairn`). The carry is
 * authored on the hold that is already running, THE HAND's arrangement, and it
 * is the **pilot's** hand because `dragSeat` reads every carry as the pilot's
 * and because the pilot is the seat with nothing else to do in this fight — no
 * bolt reaches anything, and the navigator has the only dome, which is what the
 * wave's own guide says: *make them pull to your side*.
 *
 * The third page is the split. The pile lets a rock go by itself after
 * `cairnShedBeats` without a pull, into a column drawn on **player 1's screen
 * alone** (`render/cairn-settle.ts`); the pull on page two restarted that
 * clock, so this page is the pilot watching the lane fill while the pulled
 * rock is still in the air. The fourth is the navigator's dome sliding under
 * the pulled rock and turning it — the one rock in the film anybody answers.
 * The last is the shared page every film may spend: the rock the pile let go
 * on its own reaching the hull, which is the wave's sentence.
 *
 * The timing is the pile's own. A pull at beat six puts the pile's next shed
 * at beat fourteen, the pulled rock reaches the hull at beat eighteen and the
 * shed one at beat twenty-six, and every page falls where those numbers put
 * it. The pile's next shed after that arrives during the last page, which is
 * the fight going on — it does if you leave it alone.
 */
export const THE_CAIRN: GuideScene = {
  ticks: 1680,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "cairn" },
  acts: [
    // Half a beat after the page opens, THE HAND's exception for the same
    // reason: the page points at what is held, so until the hand is down there
    // is no subject and no caption.
    { tick: 30, grip: 1, col: 3, until: 420 },
    // The same hand, still down, carried right. `dir` and never a distance:
    // how far one column is is `cfg.gripPushMilli` (`scene-script.ts`).
    { tick: 300, drag: "gripBody", dir: 1, by: 360, until: 420 },
    // Under the pulled rock — the pile's right column and the one beside it,
    // which is where a two-tile rock pulled from the right comes down.
    { tick: 870, control: "shield", col: 4 },
    { tick: 1100, control: "guard" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "A STILL THUMB MOVES NOTHING", anchor: { at: "held" } },
    { tick: 240, seat: 1, text: "CARRIED RIGHT · ONE FALLS", anchor: { at: "held" } },
    // Five beats: the lane under the pile fills from a quarter to nearly full
    // on this screen, and on this screen only.
    { tick: 480, seat: 1, text: "ONLY PLAYER 1 SEES ITS LANE", anchor: { at: "body" } },
    {
      tick: 780,
      seat: 2,
      text: "THE DOME SLIDES UNDER IT",
      anchor: { at: "control", control: "shield" },
    },
    // Seven beats: the rock the pile let go comes the rest of the way down.
    { tick: 1200, seat: 1, text: "THE ONE NOBODY PULLED LANDS", anchor: { at: "retries" } },
  ],
};
