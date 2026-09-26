import { GIMBAL_SCRIPT } from "../gimbal-script.js";
import type { GuideScene } from "../scene-types.js";

/**
 * THE GIMBAL's rehearsal: two rings, one each, turned to two marks and held.
 *
 * The drum hangs still for `gimbalStillBeats` and then the first alignment's
 * marks light (`sim/gimbal-step.ts`). The pilot's hand goes on the outer rim
 * and carries it a quarter round to its mark, and **stays on it** — a ring
 * with no hand drifts back to the top on the beat, so the hold is the half of
 * the gesture a page most needs to show. Then the navigator's hand on the
 * inner ring, and the one line this boss is: her ring is gripped from the far
 * face, so the same quarter is a quarter the *other* way round on her screen
 * (`gimbalShownMilli`). The film writes her thumb going anticlockwise, which
 * is what a pair who said *clockwise* to each other would never have done —
 * hence the page that says where, not which way.
 *
 * Both true, both held through `gimbalHoldBeats`, and a tooth shears off each.
 * Both hands stay on until the next marks are up, so the last page shows two
 * rings sheared and still held rather than drifting home under nobody's
 * thumb (`sim/gimbal-step.ts`). Every distance is on the hand's own face, clockwise
 * positive (`scene-turn.ts`), and `test/scene-gimbal.test.ts` holds the
 * shear to the beat it lands on.
 */
export const THE_GIMBAL: GuideScene = {
  ticks: 780,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "gimbal", marks: GIMBAL_SCRIPT },
  acts: [
    { tick: 150, drag: "gimbalOuter", toMilli: 250, until: 760 },
    { tick: 390, drag: "gimbalInner", toMilli: -250, until: 760 },
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
    { tick: 480, seat: 1, text: "BOTH TRUE · A TOOTH SHEARS", anchor: { at: "boss" } },
  ],
};
