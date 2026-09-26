import type { CreatureKind } from "./types.js";

/**
 * **The shield pushing a creature back up the field** (`shield-push.ts`).
 *
 * Its own file for `events-volley.ts`'s reason: `events-creature.ts` is at
 * its limit. One arm of `CreatureEvent`, so every consumer still switches over
 * the whole list and a new event is a compile error rather than a silence.
 *
 * Not a `deflect`, for `volleyReturn`'s reason: a `deflect` throws a tumbling
 * rock away from the dome, and this body is still on the field, climbing. And
 * not a `volleyReturn` either, because it is told differently: a push saves
 * the hull from something that was the cannon's to kill, and it is the last
 * time the shield will. `kind` is what was pushed, `row` the shield's.
 */
export type PushEvent = {
  type: "shieldPush";
  id: number;
  col: number;
  row: number;
  kind: CreatureKind;
};
