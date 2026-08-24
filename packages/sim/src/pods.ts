import { hullRow, ticksPerBeat } from "./config.js";
import { nextInt } from "./rng.js";
import type { Pod } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * Pods: the one thing on the field that is neither shot down nor warded off,
 * but *taken*.
 *
 * A pod hangs where the wave left it and does nothing at all. A shot knocks it
 * loose, and from then on it sinks towards the ship like a burning wreck,
 * sliding sideways as it goes. It is caught by player 1 alone — the cannon
 * under it and the maw open at the moment it arrives — which is why freeing it
 * needs both players and catching it needs one of them to do two things at once.
 *
 * The pod is the answer to the gap docs/spec/systems.md 5.7 leaves open: the
 * old design had player 1 fly to the power-up, and there is no flying any more.
 * Here the pod comes to the ship instead, and the ship has to open for it.
 */

/** Position and speed in thousandths, all derived from the config. */
function fallMilli(world: World): number {
  return Math.round((world.cfg.podFallTilesPerBeat * MILLI) / ticksPerBeat(world.cfg));
}

function driftMilli(world: World): number {
  return Math.round((world.cfg.podDriftTilesPerBeat * MILLI) / ticksPerBeat(world.cfg));
}

/** Pods enter on their beat, exactly like creatures — see `onBeat`. */
export function spawnPods(world: World): void {
  while (world.podSpawned < world.podQueue.length) {
    const entry = world.podQueue[world.podSpawned]!;
    if (entry.beat > world.waveBeat - 1) break;
    world.pods.push({
      id: world.nextId++,
      colMilli: entry.col * MILLI,
      rowMilli: entry.row * MILLI,
      driftMilli: 0,
      loose: false,
    });
    world.podSpawned += 1;
  }
}

/**
 * Knock a pod loose. The direction it falls away in is the only thing about a
 * pod that is random, and it is random on purpose: the pair has to agree on
 * where it is going *after* it starts moving (docs/spec/structure.md).
 */
export function freePod(world: World, pod: Pod): void {
  if (pod.loose) return;
  pod.loose = true;
  const dir = nextInt(world.rng, 2) === 0 ? -1 : 1;
  pod.driftMilli = dir * driftMilli(world);
  world.events.push({
    type: "podLoose",
    col: Math.round(pod.colMilli / MILLI),
    row: Math.round(pod.rowMilli / MILLI),
  });
}

/**
 * The moored pod a shot meets on its way up the column `col`, sweeping from
 * `from` down to `to` in thousandths. A pod already falling is not a target: it
 * is on its way to the maw, and a second shot would only take it away again.
 */
export function firstPodAlong(
  world: World,
  col: number,
  from: number,
  to: number,
): Pod | undefined {
  const half = Math.round(world.cfg.hitHeightMilli / 2);
  let best: Pod | undefined;
  for (const p of world.pods) {
    if (p.loose) continue;
    if (Math.round(p.colMilli / MILLI) !== col) continue;
    if (p.rowMilli - half > from || p.rowMilli + half < to) continue;
    if (!best || p.rowMilli > best.rowMilli) best = p;
  }
  return best;
}

export function advancePods(world: World): void {
  if (world.pods.length === 0) return;
  const fall = fallMilli(world);
  const edge = (world.cfg.cols - 1) * MILLI;
  const mouth = hullRow(world.cfg) * MILLI;
  const survivors: Pod[] = [];

  for (const p of world.pods) {
    if (!p.loose) {
      survivors.push(p);
      continue;
    }
    p.rowMilli += fall;
    p.colMilli += p.driftMilli;
    // A wreck that reaches the edge of the field slides down it rather than
    // leaving: the field is the whole world, and a pod outside it is a pod the
    // cannon can never be under.
    if (p.colMilli < 0 || p.colMilli > edge) {
      p.colMilli = Math.max(0, Math.min(edge, p.colMilli));
      p.driftMilli = 0;
    }
    if (p.rowMilli < mouth) {
      survivors.push(p);
      continue;
    }
    resolveIntake(world, p);
  }
  world.pods = survivors;
}

/**
 * The pod has arrived at the hull. Two conditions, both player 1's: the cannon
 * stands in its column, and the maw was opened recently enough to still be
 * open. Anything else and the pod breaks on the skin — it costs no hull, it is
 * simply gone, because a missed gift is a missed gift and not a punishment.
 */
function resolveIntake(world: World, pod: Pod): void {
  const col = Math.round(pod.colMilli / MILLI);
  const windowTicks = Math.round((world.cfg.intakeWindowMs / 1000) * world.cfg.tickHz);
  const inColumn = world.cannonCol === col;
  const inTime = world.tick - world.intakeTick <= windowTicks && world.intakeTick <= world.tick;

  if (inColumn && inTime) {
    world.hullMilli = Math.min(100 * MILLI, world.hullMilli + world.cfg.podRepair * MILLI);
    world.score += world.cfg.scorePod;
    world.events.push({ type: "podTaken", col });
    return;
  }
  world.events.push({ type: "podLost", col });
}
