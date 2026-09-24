import { describe, expect, it } from "bun:test";
import { type HaspState, haspBoss } from "../src/hasp.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  slowing,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE HASP doubled (`docs/spec/choreographed-windows.md`, 24 September 2026):
 * **THE SLOW spans a grip exactly** — up from the tick his hand takes the
 * latch for that grip's fuse, and shut on each of the grip's three ends: let
 * go, burnt off, or the clasp wound open under it (`hasp-step.ts`,
 * `haspSlow`). `hasp.test.ts` is the fight itself.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, haspBoltBeats: 99 };
const TPB = ticksPerBeat(CFG);
const DOWN = CFG.haspReachMilli;

function install(): World {
  const world = createWorld(CFG, 0);
  startWave(world, 0, [], [], { kind: "hasp" });
  return world;
}

function door(world: World): HaspState {
  const s = haspBoss(world);
  if (s === null) throw new Error("the wave installed no hasp");
  return s;
}

const latch = (tick: number, to: number, on = true): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target: "haspLatch", on, fromMilli: 0, fromYMilli: to },
});

const rim = (tick: number, at: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "drag", target: "haspWheel", on: true, fromMilli: at },
});

function run(world: World, ticks: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + ticks;
  while (world.tick < end) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** Past the still: the first latch is lit. */
function lit(world: World): void {
  run(world, TPB * (CFG.haspStillBeats + 1));
}

function grip(world: World, to = DOWN): Set<string> {
  return run(world, 1, [latch(world.tick, to)]);
}

/** Her finger round the rim, two hundred a tick for `ticks` ticks. */
function wind(world: World, ticks: number): Set<string> {
  const t = world.tick;
  const cmds: TimedCommand[] = [rim(t, -1), rim(t + 1, 0)];
  for (let i = 1; i <= ticks; i += 1) cmds.push(rim(t + 1 + i, (i * 200) % 1000));
  return run(world, ticks + 2, cmds);
}

describe("THE HASP, doubled", () => {
  it("asks nothing slowly of a lit latch with no hand on it", () => {
    const world = install();
    lit(world);
    expect(door(world).phase).toBe("work");
    expect(slowing(world)).toBe(false);
  });

  it("nor of a thumb resting short of the grip", () => {
    const world = install();
    lit(world);
    grip(world, CFG.haspGripMilli - 1);
    expect(slowing(world)).toBe(false);
  });

  it("slows a grip for exactly its fuse", () => {
    const world = install();
    lit(world);
    expect(grip(world).has("haspGrip")).toBe(true);
    expect(slowing(world)).toBe(true);
    expect(world.slowToBeat).toBe(door(world).gripBeat + CFG.haspHoldBeats);
  });

  it("shuts THE SLOW the tick he lets go, and opens it again on the next grip", () => {
    const world = install();
    lit(world);
    grip(world);
    run(world, TPB * 2);
    expect(run(world, 1, [latch(world.tick, 0, false)]).has("haspLet")).toBe(true);
    expect(slowing(world)).toBe(false);
    run(world, TPB);
    grip(world);
    expect(world.slowToBeat).toBe(world.beat + CFG.haspHoldBeats);
  });

  it("shuts it when the grip burns", () => {
    const world = install();
    lit(world);
    grip(world);
    expect(run(world, TPB * (CFG.haspHoldBeats + 1)).has("haspBurn")).toBe(true);
    expect(slowing(world)).toBe(false);
  });

  it("shuts it when the clasp is wound open under the grip", () => {
    const world = install();
    lit(world);
    grip(world);
    expect(wind(world, CFG.haspWindMilli / 200).has("haspOpen")).toBe(true);
    expect(slowing(world)).toBe(false);
  });

  it("asks the doubled turn, which the old figure falls short of", () => {
    const world = install();
    lit(world);
    grip(world);
    expect(wind(world, CFG.haspWindMilli / 400).has("haspOpen")).toBe(false);
    expect(door(world).woundMilli).toBe(CFG.haspWindMilli / 2);
  });
});
