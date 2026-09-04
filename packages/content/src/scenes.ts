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

export interface GuideScene {
  /** How long one turn of the loop is, in ticks. */
  ticks: number;
  /**
   * The rehearsal's tempo. Quicker than a wave on purpose: the loop has to
   * show a fall, a slide, a crossing and a shot inside a second and a half,
   * and the alternative to a quicker beat is a slower loop nobody watches
   * twice. `test/scenes.test.ts` holds that it still divides the tick rate.
   */
  bpm: number;
  /**
   * How tall the rehearsal field is. Shorter than the game's, and this is the
   * one place a scene is knowingly not the shipped picture: two of these stand
   * side by side inside a guide panel on a phone, and fifteen rows at that
   * width is a field of six-pixel tiles. The columns are the game's own — a
   * scene teaches *which column*, so that is the number it may not change.
   */
  rows: number;
  seed: number;
  entries: WaveEntry[];
  acts: SceneAct[];
  /** The one line under the two screens. Fixed — a scene has no step list yet. */
  caption: string;
}

export type SceneId = "firstStep";

/**
 * FIRST STEP's rehearsal, which is the whole of the game's first minute in a
 * second and a half: a red slick shows on player 1's strip and falls, player
 * 1's thumb walks the cannon into its column, the hand crosses to the other
 * screen, presses RED, and the shot takes it.
 *
 * The crossing is the part the words cannot say. Nothing on either screen
 * moves between the slide and the press, and that gap *is* the sentence one of
 * them has to speak out loud — which is why the caption's middle word is SAY.
 */
const FIRST_STEP: GuideScene = {
  ticks: 192,
  bpm: 120,
  rows: 8,
  seed: 1,
  entries: [{ beat: 0, col: 5, color: "red" }],
  // A finger arrives at a column on the tick the world hears about it, and the
  // lobe eases after it — so the steps are close together: a hand two columns
  // ahead of the cannon for half a second is a hand that is not dragging it.
  acts: [
    // The hand starts where the cannon already is, so the first thing it does
    // is visibly move rather than appear somewhere new.
    { tick: 8, control: "cannon", col: 3 },
    { tick: 18, control: "cannon", col: 4 },
    { tick: 30, control: "cannon", col: 5 },
    { tick: 44, control: "cannon", col: 5 },
    { tick: 112, control: "fireRed" },
  ],
  caption: "SLIDE · SAY · FIRE",
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
    rows: scene.rows,
    // A rehearsal held behind its own opening would be a guide inside a guide.
    briefings: false,
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
