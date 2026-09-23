import { describe, expect, it } from "bun:test";
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
import {
  NO_BOLT,
  NO_CATCH,
  RATCHET_TEETH,
  type RatchetState,
  ratchetBoss,
  ratchetHeld,
  ratchetWindowBeats,
} from "../src/ratchet.js";
import { ratchetStruck } from "../src/ratchet-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * THE RATCHET: the one boss where a step, once taken, is never taken back.
 *
 * What these pin is the sentence the pair has to say. That every press of
 * the pawl climbs a tooth whether or not the catch is set, and is clean only
 * when it is. That a clean tooth spends the catch, so it has to be lifted and
 * set again. That a window nobody answers burns a tooth, and each later
 * window is shorter. That the seats are fixed by the target's name. That the
 * second clean tooth throws a bolt, and nobody shooting it is the wave. That
 * five clean opens the rack, and a third burn jams it into the hull. And that
 * THE SLOW spans each window exactly.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const DOWN = CFG.ratchetReachMilli;

function install(over: Partial<SimConfig> = {}): World {
  const world = createWorld({ ...CFG, ...over }, 0);
  startWave(world, 0, [], [], { kind: "ratchet" });
  return world;
}

function rack(world: World): RatchetState {
  const s = ratchetBoss(world);
  if (s === null) throw new Error("the wave installed no ratchet");
  return s;
}

/** The navigator's thumb on the catch, carried `to` thousandths down. */
const catchAt = (tick: number, to: number, on = true, player: 1 | 2 = 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "ratchetCatch", on, fromMilli: 0, fromYMilli: to },
});

/** The pilot's thumb on the pawl. */
const pawlAt = (tick: number, on: boolean, player: 1 | 2 = 1): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "ratchetPawl", on, fromMilli: 0 },
});

/** Step to a tick, feeding commands on their stamp, and say what went by. */
function runTo(world: World, tick: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  while (world.tick < tick) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** A tick on, with these sent. */
function send(world: World, make: (t: number) => TimedCommand[]): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1, make(t));
}

const beat = (world: World, n = 1): Set<string> => runTo(world, world.tick + TPB * n);

/** Past the still, or the climb: the next pawl is lit. */
const lit = (world: World): Set<string> => beat(world, CFG.ratchetStillBeats + 1);

/** A press and its release, two ticks. */
function press(world: World): Set<string> {
  const seen = send(world, (t) => [pawlAt(t, true)]);
  for (const e of send(world, (t) => [pawlAt(t, false)])) seen.add(e);
  return seen;
}

/** The catch set, then the pawl pressed: one clean tooth. */
function cleanTooth(world: World): Set<string> {
  const seen = send(world, (t) => [catchAt(t, 0, false)]);
  for (const e of send(world, (t) => [catchAt(t, DOWN)])) seen.add(e);
  for (const e of press(world)) seen.add(e);
  return seen;
}

describe("THE RATCHET comes in", () => {
  it("over the middle, seven teeth, and neither hand on it", () => {
    const world = install();
    const s = rack(world);
    expect(s.phase).toBe("still");
    expect(s.teeth).toBe(RATCHET_TEETH);
    expect(s.catchMilli).toBe(NO_CATCH);
    expect(s.boltCol).toBe(NO_BOLT);
    expect(world.events.some((e) => e.type === "ratchetEnter")).toBe(true);
  });

  it("and lights the first pawl after its still", () => {
    const world = install();
    expect(lit(world).has("ratchetLit")).toBe(true);
    expect(rack(world).phase).toBe("work");
  });
});

describe("the catch and the pawl", () => {
  it("climb a tooth clean when the catch is set under the press", () => {
    const world = install();
    lit(world);
    expect(send(world, (t) => [catchAt(t, DOWN)]).has("ratchetSet")).toBe(true);
    expect(press(world).has("ratchetClick")).toBe(true);
    expect(rack(world).teeth).toBe(RATCHET_TEETH - 1);
    expect(rack(world).clean).toBe(1);
    expect(rack(world).phase).toBe("climb");
  });

  it("and climb it burnt when it is not, which is still a tooth", () => {
    const world = install();
    lit(world);
    expect(press(world).has("ratchetBurn")).toBe(true);
    expect(rack(world).teeth).toBe(RATCHET_TEETH - 1);
    expect(rack(world).clean).toBe(0);
  });

  it("so a thumb short of the grip sets nothing", () => {
    const world = install();
    lit(world);
    send(world, (t) => [catchAt(t, CFG.ratchetGripMilli - 1)]);
    expect(ratchetHeld(rack(world), world.cfg)).toBe(false);
    expect(press(world).has("ratchetBurn")).toBe(true);
  });

  it("and a thumb left on the pawl is one press, not a tooth a tick", () => {
    const world = install();
    lit(world);
    const t = world.tick;
    runTo(world, t + 4, [pawlAt(t, true), pawlAt(t + 1, true), pawlAt(t + 2, true)]);
    expect(rack(world).teeth).toBe(RATCHET_TEETH - 1);
  });

  it("spends the catch on a clean tooth, until it is lifted and set again", () => {
    const world = install();
    lit(world);
    send(world, (t) => [catchAt(t, DOWN)]);
    press(world);
    beat(world, CFG.ratchetClimbBeats + 1);
    // Held down all along: the spent catch sets nothing.
    send(world, (t) => [catchAt(t, DOWN)]);
    expect(ratchetHeld(rack(world), world.cfg)).toBe(false);
    expect(cleanTooth(world).has("ratchetClick")).toBe(true);
    expect(rack(world).clean).toBe(2);
  });

  it("hears each target from its own seat only", () => {
    const world = install();
    lit(world);
    send(world, (t) => [catchAt(t, DOWN, true, 1), pawlAt(t, true, 2)]);
    expect(rack(world).catchMilli).toBe(NO_CATCH);
    expect(rack(world).teeth).toBe(RATCHET_TEETH);
  });
});

