import { describe, expect, it } from "bun:test";
import {
  CLAW_LEAD_BEATS,
  CLAW_NOTHING,
  CLAW_POD,
  CLAW_ROCK,
  type ClawState,
  clawCells,
  clawHolds,
  clawPodsLeft,
  clawRocksLeft,
  clawRound,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  roundSpent,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE CLAW: a rail, a row of sockets, and one seat holding every button.
 *
 * Most of this file is about the two things that make it a different round
 * from THE FLEET rather than the same one with the letters filed off — the
 * wrecks shift under the sentence being said about them, and the seat that can
 * see them cannot press anything. Both are rules of the simulation rather than
 * of the drawing, which is what makes them testable at all.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 6;

function open(seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "claw" });
  return world;
}

function round(world: World): ClawState {
  const c = clawRound(world);
  if (c === null) throw new Error("no round running");
  return c;
}

function cmd(player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: 0, player, command };
}

/** Run beats, sending nothing. */
function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

/** Past the lead-in, where the round actually answers a thumb. */
function toPlay(world: World): ClawState {
  beats(world, CLAW_LEAD_BEATS + 1);
  return round(world);
}

/** One press, on the next tick. */
function press(world: World, player: 1 | 2, command: TimedCommand["command"]): void {
  step(world, [cmd(player, command)]);
}

describe("THE CLAW is installed by a wave like any other boss", () => {
  it("takes the field away for as long as it stands", () => {
    const world = open();
    expect(clawHolds(world)).toBe(true);
    expect(world.creatures).toHaveLength(0);
    // The wave stands still and the clock does not: the metronome is the
    // game's heartbeat and the field's shifting hangs off it.
    const before = world.waveBeat;
    beats(world, 3);
    expect(world.waveBeat).toBe(before);
    expect(world.beat).toBeGreaterThan(0);
  });

  it("deals the sockets it was configured for, and never onto the claw", () => {
    const world = open();
    const claw = round(world);
    expect(claw.cells).toHaveLength(clawCells(CFG));
    expect(clawPodsLeft(claw.cells)).toBe(CFG.clawPods);
    expect(clawRocksLeft(claw.cells)).toBe(CFG.clawRocks);
    // The claw opens on an empty socket, so a first grab pressed without a
    // word said can never come up holding anything.
    expect(claw.cells[claw.cell]).toBe(CLAW_NOTHING);
  });

  it("deals a different field from a different seed", () => {
    // What is rolled is exactly what one seat knows and the other does not,
    // which is the randomness rule. A fixed field is one the pilot memorises.
    const a = round(open(1)).cells.join("");
    const b = round(open(2)).cells.join("");
    expect(a).not.toBe(b);
  });
});

describe("the machine answers one seat and one seat only", () => {
  it("walks the claw a socket a press, and never off the rail", () => {
    const world = open();
    const claw = toPlay(world);
    const from = claw.cell;
    press(world, 1, { kind: "clawStep", dir: 1 });
    expect(claw.cell).toBe(from + 1);
    for (let i = 0; i < clawCells(CFG) + 3; i++) {
      press(world, 1, { kind: "clawStep", dir: -1 });
    }
    // Held to the rail rather than wrapped round it: a claw that came out of
    // the far side would make "one more left" a sentence with two answers.
    expect(claw.cell).toBe(0);
  });

  it("refuses the navigator, who has no button drawn at all", () => {
    const world = open();
    const claw = toPlay(world);
    const from = claw.cell;
    press(world, 2, { kind: "clawStep", dir: 1 });
    press(world, 2, { kind: "clawGrab" });
    expect(claw.cell).toBe(from);
    expect(claw.grabCell).toBe(-1);
  });

  it("hears nothing before the round has begun", () => {
    const world = open();
    const claw = round(world);
    expect(claw.phase).toBe("lead");
    const from = claw.cell;
    press(world, 1, { kind: "clawStep", dir: 1 });
    expect(claw.cell).toBe(from);
  });
});

