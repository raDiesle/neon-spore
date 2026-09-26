import { removeCreatures } from "./field.js";
import { gumIsFlung } from "./gum.js";
import { rockHeading } from "./rock-cross.js";
import { openSlow } from "./slow.js";
import { occupiesCol } from "./span.js";
import { type ThroatState, throatMouthCol, throatMouthRow, throatSpent } from "./throat.js";
import { podStanding, throatHasHold, throatHasHoldOfPod } from "./throat-pull.js";
import type { World } from "./world.js";

/**
 * **The two things that change THE THROAT's health**, and they are opposite
 * gestures — which is the boss.
 *
 * A gum flung into the mouth chokes a ring (`throatChoked`); anything else the
 * mouth takes re-tightens one (`throatFed`). So the pair's habit of clearing
 * the field is the thing healing it, and the answer is the one body on the
 * field that neither the cannon nor the plate can touch.
 *
 * Cut out of `throat-step.ts` on 19 September 2026, when the cinch and the
 * haul put that file ten lines over its limit. The seam is the one its own
 * header had drawn: that page is the clock — install, phase, breath, haul —
 * and this one is what the clock finds when it arrives. Both are called from
 * `stepThroat` and in that order, and nothing else calls either.
 */

/**
 * **A gum a hand has flung, arriving at the mouth** — the only thing in the
 * game that hurts this boss, and one hit test rather than a mechanic
 * (`bosses-choreographed.md` §1, *Cost*).
 *
 * Called from `beat.ts` after the bodies have moved, so the gum has already
 * taken this beat's stride along its row (`stepRockAcross`). It lands if the
 * mouth's column is **inside the stride it just flew**: a gum crosses
 * `gumFlingCols` columns a beat and the mouth is one column wide, so a test
 * that asked only whether the two were equal would be a boss a fling flew
 * straight over two times in three. The sweep is read off where the gum
 * *landed* and the way it is going rather than off where it came from —
 * `fromCol` is a fact about the picture and outside the fingerprint, and a hit
 * test that read it would be a hit test two devices could disagree about.
 *
 * A gum that reaches the mouth is gone: the tube has it, and `slack` goes up
 * for good. Then THE SLOW, because the design asks for it by name — *the
 * fling is a SLOW* — and the beat it crosses its last column is the best shot
 * in the fight.
 */
export function throatChoked(world: World, b: ThroatState): void {
  const cfg = world.cfg;
  if (b.phase === "everts") return;
  const mouth = throatMouthCol(cfg, b, world.beat);
  const row = throatMouthRow(cfg);
  const taken: number[] = [];
  for (const c of world.creatures) {
    if (!gumIsFlung(c) || c.row !== row) continue;
    const past = (c.col - mouth) * rockHeading(c);
    if (past < 0 || past >= cfg.gumFlingCols) continue;
    taken.push(c.id);
  }
  if (taken.length === 0) return;
  removeCreatures(world, taken);
  b.slack = Math.min(cfg.throatRings, b.slack + taken.length);
  b.chokedBeat = world.beat;
  // Before the spent test, because a gum that lands on the last ring is still
  // a gum landing: the eversion follows on the next `stepThroat` and this is
  // the hit that earned it. Missing it would make the best shot in the fight
  // the one shot with no sound.
  world.events.push({ type: "throatChoke", col: mouth });
  if (throatSpent(cfg, b)) return;
  openSlow(world, cfg.slowBeats, "show");
}

/**
 * **Whatever is standing in the mouth on an inhale beat**, swallowed — and
 * every one of them re-tightens a ring.
 *
 * All of them rather than one, which is the design's own step 10: *the throat
 * eats the pod and two rings re-tighten*. A boss that healed once however much
 * it was fed would make the field's own pressure free, and the field's pressure
 * is the entire threat here.
 *
 * `throatHasHold` rather than a column test written out again, so the body the
 * fall loop refused to drop and the body the mouth takes are decided by one
 * rule (`throat-pull.ts`). A pod standing in the mouth is taken by the same
 * rule's pod-shaped half, and counts the same: the design's step 10, *the
 * throat eats the pod and two rings re-tighten*.
 */
export function throatFed(world: World, b: ThroatState): void {
  const row = throatMouthRow(world.cfg);
  const mouth = throatMouthCol(world.cfg, b, world.beat);
  const eaten: number[] = [];
  for (const c of world.creatures) {
    if (c.row !== row || !occupiesCol(c, mouth)) continue;
    if (!throatHasHold(world, b, c)) continue;
    eaten.push(c.id);
  }
  const before = world.pods.length;
  world.pods = world.pods.filter(
    (p) => podStanding(p).row !== row || !throatHasHoldOfPod(world, b, p),
  );
  const fed = eaten.length + before - world.pods.length;
  if (fed === 0) return;
  removeCreatures(world, eaten);
  b.slack = Math.max(0, b.slack - fed);
  b.fedBeat = world.beat;
  // Once however many it took, because the sound says *the boss healed* and a
  // mouthful of three is one swallow to look at. What the pair is owed here is
  // the fact, and the fact is a ring they had already paid for coming back.
  world.events.push({ type: "throatSwallow", col: mouth });
}
