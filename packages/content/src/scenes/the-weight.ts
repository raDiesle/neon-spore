import type { GuideScene } from "../scene-types.js";

/**
 * THE WEIGHT's rehearsal: a thumb held alone looks exactly like two thumbs held
 * together.
 *
 * The lesson is a **negative**, which is the reason this film exists at all. A
 * hand on a weight brightens it on that seat's screen and on no other
 * (`render/weight.ts`), so a player pressing one has nothing to tell them
 * whether the other thumb is down too — and prose can only assert that, where
 * a page can show it. What the wave itself does is charge a retry for it
 * (`waves/act-8.ts`); this shows the same three steps for nothing.
 *
 * So the first two pages are the *same page twice*, once per seat: a thumb goes
 * down alone, the sac brightens under it, and nothing gives. That repetition is
 * the sentence. A pilot who has watched their own thumb brighten it and then
 * watched the navigator's do the same knows that the picture in front of them
 * says nothing about the other phone. The third page is both hands on one beat
 * and the calipers closing (`sim/weight.ts`, `weightCrushMs` after the second
 * hand lands), and the last is the shared page every film may spend: a second
 * sac left alone reaching the hull and the wave paying for it.
 *
 * The timing is the whole of the authoring. A weight comes down a row a beat,
 * so the first sac is on row one when the pilot's thumb lands, row seven when
 * the navigator's does, and gives on row eleven — still clear of the ship. A
 * page about a body holds with that body no higher than row six
 * (`test/scene-pages.test.ts`), which is what sets the first page's length,
 * and the second sac enters only once the first has gone: a caption at `body`
 * finds the newest body on the field, so a second one falling during the
 * press would take the words off the sac being pressed. That is why the last
 * page is the long one — it is a sac falling the whole field alone, which is
 * the sentence it carries.
 */
export const THE_WEIGHT: GuideScene = {
  ticks: 1860,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 3, kind: "weight", color: null },
    { beat: 14, col: 1, kind: "weight", color: null },
  ],
  acts: [
    { tick: 120, grip: 1, col: 3, until: 360 },
    { tick: 495, grip: 2, col: 3, until: 585 },
    // Both on one tick, and held past the crush: a hand that lifted on the
    // instant it gave would be the picture of the pair almost doing it.
    { tick: 690, grip: 1, col: 3, until: 810 },
    { tick: 690, grip: 2, col: 3, until: 810 },
  ],
  steps: [
    // Seven beats: the sac comes down to row six, the middle of the screen.
    { tick: 0, seat: 1, text: "PLAYER 1 HOLDS IT ALONE", anchor: { at: "body" } },
    { tick: 420, seat: 2, text: "PLAYER 2 HOLDS IT ALONE", anchor: { at: "body" } },
    // The page ends just after the sac gives, so its last frame is the crush
    // and not an empty lane: a caption at `body` has nothing to stand beside
    // once the body has gone.
    { tick: 600, seat: 1, text: "BOTH ON ONE BEAT · IT GIVES", anchor: { at: "body" } },
    // Seventeen beats: the second sac falls the whole field and lands.
    { tick: 810, seat: 1, text: "LEFT ALONE, IT ENDS THE WAVE", anchor: { at: "hit" } },
  ],
};
