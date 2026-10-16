import type { Color } from "./types.js";

/**
 * **Everything THE BROOD does that neither screen already says**, as events.
 *
 * Its own file on `events-gorge.ts`' terms. Where every bud hangs, how ripe it
 * is and how many lobes are left are read off `BroodState` every frame
 * (`brood.ts`); what is *not* in the world a frame later is the moment a bud
 * began, popped or dropped, so each of these is one such edge, and each names
 * the column it happened in, because a column is what player 2 says.
 */
export type BroodEvent =
  /** The sac is coming down over the middle column. */
  | { type: "broodEnter"; col: number }
  /** A bud began to grow over `col`, in `color` — a new one, or a dropped one again. */
  | { type: "broodBud"; col: number; color: Color }
  /** A bolt of its colour popped the bud over `col`; `left` lobes are left. */
  | { type: "broodPop"; col: number; color: Color; left: number }
  /** The bud over `col` ripened and fell as a body of `color`. */
  | { type: "broodDrop"; col: number; color: Color }
  /** A bolt of the other colour met the bud over `col`: the wave is lost. */
  | { type: "broodSpoil"; col: number; color: Color }
  /** A bolt met the sac's hide over `col`, where no bud hangs: nothing. */
  | { type: "broodHide"; col: number }
  /** A body began inside the sac over `col`, to be laid `broodLayLeadBeats` on. */
  | { type: "broodEgg"; col: number; color: Color }
  /** A body was pushed out of the belly over `col`, and falls. */
  | { type: "broodLay"; col: number; color: Color }
  /** The sac began to shudder: it lurches `broodShudderBeats` from now. */
  | { type: "broodShudder"; col: number }
  /** The sac lurched `by` columns to stand over `col`, its buds and bodies with it. */
  | { type: "broodLurch"; col: number; by: number }
  /** The last bud is popped: the sac is beaten. */
  | { type: "broodSpent"; col: number }
  /** It is gone, and the wave may end. */
  | { type: "broodOut"; col: number };
