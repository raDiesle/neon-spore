import {
  type Color,
  type CoreVerdict,
  instarStep,
  panelMark,
  type SceneState,
  type World,
} from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import type { Foot } from "./core-stop.js";
import { instarMarkPoint, instarMarkRadius } from "./instar-place.js";
import { instarThreat } from "./instar-shape.js";
import type { Sway } from "./instar-sway.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets a scene** — THE INSTAR or THE NETTLE — for `BoltStops`
 * (`bolt-stop.ts`): the SHOOT mark the panel hears it on (`panelMark`), at
 * the ring's lower edge where `drawInstarMarks` lays it, `target` in a
 * colour it takes and `wrong` in one it refuses (`verdict`); and otherwise
 * the body's `foot`.
 *
 * The mark is met whenever the simulation hears it, which is while the
 * step acts. The marks are drawn only while THE SLOW is open as well
 * (`instarMarksUp`); after a strike shuts it early a bolt can stop on a mark
 * no longer drawn. That is a look, and it is not fixed here.
 */
export function sceneStopper(
  l: Layout,
  world: World,
  s: SceneState,
  sway: Sway,
  beat: number,
  beatPhase: number,
  verdict: (world: World, col: number, color: Color) => CoreVerdict,
  foot: Foot,
): Stopper {
  const marks = instarStep(s)?.marks ?? [];
  const r = instarMarkRadius(l, world.cfg);
  const along = instarThreat(s, beat, beatPhase);
  return (col, x, color) => {
    const v = verdict(world, col, color);
    const heard = v === "target" || v === "wrong" ? panelMark(world, "shoot", col, color) : null;
    const mark = heard === null ? undefined : marks[heard.mark];
    if ((v === "target" || v === "wrong") && mark !== undefined)
      return { y: instarMarkPoint(l, mark, sway, along).y + r, hit: v };
    const y = foot(x);
    return y === null ? null : { y, hit: "body" };
  };
}
