/**
 * **What the one generic PULL says** (`pull.ts`), whichever boss the knob
 * hangs on: a pull let go short of its reach is refused, and the pair hears
 * it — the owner, 10 October 2026, *"short * red"*. The count is each boss's
 * own event, because what a count does is the boss's; a short lift does
 * nothing anywhere, so it is one event for all of them.
 */
export type PullEvent =
  /** A thumb let a pull go part way, in the knob's column: nothing moved. */
  | { type: "pullShort"; col: number; player: 1 | 2 }
  /** A thumb wandered off a path's bend, in the knob's column: the pull failed (`pull-path.ts`). */
  | { type: "pullStray"; col: number; player: 1 | 2 };
