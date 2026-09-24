import { describe, expect, it } from "bun:test";
import { NO_BEARING } from "../src/bearing.js";
import {
  HASP_COUNT,
  type HaspState,
  haspBoss,
  haspHeatMilli,
  haspHeld,
  haspWoundMilli,
  NO_BOLT,
  NO_BURN,
  NO_LATCH,
} from "../src/hasp.js";
import { haspStruck } from "../src/hasp-shot.js";
import {
  type Bullet,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  midCol,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * THE HASP: the one boss whose question is whether a grip nobody can see is
 * the one holding the door.
 *
 * What these pin is the sentence the pair has to say out loud. That the
 * wheel turns only while the latch is down, and that the gate is a **level**
 * — asked every tick the hand is there, not once when it crossed. That the
 * heat is the pilot's whole clock and burns his hand off the latch, which
 * then will not take another until it has cooled. That the fuse shortens on
 * the last hasp. That her reference survives a seize, so the wind resumes
 * where it stopped rather than jumping to wherever her thumb went. That the
 * second opening throws one bolt and that nobody shooting it is the wave.
 * And that three openings swing the row clear.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const DOWN = CFG.haspReachMilli;

function install(over: Partial<SimConfig> = {}): World {
  const world = createWorld({ ...CFG, ...over }, 0);
  startWave(world, 0, [], [], { kind: "hasp" });
  return world;
}

function door(world: World): HaspState {
  const s = haspBoss(world);
  if (s === null) throw new Error("the wave installed no hasp");
  return s;
}

/** The pilot's thumb on the latch, carried `to` thousandths down the reach. */
const latch = (tick: number, to: number, on = true): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target: "haspLatch", on, fromMilli: 0, fromYMilli: to },
});

/** The navigator's finger reporting where it stands on the rim. */
const rim = (tick: number, at: number, on = true): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "drag", target: "haspWheel", on, fromMilli: at },
});

/** Step to a tick, feeding commands on their stamp, and say what went by. */
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

/** Past the still: the first latch is lit and the hands count. */
function lit(world: World): Set<string> {
  return runTo(world, world.tick + TPB * (CFG.haspStillBeats + 1));
}

/** His hand down on the latch, and left there. */
function grip(world: World, to = DOWN): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1, [latch(t, to)]);
}

/** His hand off it. */
function letGo(world: World): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1, [latch(t, 0, false)]);
}

/**
 * Her finger going round the rim, `by` thousandths a tick for `ticks` ticks,
 * taking hold of it first — which is what `NO_BEARING` on the wire means.
 */
function wind(world: World, ticks: number, by = 200): Set<string> {
  const t = world.tick;
  const cmds: TimedCommand[] = [rim(t, -1), rim(t + 1, 0)];
  for (let i = 1; i <= ticks; i += 1) cmds.push(rim(t + 1 + i, (i * by) % 1000));
  return runTo(world, t + ticks + 2, cmds);
}

/** One whole hasp wound off, with a hand on the latch the whole way — the
 * third's need at two hundred a tick, which is more than the first two ask. */
function windOff(world: World): Set<string> {
  grip(world);
  const seen = wind(world, (CFG.haspWindMilli + 2 * CFG.haspWindStepMilli) / 200);
  for (const type of letGo(world)) seen.add(type);
  return seen;
}

/** The swing after an opening, up to the next latch lighting. */
function settle(world: World): Set<string> {
  return beat(world, CFG.haspSwingBeats + 1);
}

describe("THE HASP comes in", () => {
  it("over the middle, every clasp sealed and neither hand on it", () => {
    const world = install();
    const s = door(world);
    expect(s.phase).toBe("still");
    expect(s.hasps).toBe(HASP_COUNT);
    expect(s.latchMilli).toBe(NO_LATCH);
    expect(s.handMilli).toBe(NO_BEARING);
    expect(s.burnBeat).toBe(NO_BURN);
    expect(s.boltCol).toBe(NO_BOLT);
    expect(world.events.some((e) => e.type === "haspEnter")).toBe(true);
  });

  it("and lights the first latch after its still", () => {
    const world = install();
    expect(lit(world).has("haspLit")).toBe(true);
    expect(door(world).phase).toBe("work");
  });
});

