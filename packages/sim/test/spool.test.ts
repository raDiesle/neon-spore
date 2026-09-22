import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  isMeteorKind,
  midCol,
  NO_BRAKE,
  NO_SLOW,
  type SimConfig,
  SPOOL_LEGS,
  SPOOL_RIBS,
  type SpoolState,
  spoolBoss,
  spoolBrakeForRateMilli,
  spoolDepthMilli,
  spoolGone,
  spoolLegs,
  spoolPayRateMilli,
  spoolZoneMilli,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE SPOOL: the one boss answered by holding back exactly enough.
 *
 * What these pin is the rule the pair has to say out loud. That the brake is
 * the pilot's and the navigator has no hand in it. That a brake is a **level**
 * and not an edge — shallow pays fast, deep pays slow, and a hand off it pays
 * fastest of all, so letting go is never neutral. That a depth the navigator's
 * rate asks for is one the pilot's thumb can reach, both ways round. That the
 * zone narrows a rib at a time and never past its own step. That the grace at
 * the head of a movement is what keeps a pair who has said nothing yet from
 * slipping before they start. That a whole movement held inside the zone eases
 * one rib and nothing else does. That a slip sends the movement back to its
 * head, and that from the second movement on it throws a rock down the pilot's
 * own column. And that the fourth rib opens THE SLOW and drifts the spool off.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);

function install(over: Partial<SimConfig> = {}): World {
  const world = createWorld({ ...CFG, ...over }, 7);
  startWave(world, 0, [], [], { kind: "spool" });
  return world;
}

function spool(world: World): SpoolState {
  const s = spoolBoss(world);
  if (s === null) throw new Error("the wave installed no spool");
  return s;
}

/** The pilot's thumb carried to a depth, or taken off the brake. */
const grip = (tick: number, to: number, on = true): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target: "spoolBrake", on, fromMilli: 0, fromYMilli: to },
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

/**
 * The fight played right for a span of beats: every tick, the brake carried to
 * the depth this leg's rolled rate asks for. The depth is read back out of the
 * rate rather than worked out here — `spoolBrakeForRateMilli` is called, never
 * re-derived (`purity.test.ts`).
 */
