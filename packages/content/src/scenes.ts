import type { ControlId } from "./controls.js";
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
  /**
   * Tick this step begins on. Ordered, and the first one starts at 0.
   *
   * A step runs until the next one begins, and the last until the loop ends:
   * that span is a **page**, and it is what repeats while a seat is reading it
   * (`stepSpan`). So a tick here is not a cue inside a film any more, it is a
   * page boundary — two steps close together are one page nobody can read.
   */
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
   * The rehearsal's tempo. It used to be 180 — a third quicker again than this
   * — on the argument that a film with five things to show should not make
   * anybody sit through them. That argument is spent: the film is not one run
   * any more but a stack of pages the pair turns itself (`sim/guide-steps.ts`),
   * so nothing is waiting on the end of it and the owner's answer to watching
   * the old one was simply that **the animations were too fast**. 120 is a beat
   * every half second, between the old film's third and the game's own
   * five-eighths. `test/scenes.test.ts` holds that it still divides the tick
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
  ticks: 1380,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 5, color: "red" },
    { beat: 4, col: 1, color: "red" },
  ],
  // A finger arrives at a column on the tick the world hears about it, and the
  // lobe eases after it — so the steps are close together: a hand two columns
  // ahead of the cannon for half a second is a hand that is not dragging it.
  // Every press sits a beat and a half after the page that asks for it opens.
  // The owner watched the hand start moving as the words arrived and asked for
  // the other order — *before the slider starts moving it should briefly stay
  // with the text, then slide with the text* — because a pair reading "slide to
  // its column" while the column is already being slid to has been shown the
  // answer rather than asked the question.
  acts: [
    { tick: 330, control: "cannon", col: 3 },
    { tick: 360, control: "cannon", col: 4 },
    { tick: 390, control: "cannon", col: 5 },
    { tick: 420, control: "cannon", col: 5 },
    { tick: 690, control: "fireRed" },
  ],
  // Five pages, each one long enough to watch twice without being long enough
  // to wait through: two seconds, three, two and a half, one and a half, two
  // and a half at 120 ticks a second. Each begins where the one before it ends
  // and is replayed from the top of the loop, so what a page shows is the world
  // as it really stood at that tick and not a clip cut out of it.
  steps: [
    // ENEMY and not SLICK: it is the first thing either of them has ever seen
    // on this field, and a name for a kind of enemy teaches nothing until there
    // is a second kind to tell it from. The owner's own correction.
    { tick: 0, seat: 1, text: "ENEMY", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "P1 · SLIDE TO ITS COLUMN",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 600, seat: 2, text: "P2 · FIRE RED", anchor: { at: "control", control: "fireRed" } },
    { tick: 900, seat: 1, text: "MISS ONE", anchor: { at: "body" } },
    // The second slick reaches the hull on beat 19, which is tick 1140 at this
    // tempo. The page opens three beats before that, so the pair reads the words
    // and then watches the bar drop rather than the other way round — and has
    // four beats left afterwards to look at what it cost.
    { tick: 1080, seat: 1, text: "AND THE HULL TAKES IT", anchor: { at: "health" } },
  ],
};

export const SCENES: Record<SceneId, GuideScene> = { firstStep: FIRST_STEP };

export function guideScene(id: SceneId): GuideScene {
  const found = SCENES[id];
  if (!found) throw new Error(`no scene named ${id}`);
  return found;
}

/**
 * How many pages of film a scene has. What the simulation is told about a wave's
 * guide, so it knows which page is the last one and therefore where the ready
 * gate is (`sim/guide-steps.ts`); it is a count and never a scene, because
 * `packages/sim` may not read this file.
 */
export function sceneSteps(id: SceneId): number {
  return guideScene(id).steps.length;
}

/**
 * A page's span: the tick it opens on and the tick it ends on. The last page
 * runs to the end of the loop. This is what a page replays, over and over,
 * while the seat reading it takes as long as it likes.
 */
export function stepSpan(scene: GuideScene, index: number): { from: number; to: number } {
  const step = scene.steps[Math.max(0, Math.min(scene.steps.length - 1, index))]!;
  const next = scene.steps[scene.steps.indexOf(step) + 1];
  return { from: step.tick, to: next ? next.tick : scene.ticks };
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
