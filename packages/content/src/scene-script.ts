import type { Command, SceneCommand, SceneScript, SimConfig } from "@neon-spore/sim";
import { control } from "./controls.js";
import { mapCol, queueFromWave } from "./queue.js";
import { guideScene, type SceneAct, type SceneId } from "./scenes.js";

/**
 * A rehearsal turned into the two things the runner takes: a command track and
 * a whole `SceneScript`.
 *
 * Its own file beside `scenes.ts`, cut on the seam that file already had a
 * heading at: next door is *what a scene is* — the shapes, the table, and where
 * a page begins and ends — and this is the one translation out of it, into the
 * vocabulary `packages/sim` speaks. Nothing here decides anything about a film;
 * it only restates one in the runner's terms.
 */

/**
 * What a press *is*, derived from the control it is on.
 *
 * The seat comes from `ControlDef.player`, so a scene cannot author a press
 * into the wrong half of the split, and the command comes from the id, so it
 * cannot author a thumb on RED that fires cyan. A control with no command here
 * is one no scene has ever needed; it throws rather than being ignored,
 * because a silently dropped act is a hand pressing nothing.
 */
export function sceneCommand(act: SceneAct, cols: number): SceneCommand {
  const def = control(act.control);
  return { tick: act.tick, player: def.player, command: commandFor(act, cols) };
}

function commandFor(act: SceneAct, cols: number): Command {
  const col = mapCol(act.col ?? 0, cols);
  switch (act.control) {
    case "cannon":
      return { kind: "cannonCol", col };
    case "shield":
      return { kind: "shieldCol", col };
    case "fireRed":
      return { kind: "fire", color: "red" };
    case "fireCyan":
      return { kind: "fire", color: "cyan" };
    case "guard":
      return { kind: "guard" };
    case "intake":
      return { kind: "intake" };
    default:
      throw new Error(`no scene command for control ${act.control}`);
  }
}

/**
 * A scene, as the runner takes it: a built queue and a built command track,
 * handed over the way `startWave`'s queue is. `packages/sim` never reads this
 * file — it is told, and the direction stays `content -> sim`.
 */
export function sceneScript(id: SceneId, wave: number, cfg: SimConfig): SceneScript {
  const scene = guideScene(id);
  const sceneCfg: SimConfig = {
    ...cfg,
    bpm: scene.bpm,
    // A rehearsal held behind its own opening would be a guide inside a guide.
    briefings: false,
    // And a rehearsal's hull does not mend. The last thing FIRST STEP's film
    // shows is what a miss costs, and at three percent a second the bar had
    // crept back to full inside the same loop — which teaches the opposite of
    // the step it is under.
    hullRegenPerSecond: 0,
  };
  return {
    cfg: sceneCfg,
    seed: scene.seed,
    wave,
    queue: queueFromWave(scene, sceneCfg.cols),
    pods: [],
    boss: null,
    commands: scene.acts.map((a) => sceneCommand(a, sceneCfg.cols)),
    ticks: scene.ticks,
  };
}
