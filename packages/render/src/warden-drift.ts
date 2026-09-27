import { beatSeconds, type Creature, type SimConfig, WARDEN_COLS } from "@neon-spore/sim";
import { type Circle, type Layout, tileCX, tileCY } from "./layout.js";
import {
  type OutlinePose,
  outlinePose,
  type Point,
  posePoint,
  withOutlinePose,
} from "./outline-drift.js";
import { wardenRadius } from "./warden.js";

/**
 * **THE WARDEN rocks on its open foot** — the outline tier's pose
 * (`outline-drift.ts`) about the bottom of the ring, where the throat is cut
 * for the shot and the rope. The foot barely moves, so the way in stays over
 * its column and the rope stays tied; the top of the ring leans most of a
 * tile either way, which is what makes it seen (*Big enough to be seen*,
 * `docs/looks.md`).
 *
 * **Its marks are found where they are drawn.** The eye is a thumb's target
 * under NARROW and GLARE, the cues write on it and the rope leaves from it, so
 * each asks `wardenPosed` rather than reading the ring at rest — the way
 * `instarMarkUnder` finds THE INSTAR's rings — and the cap is lifted to match
 * (`outlineShift`). That is why the clock is the beat and not the wall clock:
 * a hit test has the beat (`touch-field.ts`) and no frame time, and the eye a
 * thumb lands on has to be the eye the canvas drew.
 */

export interface WardenPose {
  /** The pose this beat, or `null` where it draws none. */
  readonly pose: OutlinePose | null;
  /** The foot of the ring, the pose's root. */
  readonly root: Point;
}

/** THE WARDEN's pose at `beat` and `beatPhase`, about its foot. */
export function wardenPose(
  l: Layout,
  cfg: SimConfig,
  body: Creature,
  beat: number,
  beatPhase: number,
): WardenPose {
  const r = wardenRadius(l);
  const root = { x: tileCX(l, body.col + (WARDEN_COLS - 1) / 2), y: tileCY(l, body.row) + r };
  const seconds = (beat + beatPhase) * beatSeconds(cfg);
  return { pose: outlinePose("warden", seconds, 1, 2 * r, l.tile), root };
}

/** Where the pose draws `q`, a point on the ring at rest. */
export function wardenPosed(p: WardenPose, q: Point): Point {
  return p.pose === null ? q : posePoint(p.pose, p.root, q);
}

/** A circle on the ring at rest, carried by the pose: its middle moves, its size does not. */
export function wardenPosedCircle(p: WardenPose, c: Circle): Circle {
  const at = wardenPosed(p, c);
  return { x: at.x, y: at.y, r: c.r };
}

/** Draws `draw`, which paints the ring at rest, in the pose. */
export function withWardenPose(
  ctx: CanvasRenderingContext2D,
  p: WardenPose,
  draw: () => void,
): void {
  withOutlinePose(ctx, p.pose, p.root, draw);
}
