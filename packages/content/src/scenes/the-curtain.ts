import type { GuideScene } from "../scene-types.js";

/**
 * THE CURTAIN's rehearsal: the one you move rather than answer.
 *
 * The fight is a sheet across the top of the field with a core behind it,
 * and the film is the four things the sheet does that nothing else on the
 * field does, each on the screen that can see it. It eats a shot (a bolt
 * into the cloth bounces, page three); its hem is its health and **player 1
 * alone** sees which lobes are soft (page four, then one shot off, page
 * five); it is carried sideways by a hand on it and rolls back when the hand
 * leaves (pages six and seven); carried four columns it comes off the core,
 * and **player 2 alone** has been reading the core's shadow through it all
 * along (pages two and nine). The last page is the core drifting under the
 * fabric in a new column and a new colour after its first hit, which is the
 * sentence the fight repeats twice more.
 *
 * **Every carry is the pilot's hand**, `dragSeat`'s rule for a `gripBody`
 * drag, and it is the honest seat here as it was for THE CAIRN: the pilot
 * has nothing else to do in this fight until the core is bare. The wave's
 * guide says *both push*, and the film shows one hand doing it so the other
 * seat's screen can be spent on the shadow.
 *
 * **The seed matters, twice.** The core's column and colour are the rng's
 * (`installCurtain`), and 64 puts the core under the cannon's starting
 * column in cyan, so no page is spent sliding the cannon; and the soft set
 * is redrawn by the rng every `curtainSoftBeats`, and 64 makes the lobe over
 * that column soft from beat twelve to thirty, which is the window page five
 * fires into. Page three fires into the same lobe at beat seven, when it is
 * not soft, so the cloth is seen eating a shot before the hem is seen giving
 * one up.
 *
 * **The carry's clock is the body's, not the hand's.** A shove is one column
 * and then a beat of quiet (`gripPushPauseBeats`), so four columns take
 * seven beats however fast the thumb goes, and the sheet is off the core on
 * beat thirty-four. The own-colour shot on page nine is fired after that
 * beat, not before: the fabric glides a beat after a shove and a bolt that
 * arrives during the glide is a bolt into cloth. The core would fire on its
 * own three beats after it is bared; the hit lands before that, and the drift
 * puts it back under the fabric, so nothing falls in this film.
 */
export const THE_CURTAIN: GuideScene = {
  ticks: 2400,
  bpm: 120,
  seed: 64,
  entries: [],
  boss: { kind: "curtain" },
  acts: [
    // Into the cloth over the core: a bounce and nothing else.
    { tick: 450, control: "fireCyan" },
    // Into the same column while its lobe is soft: the lobe comes off.
    { tick: 810, control: "fireCyan" },
    // Half a beat after the page opens, THE HAND's exception: the page points
    // at what is held, so until the hand is down there is no subject.
    { tick: 930, grip: 1, col: 2, until: 1140 },
    // `dir` and never a distance: one column is `cfg.gripPushMilli`.
    { tick: 990, drag: "gripBody", dir: 1, by: 1050, until: 1140 },
    // The same hand again, carried four columns' worth and held there, so the
    // sheet cannot roll back while the shot is on its way.
    { tick: 1470, grip: 1, col: 2, until: 2380 },
    { tick: 1500, drag: "gripBody", toMilli: 4000, by: 1860, until: 2380 },
    // The core's own colour, the beat after the sheet is clear of it.
    { tick: 2050, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "A CORE HIDES BEHIND A SHEET", anchor: { at: "body" } },
    { tick: 180, seat: 2, text: "PLAYER 2 SEES ITS SHADOW", anchor: { at: "body" } },
    {
      tick: 360,
      seat: 2,
      text: "A SHOT INTO CLOTH · NOTHING",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 540, seat: 1, text: "PLAYER 1 SEES THE SOFT LOBES", anchor: { at: "body" } },
    {
      tick: 720,
      seat: 2,
      text: "SHOOT A SOFT ONE · IT DROPS",
      anchor: { at: "control", control: "fireCyan" },
    },
    // This page said PLAYER 1 SHOVES IT ONE OVER until 17 September 2026: the
    // fight writes CARRY over the membrane and SHOVE under it for as long as
    // the core is behind the cloth (`decisions.md` #34). The grip goes down at
    // 930 and is the pilot's, so the page stays on his screen and says the
    // one thing the cue may not — how far a shove gets.
    { tick: 900, seat: 1, text: "A SHOVE IS ONE COLUMN", anchor: { at: "held" } },
    // Five beats: the hand is off at beat nineteen and the sheet rolls back
    // at twenty-three.
    { tick: 1140, seat: 1, text: "LET GO · IT ROLLS BACK", anchor: { at: "body" } },
    // Eight beats: the four shoves, two beats apart. It said HOLD IT · CARRY
    // IT FOUR OVER until 19 September 2026, and CARRY is the kind line the
    // cue draws over SHOVE — the page was repeating the field's own word to
    // get to its count. The count is all it was ever for.
    { tick: 1440, seat: 1, text: "FOUR OVER AND IT IS CLEAR", anchor: { at: "held" } },
    // FIRE ITS COLOUR AS IT BARES stood here. The field writes her verb on the
    // core the beat the cannon is under it (`boss-cue-read.ts`), so what is
    // left is the half no cue may carry: the colour, which is hers alone
    // (`showsCurtainShadow`), and what the other one costs — a rock down the
    // column at once, on the beat (`curtainStruck`).
    {
      tick: 1920,
      seat: 2,
      text: "ITS COLOUR OR IT FIRES BACK",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 2140, seat: 2, text: "IT DRIFTS AND HIDES AGAIN", anchor: { at: "body" } },
  ],
};
