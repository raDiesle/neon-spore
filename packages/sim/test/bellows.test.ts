import { describe, expect, it } from "bun:test";
import { bellowsStruck } from "../src/bellows-shot.js";
import {
  BELLOWS_SEAMS,
  type BellowsState,
  type Bullet,
  bellowsBoss,
  bellowsShared,
  bellowsWindowLeft,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  midCol,
  NO_HAND,
  NO_LIFT,
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
 * THE BELLOWS: the one boss that refuses whoever did **not** just act.
 *
 * What these pin is the rule the pair has to say out loud. That a handle is
 * one seat's and never the other's. That a stroke in the wrong seat's beat
 * jams both and spends the exchange, while a stroke in the right one parts a
 * seam. That the act is an **edge** — a thumb resting past the work depth is
 * nothing, and a second stroke needs the hand lifted. That only the third
 * exchange has a clock on it, and that every other one waits as long as the
 * pair takes. That the two hazards land on the hull unanswered. And that the
 * finale is the single beat in the fight both seats act together: two hands
 * off inside a beat splits the waist, a beat apart holds the last seam.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const REACH = CFG.bellowsReachMilli;

function install(over: Partial<SimConfig> = {}): World {
  const world = createWorld({ ...CFG, ...over }, 0);
  startWave(world, 0, [], [], { kind: "bellows" });
  return world;
}

function lung(world: World): BellowsState {
  const s = bellowsBoss(world);
  if (s === null) throw new Error("the wave installed no bellows");
  return s;
}

/** A seat's hand on its own handle, carried `to` thousandths down the reach. */
const hold = (tick: number, player: 1 | 2, to: number, on = true): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "bellowsPull" : "bellowsPush",
    on,
    fromMilli: 0,
    fromYMilli: to,
  },
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

/** Past the still: the first exchange's marks are up. */
function lit(world: World): Set<string> {
  return runTo(world, world.tick + TPB * (CFG.bellowsStillBeats + 1));
}

/** One seat's whole stroke, from a hand off the handle to the full reach. */
function stroke(world: World, player: 1 | 2, to = REACH): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1, [hold(t, player, to)]);
}

/** Both hands off both handles, so the next stroke is a stroke. */
function lift(world: World): void {
  const t = world.tick;
  runTo(world, t + 1, [hold(t, 1, 0, false), hold(t, 2, 0, false)]);
}

/**
 * A clean exchange — `bellowsExchanges` rounds of it in the shared window —
 * and on past the seam to the next set of marks.
 */
function exchange(world: World): void {
  const rounds = bellowsShared(lung(world)) ? CFG.bellowsExchanges : 1;
  for (let i = 0; i < rounds; i++) {
    stroke(world, 1);
    stroke(world, 2);
    lift(world);
  }
  beat(world, CFG.bellowsSeamBeats + 1);
}

describe("THE BELLOWS comes in", () => {
  it("over the middle, waist tight, with every seam whole and no hand on it", () => {
    const world = install();
    const s = lung(world);
    expect(s.phase).toBe("still");
    expect(s.seams).toBe(BELLOWS_SEAMS);
    expect(s.handMilli).toEqual([NO_HAND, NO_HAND]);
    expect(s.sparkCol).toBe(NO_SPARK);
    expect(s.liftTick).toBe(NO_LIFT);
    expect(world.events.some((e) => e.type === "bellowsEnter")).toBe(true);
  });

  it("and lights the first exchange's marks after its still, on his handle", () => {
    const world = install();
    expect(lit(world).has("bellowsMarks")).toBe(true);
    expect(lung(world).phase).toBe("pull");
  });
});

