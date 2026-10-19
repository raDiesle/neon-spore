import type { SceneAnchor } from "./scene-step-types.js";

/**
 * **What a wave's field says while it is played**, one line at a time — the
 * shape `Wave.hints` names (`wave-hints.ts`) and `render/src/wave-hint.ts`
 * draws.
 *
 * A line is a film page without a clock: a seat, its words and the thing they
 * stand beside, and instead of a tick the **state of the field** it is true
 * in. A screen shows the first of its seat's lines that holds now and whose
 * subject is on it, so a list reads top-down as *what to say first* and an
 * `always` line belongs at the foot of a seat's lines, as what is said when
 * nothing more urgent is.
 */
export interface HintLine {
  /** Whose screen. The other seat never sees it. */
  seat: 1 | 2;
  /** At most 28 characters, the film's own limit, spelled out and in the present. */
  text: string;
  /** What it stands beside — a film caption's subject, found the same way. */
  anchor: SceneAnchor;
  /** When it is true. Absent is `always`. */
  when?: HintWhen;
  /**
   * Whether this seat's thumb is the one wanted while the line holds. `test`
   * — both halves on one screen — shows the acting line; absent is `true`.
   */
  acts?: boolean;
}

/**
 * **The states a line can be true in**, read off the world and nothing else
 * (`render/src/wave-hint.ts` holds the reading). A closed list on purpose: a
 * line that needs a state not here is a new entry with its reading beside it,
 * never a clock — a moment placed by hand against a clock is a second copy of
 * where a body lands, the film's rule (`.claude/skills/new-tutorial`).
 *
 * The body these are about is **the next to land**: the lowest one on the
 * field, because it is the one a mistake is made on.
 */
export type HintWhen =
  /** Whenever a body is on the field. */
  | "always"
  /** The cannon is not under the next body to land. */
  | "offColumn"
  /** It is. */
  | "onColumn";
