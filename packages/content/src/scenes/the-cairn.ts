import type { GuideScene } from "../scene-types.js";

/**
 * THE CAIRN's rehearsal: the rock you did not pull is the one that lands.
 *
 * The pile is answered by *a hand carried sideways* — the grip's second
 * gesture (`sim/grip-push.ts`), which the game has taught only on a falling
 * rock. So the film opens on the pilot's thumb going down on the pile and not
 * moving for a whole page, and then on the same thumb carried right and one
 * rock leaving the right of the pile (`sim/cairn.ts`, `pullFromCairn`). The carry is
 * authored on the hold that is already running, THE HAND's arrangement, and it
 * is the **pilot's** hand because `dragSeat` reads every carry as the pilot's
 * and because the pilot is the seat with nothing else to do in this fight — no
 * bolt reaches anything, and the navigator has the only dome, which is why the
 * wave's own guide asks her for the side and for how many she can be under.
 *
 * **The opening page was written before a still thumb did anything, and it now
 * teaches the other gesture for free.** A hand resting on the pile stops its
 * shed clock for `cairnHoldBeats` (19 September 2026, `sim/cairn-hold.ts`), so
 * the page authored as *nothing happening* is the settle mark under the pile
 * visibly not filling for four beats and then filling again with the thumb
 * still down — which is exactly how a pair meets the hold in play, by accident,
 * and the whole of the teaching it gets or needs. The page's words are
 * untouched: they say the rule no cue may say, and the mark says the rest.
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
 * **And the pages the field took over.** The fight says `CARRY` over `PULL` on
 * the stack for as long as there is one (`render/boss-cue-read-q.ts`), and
 * `CARRY` is the kind line — *a thumb carried across the field* — so the first
 * two pages were both saying the field's own word. They keep their tick, their
 * seat and their anchor and take the halves a cue may never carry: the first
 * says the rule that makes the gesture necessary at all, that nothing either
 * control fires reaches this body, and the second says the **side**, which is
 * the one thing about this fight either of them decides and the reading's
 * loudest silence. The navigator's dome page stays exactly as it was: the ward
 * is that silence too — what comes away is an ordinary rock, and no boss's
 * reading cues one — so her verb is still the film's to teach.
 *
 * The timing is the pile's own, and two beats of it are now bought. The thumb
 * is down from beat one, so beats one to four are held and the clock stands;
 * the pull at beat six restarts it and hands the budget back, and the same
 * hand, still down until beat seven, buys one beat more. The pile's next shed
 * therefore lands at beat sixteen rather than fourteen, the pulled rock
 * reaches the hull at beat eighteen, and the shed one at twenty-nine — which
 * is why the loop runs thirty beats and not twenty-eight. Page three opens on
 * an empty lane rather than a quarter-full one and fills it five eighths of
 * the way across: more of the gauge than it used to show, making the same
 * claim, that it is on his screen and on nothing hers shows. The pile's next
 * shed arrives at beat twenty-four, during the last page, which is the fight
 * going on — it does if you leave it alone.
 */
export const THE_CAIRN: GuideScene = {
  // Thirty beats, two more than it was written with, and the two the hold
  // costs it. The pilot's thumb rests on the pile through the opening page and
  // buys its shed clock back a beat at a time (19 September 2026,
  // `sim/cairn-hold.ts`), so the pile's own shed falls on beat sixteen rather
  // than fourteen and the rock it lets go reaches the hull on twenty-nine. The
  // closing page is anchored at what the hull has left and has to still be
  // running when that lands (`content/test/scenes.test.ts`), so it is two
  // beats longer. Not one act moved: the film shows what it always showed.
  ticks: 1800,
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
    // `CARRY` over `PULL` stands on the stack from the first beat, and the kind
    // line is *a thumb carried across the field* — which is this page's whole
    // payload said by the field. What it says instead is the rule underneath the
    // gesture, and the one no word on either screen states.
    { tick: 0, seat: 1, text: "NO SHOT REACHES THIS PILE", anchor: { at: "held" } },
    // The same cue took `CARRIED`; the side is what is left, and the field will
    // never say it — it is the navigator's to ask for out loud (`cairn.ts`).
    { tick: 240, seat: 1, text: "THE WAY YOU GO IS ITS COLUMN", anchor: { at: "held" } },
    // Five beats: the lane under the pile fills from a quarter to nearly full
    // on this screen, and on this screen only.
    { tick: 480, seat: 1, text: "ONLY PLAYER 1 SEES IT FILL", anchor: { at: "body" } },
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
