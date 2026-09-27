import { beatSeconds, type SimConfig } from "@neon-spore/sim";
import { subSeed } from "./idle-drift.js";
import type { Layout } from "./layout.js";
import {
  OUTLINE_SEED,
  type OutlinePose,
  outlinePose,
  type Point,
  posePoint,
} from "./outline-drift.js";

/**
 * **THE GORGE's lobes lean on their intakes** — the outline tier's pose
 * (`outline-drift.ts`) about each lobe's own intake, the pucker a shot goes
 * in by. The intake stays over its column, which is the rule
 * (`gorge-depth.ts`: *the columns do not move*); the top of the lobe leans
 * by more than half a tile, which is seen (*Big enough to be seen*,
 * `docs/looks.md`).
 *
 * **Each lobe on its own seed**, from its index, so seven of them hanging
 * from one skin sway like fruit on a branch and not like one painted strip.
 *
 * **The thumb's ring is found where it is drawn.** The pinch and the pry
 * stand in the swell of a lobe, half a tile above its intake, and the pose
 * carries that point by most of a tile's reach; so `gorgeGripCircle` asks
 * `gorgePosed` rather than the lobe at rest, and the clock is the beat,
 * which a hit test has (`touch-field.ts`), THE WARDEN's arrangement.
 */

/** How tall a lobe stands above its intake, in tiles, at rest: its reach. */
const REACH = 1;

export interface GorgePose {
  /** The pose this beat, or `null` where it draws none. */
  readonly pose: OutlinePose | null;
  /** The intake, the pose's root. */
  readonly root: Point;
}

/** Lobe `i`'s pose at `beat` and `beatPhase`, about its intake at `root`. */
export function gorgePose(
  l: Layout,
  cfg: SimConfig,
  root: Point,
  i: number,
  beat: number,
  beatPhase: number,
): GorgePose {
  const seconds = (beat + beatPhase) * beatSeconds(cfg);
  const seed = subSeed(OUTLINE_SEED.gorge, i);
  return { pose: outlinePose("gorge", seconds, 1, REACH * l.tile, l.tile, seed), root };
}

/** Where the pose draws `q`, a point on the lobe at rest. */
export function gorgePosed(p: GorgePose, q: Point): Point {
  return p.pose === null ? q : posePoint(p.pose, p.root, q);
}
