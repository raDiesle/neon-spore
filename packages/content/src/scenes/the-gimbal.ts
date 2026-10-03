import { GIMBAL_SCRIPT } from "../gimbal-script.js";
import type { GuideScene } from "../scene-types.js";

/**
 * THE GIMBAL's rehearsal: two rings, one each, talked onto two marks and let
 * go of together.
 *
 * The drum hangs still for `gimbalStillBeats` and then the first alignment's
 * marks light (`sim/gimbal-step.ts`) — each on the *other* seat's screen
 * (`render/gimbal-partner.ts`). The pilot's hand goes on the outer rim and
 * carries it a quarter round to the mark the navigator can see, and **stays
 * on it**: a ring with no hand drifts back to the top on the beat. Hers is
 * already held still under her thumb, because his quarter carries her ring a
 * quarter with it (`sim/gimbal-turn.ts`) and an unheld ring would ride it and
 * then fall home. So her
 * mark at the bottom is a quarter further on from where her ring now stands,
 * and she is gripped from the far face, so that quarter is a quarter the
 * *other* way round on her screen (`gimbalShownMilli`). The film writes her
 * thumb going anticlockwise, which is what a pair who said *clockwise* to
 * each other would never have done — hence the page that says where, not
 * which way.
 *
 * Both true, and **both hands come off on the same tick**: the let-go is the
 * shear (`sim/gimbal-let-go.ts`), so the last page is the count down that
 * lands it. Every distance is on the hand's own face, clockwise positive
 * (`scene-turn.ts`), and `test/scene-gimbal.test.ts` holds the shear to the
 * beat it lands on.
 */
export const THE_GIMBAL: GuideScene = {
  ticks: 780,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "gimbal", marks: GIMBAL_SCRIPT },
  acts: [
    { tick: 140, drag: "gimbalInner", toMilli: 0, until: 389 },
    { tick: 150, drag: "gimbalOuter", toMilli: 250, until: 540 },
    { tick: 390, drag: "gimbalInner", toMilli: -250, until: 540 },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "THE OUTER RING IS YOURS",
      anchor: { at: "boss" },
    },
    {
      tick: 300,
      seat: 2,
      text: "SAY WHERE, NOT WHICH WAY",
      anchor: { at: "handle", target: "gimbalInner" },
    },
    { tick: 480, seat: 1, text: "BOTH TRUE · LET GO TOGETHER", anchor: { at: "boss" } },
  ],
};
