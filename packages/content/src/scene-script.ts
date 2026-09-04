import type { Command, DragTarget, SceneCommand, SceneScript, SimConfig } from "@neon-spore/sim";
import { controlPress } from "./control-command.js";
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
export function sceneCommands(act: SceneAct, cfg: SimConfig): SceneCommand[] {
  if (act.grip !== undefined) return gripCommands(act, cfg.cols);
  if (act.drag !== undefined) return dragCommands(act, cfg);
  const def = control(controlOf(act));
  return [{ tick: act.tick, player: def.player, command: commandFor(act, cfg.cols) }];
}

/**
 * How far a handle is carried when the film does not say: as far as it goes.
 *
 * The three numbers are the simulation's own, and are read off the config
 * rather than repeated here — `packages/sim/test/purity.test.ts` exists to
 * catch exactly the second copy this would otherwise be.
 */
function tautMilli(target: DragTarget, cfg: SimConfig): number {
  if (target === "lidString") return cfg.lidTautMilli;
  if (target === "wardenTether") return cfg.wardenTautMilli;
  return cfg.mazeTurnMilli;
}

/**
 * Which way a handle is carried.
 *
 * **Down**, for the two that are pulled: a pull is clamped to stay on the
 * field (`sim/handle-pull.ts`), and down is the one direction the field always
 * has room for from where a cord or a rope hangs. Carried sideways by the same
 * distance, a lid in the third column runs out of field and is clipped short
 * of taut — the plates then never part, which is a film that shows the gesture
 * and not the point of it.
 *
 * **Across**, for the one that is turned: a wheel is turned by how far the
 * hand has come, and that is the x of it and nothing else
 * (`sim/maze-controls.ts`).
 */
function pullsDown(target: DragTarget): boolean {
  return target !== "mazeString";
}

/**
 * A hand on a cord, carried and let go.
 *
 * **It travels rather than jumping.** A single command at the taut distance
 * would be a hand that teleported, and the whole of what a page about a handle
 * has to show is the carrying: the plates parting, the hatch coming up. So the
 * pull is a handful of commands from the grab to the far end, which is also
 * what a real thumb sends — a `drag` is cumulative from the grab, so each one
 * supersedes the last and a film that drops one heals itself
 * (`sim/command-types.ts`).
 *
 * The seat is the pilot's for all three targets and is not authored: the
 * navigator carries both colours and fires, so a handle either of them could
 * reach would be a round one phone could play (`render/handles.ts`).
 */
function dragCommands(act: SceneAct, cfg: SimConfig): SceneCommand[] {
  const target = act.drag as DragTarget;
  const to = act.toMilli ?? tautMilli(target, cfg);
  const until = act.until ?? act.tick;
  const span = Math.max(1, until - act.tick);
  const steps = Math.max(1, Math.min(PULL_STEPS, span));
  const out: SceneCommand[] = [];
  for (let i = 0; i < steps; i++) {
    const at = act.tick + Math.round((span * i) / steps);
    out.push({
      tick: at,
      player: 1,
      command: {
        kind: "drag",
        target,
        on: true,
        ...carry(target, Math.round((to * i) / (steps - 1 || 1))),
      },
      // Every one of them, not only the grab: a lid may have fallen a row
      // between two of these, and the id is the address of the cord rather
      // than of where it was.
      ...(target === "lidString" ? { dragCol: actCol(act, cfg.cols) } : {}),
    });
  }
  out.push({
    tick: until,
    player: 1,
    command: { kind: "drag", target, on: false, ...carry(target, 0) },
  });
  return out;
}

/** How many messages one carry is spelled in. Enough that the plates are seen
 * parting rather than found apart, and few enough to stay a gesture. */
const PULL_STEPS = 6;

/** One distance, on the axis this handle is carried along. */
function carry(target: DragTarget, milli: number): { fromMilli: number; fromYMilli: number } {
  return pullsDown(target)
    ? { fromMilli: 0, fromYMilli: milli }
    : { fromMilli: milli, fromYMilli: 0 };
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
  // `control-command.ts` is the one copy of what a press says, for every panel
  // in the game. It used to be a seven-case switch here, which is why no wave
  // with a round of its own could carry a rehearsal: THE GAUGE's valve, THE
  // FLEET's arrows, SNAKE's turns and PINBALL's latch all threw.
  return controlPress(controlOf(act), actCol(act, cols)).down;
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
    // Sorted, because a grip contributes its release as well as its hold, and a
    // drag a whole run of carries — and any of those can fall after the act
    // written under it. `SceneRun` walks
    // the list once, in order, and would drop anything out of place.
    commands: scene.acts.flatMap((a) => sceneCommands(a, sceneCfg)).sort((a, b) => a.tick - b.tick),
    ticks: scene.ticks,
  };
}
