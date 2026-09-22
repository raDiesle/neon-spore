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
  // THE GIMBAL's ten, added here on 22 September 2026 rather than to page one
  // by that page's own rule read forward: pages one and two are both within
  // three lines of the 250-line limit and this one has room, so nothing had
  // to be handed across to take them. The subject in every one is the drum
  // and its two rings — a sealed body hung in a cradle above the field, with
  // nothing of it among the creatures — so there is no card a sheet could
  // draw (`sim/gimbal.ts`, `sim/events-gimbal.ts`).
  "boss.gimbalEnter":
    "the drum dropping into frame between two dark, still rings. It is a fixture hanging above the field, and the sheet's cards are silhouettes of bodies that stand on a grid.",
  "boss.gimbalMarks":
    "each seat's own mark lighting on its own ring. What it is on is the rim of that ring, which is the fixture. Same argument.",
  "boss.gimbalTrue":
    "both rings sitting on their marks at once and the hold beginning. Same argument — and what it marks is an agreement between two bearings, which stands nowhere at all.",
  "boss.gimbalSlip":
    "a ring leaving its mark before the hold was up. Same argument, and this one is an absence.",
  "boss.gimbalShear":
    "a latch-tooth shearing off each ring. The tooth is a notch in the rim rather than a body, so it goes with the fixture it is a notch in.",
  "boss.gimbalLeak":
    "the drum swinging loose in its cradle and a spark starting from the seam. A spark is not a body and the seam is the fixture's.",
  "boss.gimbalSeamOut": "that spark shot out, in either colour. Same argument.",
  "boss.gimbalSeamHit":
    "nobody shot it and it reached the hull. What is hit is the ship, which the hull's own sounds already have; what made it is the seam. Same argument.",
  "boss.gimbalHatch":
    "the last tooth pair gone, both rings spinning free and the drum splitting open. Same argument — the fixture unmaking itself, as THE THROAT's eversion is.",
  "boss.gimbalOut": "the opened hatch hanging and the wave ending. Same argument, and an absence.",
  // THE BELLOWS's sixteen, added here on 22 September 2026 for THE GIMBAL's
  // reason read forward: pages one and two are still at their limit and this
  // one has room. The subject in every one is the lung and its two chambers —
  // a fixture slung across the top of the field, with nothing of it among the
  // creatures — so there is no card a sheet could draw. The one exception is
  // the breath, and it is excused for the opposite reason: what it throws is
  // an ordinary meteor, whose card the sheet already has
  // (`sim/bellows.ts`, `sim/events-bellows.ts`).
  "boss.bellowsEnter":
    "the lung swinging in across the top of the field, waist tight and all four seams whole. It is a fixture hanging above the field, and the sheet's cards are silhouettes of bodies that stand on a grid.",
  "boss.bellowsMarks":
    "an exchange lighting, one mark on each handle. What they are on is the housings, which are the fixture. Same argument.",
  "boss.bellowsGrip":
    "a hand taking hold of its own handle. The handle is part of the fixture and the hand is nobody's contour. Same argument.",
  "boss.bellowsPulled":
    "the pilot's chamber drawn open and the ribs of it standing apart. Same argument, and what changed is the fixture's own width.",
  "boss.bellowsSeam":
    "a seam parting down the waist. A seam is a gap in the fixture rather than a body, so it goes with the fixture it is a gap in.",
  "boss.bellowsJam":
    "both handles seizing on a stroke worked out of turn. Same argument, and this one is a refusal: nothing on the field moves at all.",
  "boss.bellowsLate":
    "the one shared window running out with an exchange half done. Same argument, and an absence rather than a thing.",
  "boss.bellowsSpark":
    "a spark starting out of the gap the second seam left. A spark is not a body and the gap is the fixture's.",
  "boss.bellowsSparkOut": "that spark shot out, in either colour. Same argument.",
  "boss.bellowsSparkHit":
    "nobody shot it and it reached the hull. What is hit is the ship, which the hull's own sounds already have; what made it is the gap. Same argument.",
  "boss.bellowsBreath":
    "the lung forcing a breath down the cannon's column. What arrives is an ordinary body with a card of its own; this sound is the fixture pushing it out, which has none.",
  "boss.bellowsGlow":
    "the last seam lighting, with both handles up together for the first time. Same argument — a mark on the fixture.",
  "boss.bellowsHold":
    "one hand let go a beat before the other and the last seam holding. Same argument, and an absence: the split that did not happen.",
  "boss.bellowsSplit":
    "both hands off together and the waist splitting clean in two. Same argument — the fixture unmaking itself, as THE GIMBAL's hatch is.",
  "boss.bellowsVent":
    "the two halves falling apart and the whole held breath crossing the field. Same argument, and it is air rather than anything with a contour.",
  "boss.bellowsOut":
    "the empty lung dropping away and the wave ending. Same argument, and an absence.",
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