describe("a grab", () => {
  /** Stand the claw over a socket and put `what` in it. */
  function set(claw: ClawState, what: number): void {
    claw.cells.fill(what === CLAW_POD ? CLAW_NOTHING : CLAW_POD);
    claw.cells[claw.cell] = what;
  }

  it("raises a pod and spends the socket", () => {
    const world = open();
    const claw = toPlay(world);
    set(claw, CLAW_POD);
    const score = world.score;
    press(world, 1, { kind: "clawGrab" });
    expect(claw.pods).toBe(1);
    expect(claw.cells[claw.cell]).toBe(CLAW_NOTHING);
    expect(world.score).toBeGreaterThan(score);
  });

  it("costs the hull when it comes up holding a rock", () => {
    const world = open();
    const claw = toPlay(world);
    set(claw, CLAW_ROCK);
    const hull = hullPercent(world);
    press(world, 1, { kind: "clawGrab" });
    expect(claw.rocks).toBe(1);
    expect(hullPercent(world)).toBeLessThan(hull);
    // The scar is on the hull when the field comes back, which is what makes
    // the price read rather than merely count.
    expect(world.scars.length).toBeGreaterThan(0);
  });

  it("spends an empty socket too, so the rail cannot simply be swept", () => {
    const world = open();
    const claw = toPlay(world);
    claw.cells.fill(CLAW_POD);
    claw.cells[claw.cell] = CLAW_NOTHING;
    press(world, 1, { kind: "clawGrab" });
    expect(claw.grabHold).toBe(CLAW_NOTHING);
    expect(claw.pods).toBe(0);
  });

  it("costs the rest between two of them, landed or not", () => {
    const world = open();
    const claw = toPlay(world);
    claw.cells.fill(CLAW_POD);
    press(world, 1, { kind: "clawGrab" });
    expect(claw.pods).toBe(1);
    // Straight away, and on a socket that still has something in it: the press
    // is refused by the rest and not by an empty hole.
    claw.cells[claw.cell] = CLAW_POD;
    press(world, 1, { kind: "clawGrab" });
    expect(claw.pods).toBe(1);
    beats(world, CFG.clawGrabRestBeats + 1);
    press(world, 1, { kind: "clawGrab" });
    expect(claw.pods).toBe(2);
  });

  it("holds the claw still while it is down", () => {
    const world = open();
    const claw = toPlay(world);
    press(world, 1, { kind: "clawGrab" });
    const from = claw.cell;
    press(world, 1, { kind: "clawStep", dir: 1 });
    expect(claw.cell).toBe(from);
  });
});

describe("the wrecks shift, which is the round", () => {
  it("moves exactly one of them, one socket, into a hole", () => {
    const world = open();
    const claw = toPlay(world);
    const before = [...claw.cells];
    beats(world, CFG.clawDriftBeats + 1);
    const moved: number[] = [];
    for (let i = 0; i < claw.cells.length; i++) {
      if (claw.cells[i] !== before[i]) moved.push(i);
    }
    expect(moved).toHaveLength(2);
    expect(Math.abs((moved[1] as number) - (moved[0] as number))).toBe(1);
    // Into a hole and never onto anything: the count of each is unchanged.
    expect(clawPodsLeft(claw.cells)).toBe(clawPodsLeft(before));
    expect(clawRocksLeft(claw.cells)).toBe(clawRocksLeft(before));
  });

  it("says where it went, so one screen can draw the move", () => {
    const world = open();
    const claw = toPlay(world);
    beats(world, CFG.clawDriftBeats + 1);
    expect(claw.driftFrom).toBeGreaterThanOrEqual(0);
    expect(Math.abs(claw.driftTo - claw.driftFrom)).toBe(1);
  });
});

describe("how it ends", () => {
  it("is over when the last pod is up", () => {
    const world = open();
    const claw = toPlay(world);
    claw.cells.fill(CLAW_NOTHING);
    claw.cells[claw.cell] = CLAW_POD;
    press(world, 1, { kind: "clawGrab" });
    beats(world, 1);
    expect(round(world).phase).toBe("verdict");
    expect(round(world).passed).toBe(true);
  });

  it("costs the hull when the clock runs out, and then ends the wave", () => {
    const world = open();
    toPlay(world);
    const hull = hullPercent(world);
    beats(world, CFG.clawRoundBeats + 1);
    expect(round(world).passed).toBe(false);
    expect(hullPercent(world)).toBeLessThan(hull);
    // The picture holds until the next wave arrives rather than dropping back
    // to a field for the beats of rest in between.
    beats(world, 6);
    expect(roundSpent(world)).toBe(true);
  });
});

describe("two devices", () => {
  it("notices a socket that differs by one wreck", () => {
    const world = open();
    const claw = toPlay(world);
    const before = hashWorld(world);
    claw.cells[0] = claw.cells[0] === CLAW_ROCK ? CLAW_POD : CLAW_ROCK;
    expect(hashWorld(world)).not.toBe(before);
  });

  it("notices the claw standing one socket over", () => {
    const world = open();
    const claw = toPlay(world);
    const before = hashWorld(world);
    claw.cell += 1;
    expect(hashWorld(world)).not.toBe(before);
  });
});
