import { type Creature, handMeans } from "@neon-spore/sim";
import { flatCenter, flatRadius } from "./creature-place.js";
import { glidePhase } from "./depth.js";
import { landingY } from "./landing.js";
import type { Layout } from "./layout.js";
import type { Field } from "./touch-field.js";

/** The part of a `Field` a hand on a body is answered from. */
export type BodiesUnder = Pick<
  Field,
  "creatures" | "beatPhase" | "beat" | "cfg" | "seat" | "skinY"
>;

/**
 * The creature under **this seat's** finger on the flat field, or null.
 * Generous — a thumb covers more than a silhouette and a falling target is
 * not a button — and the nearest wins when two overlap.
 *
 * Its own file since 13 September 2026, when `creatureCenter` learned which
 * picture it is placing on and started taking the world: the touch layer is
 * handed a field and never a world (`touch-field.ts`), so this reads the flat
 * placement by its own name, and THE WELL's screen answers a finger through
 * `touch-well.ts` instead. The reach is `flatRadius` at the field's own
 * `cfg`, which the flat pass sizes the body by.
 *
 * **A body is answered at the phase it is glided by**, `glidePhase`, as every
 * placement in render/ is: THE BALLOON's one step is spread over
 * `balloonClimbBeats`, and on the second beat of one the beat's own phase is
 * half a tile behind the picture. A balloon refuses a hand today and is held
 * by its handles (`balloon-handles.ts`), so this is the rule asked rather
 * than a fix; `touch-reach.test.ts` pins the refusal. The field's `beat` is
 * what the phase is counted from, which is why this takes the field rather
 * than its creatures.
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
 *
 * **A landing beat is answered where the body is drawn, on the skin.** The
 * field pass ends that one glide resting in the plating rather than under the
 * membrane at the hull row's centre (`landing.ts`), which is three quarters of
 * a tile higher — further than the reach below, so a thumb laid on the body as
 * drawn found nothing at all on the last beat it can still be aimed at. The
 * skin is the one the last frame was drawn on (`Field.skinY`), lobes and
 * all, so the body a lobe has raised is answered as high as it was drawn;
 * without a frame it is `l.hullY`, the flat membrane.
 */
export function creatureAt(l: Layout, field: BodiesUnder, x: number, y: number): Creature | null {
  const { cfg, beat, beatPhase } = field;
  const skin = field.skinY ?? (() => l.hullY);
  let best: Creature | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of field.creatures) {
    if (handMeans(c.kind, field.seat) === null) continue;
    const glide = glidePhase(cfg, beat, c, beatPhase);
    const { x: cx, y: flatY } = flatCenter(l, c, glide);
    const cy = landingY(l, cfg, c, cx, flatY, glide, skin);
    const reach = flatRadius(l, cfg, c, glide) * 1.6;
    const d = Math.hypot(x - cx, y - cy);
    if (d > reach || d >= bestDist) continue;
    best = c;
    bestDist = d;
  }
  return best;
}
