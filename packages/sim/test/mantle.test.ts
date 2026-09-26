import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type MantleState,
  mantleBoss,
  mantlePairsLeft,
  NO_SPARK,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * THE MANTLE: a hinged shell pried open by two hands pulling together.
 *
 * What these pin is the rule a phone cannot show. That a pull only counts
 * once **both** handles clear the floor at once — one thumb at maximum while
 * the other sits at nought shears nothing. That letting go costs the whole
 * pull, at once, with no drift to bank progress against. That the second
 * shear leaks a spark that reaches the hull unanswered, and either colour
 * answers it. That the last pair splits the shell and hands the fight to an
 * alternating single tap, which the wrong seat's thumb cannot touch.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);

/** Two thresholds, so the first shear leaves one pair and the second splits it. */
const THRESHOLDS = [1400, 1700];

function install(thresholds: readonly number[] = THRESHOLDS): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "mantle", thresholds });
  return world;
}

function mantle(world: World): MantleState {
  const s = mantleBoss(world);
  if (s === null) throw new Error("the wave installed no mantle");
  return s;
}

/** A thumb on a handle, held at `atMilli` thousandths of a tile. */
const pull = (tick: number, player: 1 | 2, atMilli: number, on = true): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "mantleLeft" : "mantleRight",
    on,
    fromMilli: 0,
    fromYMilli: atMilli,
  },
});

const tapCore = (tick: number, player: 1 | 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "mantleCore", on: true, fromMilli: 0 },
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

/** Past the still: the handles are lit. */
function lit(world: World): Set<string> {
  return runTo(world, world.tick + TPB * (CFG.mantleStillBeats + 1));
}

describe("THE MANTLE comes in", () => {
  it("closed, dark and still, with every pair on the shell", () => {
    const world = install();
    const s = mantle(world);
    expect(s.phase).toBe("still");
    expect(s.cursor).toBe(0);
    expect(mantlePairsLeft(s)).toBe(2);
    expect(s.depthMilli).toEqual([0, 0]);
    expect(s.sparkCol).toBe(NO_SPARK);
    expect(world.events.some((e) => e.type === "mantleEnter")).toBe(true);
  });

  it("and lights the first movement's handles after its still", () => {
    const world = install();
    expect(lit(world).has("mantleLight")).toBe(true);
    expect(mantle(world).phase).toBe("pull");
  });
});

describe("a pull only counts with both handles past the floor at once", () => {
  it("so one handle at maximum and the other at nought shears nothing", () => {
    const world = install();
    lit(world);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 2000)]);
    expect(beat(world, 5).has("mantleShear")).toBe(false);
    expect(mantle(world).phase).toBe("pull");
  });

  it("and both past the floor, summing past the threshold, shears a pair", () => {
    const world = install();
    lit(world);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 800), pull(t, 2, 800)]);
    expect(beat(world).has("mantleShear")).toBe(true);
    const s = mantle(world);
    expect(mantlePairsLeft(s)).toBe(1);
    expect(world.slowToBeat).toBeGreaterThan(world.beat);
  });
});

describe("letting go", () => {
  it("resets that handle to nought at once, with no drift to bank", () => {
    const world = install();
    lit(world);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 900)]);
    expect(mantle(world).depthMilli[0]).toBe(900);
    runTo(world, t + 2, [pull(t + 1, 1, 900, false)]);
    expect(mantle(world).depthMilli[0]).toBe(0);
  });
});

describe("the second shear leaks a spark", () => {
  // Three thresholds, so the second shear (cursor reaching 2) is not also the
  // last: the leak sits between the second and third movements, never on the
  // shear that splits the shell.
  const THREE = [1400, 1700, 1900];

  it("that reaches the hull unanswered after mantleSparkBeats", () => {
    const world = install(THREE);
    lit(world);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 800), pull(t, 2, 800)]);
    beat(world); // first shear
    lit(world);
    const t2 = world.tick;
    runTo(world, t2 + 1, [pull(t2, 1, 900), pull(t2, 2, 900)]);
    const shear = beat(world);
    expect(shear.has("mantleShear")).toBe(true);
    expect(shear.has("mantleLeak")).toBe(true);
    expect(mantle(world).sparkCol).not.toBe(NO_SPARK);
    const seen = beat(world, CFG.mantleSparkBeats + 1);
    expect(seen.has("mantleSparkHit")).toBe(true);
    expect(mantle(world).sparkCol).toBe(NO_SPARK);
  });

  it("and nothing strikes the pair for taking as long as they like otherwise", () => {
    const world = install(THREE);
    lit(world);
    const seen = beat(world, 20);
    expect(seen.has("mantleSparkHit")).toBe(false);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the last pair splits the shell", () => {
  function toFinale(world: World): void {
    for (let i = 0; i < THRESHOLDS.length; i++) {
      lit(world);
      const t = world.tick;
      runTo(world, t + 1, [pull(t, 1, 1200), pull(t, 2, 1200)]);
      beat(world);
    }
  }

  it("and hands the fight to an alternating tap the wrong seat cannot touch", () => {
    const world = install();
    toFinale(world);
    const s = mantle(world);
    expect(s.phase).toBe("heartbeat");
    expect(s.heartbeatNext).toBe(0);
    const t = world.tick;
    // Player 2 goes first: wrong seat, refused silently.
    runTo(world, t + 1, [tapCore(t, 2)]);
    expect(mantle(world).heartbeatDone).toBe(0);
    const t2 = world.tick;
    runTo(world, t2 + 1, [tapCore(t2, 1)]);
    expect(mantle(world).heartbeatDone).toBe(1);
    expect(mantle(world).heartbeatNext).toBe(1);
  });

  it("and the last tap darkens the core and ends the fight", () => {
    const world = install();
    toFinale(world);
    let next: 1 | 2 = 1;
    for (let i = 0; i < CFG.mantleHeartbeatTaps; i++) {
      const t = world.tick;
      runTo(world, t + 1, [tapCore(t, next)]);
      next = next === 1 ? 2 : 1;
    }
    expect(mantle(world).phase).toBe("dark");
    const seen = beat(world, CFG.mantleOpenBeats + 1);
    expect(seen.has("mantleOut")).toBe(true);
    expect(world.boss).toBe(null);
  });
});

describe("the fingerprint", () => {
  it("is the same for two runs given the same thumbs", () => {
    const run = (): number => {
      const world = install();
      lit(world);
      const t = world.tick;
      runTo(world, t + 1, [pull(t, 1, 800), pull(t, 2, 800)]);
      beat(world, 4);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });

  it("and differs when one handle sits a step off the other's", () => {
    const stand = (atMilli: number): number => {
      const world = install();
      lit(world);
      const t = world.tick;
      runTo(world, t + 1, [pull(t, 1, atMilli)]);
      return hashWorld(world);
    };
    expect(stand(800)).not.toBe(stand(801));
  });
});
