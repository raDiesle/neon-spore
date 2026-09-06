import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { controlSetForWave, setHas } from "../src/index.js";
import { SCENES, type SceneId, stepSpan } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * The **pages** a rehearsal is read off, rather than the acts it plays.
 *
 * A step is a page: it stands until the seat reading it presses NEXT, and the
 * three things that can be wrong with one are how long it is on the screen,
 * how much of it there is to read, and what it points at. None of that depends
 * on a creature, on a control the world answers, or on the film's own
 * arithmetic, which is why it separates cleanly from `scenes.test.ts` next
 * door: that file asks whether the acts a film performs are ones the wave's
 * panel could have performed, and this one asks whether a person can read what
 * is written over them. `scenes.test.ts` had reached 443 lines holding both
 * halves and the named films besides.
 */

const SCENE_IDS = Object.keys(SCENES) as SceneId[];

/** Every wave that names a scene, and the scene it names. */
const USED = WAVES.map((w, i) => ({ wave: i, id: w.guide?.scene })).filter(
  (u): u is { wave: number; id: SceneId } => u.id !== undefined,
);

describe("the pages a rehearsal is read off", () => {
  it("gives every page long enough on the screen to be read", () => {
    // A step is a page now, not a cue: it repeats until the seat reading it
    // presses NEXT, and what it repeats is the span between it and the next
    // one. A page under a second is a flicker nobody can follow, and the owner
    // asked for the film to be slower rather than tighter.
    for (const id of SCENE_IDS) {
      const scene = SCENES[id];
      const perSecond = DEFAULT_CONFIG.tickHz;
      for (let i = 0; i < scene.steps.length; i++) {
        const span = stepSpan(scene, i);
        expect(
          (span.to - span.from) / perSecond,
          `${id}: "${scene.steps[i]?.text}" is a page that flickers past`,
        ).toBeGreaterThanOrEqual(1.5);
      }
    }
  });

  it("spends at most one page on what the hull has left", () => {
    // The film exists to teach a pair that they hold two different halves, and
    // the bar saying what the hull has left is the one readout that is
    // *identical* on both screens. The owner cut the one page that pointed at
    // it — "the game scene shows exactly the same for both players ... remove
    // this, also for future tutorials" — and then asked for it back, because
    // without it the film never says what a miss costs: "the step is missing
    // to show that the enemy hits the ship and it loses health".
    //
    // One, then. A film built out of pages about the cost teaches nothing
    // about the split; a film with none of them never names the price of
    // getting it wrong.
    //
    // `hull` is deliberately not counted with it. That anchor is a *place* —
    // the middle of the field — and what stands there is not always the same
    // on the two screens: THE FLEET's chart fills it and carries the ships on
    // one phone and nothing but water on the other, which is the split itself
    // rather than an escape from it.
    for (const id of SCENE_IDS) {
      const paid = SCENES[id].steps.filter((s) => s.anchor.at === "health");
      expect(
        paid.length,
        `${id} spends ${paid.length} pages on what the hull has left`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it("keeps every caption short enough to read at a glance", () => {
    // A caption is read beside the thing it is about, under a beat, by
    // somebody who is watching something move. The owner's instruction was
    // "as short as possible"; this is the half of it that can be checked.
    for (const id of SCENE_IDS) {
      for (const step of SCENES[id].steps) {
        expect(step.text.length, `${id}: "${step.text}" is a long caption`).toBeLessThanOrEqual(28);
      }
    }
  });

  it("only points a caption at a control the wave's own panel carries", () => {
    for (const { wave, id } of USED) {
      const set = controlSetForWave(wave);
      for (const step of SCENES[id].steps) {
        if (step.anchor.at !== "control") continue;
        expect(
          setHas(set, step.anchor.control),
          `${WAVES[wave]?.name}'s scene points at ${step.anchor.control}`,
        ).toBe(true);
      }
    }
  });
});
