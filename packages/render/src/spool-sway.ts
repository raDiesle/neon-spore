import { beatSeconds, type SpoolState, type World } from "@neon-spore/sim";
import { IDLE_DRIFT, subSeed } from "./idle-drift.js";
import type { Layout } from "./layout.js";
import { bodyLife } from "./motion-life.js";
import { slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";
import { type Point, type SpoolPose, spoolBarrelHalf } from "./spool-shape.js";

/**
 * **THE SPOOL's barrel rolls on its flange** (`docs/spec/living-bosses.md`,
 * the rollout's step 11, the mechanisms' hinged parts): the casing, its ribs
 * and its two flanges turn together about the brake's flange, so the far end
 * rises and dips by more than half a tile, which is seen (*Big enough to be
 * seen*, `docs/looks.md`). On the beat clock, so both screens see one roll.
 *
 * **The pivot is the brake's flange** because that is where the shoe bites:
 * the rail, its knob and the navigator's gauge are drawn off the unrolled
 * pose and do not move, and the line's top follows the winding, so it stays
 * taut to the hull, and the knob a thumb holds sits at the pivot, where the
 * roll moves nothing. **A hand on the brake does not still it**: the
 * navigator is never shown the grip (`spool-frame.test.ts`), and a barrel
 * that stopped under a thumb would show him. The slack spool has its own
 * turn and takes none of this. It dies down under THE SLOW, as any boss's
 * motion does.
 */

/** THE SPOOL's own lattice, so it never rolls in step with another boss. */
const SEED = 241;
/** How far the barrel rolls at the widest, in radians: its far end, 5.2 tiles from the pivot, moves over half a tile. */
export const SPOOL_SWING = 0.12;

/** The roll at `beat` and `beatPhase`, in radians, clockwise on the screen. */
export function spoolSway(world: World, s: SpoolState, beat: number, beatPhase: number): number {
  const life = bodyLife();
  if (life <= 0 || s.phase === "slack") return 0;
  const hush = slowHush(world, beat, beatPhase);
  if (hush <= 0) return 0;
  const seconds = (beat + beatPhase) * beatSeconds(world.cfg);
  return (
    life * hush * SPOOL_SWING * noise1((seconds * 2) / IDLE_DRIFT.roll.period, subSeed(SEED, 0))
  );
}

/** The point the barrel rolls about: the brake's flange, on the axle. */
export function spoolPivot(l: Layout, pose: SpoolPose, side: -1 | 1): Point {
  return { x: pose.at.x + side * spoolBarrelHalf(l, pose.turn), y: pose.at.y };
}

/** The pose with its axle's middle where the roll has carried it — for the line, whose top is the winding's underside. */
export function spoolRolled(l: Layout, pose: SpoolPose, side: -1 | 1, roll: number): SpoolPose {
  const p = spoolPivot(l, pose, side);
  const dx = pose.at.x - p.x;
  const dy = pose.at.y - p.y;
  const at = {
    x: p.x + dx * Math.cos(roll) - dy * Math.sin(roll),
    y: p.y + dx * Math.sin(roll) + dy * Math.cos(roll),
  };
  return { ...pose, at };
}
