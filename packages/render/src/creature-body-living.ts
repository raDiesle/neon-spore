import type { CreatureSilhouette } from "@neon-spore/content";
import { colourArmourLeft } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import type { Wash } from "./creature-tint.js";
import { drawLiving } from "./living-draw.js";
import { rindWears } from "./rind-look.js";
import { showsVeilCore } from "./veil.js";
import { showsVolleyCore } from "./volley.js";

/**
 * The ordinary living body, on its own so the kinds that wear it can reach it
 * without reaching the table.
 *
 * It lived in `creature-body.ts` beside the table of exclusive draws, and
 * `cling.ts` and `creature-body-worn.ts` imported it from there while the
 * table imported them — a cycle. A bundle happened to enter it from the
 * table's side and never noticed; the director's dev server entered it from
 * `canvas2d.ts` through `cling.ts` first, so the table was built while
 * `cling.ts` was still evaluating and read `drawLimpetBody` as null. Nothing
 * here imports a module that draws a kind, so nothing that draws a kind can
 * close a loop through it.
 */
export function drawLivingBody(b: Body, swell = 1, shape?: CreatureSilhouette, wash?: Wash): void {
  const { ctx, l, world, c, x, y, time, beats, beatPhase, near } = b;
  if (c.kind === "veil" && !showsVeilCore(l)) return;
  if (!showsVolleyCore(world.cfg, c)) return;
  // A rind under a look that gives it a body of its own wears that body while
  // it has a layer on, the way a soundbox wears its arms: a contour that is a
  // fact about this body now rather than about its kind (`rind-look.ts`).
  const over = shape ?? rindWears(c, world.cfg);
  drawLiving(
    ctx,
    l,
    c,
    x,
    y,
    beats,
    beatPhase,
    time,
    // The longer of the two: the spark render/ holds for a third of a second
    // off any `reject`, and the window the simulation is really refusing shots
    // in when the reject was a wrong colour. Read off the world rather than
    // timed here, so the grey body and the shot that bounces off it can never
    // be two different lengths (`sim/colour-armour.ts`).
    Math.max(b.blocked.get(c.id) ?? 0, colourArmourLeft(world, c)),
    world.cfg,
    near,
    b.turn,
    swell,
    over,
    wash,
  );
}
