import type { Command, SceneCommand, SceneScript, SimConfig } from "@neon-spore/sim";
import { controlHold, controlPress } from "./control-command.js";
import { type ControlId, control } from "./controls.js";
import { bossFromWave, mapCol, podsFromWave, queueFromWave } from "./queue.js";
import { dragCommands } from "./scene-drag.js";
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
/** A film's tap on a held control, in ticks — a thumb, not a hold. */
const TAP_TICKS = 6;

export function sceneCommands(act: SceneAct, cfg: SimConfig): SceneCommand[] {
  if (act.grip !== undefined) return gripCommands(act, cfg.cols);
  if (act.drag !== undefined) return dragCommands(act, cfg);
  // The device shaken: one command carrying nothing, and nothing to let go of.
  // The pilot's, unauthored, exactly as a drag's seat is.
  if (act.shake) return [{ tick: act.tick, player: 1, command: { kind: "shake" } }];
  const id = controlOf(act);
  const def = control(id);
  const down: SceneCommand = {
    tick: act.tick,
    player: def.player,
    command: commandFor(act, cfg.cols),
    // A strip answering a body rather than a column. The command still carries
    // the authored column, which is what it falls back to on an empty field;
    // `SceneRun` replaces it with the body's at the moment the thumb goes down
    // (`aimed` in `sim/scene.ts`), for the reason `gripCol` exists.
    ...(act.atBody ? { atBody: true as const } : {}),
  };
  // A thumb that stays on a *control* rather than on a handle: the two colours,
  // the gauge's two valve slabs and the bucket's two. What lifting sends is the
  // control's own release rather than a second act authored beside it
  // (`control-command.ts`), the same bargain a drag's lift makes.
  //
  // **A held control with no `until` is a tap, and it still has to lift.** The
  // two colours became holds when the lance lost its button, and every film
  // written before that presses them without saying when to let go — a thumb
  // left down on one fills the cannon lobe and fires a lance three beats later,
  // in the middle of a rehearsal about something else.
  if (!controlPress(id).up) return [down];
  const lift = act.until ?? act.tick + TAP_TICKS;
  return [down, { tick: lift, player: def.player, command: controlHold(id).up }];
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
    malfunction: scene.malfunction ?? null,
    // Sorted, because a grip contributes its release as well as its hold, and a
    // drag a whole run of carries — and any of those can fall after the act
    // written under it. `SceneRun` walks
    // the list once, in order, and would drop anything out of place.
    commands: scene.acts.flatMap((a) => sceneCommands(a, sceneCfg)).sort((a, b) => a.tick - b.tick),
    ticks: scene.ticks,
  };
}
