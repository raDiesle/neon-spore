import { PINBALL_ROUNDS } from "../pinball-rounds.js";
import type { GuideScene } from "../scene-types.js";

/**
 * PINBALL's rehearsal: the thing you fire from is the thing you have to catch
 * it with.
 *
 * The ship stays a ship. One ball goes up out of the cannon, comes down through
 * the table, and the same cannon has to be under it when it lands. Player 1
 * slides the cannon *and* stops the sweeping needle; player 2 does one thing and
 * cannot do it until the needle has stopped. That is why the film is lopsided —
 * three of its six pages are his — and it is the wave being lopsided rather
 * than the film.
 *
 * **The sixth page is the nudge**, the owner's on 10 October 2026: ◀ and ▶
 * stand either side of both panels the whole round and light while a ball is
 * in the air, and a pair who are never shown one pressed never find out what
 * they are for. It stays on player 2's screen, the page before it, and she
 * bumps the ball back toward the ship — not far enough, which is the page
 * after it.
 *
 * **It ends on a miss, and that is the only page that could have ended it.**
 * The whole of the round is the sentence *and then get back under wherever the
 * ball is coming down*, which is a thing a pair fails at before they do it: the
 * cannon is left where the shot was aimed from, the ball comes down somewhere
 * else, and the hull pays. Showing the catch would have taught the arithmetic
 * of one particular board; showing the drop teaches what the catch is for.
 *
 * The film's one page about what both screens share is spent on it.
 *
 * **The first page changed on 18 September 2026.** The
 * field now says `MOVE` on the cannon while a ball is coming down somewhere
 * else, so the page that named his gesture carries the round's own doubling
 * instead — the one rule neither screen states (`docs/spec/briefings.md`).
 */
export const PINBALL: GuideScene = {
  ticks: 1380,
  bpm: 120,
  // One row shorter than the game's table, so the board hangs under the
  // tutorial plate and the round's header has the empty top row to drop
  // into (`GuideScene.pinballRows`). The first board is seven rows deep and
  // hangs from the top, so a thirteen-row table still leaves the band of clear
  // air above the hull that `pinballClearMilli` keeps.
  pinballRows: 13,
  seed: 1,
  entries: [],
  boss: { kind: "pinball", rounds: PINBALL_ROUNDS },
  acts: [
    // Every one of these waits for the round to finish opening: it is in its
    // `morph` phase for six beats and a press inside it is a press nobody
    // meant. The first is the ship's own strip, dragged to a column — the same
    // gesture and the same speed as every ordinary wave, which is the whole of
    // what changed here.
    { tick: 450, control: "cannon", col: 2 },
    { tick: 710, control: "pinLatch" },
    // Long after the needle stopped, because the bar the launch takes its
    // strength off does not stop: it fills and empties on its own, and the
    // press is a moment inside that rather than the next thing on a list.
    // A hundred ticks into page four since the nudge page went in after it (10
    // October 2026): the slower bar and the deader bounce keep a ball up
    // longer, and a launch any later comes down after the film has ended —
    // this one, bumped once, drops at 1231, under the last page.
    { tick: 900, control: "pinLaunch" },
    // The ball is coming down to the right of the cannon, so she bumps it
    // left, toward the ship — one bump of three, a beat and a half into its
    // page, and it still lands wide.
    { tick: 1070, control: "pin2Left" },
  ],
  steps: [
    // PLAYER 1 SLIDES THE CANNON stood here and is the cannon's own now:
    // through every flight it is drawn as a funnel as wide as the catch
    // (`render/pinball-mouth.ts`, which replaced the `MOVE` cue on 1 October
    // 2026). Page two teaches the slide itself and the band says whose screen
    // this is, so what the first page had left was the round's own design:
    // the thing you fire from is the thing you have to catch it with.
    {
      tick: 0,
      seat: 1,
      text: "THE CANNON ALSO CATCHES",
      // On the swelling the cannon is reached through and not on the middle of
      // the plating (21 September 2026). The sentence names the cannon twice
      // over — the thing fired from and the thing caught with — so it needed
      // no line in `render/caption-anchor-boss-f.ts` at all, the way THE
      // CLAW's two pages turned out to need none.
      anchor: { at: "ship", control: "cannon" },
    },
    {
      tick: 360,
      seat: 1,
      text: "SLIDE TO WHERE IT STARTS",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 620,
      seat: 1,
      text: "SET STOPS THE NEEDLE",
      anchor: { at: "control", control: "pinLatch" },
    },
    {
      tick: 800,
      seat: 2,
      text: "PLAYER 2 TAKES THE POWER",
      anchor: { at: "control", control: "pinLaunch" },
    },
    {
      tick: 980,
      seat: 2,
      text: "ANY PLAYER BUMPS THE BALL",
      anchor: { at: "control", control: "pin2Left" },
    },
    { tick: 1160, seat: 1, text: "MISS IT AND THE WAVE IS LOST", anchor: { at: "hit" } },
  ],
};
