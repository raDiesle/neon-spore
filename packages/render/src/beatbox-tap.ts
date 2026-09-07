import { beatboxIsBox } from "@neon-spore/sim";
import { beatboxSwell } from "./beatbox.js";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";

/**
 * **Player 2's thumb on a soundbox**, and the first press in this game that
 * lands on a *body* and is over the instant it happens.
 *
 * The field already answers a press — the grip, a hand held on something
 * falling (`creature-place.ts`'s `creatureAt`) — and this is deliberately not
 * that. A grip is a **hold**: it has a lift to send, it lasts as long as the
 * thumb does, and what it is worth depends on how long that is. A tap is a
 * *moment*, and a moment cannot be released. So it returns a `hold` of null
 * and the press is finished, which is the same shape a guard has.
 *
 * The two can never meet on one body, and that is enforced rather than
 * arranged: a box refuses a hand outright (`sim/grippable.ts`), so `creatureAt`
 * skips it and this function is the only thing that ever answers over one. Had
 * both been live, a thumb that rested a fraction too long would silently
 * become the other gesture.
 *
 * **Player 2 only**, and it is checked here as well as in the simulation. The
 * simulation's check is the rule (`beatboxTapped`); this one is the picture:
 * a press that was answered here and then refused there is a control that
 * looks live on one screen and does nothing at all, which is the exact defect
 * `creatureAt`'s own seat test exists to prevent.
 *
 * **The reach follows the swell.** A box on the beat is drawn half again its
 * footprint, and a hit test against the resting size would make the beat the
 * pair is aiming at the moment the target is *hardest* to hit. `beatboxSwell`
 * is the same number the body is drawn with, so the thing under the thumb is
 * the thing on the screen.
 */

/** How much further than the drawn body a thumb still counts, in radii. The
 * grip's own figure — a thumb covers more than a silhouette and a falling
 * target is not a button — and the same one for the same reason. */
const REACH_MUL = 1.6;

export function beatboxUnder(l: Layout, field: Field, x: number, y: number): Touch | null {
  if (field.seat !== 2) return null;
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of field.creatures) {
    if (!beatboxIsBox(c)) continue;
    const { x: cx, y: cy } = creatureCenter(l, c, field.beatPhase);
    const swell = beatboxSwell(c, field.beat, field.beatPhase);
    const reach = creatureRadius(l, c, field.beatPhase, field.cfg) * swell * REACH_MUL;
    const d = Math.hypot(x - cx, y - cy);
    if (d > reach || d >= bestDist) continue;
    best = c.id;
    bestDist = d;
  }
  if (best === null) return null;
  return { player: 2, command: { kind: "tap", id: best }, hold: null };
}
