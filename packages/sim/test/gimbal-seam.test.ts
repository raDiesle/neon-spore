import { describe, expect, it } from "bun:test";
import { midCol } from "../src/config-derived.js";
import {
  BEARING_TURN,
  createWorld,
  DEFAULT_CONFIG,
  type GimbalMark,
  type GimbalState,
  gimbalBoss,
  gimbalTeeth,
  NO_SEAM,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * THE GIMBAL's seam, and the end of it.
 *
 * The second page of `gimbal.test.ts`, cut off it the day it was written:
 * the receipts for the rings alone came to within a few lines of the
 * 250-line ceiling, and the seam is the half of this fight the *cannon*
 * answers rather than a thumb — a hazard on a clock, where everything next
 * door is a bearing. What these pin: that the last tooth pair leaves the
 * seam leaking over the middle, that a bolt of either colour in its column
 * shuts it, that nobody's bolt is one strike on the hull and so the wave,
 * and that the shear after it opens the drum, hangs, and goes.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);

/** Two alignments, so the first shear leaves one tooth pair and the seam. */
const FIRST: GimbalMark = { outerMilli: 250, innerMilli: 250, creepMilli: 0 };
const MARKS: GimbalMark[] = [FIRST, { outerMilli: 600, innerMilli: 400, creepMilli: 0 }];

function install(marks: readonly GimbalMark[] = MARKS, over: Partial<SimConfig> = {}): World {
  const world = createWorld({ ...CFG, ...over }, 0);
  startWave(world, 0, [], [], { kind: "gimbal", marks });
  return world;
}

function gimbal(world: World): GimbalState {
  const s = gimbalBoss(world);
  if (s === null) throw new Error("the wave installed no gimbal");
  return s;
}

/** A thumb on a rim, at `at` thousandths of a turn **on that seat's face**. */
const grip = (tick: number, player: 1 | 2, at: number, on = true): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "gimbalOuter" : "gimbalInner",
    on,
    fromMilli: at,
    fromYMilli: 0,
  },
});

/** Step to a tick, feeding commands on the tick they are stamped for, and say
 * which event types went by — `world.events` is one tick's worth. */
function runTo(world: World, tick: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  while (world.tick < tick) {
    const before = world.tick;
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
    if (world.tick === before) throw new Error("the tick stopped advancing");
  }
  return seen;
}

/** A beat on, with nothing sent. */
function beat(world: World, n = 1): Set<string> {
  return runTo(world, world.tick + TPB * n);
}

/** Past the still: the marks are up and the thumbs count. */
function lit(world: World): Set<string> {
  return runTo(world, world.tick + TPB * (CFG.gimbalStillBeats + 1));
}

/** A seat's thumb put down at rest, then carried to `to` on its own face. */
function carry(world: World, player: 1 | 2, to: number): void {
  const t = world.tick;
  runTo(world, t + 2, [grip(t, player, 0), grip(t + 1, player, to)]);
}

/** Both thumbs onto the first alignment: his mark, and hers the mirror of it. */
function onFirstMarks(world: World): void {
  carry(world, 1, FIRST.outerMilli);
  carry(world, 2, BEARING_TURN - FIRST.innerMilli);
}

describe("the seam", () => {
  it("leaks over the middle once one tooth pair is left", () => {
    const world = install();
    lit(world);
    onFirstMarks(world);
    const seen = beat(world, CFG.gimbalHoldBeats);
    expect(seen.has("gimbalLeak")).toBe(true);
    expect(gimbal(world).seamCol).toBe(MID);
  });

  it("is shut by a bolt of either colour in its column", () => {
    const world = install(MARKS, { gimbalSeamBeats: 24 });
    lit(world);
    onFirstMarks(world);
    beat(world, CFG.gimbalHoldBeats);
    const t = world.tick;
    const seen = runTo(world, t + TPB * 12, [
      { tick: t, player: 1, command: { kind: "cannonCol", col: MID } },
      { tick: t + 2, player: 2, command: { kind: "fire", color: "cyan" } },
    ]);
    expect(seen.has("gimbalSeamOut")).toBe(true);
    expect(gimbal(world).seamCol).toBe(NO_SEAM);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("and unanswered is one strike on the hull, which is the wave", () => {
    const world = install();
    lit(world);
    onFirstMarks(world);
    beat(world, CFG.gimbalHoldBeats);
    const seen = beat(world, CFG.gimbalSeamBeats + 1);
    expect(seen.has("gimbalSeamHit")).toBe(true);
    expect(gimbal(world).seamCol).toBe(NO_SEAM);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });
});

describe("the last tooth pair", () => {
  it("opens the drum, hangs, and takes the boss off the field", () => {
    const world = install([FIRST], { gimbalSeamBeats: 999 });
    lit(world);
    onFirstMarks(world);
    const shorn = beat(world, CFG.gimbalHoldBeats);
    expect(shorn.has("gimbalShear")).toBe(true);
    expect(gimbalTeeth(gimbal(world))).toBe(0);
    expect(beat(world, CFG.gimbalShearBeats + 1).has("gimbalHatch")).toBe(true);
    expect(beat(world, CFG.gimbalOpenBeats + 1).has("gimbalOut")).toBe(true);
    expect(world.boss).toBe(null);
  });
});
