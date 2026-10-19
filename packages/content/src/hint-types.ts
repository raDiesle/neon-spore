import type { SceneAnchor } from "./scene-step-types.js";

/**
 * **What a wave's field says while it is played**, one line at a time — the
 * shape `Wave.hints` names (`wave-hints.ts`) and `render/src/wave-hint.ts`
 * draws.
 *
 * A line is a film page without a clock: a seat, its words and the thing they
 * stand beside, and instead of a tick the **state of the field** it is true
 * in. A screen shows its seat's lines that hold now and whose subject is on
 * it, **taking turns** a few beats each when more than one does — so a film's
 * three pages for a seat become three lines it reads in order, over and over,
 * while the state they are true in lasts.
 */
export interface HintLine {
  /** Whose screen. The other seat never sees it. */
  seat: 1 | 2;
  /** At most 28 characters, the film's own limit, spelled out and in the present. */
  text: string;
  /** What it stands beside — a film caption's subject, found the same way. */
  anchor: HintAnchor;
  /** When it is true: every state named must hold. Absent is `always`. */
  when?: HintWhen | readonly HintWhen[];
  /**
   * Whether this seat's thumb is the one wanted while the line holds. `test`
   * — both halves on one screen — shows the acting lines; absent is `true`.
   */
  acts?: boolean;
}

/**
 * A film caption's subject, or **the button that kills the next body** — the
 * one subject a film could name by hand, since it knew the colour it had
 * authored, and a live field cannot.
 */
export type HintAnchor = SceneAnchor | { at: "fire" };

/**
 * **The states a line can be true in**, read off the world and nothing else
 * (`render/src/wave-hint.ts` holds the reading). A closed list on purpose: a
 * line that needs a state not here is a new entry with its reading beside it,
 * never a clock — a moment placed by hand against a clock is a second copy of
 * where a body lands, the film's rule (`.claude/skills/new-tutorial`).
 *
 * The body the column states are about is **the next to land**: the lowest
 * one on the field, because it is the one a mistake is made on, and *under*
 * is under any column of its width. Every state but `always` wants a body on
 * the field; an `always` line holds before the first has arrived, which is
 * when a warning on the strip is the thing to read.
 */
export type HintWhen =
  /** Whenever the wave is teaching, a body on the field or not. */
  | "always"
  /** The cannon is not under the next body to land. */
  | "offColumn"
  /** It is. */
  | "onColumn"
  /** The shield is not under the next body to land. */
  | "shieldOff"
  /** It is. */
  | "shieldOn"
  /** A hand is on a body — either seat's, any body (`sim/grip.ts`). */
  | "held"
  /** No hand is on any. */
  | "free";