describe("the window", () => {
  it("burns a tooth when nobody answers it", () => {
    const world = install();
    lit(world);
    const burn = beat(world, CFG.ratchetWindowBeats + 1);
    expect(burn.has("ratchetBurn")).toBe(true);
    expect(rack(world).teeth).toBe(RATCHET_TEETH - 1);
  });

  it("and is shorter for every tooth spent", () => {
    const world = install();
    const first = ratchetWindowBeats(rack(world), world.cfg);
    lit(world);
    press(world);
    expect(ratchetWindowBeats(rack(world), world.cfg)).toBe(first - CFG.ratchetWindowStepBeats);
  });

  it("is THE SLOW, opened on the light and closed on the answer", () => {
    const world = install();
    expect(slowing(world)).toBe(false);
    lit(world);
    expect(slowing(world)).toBe(true);
    press(world);
    expect(slowing(world)).toBe(false);
  });
});

describe("the bolt", () => {
  function twoClean(over: Partial<SimConfig> = {}): World {
    const world = install(over);
    lit(world);
    cleanTooth(world);
    beat(world, CFG.ratchetClimbBeats + 1);
    return world;
  }

  it("comes loose on the second clean tooth, over the middle", () => {
    const world = twoClean({ ratchetBoltBeats: 99 });
    expect(rack(world).boltCol).toBe(NO_BOLT);
    expect(cleanTooth(world).has("ratchetBolt")).toBe(true);
    expect(rack(world).boltCol).toBe(midCol(world.cfg));
  });

  it("goes out to a shot in either colour", () => {
    const world = twoClean({ ratchetBoltBeats: 99 });
    cleanTooth(world);
    const bolt: Bullet = {
      id: world.nextId++,
      col: rack(world).boltCol,
      row: 0,
      subMilli: 0,
      color: "red",
      lance: false,
      driftMilli: 0,
      aimMilli: 0,
    };
    ratchetStruck(world, bolt);
    expect(rack(world).boltCol).toBe(NO_BOLT);
    expect(world.events.some((e) => e.type === "ratchetBoltOut")).toBe(true);
  });

  it("and reaches the hull unanswered, which is the wave", () => {
    const world = twoClean();
    cleanTooth(world);
    expect(beat(world, CFG.ratchetBoltBeats + 1).has("ratchetBoltHit")).toBe(true);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });
});

describe("the end of the rack", () => {
  it("opens on the fifth clean tooth, and is gone its beats later", () => {
    const world = install({ ratchetBoltBeats: 99 });
    lit(world);
    for (let i = 0; i < 4; i += 1) {
      cleanTooth(world);
      beat(world, CFG.ratchetClimbBeats + 1);
    }
    expect(cleanTooth(world).has("ratchetOpen")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(beat(world, CFG.ratchetOpenBeats + 1).has("ratchetOut")).toBe(true);
    expect(world.boss).toBeNull();
  });

  it("jams on the third burn, which breaches the hull", () => {
    const world = install();
    lit(world);
    press(world);
    beat(world, CFG.ratchetClimbBeats + 1);
    press(world);
    beat(world, CFG.ratchetClimbBeats + 1);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(press(world).has("ratchetJam")).toBe(true);
    expect(rack(world).phase).toBe("jam");
    expect(world.failTick).not.toBe(NOT_FAILED);
  });

  it("holds the wave while there is margin left", () => {
    const world = install();
    lit(world);
    press(world);
    beat(world, CFG.ratchetClimbBeats + 1);
    press(world);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(rack(world).phase).toBe("climb");
  });
});

describe("the fingerprint", () => {
  it("is the same for two runs given the same hands", () => {
    const run = (): number => {
      const world = install();
      lit(world);
      cleanTooth(world);
      beat(world, 2);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });

  it("and differs when her thumb has the catch a thousandth further down", () => {
    const at = (to: number): number => {
      const world = install();
      lit(world);
      send(world, (t) => [catchAt(t, to)]);
      return hashWorld(world);
    };
    expect(at(700)).not.toBe(at(701));
  });
});
