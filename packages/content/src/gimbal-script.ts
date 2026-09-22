import type { GimbalMark } from "@neon-spore/sim";

/**
 * THE GIMBAL's three alignments: where each ring's mark sits on the true
 * wheel, and how far the marks creep a beat.
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
 * **The three are the whole curve of the fight.**
 *
 * The **first** puts both marks at the same true bearing, a quarter turn
 * round, and holds them still. It is the easiest alignment to reach and the
 * one that teaches the boss: his mark is at a quarter, hers is drawn at three
 * quarters, and one of them says *a quarter* out loud and the other does not
 * find it there. Nothing is pressing while they work that out — a mark that
 * does not creep waits as long as it takes.
 *
 * The **second** puts them at different true bearings, and the near side of
 * hers is the far side of his: a pair who came out of the first with *add
 * half a turn* still has it wrong, because the rule is a reflection and not
 * an offset, and a reflection only looks like an offset at one place on the
 * circle. Still nothing creeps.
 *
 * The **third** creeps. Both marks run at `creepMilli` a beat in opposite
 * **true** senses, which on the two faces looks like both of them running the
 * same way — so the pair is chasing, and a ring let go of to think falls back
 * to rest at nearly twice the speed the mark is moving
 * (`gimbalDriftMilli`). It is the only alignment with a clock on it, and the
 * leaking seam of row 9 opens the moment it lights.
 *
 * Three alignments is six latch-teeth, three to a ring, which is the health
 * the rim is drawn with (`sim/gimbal.ts` `gimbalTeeth`).
 */
export const GIMBAL_SCRIPT: readonly GimbalMark[] = [
  { outerMilli: 250, innerMilli: 250, creepMilli: 0 },
  { outerMilli: 120, innerMilli: 800, creepMilli: 0 },
  { outerMilli: 600, innerMilli: 400, creepMilli: 15 },
];