describe("the gate", () => {
  it("leaves the wheel dead under her hand while the latch is up", () => {
    const world = install();
    lit(world);
    wind(world, 3);
    expect(beat(world, 1).has("haspSeize")).toBe(true);
    const s = door(world);
    expect(s.woundMilli).toBe(0);
    expect(s.wheelMilli).toBe(0);
  });

  it("says the seize once, however long she keeps turning it", () => {
    const world = install();
    lit(world);
    wind(world, 3);
    beat(world, 3);
    expect(world.events.filter((e) => e.type === "haspSeize").length).toBeLessThanOrEqual(1);
  });

  it("and turns it while he holds, which is the whole sentence", () => {
    const world = install();
    lit(world);
    expect(grip(world).has("haspGrip")).toBe(true);
    wind(world, 3);
    expect(door(world).woundMilli).toBe(600);
  });

  it("frees a wheel she was already turning, once his thumb is down", () => {
    const world = install();
    lit(world);
    wind(world, 3);
    beat(world, 1);
    expect(door(world).seized).toBe(true);
    grip(world);
    expect(beat(world, 1).has("haspFree")).toBe(true);
    expect(door(world).seized).toBe(false);
  });

  it("keeps her place on the rim across a seize, so nothing jumps when he returns", () => {
    const world = install();
    lit(world);
    grip(world);
    const t = world.tick;
    // Her hand never leaves the rim: he lets go at the third sample and takes
    // hold again at the fifth, and the two hundred she turned in between are
    // the only thing the seize costs her.
    runTo(world, t + 7, [
      rim(t, -1),
      rim(t + 1, 0),
      rim(t + 2, 100),
      latch(t + 3, 0, false),
      rim(t + 3, 200),
      rim(t + 4, 300),
      latch(t + 5, DOWN),
      rim(t + 5, 400),
      rim(t + 6, 500),
    ]);
    expect(door(world).woundMilli).toBe(300);
  });

  it("and seizes it again the tick he lets go, mid-wind", () => {
    const world = install();
    lit(world);
    grip(world);
    wind(world, 2);
    const wound = door(world).woundMilli;
    expect(letGo(world).has("haspLet")).toBe(true);
    wind(world, 3);
    expect(door(world).woundMilli).toBe(wound);
  });
});

describe("the latch is a level, not an edge", () => {
  it("so a thumb resting short of the grip depth holds nothing open", () => {
    const world = install();
    lit(world);
    grip(world, CFG.haspGripMilli - 1);
    expect(haspHeld(door(world), world.cfg)).toBe(false);
    wind(world, 3);
    expect(door(world).woundMilli).toBe(0);
  });

  it("and a thumb that stays down goes on holding it, beat after beat", () => {
    const world = install();
    lit(world);
    grip(world);
    wind(world, 2, 100);
    beat(world, 1);
    wind(world, 2, 100);
    expect(door(world).woundMilli).toBe(400);
  });
});

describe("the heat", () => {
  it("is his whole readout, nought at a fresh grip and full when it burns", () => {
    const world = install();
    lit(world);
    grip(world);
    const s = door(world);
    expect(haspHeatMilli(s, world.cfg, world.beat)).toBe(0);
    expect(haspHeatMilli(s, world.cfg, s.gripBeat + CFG.haspHoldBeats)).toBe(1000);
  });

  it("burns his hand off the latch when he holds past the fuse", () => {
    const world = install();
    lit(world);
    grip(world);
    expect(beat(world, CFG.haspHoldBeats + 1).has("haspBurn")).toBe(true);
    const s = door(world);
    expect(s.latchMilli).toBe(NO_LATCH);
    expect(s.burnBeat).not.toBe(NO_BURN);
  });

  it("and the hot latch takes no hand until it has cooled", () => {
    const world = install();
    lit(world);
    grip(world);
    beat(world, CFG.haspHoldBeats + 1);
    grip(world);
    expect(door(world).latchMilli).toBe(NO_LATCH);
    expect(beat(world, CFG.haspBurnBeats + 1).has("haspCool")).toBe(true);
    grip(world);
    expect(haspHeld(door(world), world.cfg)).toBe(true);
  });

  it("and the fuse is shorter on the last hasp than on the first", () => {
    const first = install({ haspBoltBeats: 99 });
    lit(first);
    grip(first);
    expect(beat(first, CFG.haspLastHoldBeats + 1).has("haspBurn")).toBe(false);

    const world = install({ haspBoltBeats: 99 });
    lit(world);
    windOff(world);
    settle(world);
    windOff(world);
    settle(world);
    expect(door(world).hasps).toBe(1);
    grip(world);
    expect(beat(world, CFG.haspLastHoldBeats + 1).has("haspBurn")).toBe(true);
  });
});

