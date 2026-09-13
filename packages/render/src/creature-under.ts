import { type Creature, DEFAULT_CONFIG, handMeans } from "@neon-spore/sim";
import { flatCenter, flatRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";

/**
 * The creature under **this seat's** finger on the flat field, or null.
 * Generous — a thumb covers more than a silhouette and a falling target is
 * not a button — and the nearest wins when two overlap.
 *
 * Its own file since 13 September 2026, when `creatureCenter` learned which
 * picture it is placing on and started taking the world: the touch layer is
 * handed a field and never a world (`touch-field.ts`), so this reads the flat
 * placement by its own name, and THE WELL's screen answers a finger through
 * `touch-well.ts` instead. The reach is `flatRadius` at `DEFAULT_CONFIG`,
 * which is what every device runs; the field's own `cfg` is worth passing the
 * next time `touch.ts` is open.
 *
 * **The seat is part of the question**, which it was not while a hand meant one
 * thing to everybody. A hand on a rock is a brake either seat may apply; a hand
 * on anything living is an aim, and only the pilot has one (`sim/hand.ts`). So
 * a navigator's thumb sweeping over a slick has to find *nothing* — a press
 * that was answered here and then refused by `setGrip` is a control that looks
 * live on one screen and does nothing at all, which is the exact defect the
 * refusals exist to prevent. `handMeans` is that rule asked rather than a list
 * of kinds kept in step with it, and it is also why a boss body, THE WARDEN's
 * rope and a ghost are not named here.
 *
 * The rope used to be answered here, along its whole length, because a hand was
 * the only thing that touched it. It is now *dragged* by a handle rather than
 * held, and a handle is a circle rather than a line: `tetherHandleCircle` in
 * `tether.ts` owns that hit test, beside the code that draws it.
 */
export function creatureAt(
  l: Layout,
  creatures: readonly Creature[],
  x: number,
  y: number,
  beatPhase: number,
  player: 1 | 2,
): Creature | null {
  let best: Creature | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of creatures) {
    if (handMeans(c.kind, player) === null) continue;
    const { x: cx, y: cy } = flatCenter(l, c, beatPhase);
    const reach = flatRadius(l, DEFAULT_CONFIG, c, beatPhase) * 1.6;
    const d = Math.hypot(x - cx, y - cy);
    if (d > reach || d >= bestDist) continue;
    best = c;
    bestDist = d;
  }
  return best;
}
