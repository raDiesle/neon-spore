import type { BossEntry, PodEntry } from "@neon-spore/sim";
import type { ControlId } from "./controls.js";
import type { WaveEntry } from "./wave-types.js";

/**
 * The shapes a rehearsal is written in. The films themselves are one per file
 * under `scenes/`, and `scenes.ts` is the list of them.
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
 * One moment of the rehearsal: a thumb on a control, or a hand on the field.
 *
 * `packages/render/src/guide-thumb.ts` reads exactly this list to place the
 * hand — a lobe's circle comes from `bandLobes`, a strip's from the strip and
 * the column — so the hand and the world are driven by one authored fact and
 * cannot come apart.
 *
 * **A grip is the one act that is not on a control**, because the gesture is
 * not: THE GRIP is a finger held on something falling, on the field itself
 * (`sim/grip.ts`), and it is the one verb either seat may use. It is authored
 * as a column and a span of ticks rather than as a creature, because a scene
 * is written before a world exists and ids are dealt out by the simulation —
 * the runner finds what is standing in that column at the moment the hand goes
 * down (`sim/scene.ts`). Exactly one of `control` and `grip` is ever set;
 * `test/scenes.test.ts` holds that.
 */
export interface SceneAct {
  /** Tick within the loop. Ordered, and the first one places the hand. */
  tick: number;
  control?: ControlId;
  /** Where a strip is dragged to, in authored columns. Absent on a lobe. */
  col?: number;
  /** A hand on the field instead of on the panel: which seat's. The column is
   * `col`, which a grip always carries. */
  grip?: 1 | 2;
  /** The tick that hand lifts again. A grip always says when it lets go —
   * a hold with no end is a hand that stays down past the end of the loop. */
  until?: number;
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
  /** Whatever a hand is holding — the subject of a page about THE GRIP, and
   * the one anchor that follows a body chosen by the world rather than named
   * by the author. */
  | { at: "held" }
  /**
   * The warning strip along the top edge. It points at the blip when this
   * screen carries one and at the middle of the strip when it does not, which
   * is what makes *"player 2 sees nothing"* a page that can be drawn at all:
   * the same anchor, on the two screens, pointing at a thing and at its
   * absence.
   */
  | { at: "radar" }
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
  /**
   * Pods hanging in the field, and the boss it is played against — both in the
   * same shapes a wave writes them in, and both optional because most films
   * have neither.
   *
   * **They are here because a rehearsal that could not carry them could not
   * teach half the game.** `sceneScript` used to hand the runner `pods: []` and
   * `boss: null` as literals, which meant SALVAGE — a wave whose entire subject
   * is a pod — and the six bosses of act two, each a mechanic taught nowhere
   * else, were the waves a film could never be written for. Nothing in
   * `packages/sim` was missing: `startWave` has always taken both.
   */
  pods?: PodEntry[];
  boss?: BossEntry;
  acts: SceneAct[];
  steps: SceneStep[];
}
