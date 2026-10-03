import type { GimbalMark } from "@neon-spore/sim";

/**
 * THE GIMBAL's six alignments: where each ring's mark sits on the true
 * wheel, how far the marks creep a beat, and how near is near enough.
 *
 * Every figure here is a bearing in thousandths of a turn, clockwise from the
 * top of the **true** wheel — not of either face. The pilot's ring is drawn
 * as the wheel is, so `outerMilli` is what he sees; the navigator's is
 * gripped from the far side, so `innerMilli` is *not* what she sees and the
 * screen shows her `TURN - innerMilli` (`sim/gimbal.ts` `gimbalShownMilli`).
 * Authoring the true figures rather than the shown ones is deliberate: one
 * wheel, one number a ring, and the mirror said once in the one function that
 * draws it.
 *
 * **The six are the whole curve of the fight**, and they were three until
 * the owner found the wave too easy and too short (3 October 2026). Each
 * screen shows the partner's mark and never its own, the outer ring carries
 * the inner, and a tooth shears on a let-go together (`sim/gimbal.ts`) — so
 * every figure below is chosen against those three.
 *
 * **What the navigator turns is `innerMilli - outerMilli`**, not
 * `innerMilli`: his quarter carries her ring a quarter before she touches it
 * (`sim/gimbal-turn.ts`). No alignment puts the two marks within its own
 * tolerance of each other, or she would have nothing to do but hold on.
 *
 * The **first** puts his mark at a quarter and hers at the bottom, where the
 * mirror leaves it in place: she is told *the bottom* and it is the bottom,
 * and he is told *the left* and it is not — the lesson, once, on the
 * alignment with the widest window.
 *
 * The **second to fourth** are still marks scattered round the wheel, the
 * window closing a step each time, so a pair that has found the mirror has to
 * keep finding it with less room to be roughly right in.
 *
 * The **fifth and sixth** creep. Both marks run at `creepMilli` a beat in
 * opposite **true** senses; his carries hers forward while hers runs back, so
 * she is chasing at twice the creep. The seam leaks the moment the fifth
 * shears, and the sixth is the tightest window on the wheel.
 *
 * Six alignments is twelve latch-teeth, six to a ring, which is the health
 * the rim is drawn with (`sim/gimbal.ts` `gimbalTeeth`).
 */
export const GIMBAL_SCRIPT: readonly GimbalMark[] = [
  { outerMilli: 250, innerMilli: 500, creepMilli: 0, trueMilli: 45 },
  { outerMilli: 120, innerMilli: 800, creepMilli: 0, trueMilli: 40 },
  { outerMilli: 850, innerMilli: 650, creepMilli: 0, trueMilli: 35 },
  { outerMilli: 500, innerMilli: 100, creepMilli: 0, trueMilli: 30 },
  { outerMilli: 600, innerMilli: 400, creepMilli: 10, trueMilli: 25 },
  { outerMilli: 300, innerMilli: 700, creepMilli: 12, trueMilli: 20 },
];
