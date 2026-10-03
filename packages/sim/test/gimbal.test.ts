import { describe, expect, it } from "bun:test";
import {
  BEARING_TURN,
  createWorld,
  DEFAULT_CONFIG,
  type GimbalMark,
  type GimbalState,
  gimbalBoss,
  gimbalShownMilli,
  gimbalTeeth,
  hashWorld,
  INNER,
  NO_BEARING,
  NO_SEAM,
  OUTER,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * THE GIMBAL: one wheel gripped from its two opposite faces.
 *
 * What these pin is the rule a phone cannot show. That each seat turns its
 * own ring and only its own. That the navigator's rim is **mirrored** — the
 * same drag that carries the pilot's ring clockwise carries hers the other
 * way round the wheel — which is the whole fight, and is one function rather
 * than a rule written twice (`gimbalShownMilli`). That both rings true
 * together lights the pair and takes no tooth on its own — the let-go does,
 * `gimbal-let-go.test.ts` — that either of them leaving is the slip, and
 * that a ring nobody is holding drifts back to rest.
 * That the last tooth pair leaves the seam leaking, that a bolt of either
 * colour shuts it, and that nobody's bolt is one strike on the hull. And
 * that no window ever closes on the pair: an alignment nobody finds is an
 * alignment still up.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);

/** Two alignments, so the first shear leaves one tooth pair and the seam. */
const FIRST: GimbalMark = { outerMilli: 250, innerMilli: 500, creepMilli: 0, trueMilli: 45 };
const MARKS: GimbalMark[] = [
  FIRST,
  { outerMilli: 600, innerMilli: 400, creepMilli: 0, trueMilli: 30 },
];

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

/** Both thumbs onto the first alignment: his mark, then hers — what is left
 * of it once his turn has carried her ring, mirrored onto her face. */
function onFirstMarks(world: World): void {
  carry(world, 1, FIRST.outerMilli);
  carry(world, 2, BEARING_TURN - (FIRST.innerMilli - FIRST.outerMilli));
}

describe("THE GIMBAL comes in", () => {
  it("over the middle, dark and still, with every tooth on both rings", () => {
    const world = install();
    const s = gimbal(world);
    expect(s.phase).toBe("still");
    expect(s.cursor).toBe(0);
    expect(gimbalTeeth(s)).toBe(2);
    expect(s.atMilli).toEqual([0, 0]);
    expect(s.handMilli).toEqual([NO_BEARING, NO_BEARING]);
    expect(s.seamCol).toBe(NO_SEAM);
    expect(world.events.some((e) => e.type === "gimbalEnter")).toBe(true);
  });

  it("and lights the first alignment's marks after its still", () => {
    const world = install();
    expect(lit(world).has("gimbalMarks")).toBe(true);
    expect(gimbal(world).phase).toBe("turn");
  });
});

describe("the navigator's rim is the mirror of the wheel", () => {
  it("as a reading, on her ring alone", () => {
    expect(gimbalShownMilli(250, OUTER)).toBe(250);
    expect(gimbalShownMilli(250, INNER)).toBe(750);
    expect(gimbalShownMilli(0, INNER)).toBe(0);
  });

  it("and as a turn: the same drag carries the two rings opposite ways", () => {
    const world = install();
    lit(world);
    carry(world, 2, 250);
    expect(gimbal(world).atMilli).toEqual([0, BEARING_TURN - 250]);
  });

  it("so her mark is reached by carrying to the far side of her own rim", () => {
    const world = install();
    lit(world);
    onFirstMarks(world);
    expect(gimbal(world).atMilli).toEqual([FIRST.outerMilli, FIRST.innerMilli]);
  });
});

describe("a ring is one seat's and nobody else's", () => {
  it("so the pilot's thumb on the inner rim moves nothing", () => {
    const world = install();
    lit(world);
    const t = world.tick;
    runTo(world, t + 2, [
      { tick: t, player: 1, command: { ...grip(t, 2, 0).command } },
      { tick: t + 1, player: 1, command: { ...grip(t, 2, 400).command } },
    ]);
    expect(gimbal(world).atMilli).toEqual([0, 0]);
  });

  it("and no rim moves at all while the marks are still dark", () => {
    const world = install();
    carry(world, 1, 250);
    expect(gimbal(world).atMilli[OUTER]).toBe(0);
  });
});

describe("both true", () => {
  it("lights the pair and takes no tooth while the hands stay on", () => {
    const world = install();
    lit(world);
    onFirstMarks(world);
    expect(beat(world).has("gimbalTrue")).toBe(true);
    expect(beat(world, 6).has("gimbalShear")).toBe(false);
    expect(gimbalTeeth(gimbal(world))).toBe(2);
  });

  it("and is lost the beat either ring leaves its mark", () => {
    const world = install();
    lit(world);
    onFirstMarks(world);
    expect(beat(world).has("gimbalTrue")).toBe(true);
    // She turns off her mark; his ring is not carried by hers.
    const t = world.tick;
    runTo(world, t + 1, [grip(t, 2, 600)]);
    const slips: SimEvent[] = [];
    while (world.tick < t + 1 + TPB) {
      step(world, []);
      slips.push(...world.events.filter((e) => e.type === "gimbalSlip"));
    }
    expect(slips).toEqual([
      { type: "gimbalSlip", col: expect.any(Number), outer: false, inner: true },
    ]);
    expect(gimbal(world).heldBeats).toBe(0);
  });

  it("and nothing strikes the pair for taking as long as they like", () => {
    const world = install();
    lit(world);
    const seen = beat(world, 20);
    expect(seen.has("gimbalSeamHit")).toBe(false);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(gimbal(world).phase).toBe("turn");
  });
});

describe("a ring nobody is holding", () => {
  it("drifts back to rest, a step a beat, and stops there", () => {
    const world = install();
    lit(world);
    carry(world, 1, 250);
    const t = world.tick;
    runTo(world, t + 1, [grip(t, 1, 250, false)]);
    const was = gimbal(world).atMilli[OUTER];
    beat(world);
    expect(gimbal(world).atMilli[OUTER]).toBe(was - CFG.gimbalDriftMilli);
    beat(world, 20);
    expect(gimbal(world).atMilli[OUTER]).toBe(0);
  });
});

describe("the fingerprint", () => {
  it("is the same for two runs given the same thumbs", () => {
    const run = (): number => {
      const world = install();
      lit(world);
      onFirstMarks(world);
      beat(world, 4);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });

  it("and differs when one ring sits a step off the other's", () => {
    const stand = (to: number): number => {
      const world = install();
      lit(world);
      carry(world, 1, to);
      return hashWorld(world);
    };
    expect(stand(250)).not.toBe(stand(251));
  });
});
