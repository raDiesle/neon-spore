import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullPercent, SceneRun, type SimEvent } from "@neon-spore/sim";
import { control, controlSetForWave, setHas } from "../src/index.js";
import { sceneScript } from "../src/scene-script.js";
import { SCENES, type SceneId, stepAt, stepSpan } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * A rehearsal is a picture of a panel the pair is about to be handed, so the
 * one thing it may never do is press a button that panel does not have.
 *
 * That is not a hypothetical. A scene names a control, the ghost thumb is
 * placed from `bandLobes` for that name, and `bandLobes` only ever returns the
 * lobes the wave's *set* carries — so an act naming `lance` on a wave played
 * on the standard panel would produce a hand hovering over nothing while the
 * world it is supposedly driving fired anyway. The failure is silent in the
 * drawing and invisible in the types, which is what makes it a test.
 */

const SCENE_IDS = Object.keys(SCENES) as SceneId[];

/** Every wave that names a scene, and the scene it names. */
const USED = WAVES.map((w, i) => ({ wave: i, id: w.guide?.scene })).filter(
  (u): u is { wave: number; id: SceneId } => u.id !== undefined,
);

describe("the rehearsals a guide can show", () => {
  it("only ever presses a control the wave's own panel carries", () => {
    for (const { wave, id } of USED) {
      const set = controlSetForWave(wave);
      for (const act of SCENES[id].acts) {
        if (!act.control) continue;
        expect(
          setHas(set, act.control),
          `${WAVES[wave]?.name}'s scene presses ${act.control}, which ${set.name} has not got`,
        ).toBe(true);
      }
    }
  });

  it("gives every act exactly one of a control and a grip", () => {
    // The grip is the one gesture that is not on the panel — a finger held on
    // the field — so an act carries either a `control` or a `grip` and never
    // both, and never neither. `sceneCommands` throws on the third case rather
    // than dropping it silently, and this is what keeps it from being thrown.
    for (const id of SCENE_IDS) {
      for (const act of SCENES[id].acts) {
        const both = act.control !== undefined && act.grip !== undefined;
        const neither = act.control === undefined && act.grip === undefined;
        expect(both || neither, `${id} has an act at tick ${act.tick} that presses nothing`).toBe(
          false,
        );
        if (act.grip === undefined) continue;
        expect(act.col, `${id}: a grip at tick ${act.tick} has no column`).toBeGreaterThanOrEqual(
          0,
        );
        expect(act.until ?? -1, `${id}: a grip at tick ${act.tick} never lets go`).toBeGreaterThan(
          act.tick,
        );
      }
    }
  });

  it("gives a strip a column to be dragged to, and a lobe none", () => {
    for (const id of SCENE_IDS) {
      for (const act of SCENES[id].acts) {
        if (!act.control) continue;
        const form = control(act.control).form;
        expect(act.col === undefined, `${id}: ${act.control} carries the wrong argument`).toBe(
          form !== "strip",
        );
      }
    }
  });

  it("keeps every act inside the loop it belongs to", () => {
    for (const id of SCENE_IDS) {
      const scene = SCENES[id];
      let last = -1;
      for (const act of scene.acts) {
        expect(act.tick, `${id} is not in order`).toBeGreaterThanOrEqual(last);
        expect(act.tick, `${id} presses past the end of its own loop`).toBeLessThan(scene.ticks);
        last = act.tick;
      }
    }
  });

  it("starts on a step and keeps every one of them inside the loop, in order", () => {
    // `stepAt` promises never to return undefined, and the whole of what makes
    // that true is that a scene's first step is at tick 0.
    for (const id of SCENE_IDS) {
      const scene = SCENES[id];
      expect(scene.steps[0]?.tick, `${id} has no step at tick 0`).toBe(0);
      let last = -1;
      for (const step of scene.steps) {
        expect(step.tick, `${id}'s steps are out of order`).toBeGreaterThan(last);
        expect(step.tick, `${id} has a step past the end of its own loop`).toBeLessThan(
          scene.ticks,
        );
        last = step.tick;
      }
    }
  });

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

  it("finds the step showing at any tick of the loop", () => {
    for (const id of SCENE_IDS) {
      const scene = SCENES[id];
      for (const step of scene.steps) {
        expect(stepAt(scene, step.tick)).toBe(step);
      }
      expect(stepAt(scene, scene.ticks - 1)).toBe(scene.steps[scene.steps.length - 1]!);
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

  it("hands the runner the pods and the boss a film authors", () => {
    // `sceneScript` used to write `pods: []` and `boss: null` as literals,
    // which made SALVAGE — a wave whose whole subject is a pod — and every
    // boss in act two impossible to write a film for. Both go through the
    // wave's own remapping now, so a column authored in seven lands on the
    // field the game is really played on.
    for (const { wave, id } of USED) {
      const script = sceneScript(id, wave, DEFAULT_CONFIG);
      expect(script.pods.length, `${id} lost its pods`).toBe(SCENES[id].pods?.length ?? 0);
      expect(script.boss === null, `${id} lost its boss`).toBe(SCENES[id].boss === undefined);
      for (const pod of script.pods) {
        expect(pod.col, `${id}: a pod landed off the field`).toBeLessThan(DEFAULT_CONFIG.cols);
      }
    }
  });

  it("plays out the way it was written to, every tick of it", () => {
    // The one test that watches a film rather than reading it.
    //
    // A rehearsal is a real world stepped by the real `step`, which is the
    // whole argument for it — and the price of that is that a film is only as
    // true as the rules under it. A shot authored to land stops landing when
    // the fall speed changes; a guard authored to catch a rock stops catching
    // it when the window moves; a dart's side and a veil's colour come off the
    // seeded rng and change when anything else touches that stream. Every one
    // of those failures is silent in the picture: what the pair sees is a
    // tutorial getting it wrong.
    //
    // The invariant that catches all of them needs no authored expectation:
    // **a film costs the hull if and only if it has a page anchored at what
    // the hull has left.** A shot that stops landing lets a body through and
    // the hull pays for it; a deliberate miss that stops missing takes the
    // mark away from under the page that is pointing at it.
    //
    // `health` and not `hull`: the two are a cost and a place. The bar is only
    // ever pointed at to say something has been paid for, while the ship
    // itself is pointed at to say *there* — THE MIRROR stands over the hull and
    // performs at it, and that page is about where to look rather than about
    // damage.
    for (const { wave, id } of USED) {
      const run = new SceneRun(sceneScript(id, wave, DEFAULT_CONFIG));
      const full = hullPercent(run.world);
      const spent: SimEvent[] = [];
      for (let t = 0; t < SCENES[id].ticks - 1; t++) run.advance(spent);
      const paid = SCENES[id].steps.some((s) => s.anchor.at === "health");
      expect(
        hullPercent(run.world) < full,
        paid
          ? `${id} points a page at what the hull has left and never marks it`
          : `${id} loses hull with no page saying why`,
      ).toBe(paid);
    }
  });

  it("keeps a rehearsal's hull from mending, so a miss leaves a mark", () => {
    // The last step of FIRST STEP's film is the hull bar dropping. At the
    // game's own three percent a second the bar was back to full inside the
    // same loop, which teaches the opposite of the words over it.
    for (const { wave, id } of USED) {
      expect(sceneScript(id, wave, DEFAULT_CONFIG).cfg.hullRegenPerSecond).toBe(0);
    }
  });

  it("runs at a tempo that divides the tick rate", () => {
    // `ticksPerBeat` throws on a beat that does not land on a tick, and a guide
    // is the worst possible place to find that out: the first wave of the game
    // would open on an exception. A scene authors its own tempo, so the guard
    // belongs here, over the tick rate the game actually ships.
    for (const id of SCENE_IDS) {
      const exact = (DEFAULT_CONFIG.tickHz * 60) / SCENES[id].bpm;
      expect(exact, `${id} runs at ${SCENES[id].bpm} bpm, which drifts`).toBe(Math.round(exact));
    }
  });

  it("builds a script whose presses are the seats the controls belong to", () => {
    for (const { wave, id } of USED) {
      const script = sceneScript(id, wave, DEFAULT_CONFIG);
      // One command per press, and two per grip: a hand goes down and comes up
      // again (`scene-script.ts`).
      const grips = SCENES[id].acts.filter((a) => a.grip !== undefined).length;
      expect(script.commands.length).toBe(SCENES[id].acts.length + grips);
      for (const act of SCENES[id].acts) {
        const seat = act.grip ?? control(act.control!).player;
        const sent = script.commands.filter((c) => c.tick === act.tick && c.player === seat);
        expect(sent.length, `${id}: nothing sent for the act at tick ${act.tick}`).toBeGreaterThan(
          0,
        );
      }
      // Sorted, because `SceneRun` walks the list once and drops what is out of
      // place — and a grip's release is written after the act it belongs to.
      const ticks = script.commands.map((c) => c.tick);
      expect(ticks, `${id}'s commands are out of order`).toEqual([...ticks].sort((a, b) => a - b));
      // The rehearsal is never itself held behind an opening.
      expect(script.cfg.briefings).toBe(false);
    }
  });
});
