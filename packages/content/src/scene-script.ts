import type { Command, SceneCommand, SceneScript, SimConfig } from "@neon-spore/sim";
import { type ControlId, control } from "./controls.js";
import { bossFromWave, mapCol, podsFromWave, queueFromWave } from "./queue.js";
import type { SceneAct } from "./scene-types.js";
import { guideScene, type SceneId } from "./scenes.js";

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
export function sceneCommands(act: SceneAct, cols: number): SceneCommand[] {
  if (act.grip !== undefined) return gripCommands(act, cols);
  const def = control(controlOf(act));
  return [{ tick: act.tick, player: def.player, command: commandFor(act, cols) }];
}

/**
 * A hand on the field, down and up again.
 *
 * Two commands out of one act, because that is what the gesture is: `setGrip`
 * takes hold and `NO_GRIP` lets go (`sim/grip.ts`), and a rehearsal that only
 * ever took hold would end its loop with a hand still down on a world that is
 * about to be rebuilt. The column is carried through rather than resolved
 * here — the body standing in it is not known until the tick arrives, and
 * `SceneRun` is the only thing that ever sees a world.
 */
function gripCommands(act: SceneAct, cols: number): SceneCommand[] {
  const player = act.grip as 1 | 2;
  const col = actCol(act, cols);
  const until = act.until ?? act.tick;
  return [
    { tick: act.tick, player, command: { kind: "grip", id: 0 }, gripCol: col },
    { tick: until, player, command: { kind: "grip", id: 0 } },
  ];
}

/**
 * The real column an act names: the authored one put through the wave's own
 * remapping. One line, and it is a function because three callers wanted it —
 * a press, a grip, and the ghost hand over on the drawing side
 * (`render/guide-thumb.ts`), which had its own copy of the same expression.
 */
export function actCol(act: SceneAct, cols: number): number {
  return mapCol(act.col ?? 0, cols);
}

/** The control an act is on, or a loud failure: a grip is handled above, and
 * an act that is neither is an authoring mistake `test/scenes.test.ts` also
 * refuses. */
function controlOf(act: SceneAct): ControlId {
  if (!act.control) throw new Error(`scene act at tick ${act.tick} presses nothing`);
  return act.control;
}

function commandFor(act: SceneAct, cols: number): Command {
  const col = actCol(act, cols);
  switch (controlOf(act)) {
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
    // The same remapping the arrivals get, and from the same two functions a
    // wave's own pods and boss go through: a film is authored in the seven
    // columns every wave is authored in (`queue.ts`).
    pods: podsFromWave(scene, sceneCfg.cols),
    boss: bossFromWave(scene, sceneCfg.cols),
    // Sorted, because a grip contributes its release as well as its hold and
    // that release can fall after the act written under it. `SceneRun` walks
    // the list once, in order, and would drop anything out of place.
    commands: scene.acts
      .flatMap((a) => sceneCommands(a, sceneCfg.cols))
      .sort((a, b) => a.tick - b.tick),
    ticks: scene.ticks,
  };
}
