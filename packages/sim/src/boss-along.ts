import { flueAlong, flueStruckEmber } from "./flue-shot.js";
import { gimbalBeadAlong } from "./gimbal-bead.js";
import { gimbalStruck, gimbalVerdict } from "./gimbal-shot.js";
import { gorgeAlong, gorgeStruck } from "./gorge-step.js";
import { haspBoltAlong, haspStruck } from "./hasp-shot.js";
import { hiveWallStruck } from "./hive-shot.js";
import { hiveWallAlong } from "./hive-wall.js";
import { keelRockAlong, keelStruck } from "./keel-shot.js";
import { mantleSparkAlong, mantleStruck } from "./mantle-shot.js";
import { ratchetBoltAlong, ratchetStruck } from "./ratchet-shot.js";
import type { Bullet } from "./types.js";
import { valveSparkAlong, valveStruck } from "./valve-shot.js";
import { vaneMouthAlong, vaneMouthStruck } from "./vane.js";
import type { World } from "./world.js";

/**
 * **The bosses a shot meets in mid-field** rather than past the top: THE
 * VANE's open bearing on the arm's row, THE GORGE's bubble on its own, THE
 * HIVE's cocoons down its two walls (`hive-wall.ts`), THE GIMBAL's leaking
 * bead, THE MANTLE's spark and THE VALVE's, THE RATCHET's loose bolt and THE
 * HASP's and THE KEEL's rock, each on its way down its column
 * (`spark-fall.ts`), THE FLUE's row, which
 * stops every shot to judge it against the ember (`flue-shot.ts`). One
 * question for `bullets.ts` and `lance-burn.ts` to ask beside the bodies and
 * pods in the same sweep, so whichever stands lowest is met first and a body
 * on the same row is in front of it.
 *
 * Where it stands in thousandths of a row, or -1 when there is nothing.
 * Only one boss is up at a time, so at most one of these answers.
 */
export function bossAlong(world: World, bullet: Bullet, from: number, to: number): number {
  const mouth = vaneMouthAlong(world, bullet, from, to);
  if (mouth >= 0) return mouth;
  const wall = hiveWallAlong(world, bullet, from, to);
  if (wall >= 0) return wall;
  const ember = flueAlong(world, bullet, from, to);
  if (ember >= 0) return ember;
  const leak = gimbalVerdict(world, bullet.col, bullet.color) !== null;
  const bead = leak ? gimbalBeadAlong(world, from, to) : -1;
  if (bead >= 0) return bead;
  const spark = mantleSparkAlong(world, bullet, from, to);
  if (spark >= 0) return spark;
  const fall = valveSparkAlong(world, bullet, from, to);
  if (fall >= 0) return fall;
  const pawl = ratchetBoltAlong(world, bullet, from, to);
  if (pawl >= 0) return pawl;
  const clasp = haspBoltAlong(world, bullet, from, to);
  if (clasp >= 0) return clasp;
  const rock = keelRockAlong(world, bullet, from, to);
  return rock >= 0 ? rock : gorgeAlong(world, bullet, from, to);
}

/** The shot met what `bossAlong` found. */
export function bossAlongStruck(world: World, bullet: Bullet): void {
  if (world.boss?.kind === "gorge") gorgeStruck(world, bullet);
  else if (world.boss?.kind === "hive") hiveWallStruck(world, bullet);
  else if (world.boss?.kind === "gimbal") gimbalStruck(world, bullet);
  else if (world.boss?.kind === "flue") flueStruckEmber(world, bullet);
  else if (world.boss?.kind === "mantle") mantleStruck(world, bullet);
  else if (world.boss?.kind === "valve") valveStruck(world, bullet);
  else if (world.boss?.kind === "ratchet") ratchetStruck(world, bullet);
  else if (world.boss?.kind === "hasp") haspStruck(world, bullet);
  else if (world.boss?.kind === "keel") keelStruck(world, bullet);
  else vaneMouthStruck(world, bullet);
}
