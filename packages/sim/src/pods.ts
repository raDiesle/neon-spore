import { markMoment } from "./balance.js";
import { hullRow, msToTicks, type SimConfig, ticksPerBeat } from "./config.js";
import type { PodEntry } from "./entries.js";
import { mirrorBaitTaken } from "./mirror-round.js";
import { purge, ward } from "./pod-effects.js";
import { nextInt } from "./rng.js";
import type { Pod, PodKind } from "./types.js";
import { failWave } from "./wave-fail.js";
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
 *
 * What is taken is one of two things — purge or ward, see `PodKind` —
 * authored in the wave and never drawn at random: a pair that watches a pod
 * come loose has to be able to tell what it is before it decides how to
 * chase it. The effect lands all at once, on the tick of the catch; there is
 * no pickup that waits to be spent.
 *
 * **And a pod is taken, or the wave is lost.** The owner's rule of 12
 * September 2026 lists *sucked* beside destroyed, evaded and shielded as the
 * ways a wave is passed: a pod that breaks on the skin, or crosses the field
 * and gets away, is a hit (`wave-fail.ts`), and a pod still hanging holds the
 * wave open the way a body still falling does (`beat.ts`). It used to be a
 * gift, and missing it cost nothing.
 *
 * The fall is no longer the only thing that changes near the mouth — the last
 * stretch of it steers toward whatever column the cannon already holds, so
 * the two players' work stays "be in the right column, be open at the right
 * time" rather than becoming a tracking problem on top of it.
 */

/**
 * What a pod gives when it is swallowed. It was `entry.kind ?? "mend"` while a
 * wave could leave the kind unsaid, and the one `??` lived here so that
 * `mechanics.ts` could call it rather than write its own; every pod names its
 * kind now, and the function stays as the one place that reads it.
 */
export function podKindOf(entry: PodEntry): PodKind {
  return entry.kind;
}

/** Ticks the maw stays open, from `intakeWindowMs` at this tick rate. */
export function intakeWindowTicks(cfg: SimConfig): number {
  return msToTicks(cfg, cfg.intakeWindowMs);
}

/**
 * Whether the maw is open this tick — the one place that decides it.
 *
 * `resolveIntake` asks it of an arriving pod, and the button and the sound ask
 * the same question rather than writing the window out again. They used `<`
 * where this uses `<=`, so the mouth drew and sounded shut one tick before it
 * stopped swallowing.
 */
export function mawOpen(world: World): boolean {
  const windowTicks = intakeWindowTicks(world.cfg);
  return world.tick - world.intakeTick <= windowTicks && world.intakeTick <= world.tick;
}

/** Position and speed in thousandths, all derived from the config. */
function fallMilli(world: World): number {
  return Math.round((world.cfg.podFallTilesPerBeat * MILLI) / ticksPerBeat(world.cfg));
}

function driftMilli(world: World): number {
  return Math.round((world.cfg.podDriftTilesPerBeat * MILLI) / ticksPerBeat(world.cfg));
}

/** How far a crossing pod travels in a tick, from a speed in tiles per beat. */
export function crossMilli(world: World, tilesPerBeat: number): number {
  return Math.round((tilesPerBeat * MILLI) / ticksPerBeat(world.cfg));
}

function homeMilli(world: World): number {
  return Math.round((world.cfg.podHomeTilesPerBeat * MILLI) / ticksPerBeat(world.cfg));
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
      kind: podKindOf(entry),
      // Which way it crosses, and how fast. Absent is nought, which is a pod
      // that hangs exactly as every pod did before THE CLAW.
      crossMilli:
        entry.cross === undefined
          ? 0
          : entry.cross * crossMilli(world, entry.speed ?? world.cfg.podCrossTilesPerBeat),
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
  world.balance.podsFreed += 1;
  // A boss may be hanging this pod out as bait — see `mirrorBaitTaken`.
  mirrorBaitTaken(world);
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
      // A pod authored to cross travels its row until it leaves the far side.
      // It is removed rather than held at the wall, which is the opposite of
      // what a *falling* pod does below: a wreck at the edge is still a thing
      // the ship could reach, and a power-up that has crossed the field is a
      // window that has shut.
      if (p.crossMilli !== 0) {
        p.colMilli += p.crossMilli;
        if (p.colMilli < -MILLI || p.colMilli > edge + MILLI) {
          // And a window that shut is a pod not taken: the wave is lost.
          lost(world, p);
          continue;
        }
      }
      survivors.push(p);
      continue;
    }
    p.rowMilli += fall;
    if (mouth - p.rowMilli <= world.cfg.podHomeTiles * MILLI) {
      const target = world.cannonCol * MILLI;
      const step = homeMilli(world);
      if (p.colMilli < target) {
        p.colMilli = Math.min(target, p.colMilli + step);
      } else {
        p.colMilli = Math.max(target, p.colMilli - step);
      }
      p.driftMilli = 0;
    } else {
      p.colMilli += p.driftMilli;
    }
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
 * open. Anything else and the pod breaks on the skin, and that is a hit: the
 * wave is lost (`wave-fail.ts`). It used to be simply gone — a missed gift
 * and not a punishment — until taking every pod in became part of passing
 * the wave.
 */
function resolveIntake(world: World, pod: Pod): void {
  const col = Math.round(pod.colMilli / MILLI);
  const inColumn = world.cannonCol === col;
  const inTime = mawOpen(world);

  if (inColumn && inTime) {
    world.balance.podsTaken += 1;
    markMoment(world, true);
    switch (pod.kind) {
      case "purge":
        purge(world);
        break;
      case "ward":
        ward(world);
        break;
    }
    mirrorBaitTaken(world);
    world.events.push({ type: "podTaken", col, kind: pod.kind });
    return;
  }
  lost(world, pod);
}

/** A pod the pair did not take, at the hull or off the side: the wave is lost. */
function lost(world: World, pod: Pod): void {
  const col = Math.max(0, Math.min(world.cfg.cols - 1, Math.round(pod.colMilli / MILLI)));
  world.balance.podsLost += 1;
  markMoment(world, false);
  failWave(world);
  world.events.push({ type: "podLost", col });
}
