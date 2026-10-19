import { handMeans, lockChargeMilli, lockReady, type World } from "@neon-spore/sim";
import { type HullFrame, surface, surfaceSampler } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { LOCK_LIGHT } from "./lock-light-look.js";

/**
 * **Whether THE LOCK is ready**, on the cannon, on both screens: player 1
 * locks and player 2 fires into it, so each wants to know (`sim/lock-rest.ts`).
 * What it looks like is `lock-light-look.ts`; this is only where it stands and
 * what it is told. Not on THE CLAW's panel, where the swelling is a hand and
 * there is no muzzle for a lock to aim.
 *
 * **Only while a lock means something**: a body on the field player 1's hand
 * would aim at, or a rest still running. A boss round with nothing to hold, a
 * field of rocks or an empty sky wears no light, because a lamp that is lit
 * over nothing to lock says the opposite of what it is for.
 */
export function drawLockLight(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  f: HullFrame,
  time: number,
  beatPhase: number,
): void {
  const aimable = world.creatures.some((c) => handMeans(c.kind, 1) === "aim");
  if (!aimable && lockReady(world)) return;
  const tip = surface(f, f.cannonX);
  LOCK_LIGHT.paint(ctx, {
    x: tip.x,
    y: tip.y,
    tile: l.tile,
    charge: lockChargeMilli(world) / 1000,
    time,
    beatPhase,
    surface: surfaceSampler(f),
  });
}