describe("one seat at a time", () => {
  it("opens the chamber on his stroke and parts a seam on hers", () => {
    const world = install();
    lit(world);
    expect(stroke(world, 1).has("bellowsPulled")).toBe(true);
    expect(lung(world).phase).toBe("push");
    expect(stroke(world, 2).has("bellowsSeam")).toBe(true);
    const s = lung(world);
    expect(s.phase).toBe("seam");
    expect(s.seams).toBe(BELLOWS_SEAMS - 1);
  });

  it("jams both handles when she pushes inside his beat, and parts nothing", () => {
    const world = install();
    lit(world);
    expect(stroke(world, 2).has("bellowsJam")).toBe(true);
    const s = lung(world);
    expect(s.phase).toBe("jam");
    expect(s.seams).toBe(BELLOWS_SEAMS);
    expect(s.handMilli).toEqual([NO_HAND, NO_HAND]);
  });

  it("and names the seat that caused it, which is the whole conversation", () => {
    const world = install();
    lit(world);
    stroke(world, 2);
    const jam = world.events.find((e) => e.type === "bellowsJam");
    expect(jam).toMatchObject({ type: "bellowsJam", player: 2 });
  });

  it("lights the same exchange again once the jam runs out", () => {
    const world = install();
    lit(world);
    stroke(world, 1);
    const t = world.tick;
    runTo(world, t + 1, [hold(t, 1, 0, false)]);
    stroke(world, 1);
    expect(lung(world).phase).toBe("jam");
    expect(beat(world, CFG.bellowsJamBeats + 1).has("bellowsMarks")).toBe(true);
    expect(lung(world).phase).toBe("pull");
    expect(lung(world).seams).toBe(BELLOWS_SEAMS);
  });
});

describe("the stroke is an edge", () => {
  it("so a thumb that never reaches the work depth has done nothing", () => {
    const world = install();
    lit(world);
    stroke(world, 1, CFG.bellowsWorkMilli - 1);
    expect(lung(world).phase).toBe("pull");
  });

  it("and a thumb resting past it is not a second stroke", () => {
    const world = install();
    lit(world);
    stroke(world, 1);
    expect(lung(world).phase).toBe("push");
    const t = world.tick;
    runTo(world, t + 2, [hold(t, 1, REACH), hold(t + 1, 1, REACH)]);
    expect(lung(world).phase).toBe("push");
  });
});

describe("the clock", () => {
  it("never runs out on the first exchange, however long the pair takes", () => {
    const world = install();
    lit(world);
    const seen = beat(world, 20);
    expect(seen.has("bellowsLate")).toBe(false);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(lung(world).phase).toBe("pull");
    expect(bellowsWindowLeft(lung(world), world.cfg, world.beat)).toBe(NO_HAND);
  });

  it("but jams the third exchange when both halves miss one window", () => {
    const world = install({ bellowsSparkBeats: 99 });
    lit(world);
    exchange(world);
    exchange(world);
    const s = lung(world);
    expect(bellowsShared(s)).toBe(true);
    expect(bellowsWindowLeft(s, world.cfg, world.beat)).toBeGreaterThan(0);
    stroke(world, 1);
    let seen = new Set<string>();
    for (let n = 0; n <= CFG.bellowsWindowBeats && !seen.has("bellowsLate"); n++) {
      seen = beat(world);
    }
    expect(seen.has("bellowsLate")).toBe(true);
    expect(lung(world).phase).toBe("jam");
    expect(lung(world).seams).toBe(BELLOWS_SEAMS - 2);
  });
});

