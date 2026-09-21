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
 * THE THROAT's seven joined them on 21 September 2026, off the same page by
 * the same rule, when THE HIVE's clench and its wrung lobe filled it. They
 * keep their own answer, which is the tube's: a fixture hanging from the top
 * of the field with nothing of it among the creatures.
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
  // THE THROAT's two hands on the gullet, and the gullet's own clock beside
  // them. The subject is the tube itself — a fixture hanging from the top of
  // the field with nothing of it among the creatures — so there is no body a
  // sheet could card (`sim/throat.ts`).
  "boss.throatCinch":
    "player 2's thumb landing on a ring the pair has already choked: the gullet stops breathing while she holds it. What it is on is THE THROAT's tube, a fixture that is not a creature and stands on no card.",
  "boss.throatSlip":
    "that hold lost — lifted, or torn out of her thumb when its beats ran out — and the gullet breathing again. Same argument.",
  "boss.throatHaul":
    "player 1 dragging the whole tube a column sideways, which is the only way in this fight to take a body back out of the mouth. Same argument.",
  "boss.throatInhale":
    "the gullet drawing breath — the beat player 2 has been counting down to out loud. It is the tube's own clock and not a thing either thumb did, so it stands on the same fixture and on no card.",
  "boss.throatChoke":
    "a flung gum arriving in the mouth and a ring going slack under it. The gum has a card of its own, but what this sound says happened is the tube's, so it stands with the rest of the fixture.",
  "boss.throatSwallow":
    "the mouth taking what stood in it, and a slack ring drawing tight again. Same argument — the body that was eaten is gone by the time it is heard.",
  "boss.throatEvert":
    "the last ring gone slack and the tube turning through its own mouth. Same argument, and there is no contour for it: the eversion is the fixture unmaking itself.",
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