describe("the wheel", () => {
  it("reads her whole progress off itself, and opens when it is there", () => {
    const world = install();
    lit(world);
    grip(world);
    wind(world, (CFG.haspWindMilli * 3) / 800);
    expect(haspWoundMilli(door(world), world.cfg)).toBe(750);
    expect(wind(world, CFG.haspWindMilli / 800).has("haspOpen")).toBe(true);
    expect(door(world).hasps).toBe(HASP_COUNT - 1);
  });

  it("and asks further of the second hasp than the first asked", () => {
    const world = install({ haspBoltBeats: 99 });
    lit(world);
    windOff(world);
    settle(world);
    grip(world);
    // The first hasp's whole winding, turned again: on this one it is short.
    expect(wind(world, CFG.haspWindMilli / 200).has("haspOpen")).toBe(false);
    expect(door(world).woundMilli).toBe(CFG.haspWindMilli);
    expect(door(world).hasps).toBe(HASP_COUNT - 1);
  });

  it("and comes off the opened hasp with both hands, so neither is carried across", () => {
    const world = install();
    lit(world);
    windOff(world);
    const s = door(world);
    expect(s.latchMilli).toBe(NO_LATCH);
    expect(s.handMilli).toBe(NO_BEARING);
    expect(s.woundMilli).toBe(0);
    expect(s.seized).toBe(false);
  });
});

describe("the one bolt", () => {
  it("comes loose on the second opening, over the middle", () => {
    const world = install({ haspBoltBeats: 99 });
    lit(world);
    windOff(world);
    settle(world);
    expect(door(world).boltCol).toBe(NO_BOLT);
    expect(windOff(world).has("haspBolt")).toBe(true);
    expect(door(world).boltCol).toBe(midCol(world.cfg));
  });

  it("goes out to a shot in either colour", () => {
    const world = install({ haspBoltBeats: 99 });
    lit(world);
    windOff(world);
    settle(world);
    windOff(world);
    const bolt: Bullet = {
      id: world.nextId++,
      col: door(world).boltCol,
      row: 0,
      subMilli: 0,
      color: "cyan",
      lance: false,
      driftMilli: 0,
      aimMilli: 0,
    };
    haspStruck(world, bolt);
    expect(door(world).boltCol).toBe(NO_BOLT);
    expect(world.events.some((e) => e.type === "haspBoltOut")).toBe(true);
  });

  it("and reaches the hull unanswered, which is the wave", () => {
    const world = install();
    lit(world);
    windOff(world);
    settle(world);
    windOff(world);
    expect(beat(world, CFG.haspBoltBeats + 1).has("haspBoltHit")).toBe(true);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });
});

describe("the row swings clear", () => {
  it("on the third opening, and the boss is gone its beats later", () => {
    const world = install({ haspBoltBeats: 99 });
    lit(world);
    windOff(world);
    settle(world);
    windOff(world);
    settle(world);
    windOff(world);
    expect(door(world).hasps).toBe(0);
    expect(settle(world).has("haspClear")).toBe(true);
    expect(beat(world, CFG.haspClearBeats + 1).has("haspOut")).toBe(true);
    expect(world.boss).toBeNull();
  });
});

describe("the fingerprint", () => {
  it("is the same for two runs given the same hands", () => {
    const run = (): number => {
      const world = install();
      lit(world);
      grip(world);
      wind(world, 3);
      beat(world, 2);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });

  it("and differs when his thumb has the latch a thousandth further down", () => {
    const at = (to: number): number => {
      const world = install();
      lit(world);
      grip(world, to);
      return hashWorld(world);
    };
    expect(at(700)).not.toBe(at(701));
  });
});