function play(world: World, beats: number): Set<string> {
  const seen = new Set<string>();
  const stop = world.tick + TPB * beats;
  while (world.tick < stop && spoolBoss(world) !== null) {
    const s = spool(world);
    const at = spoolBrakeForRateMilli(world.cfg, s.wantRateMilli);
    step(world, [grip(world.tick, at)]);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** The same span played wrong: the brake at whichever end of the reach is further off. */
function playWrong(world: World, beats: number): Set<string> {
  const seen = new Set<string>();
  const stop = world.tick + TPB * beats;
  while (world.tick < stop && spoolBoss(world) !== null) {
    const s = spool(world);
    const at = spoolBrakeForRateMilli(world.cfg, s.wantRateMilli);
    step(world, [grip(world.tick, at * 2 < world.cfg.spoolReachMilli ? CFG.spoolReachMilli : 0)]);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

describe("THE SPOOL comes in", () => {
  it("over the middle, every rib whole, the line taut and no hand on the brake", () => {
    const world = install();
    const s = spool(world);
    expect(s.phase).toBe("taut");
    expect(s.ribs).toBe(SPOOL_RIBS);
    expect(s.brakeMilli).toBe(NO_BRAKE);
    expect(s.paidMilli).toBe(0);
    expect(s.wantMilli).toBe(0);
  });

  it("says so, in the column the casing hangs over", () => {
    const world = install();
    const enter = world.events.find((e) => e.type === "spoolEnter");
    expect(enter).toBeDefined();
    expect(enter && "col" in enter ? enter.col : -1).toBe(midCol(CFG));
  });

  it("opens its first movement once the taut beats are up", () => {
    const world = install();
    expect(beat(world, CFG.spoolTautBeats + 1)).toContain("spoolZone");
    expect(spool(world).phase).toBe("pay");
  });
});

describe("the brake", () => {
  it("is the pilot's, and the navigator's hand on it does nothing at all", () => {
    const world = install();
    const t = world.tick;
    runTo(world, t + 1, [
      {
        tick: t,
        player: 2,
        command: { kind: "drag", target: "spoolBrake", on: true, fromMilli: 0, fromYMilli: 500 },
      },
    ]);
    expect(spool(world).brakeMilli).toBe(NO_BRAKE);
  });

  it("carries a depth rather than counting an edge: pressed twice, it is the second depth", () => {
    const world = install();
    runTo(world, world.tick + 1, [grip(world.tick, 400)]);
    expect(spool(world).brakeMilli).toBe(400);
    runTo(world, world.tick + 1, [grip(world.tick, 700)]);
    expect(spool(world).brakeMilli).toBe(700);
  });

  it("is cut to its own reach at either end", () => {
    const world = install();
    runTo(world, world.tick + 1, [grip(world.tick, CFG.spoolReachMilli * 3)]);
    expect(spool(world).brakeMilli).toBe(CFG.spoolReachMilli);
    runTo(world, world.tick + 1, [grip(world.tick, -500)]);
    expect(spool(world).brakeMilli).toBe(0);
  });

  it("says when it is first taken and when it is let go, and nothing in between", () => {
    const world = install();
    expect(runTo(world, world.tick + 1, [grip(world.tick, 400)])).toContain("spoolGrip");
    expect(runTo(world, world.tick + 1, [grip(world.tick, 500)])).not.toContain("spoolGrip");
    expect(runTo(world, world.tick + 1, [grip(world.tick, 0, false)])).toContain("spoolLet");
    expect(spool(world).brakeMilli).toBe(NO_BRAKE);
  });

  it("reads as fully shallow with no hand on it, so letting go is never neutral", () => {
    const world = install();
    const s = spool(world);
    expect(spoolDepthMilli(s)).toBe(0);
    expect(spoolPayRateMilli(s, CFG)).toBe(CFG.spoolRateFastMilli);
    s.brakeMilli = CFG.spoolReachMilli;
    expect(spoolPayRateMilli(s, CFG)).toBe(CFG.spoolRateSlowMilli);
  });

  it("reaches every rate the navigator can be shown, and the depth reads back to it", () => {
    const world = install();
    const s = spool(world);
    for (let rate = CFG.spoolRateSlowMilli; rate <= CFG.spoolRateFastMilli; rate++) {
      const at = spoolBrakeForRateMilli(CFG, rate);
      expect(at).toBeGreaterThanOrEqual(0);
      expect(at).toBeLessThanOrEqual(CFG.spoolReachMilli);
      s.brakeMilli = at;
      expect(spoolPayRateMilli(s, CFG)).toBe(rate);
    }
  });
});

describe("the zone", () => {
  it("narrows a rib at a time, and never past its own step", () => {
    const world = install();
    const s = spool(world);
    const widths: number[] = [];
    for (let gone = 0; gone < SPOOL_RIBS; gone++) {
      s.ribs = SPOOL_RIBS - gone;
      widths.push(spoolZoneMilli(s, CFG));
    }
    expect(widths).toEqual([360, 280, 200, 120]);
    for (const w of widths) expect(w).toBeGreaterThanOrEqual(CFG.spoolZoneNarrowMilli);
  });

  it("runs the legs the beat list gives the movement, and the last one runs fewest", () => {
    const world = install();
    const s = spool(world);
    const legs: number[] = [];
    for (let gone = 0; gone < SPOOL_RIBS; gone++) {
      s.ribs = SPOOL_RIBS - gone;
      expect(spoolGone(s)).toBe(gone);
      legs.push(spoolLegs(s));
    }
    expect(legs).toEqual([...SPOOL_LEGS]);
  });

  it("is not judged during the grace, so a pair who has said nothing yet is safe", () => {
    const world = install();
    beat(world, CFG.spoolTautBeats + 1);
    expect(spool(world).phase).toBe("pay");
    // No hand on the brake at all: the fastest rate there is, against a zone
    // that starts on the same mark. It only survives because of the grace.
    beat(world, CFG.spoolGraceBeats - 1);
    expect(spool(world).phase).toBe("pay");
  });
});

describe("a movement held inside its zone", () => {
  it("eases one rib, and the zone under the next is narrower", () => {
    const world = install();
    const seen = play(world, 16);
    expect(seen).toContain("spoolRib");
    const s = spool(world);
    expect(s.ribs).toBe(SPOOL_RIBS - 1);
    expect(seen).not.toContain("spoolSlip");
    expect(spoolZoneMilli(s, CFG)).toBe(CFG.spoolZoneWideMilli - CFG.spoolZoneNarrowMilli);
  });

  it("takes the whole fight to the slack, opens THE SLOW and drifts the spool off", () => {
    const world = install();
    const seen = play(world, 240);
    expect(seen).toContain("spoolSlack");
    expect(seen).toContain("spoolDrift");
    expect(seen).toContain("spoolOut");
    expect(world.slowFromBeat).not.toBe(NO_SLOW);
    expect(world.boss).toBe(null);
  });
});

describe("a movement that leaves its zone", () => {
  it("slips, and goes back to its head with nothing paid out", () => {
    const world = install();
    const seen = playWrong(world, 40);
    expect(seen).toContain("spoolSlip");
    expect(seen).not.toContain("spoolRib");
    const s = spool(world);
    expect(s.ribs).toBe(SPOOL_RIBS);
    expect(s.leg).toBe(0);
  });

  it("throws nothing on the first movement, which is where the gesture is found", () => {
    const world = install();
    const seen = playWrong(world, 20);
    expect(seen).toContain("spoolSlip");
    expect(seen).not.toContain("spoolRock");
    expect(world.creatures.filter((c) => isMeteorKind(c.kind))).toEqual([]);
  });

  it("throws a rock down the pilot's own column once a rib is off", () => {
    const world = install();
    play(world, 16);
    expect(spool(world).ribs).toBe(SPOOL_RIBS - 1);
    world.cannonCol = 2;
    const seen = playWrong(world, 40);
    expect(seen).toContain("spoolRock");
    const rock = world.creatures.find((c) => isMeteorKind(c.kind));
    expect(rock?.col).toBe(2);
  });
});

describe("the fingerprint", () => {
  it("is the same for two runs of the same seed and the same hands", () => {
    const once = (): number => {
      const world = install();
      play(world, 60);
      return hashWorld(world);
    };
    expect(once()).toBe(once());
  });

  it("moves when the brake does", () => {
    const world = install();
    beat(world, CFG.spoolTautBeats + 2);
    const before = hashWorld(world);
    runTo(world, world.tick + 1, [grip(world.tick, 600)]);
    expect(hashWorld(world)).not.toBe(before);
  });
});
