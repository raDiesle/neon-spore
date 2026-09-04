import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { control, controlSetForWave, setHas } from "../src/index.js";
import { SCENES, type SceneId, sceneScript } from "../src/scenes.js";
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
        expect(
          setHas(set, act.control),
          `${WAVES[wave]?.name}'s scene presses ${act.control}, which ${set.name} has not got`,
        ).toBe(true);
      }
    }
  });

  it("gives a strip a column to be dragged to, and a lobe none", () => {
    for (const id of SCENE_IDS) {
      for (const act of SCENES[id].acts) {
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
      expect(script.commands.length).toBe(SCENES[id].acts.length);
      script.commands.forEach((cmd, i) => {
        expect(cmd.player).toBe(control(SCENES[id].acts[i]!.control).player);
      });
      // The rehearsal is never itself held behind an opening.
      expect(script.cfg.briefings).toBe(false);
    }
  });
});
