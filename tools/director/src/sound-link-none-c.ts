/**
 * The sounds wired up with nothing to draw, the third page — from THE GAUGE
 * on.
 *
 * Cut off `sound-link-none-b.ts` on 19 September 2026, when THE SCUTTLE's
 * swing would have put that page over its 250-line limit, exactly as that
 * page was cut off the first and along the same seam: the *last* boss on the
 * full page goes across, never the boss being worked on, whose rows stay
 * under the comment that explains them. `sound-link-none.ts` spreads all
 * three into `NO_SUBJECT`, so `test/sound-link.test.ts` reads one table and
 * nothing that asks it knows there are three pages.
 *
 * THE GAUGE's four came over whole. They share one answer with the interlude
 * rows on page one: the subject is a dial and a band on a plate, and the
 * round has thrown the field away altogether — the sheet's cards are
 * silhouettes of bodies on a grid, and there is no grid here to stand on.
 */
export const NO_SUBJECT_C: Record<string, string> = {
  // THE GAUGE's four, the round's first sounds at all. The subject is a dial
  // and a band on a plate, and the round has thrown the field away like the
  // others (`sim/events-gauge.ts`, `docs/spec/interludes.md`).
  "boss.gaugeMark":
    "a call landing between the two marks. The needle's, and the sheet has no card for a dial.",
  "boss.gaugeMiss":
    "a call that missed — free the first time, and the valve sticks beside it. Same argument.",
  "boss.gaugeJam":
    "the miss beside this one sticking the valve: the needle answers his hand until the next call lands. Same argument.",
  "boss.gaugeBind":
    "the mark beside this one winding the band tight: she cannot call while her thumb is not holding it open. Same argument.",
  // THE WELL's four, the projection's first sounds at all. The subject in
  // every one of them is the *grid itself*, rolled into a clock face — which
  // is the one thing the sheet's cards cannot be, being silhouettes of bodies
  // that stand on a grid (`sim/events-well.ts`, `render/well.ts`).
  "boss.wellRoll":
    "the face beginning to slip, hours and all. The subject is the field rolled into a circle, and the sheet draws bodies on a field rather than the field.",
  "boss.wellHeld":
    "a thumb on the seam holding that slip still for a beat. Same argument: what is held is the whole picture, not a body in it.",
  "boss.wellWound":
    "the face stopped three sectors from the top. Same argument, and there is nothing new on the field to draw — only the old one turned.",
  "boss.wellHome": "the seam back at twelve and every hour on its own column again. Same argument.",
  // THE BALLOON's own two, bound since before this page existed —
  // `bind-balloon.ts` reused a sound written for a different creature and the
  // catalogue's `status` had not caught up (`docs/queue.md`, 20 September
  // 2026). Unlike the lure and the veil on page one, THE BALLOON has a shape
  // of its own (`content/src/balloon-shape.ts`); it is only not on the shape
  // sheet's card catalogue yet.
  "creature.colonySpread":
    "THE BALLOON splitting, and topping out into a torch. It has a shape of its own, and the shape sheet has no card for it yet.",
  "impact.overkill":
    "THE BALLOON popping under two shots landed the same beat. Same body, same gap in the sheet.",
};
