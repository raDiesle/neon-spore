import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { controlSetForWave, setHas } from "../src/index.js";
import { sceneScript } from "../src/scene-script.js";
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

  it("holds a page about a body with that body around the middle of the screen", () => {
    // A page plays once and stands on its last frame, and on a page about a
    // body that frame is the picture the pair reads the words against. Every
    // film used to turn its first page four beats in, with the body it was
    // pointing at three rows down a fifteen-row field — under the corner
    // plate, at the top of the screen, with the whole field empty below it.
    // The owner, 12 September 2026: *when tutorials stop, the explained enemy
    // should be around the middle of the screen, not the top.* So a page
    // anchored at a body holds with that body no higher than row six — the
    // top of the middle third of the screen on a phone — and the pages after
    // it do their work lower on the field. A body that was never at the top
    // (one that crawls in along the hull, one that sits on it) is lower than
    // that already and passes.
    //
    // The body checked is the one the caption finds: the newest on the field,
    // which is the one nearest the top (`render/caption-anchor.ts`).
    //
    // Two bodies are where their wave puts them and no timing moves them: a
    // boss standing at the top of the field (THE WARDEN's ring on row two),
    // and a body that crosses along a row the game gives it — THE COIL walks
    // the top row wall to wall before it drops. Those hold where the wave will
    // show them.
    const MIDDLE_FROM = 6;
    const ON_A_ROW_OF_ITS_OWN = new Set(["coil"]);
    for (const { wave, id } of USED) {
      const scene = SCENES[id];
      const run = new SceneRun(sceneScript(id, wave, DEFAULT_CONFIG));
      scene.steps.forEach((step, i) => {
        if (step.anchor.at !== "body") return;
        run.restart(stepSpan(scene, i).to);
        let top: number | null = null;
        for (const c of run.world.creatures) {
          if (c.kind === scene.boss?.kind || ON_A_ROW_OF_ITS_OWN.has(c.kind)) continue;
          top = top === null ? c.row : Math.min(top, c.row);
        }
        if (top === null) return;
        expect(
          top,
          `${id}: "${step.text}" holds with its body at row ${top}, at the top of the screen`,
        ).toBeGreaterThanOrEqual(MIDDLE_FROM);
      });
    }
  });

  it("spends at most one page on what a miss costs", () => {
    // The film exists to teach a pair that they hold two different halves, and
    // the corner saying how the run is going — the retries now, the hull's bar
    // before it — is the one readout that is *identical* on both screens. The
    // owner cut the one page that pointed at it — "the game scene shows exactly the same for both players ... remove
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
      const paid = SCENES[id].steps.filter((s) => s.anchor.at === "retries");
      expect(paid.length, `${id} spends ${paid.length} pages on the retries`).toBeLessThanOrEqual(
        1,
      );
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
