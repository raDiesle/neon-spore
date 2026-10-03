import { expect } from "bun:test";
import {
  BEARING_TURN,
  createWorld,
  DEFAULT_CONFIG,
  type GimbalMark,
  type GimbalState,
  gimbalBoss,
  NO_BEARING,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE GIMBAL's test hands, shared by the pages written after the let-go
 * (`gimbal-let-go.test.ts`, `gimbal-carry.test.ts`). The first three pages
 * keep their own copies, which they had before this existed.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);

/** Two alignments, so the first shear leaves one tooth pair and the seam. */
export const FIRST: GimbalMark = { outerMilli: 250, innerMilli: 500, creepMilli: 0, trueMilli: 45 };
export const MARKS: GimbalMark[] = [
  FIRST,
  { outerMilli: 600, innerMilli: 400, creepMilli: 0, trueMilli: 30 },
];

export function install(
  marks: readonly GimbalMark[] = MARKS,
  over: Partial<SimConfig> = {},
): World {
  const world = createWorld({ ...CFG, ...over }, 0);
  startWave(world, 0, [], [], { kind: "gimbal", marks });
  return world;
}

export function gimbal(world: World): GimbalState {
  const s = gimbalBoss(world);
  if (s === null) throw new Error("the wave installed no gimbal");
  return s;
}

/** A thumb on a rim, at `at` thousandths of a turn **on that seat's face**. */
export const grip = (tick: number, player: 1 | 2, at: number, on = true): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "gimbalOuter" : "gimbalInner",
    on,
    fromMilli: on ? at : NO_BEARING,
    fromYMilli: 0,
  },
});

/** A thumb coming off its rim on `tick`. */
export const lift = (tick: number, player: 1 | 2): TimedCommand => grip(tick, player, 0, false);

/** Step to a tick, feeding commands on the tick they are stamped for, and
 * gather every event that went by. */
export function runTo(world: World, tick: number, cmds: TimedCommand[] = []) {
  const seen: World["events"] = [];
  while (world.tick < tick) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    seen.push(...world.events);
  }
  return seen;
}

/** Past the still: the marks are up and the thumbs count. */
export function lit(world: World): void {
  runTo(world, world.tick + TPB * (CFG.gimbalStillBeats + 1));
  expect(gimbal(world).phase).toBe("turn");
}

/** A seat's thumb put down at rest, then carried to `to` on its own face. */
export function carry(world: World, player: 1 | 2, to: number): void {
  const t = world.tick;
  runTo(world, t + 2, [grip(t, player, 0), grip(t + 1, player, to)]);
}

/** Both thumbs onto the first alignment and a beat for the pair to come true. */
export function onFirstMarks(world: World): void {
  carry(world, 1, FIRST.outerMilli);
  carry(world, 2, BEARING_TURN - (FIRST.innerMilli - FIRST.outerMilli));
  runTo(world, world.tick + TPB);
}

/** Both hands off on the same tick: the shear, from two rings standing true. */
export function letGoTogether(world: World): World["events"] {
  const t = world.tick;
  return runTo(world, t + 1, [lift(t, 1), lift(t, 2)]);
}
