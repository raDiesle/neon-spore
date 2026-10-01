import { midCol, type SeamState, seamVerdict, type World } from "@neon-spore/sim";
import type { BoltHit, Stopper } from "./bolt-stop.js";
import type { Layout } from "./layout.js";
import { type SeamThrow, seamRockNow } from "./seam-marks.js";
import { type Point, seamFootAt } from "./seam-shape.js";
import { seamTurn, seamTurnWidth } from "./seam-story.js";
import { seamCrackAsks, seamCrackCircle } from "./seam-verdicts.js";

/**
 * **Where a bolt meets THE SEAM**, for `BoltStops` (`bolt-stop.ts`): what the
 * simulation will say of it at row 0, put at the place on the picture it
 * says it of.
 *
 * - **The rock**, falling down its own column, stops a bolt in that column
 *   at the rock: `target` in the colour that breaks it, `wrong` in the other.
 * - **The lit point or the glow** is up the crack, and the crack is open: a
 *   bolt up the middle column climbs it to the mark, `target` or `wrong` by
 *   its colour.
 * - **Anything else the ridge stands over** stops the bolt at its foot, the
 *   lowest shell over that x. A bolt there is `body` unless the simulation
 *   counts it against the pair — a column the step does not ask for, or the
 *   decoy's held fire — when it is `wrong`, and never a burst of the step's
 *   colour.
 *
 * Nothing while the ridge is still coming down or has split: the bolt goes on
 * into the sky, as it is judged there.
 */
export function seamStopper(
  l: Layout,
  world: World,
  s: SeamState,
  c: Point,
  arrived: number,
  split: number,
  thrown: SeamThrow | null,
  beat: number,
  beatPhase: number,
): Stopper | null {
  if (split > 0 || arrived < 0.5) return null;
  const width = seamTurnWidth(seamTurn(s, world.cfg, beat, beatPhase));
  const rock = seamRockNow(l, thrown);
  const asks = seamCrackAsks(s);
  const mid = midCol(world.cfg);
  return (col, x, color) => {
    const v = seamVerdict(world, col, color);
    const hit: BoltHit = v === "target" ? "target" : v === null ? "body" : "wrong";
    if (rock !== null && v !== null && v !== "held") return { y: rock.y, hit };
    if (col === mid && asks && v !== null && v !== "held") {
      return { y: seamCrackCircle(l, s, c).y, hit };
    }
    const foot = seamFootAt(l, (x - c.x) / width);
    return foot === null ? null : { y: c.y + foot, hit };
  };
}
