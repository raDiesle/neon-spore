import type { BossEntry, DragTarget, PodEntry } from "@neon-spore/sim";
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
  /**
   * A hand on a **cord, a string or a rope** — the third gesture that is not a
   * press on a button, and the one that had no way of being written down.
   *
   * All three are the pilot's: the navigator carries both colours and fires,
   * so a handle either seat could reach would be a round one phone could play
   * (`render/handles.ts` says it three times, once per handle). So the seat is
   * read off the target rather than authored beside it, the way a press reads
   * its seat off `ControlDef.player`.
   *
   * `col` says where the body is for `lidString`, which is the one handle that
   * is *many* — a wave may send three lids down at once, and the cord names
   * the body it hangs off by an id no author can know. It is the grip's
   * arrangement exactly: the column is what an author can know, because it is
   * what they wrote the arrival in, and `SceneRun` fills the id in at the
   * moment the hand goes down. A maze has one string and a warden one rope, so
   * neither needs it.
   *
   * `until` is when the hand lets go, and it is required for the reason a
   * grip's is: a hold with no end is a hand still down on a world that is
   * about to be rebuilt.
   */
  drag?: DragTarget;
  /**
   * How far the hand carries it, in thousandths of a tile — the units every
   * draggable control speaks (`Command` in `sim/command-types.ts`).
   *
   * Left out, it is the target's own taut distance, which is what a film about
   * a handle almost always wants: the plates fully apart, the hatch open, the
   * wheel round. Written down, it is a pull that stops short — the picture a
   * page about *not far enough* needs.
   */
  toMilli?: number;
  /**
   * The tick the carry is *finished*, when that is not the tick the hand lets
   * go. The messages spread over `tick`..`by` and then stop; the hand stays
   * where it left them until `until`.
   *
   * Two clocks rather than one, because two of the three handles need them
   * apart. A lid's plates shut the instant the cord is released, so a film has
   * to fire while it is still held — and THE MAZE's wheel unlocks on the next
   * *movement* after a click, so a hand that carried on past the column took
   * it back off the pair. Absent, the carry runs to the release, which is a
   * hand that arrives and immediately lets go.
   */
  by?: number;
  /**
   * The tick the thumb lifts.
   *
   * A grip and a drag always say when they let go — a hold with no end is a
   * hand still down on a world that is about to be rebuilt. On an ordinary
   * **control** it is what makes the act a hold rather than a press, and only
   * the five that are held will take one: the lance, the gauge's two valve
   * slabs and the bucket's two (`ControlPress.up`). Absent, on a control, is a
   * press — which is what every other one is.
   */
  until?: number;
  /**
   * Draw the hand **on the ship** rather than on the panel below it.
   *
   * The command is unchanged and so is the seat: this is the same control
   * reached the other way. Six of them can be — the cannon slid on the hull,
   * a lift that carried it nowhere opening the maw, the plate dragged, the
   * plate pressed to fire it, and the muzzle carried left or right for a
   * colour (`render/src/touch-ship.ts`) — and a wave is playable with the band
   * alone, so this is never what a film shows unless the film is *about* it.
   *
   * Where the hand goes is not authored with it. The swelling is wherever the
   * world has left the cannon or the plate, so the drawing reads that rather
   * than a column somebody typed beside the act — the rule the ghost hand has
   * played by since it existed.
   */
  onField?: true;
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
  /** The pod hanging in the field — the subject of SALVAGE, THE PURGE and THE
   * WARD, and the one thing on the field that is neither a body nor a shot. */
  | { at: "pod" }
  /**
   * The swelling on the hull a control is reached through, rather than the
   * button for it on the panel — the cannon, or the plate. Which of the two
   * answers a given control is `shipCircle`'s, so a caption cannot point at
   * one swelling while the hand presses the other.
   */
  | { at: "ship"; control: ControlId }
  /** A handle on the field, wherever the hand has carried it — the maze's
   * string, the warden's rope or a lid's cord (`render/handles.ts`). */
  | { at: "handle"; target: DragTarget }
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
