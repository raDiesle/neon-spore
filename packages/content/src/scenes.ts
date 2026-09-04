import type { Command, SceneCommand, SceneScript, SimConfig } from "@neon-spore/sim";
import { type ControlId, control } from "./controls.js";
import { mapCol, queueFromWave } from "./queue.js";
import type { WaveEntry } from "./wave-types.js";

/**
 * The rehearsals a guide can show, and the only place one is written down.
 *
 * A guide names a scene by id — `WaveGuide.scene` — the way a wave names a
 * control set by id. That is not a shortcut around putting the data on the
 * wave: it is the same argument `control-sets.ts` makes at the top of itself.
 * A named thing is something a person can be shown, argued with and told to
 * change; an anonymous literal inside a wave file is a hundred lines of
 * choreography sitting in the middle of a list of arrivals, and the director
 * would have to learn to serialize every one of them to save the wave beside
 * it (`tools/director/src/serialize.ts` writes one line for a name).
 *
 * **Everything here is authored in the game's own vocabulary.** Arrivals are
 * `WaveEntry`s in the same seven columns every wave is written in, put through
 * the same `queueFromWave`; a press names a `ControlId` and nothing else, and
 * which seat sends it, what `Command` it becomes and where the ghost thumb has
 * to be are all read off that one name. Two copies of "player 2 fires red"
 * would be two copies that could disagree, and the one that disagreed would be
 * the picture — a thumb pressing a button the world never felt.
 */

/**
 * One moment of the rehearsal: a thumb on a control.
 *
 * `packages/render/src/guide-thumb.ts` reads exactly this list to place the
 * hand — a lobe's circle comes from `bandLobes`, a strip's from the strip and
 * the column — so the hand and the world are driven by one authored fact and
 * cannot come apart.
 */
export interface SceneAct {
  /** Tick within the loop. Ordered, and the first one places the hand. */
  tick: number;
  control: ControlId;
  /** Where a strip is dragged to, in authored columns. Absent on a lobe. */
  col?: number;
}

/**
 * What a caption is pointing at, so it is drawn beside the thing it explains
 * rather than in a paragraph underneath the picture.
 *
 * The owner's instruction, and the whole reason there is no text block any
 * more: *show the text inside the screen, in the position where it is
 * explaining*. So a caption names a thing and the drawing finds it — a body on
 * the field, a control on the band, the ship, the hull bar — which means a
 * caption cannot drift away from its subject when the layout changes.
 */
export type SceneAnchor =
  | { at: "body" }
  | { at: "control"; control: ControlId }
  | { at: "hull" }
  | { at: "health" };

/**
 * One step of the film: a screen, a few words, and what they point at.
 *
 * **A step owns a seat, and that is what makes the switch legible.** The
 * rehearsal is drawn one screen at a time at full size — the owner asked for
 * the real screen and the room that buys — so the moment a step changes seat,
 * the picture slides from one device to the other and says whose it now is
 * (`guide-scene.ts`). A film that cut without saying would be two screens the
 * pair could not tell apart.
 */
export interface SceneStep {
  /** Tick this step begins on. Ordered, and the first one starts at 0. */
  tick: number;
  seat: 1 | 2;
  /** As few words as will do. It is read at a glance, beside its subject. */
  text: string;
  anchor: SceneAnchor;
}

export interface GuideScene {
  /** How long one turn of the loop is, in ticks. */
  ticks: number;
  /**
   * The rehearsal's tempo. Quicker than a wave on purpose: a film that shows a
   * fall, a slide, a switch, a shot and a hull taking a hit has five things to
   * get through, and the alternative to a quicker beat is a loop nobody
   * watches twice. `test/scenes.test.ts` holds that it still divides the tick
   * rate.
   *
   * The *field* is the game's own, unlike the tempo: same columns, same rows,
   * same hull. A rehearsal is played at full size now, so there is nothing to
   * be gained by shrinking it and a shape to be taught wrongly if it were.
   */
  bpm: number;
  seed: number;
  entries: WaveEntry[];
  acts: SceneAct[];
  steps: SceneStep[];
}

export type SceneId = "firstStep";

/**
 * FIRST STEP's rehearsal: the whole of the game's first minute, in five
 * seconds, on the two screens it actually happens on.
 *
 * Two slicks fall. The pair takes the first one — player 1 slides the cannon
 * into its column, the film switches to player 2's screen and fires red — and
 * the second is left alone on purpose, so the last thing the pair is shown is
 * what a miss costs. Nothing here is staged: both are ordinary arrivals in an
 * ordinary world, and the hull bar drops because the hull was hit.
 */
const FIRST_STEP: GuideScene = {
  ticks: 860,
  bpm: 180,
  seed: 1,
  entries: [
    { beat: 0, col: 5, color: "red" },
    { beat: 4, col: 1, color: "red" },
  ],
  // A finger arrives at a column on the tick the world hears about it, and the
  // lobe eases after it — so the steps are close together: a hand two columns
  // ahead of the cannon for half a second is a hand that is not dragging it.
  acts: [
    { tick: 150, control: "cannon", col: 3 },
    { tick: 170, control: "cannon", col: 4 },
    { tick: 190, control: "cannon", col: 5 },
    { tick: 210, control: "cannon", col: 5 },
    { tick: 330, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "SLICK", anchor: { at: "body" } },
    {
      tick: 110,
      seat: 1,
      text: "P1 · SLIDE TO ITS COLUMN",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 260, seat: 2, text: "P2 · FIRE RED", anchor: { at: "control", control: "fireRed" } },
    { tick: 430, seat: 1, text: "MISS ONE", anchor: { at: "body" } },
    // The second slick reaches the hull on beat 19, which is tick 760 at this
    // tempo. The words go up just before it lands, so the pair reads them and
    // then watches the bar drop rather than the other way round.
    { tick: 700, seat: 1, text: "AND THE HULL TAKES IT", anchor: { at: "health" } },
  ],
};

export const SCENES: Record<SceneId, GuideScene> = { firstStep: FIRST_STEP };

export function guideScene(id: SceneId): GuideScene {
  const found = SCENES[id];
  if (!found) throw new Error(`no scene named ${id}`);
  return found;
}

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

/** The step showing at this tick of the loop. Never undefined: a scene's first
 * step starts at tick 0, and `test/scenes.test.ts` is what holds that. */
export function stepAt(scene: GuideScene, tick: number): SceneStep {
  let found = scene.steps[0]!;
  for (const step of scene.steps) {
    if (step.tick > tick) break;
    found = step;
  }
  return found;
}