describe("the two hazards", () => {
  it("leak a spark from the gap the second seam left, and take either colour", () => {
    const world = install();
    lit(world);
    exchange(world);
    stroke(world, 1);
    expect(stroke(world, 2).has("bellowsSpark")).toBe(true);
    const s = lung(world);
    expect(s.sparkCol).toBe(midCol(world.cfg));
    const bolt: Bullet = {
      id: world.nextId++,
      col: s.sparkCol,
      row: 0,
      subMilli: 0,
      color: "cyan",
      lance: false,
      driftMilli: 0,
      aimMilli: 0,
    };
    bellowsStruck(world, bolt);
    expect(lung(world).sparkCol).toBe(NO_SPARK);
    expect(world.events.some((e) => e.type === "bellowsSparkOut")).toBe(true);
  });

  it("and strike the hull with the one nobody shot", () => {
    const world = install();
    lit(world);
    exchange(world);
    stroke(world, 1);
    stroke(world, 2);
    expect(beat(world, CFG.bellowsSparkBeats + 1).has("bellowsSparkHit")).toBe(true);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });

  it("breathe a body down the cannon's own column on the third seam", () => {
    const world = install({ bellowsSparkBeats: 99 });
    lit(world);
    exchange(world);
    exchange(world);
    for (let i = 1; i < CFG.bellowsExchanges; i++) {
      stroke(world, 1);
      stroke(world, 2);
      lift(world);
    }
    stroke(world, 1);
    expect(stroke(world, 2).has("bellowsBreath")).toBe(true);
    const body = world.creatures.find((c) => c.kind === "meteor");
    expect(body?.col).toBe(world.cannonCol);
  });
});

/** Three seams off and the last one glowing, with both handles free. */
function toLast(world: World): void {
  lit(world);
  exchange(world);
  exchange(world);
  exchange(world);
}

describe("the last seam", () => {
  it("glows with nothing on either handle once three are gone", () => {
    const world = install({ bellowsSparkBeats: 99 });
    toLast(world);
    const s = lung(world);
    expect(s.phase).toBe("last");
    expect(s.seams).toBe(1);
    expect(s.handMilli).toEqual([NO_HAND, NO_HAND]);
  });

  it("splits the waist when both let go inside a beat, under THE SLOW", () => {
    const world = install({ bellowsSparkBeats: 99 });
    toLast(world);
    const t = world.tick;
    runTo(world, t + 1, [hold(t, 1, 0), hold(t, 2, 0)]);
    const off = world.tick;
    const seen = runTo(world, off + 1, [hold(off, 1, 0, false), hold(off, 2, 0, false)]);
    expect(seen.has("bellowsSplit")).toBe(true);
    expect(seen.has("bellowsVent")).toBe(true);
    expect(lung(world).phase).toBe("vent");
    expect(lung(world).seams).toBe(0);
    expect(world.slowToBeat).toBeGreaterThan(world.beat);
  });

  it("and holds when one hand comes off a beat after the other", () => {
    const world = install({ bellowsSparkBeats: 99 });
    toLast(world);
    const t = world.tick;
    runTo(world, t + 1, [hold(t, 1, 0), hold(t, 2, 0)]);
    const off = world.tick;
    runTo(world, off + 1, [hold(off, 1, 0, false)]);
    const late = world.tick + TPB * 2;
    const seen = runTo(world, late + 1, [hold(late, 2, 0, false)]);
    expect(seen.has("bellowsHold")).toBe(true);
    expect(seen.has("bellowsSplit")).toBe(false);
    expect(lung(world).phase).toBe("last");
    expect(lung(world).seams).toBe(1);
  });

  it("and the vent hangs its beats, then the lung is gone", () => {
    const world = install({ bellowsSparkBeats: 99 });
    toLast(world);
    const t = world.tick;
    runTo(world, t + 1, [hold(t, 1, 0), hold(t, 2, 0)]);
    const off = world.tick;
    runTo(world, off + 1, [hold(off, 1, 0, false), hold(off, 2, 0, false)]);
    expect(beat(world, CFG.bellowsVentBeats + 1).has("bellowsOut")).toBe(true);
    expect(world.boss).toBeNull();
  });
});

describe("the fingerprint", () => {
  it("is the same for two runs given the same hands", () => {
    const run = (): number => {
      const world = install();
      lit(world);
      stroke(world, 1);
      beat(world, 2);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });

  it("and differs when a thumb has a handle a thousandth further down", () => {
    const at = (to: number): number => {
      const world = install();
      lit(world);
      stroke(world, 1, to);
      return hashWorld(world);
    };
    expect(at(100)).not.toBe(at(101));
  });
});
