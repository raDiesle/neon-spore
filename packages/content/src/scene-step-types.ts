import type { DragTarget } from "@neon-spore/sim";
import type { ControlId } from "./controls.js";

/**
 * **A page of a rehearsal, and the thing its words point at.**
 *
 * Cut out of `scene-types.ts` along the seam that file already had in it: next
 * door is a *thumb* — which control it presses, which handle it carries, when
 * it lets go — and this is the sentence the pair reads while it happens.
 * Neither reads the other, and `scene-types.ts` re-exports both so nothing
 * moved.
 */
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
   * Both of the queen's marks at once, in one ring around the pair.
   *
   * The one anchor that is deliberately about *two* things. `one mark is real`
   * is a sentence about a pair, and it was pointed at `body` — which is her,
   * so the ring sat on her shell between the two marks and touched neither.
   * `render/queen-figure.ts` places them, and this asks it.
   */
  | { at: "marks" }
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
  /** The run's line in the corner — the retry count, which a hit puts up.
   * It was `health`, the hull bar, until the hull lost its points. */
  | { at: "retries" };

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
