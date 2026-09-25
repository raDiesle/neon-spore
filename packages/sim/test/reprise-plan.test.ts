import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type RepriseEcho,
  repriseClock,
  reprisePlan,
  type SimConfig,
  type SpawnEntry,
  startWave,
  step,
  ticksPerBeat,
} from "../src/index.js";

/**
 * `reprisePlan` is `reprise.ts`'s clock walked a second time without a world,
 * so the director can mark on the map where the dark falls. This plays the
 * real world beside it and holds the two to one answer: every echo the world
 * opens is one the plan named, with the same first body and the same count,
 * and the same rows either side of the dark.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, briefings: false, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);

/** The echoes the real world opens, read as it plays. */
function played(queue: SpawnEntry[], every: number): RepriseEcho[] {
  const world = createWorld(CFG, 5);
  startWave(world, 3, [...queue], [], { kind: "reprise", beat: every });
  const out: RepriseEcho[] = [];
  let firstRow = 0;
  for (let beat = 0; beat < 400 && world.boss !== null; beat++) {
    const before = world.boss.kind === "reprise" ? { ...world.boss } : null;
    for (let t = 0; t < TPB; t++) step(world, []);
    const boss = world.boss;
    if (before === null || boss === null || boss.kind !== "reprise") continue;
    // An echo opened on this beat: the clock was running seen and the queue
    // was held. One that is a beat long has opened and shut again already, so
    // what it sent is read off how far `from` moved.
    if (before.at >= 0 || boss.held === before.held) continue;
    const count = boss.at >= 0 ? boss.cursor - boss.from + boss.left : boss.from - before.from;
    // The dark falls on the seen beat the stretch ran out on; the last row the
    // wave had spawned from was read against the beat before it.
    const lastRow = world.waveBeat - before.held - 2;
    out.push({ from: before.from, count, firstRow, lastRow });
    firstRow = lastRow + 1;
  }
  return out;
}

const at = (beats: number[]): SpawnEntry[] =>
  beats.map((beat, i) => ({ beat, col: i % 7, kind: "slick", color: i % 2 ? "cyan" : "red" }));

describe("THE REPRISE's plan", () => {
  const cases: [string, number[], number][] = [
    ["the shipped figure", [0, 3, 6, 12, 14, 18, 21], 12],
    ["a quiet stretch in the middle", [0, 2, 30, 31], 8],
    ["bodies on the edge of a stretch", [0, 10, 11, 12, 22, 23], 12],
    ["two on one row", [0, 0, 5, 5, 9], 4],
    ["one body", [7], 16],
  ];
  for (const [name, beats, every] of cases) {
    it(`agrees with the world: ${name}`, () => {
      const plan = reprisePlan(beats, every);
      const world = played(at(beats), every);
      expect(plan).toEqual(world);
      // Every body in the stretch is on a row at or above `lastRow`, and the
      // next body is below it: the row is where the dark actually falls.
      for (const echo of plan) {
        const inside = beats.slice(echo.from, echo.from + echo.count);
        expect(Math.max(...inside)).toBeLessThanOrEqual(echo.lastRow);
        const next = beats[echo.from + echo.count];
        if (next !== undefined) expect(next).toBeGreaterThan(echo.lastRow);
      }
      expect(plan.reduce((n, e) => n + e.count, 0)).toBe(beats.length);
    });
  }

  it("has nothing to plan for an empty wave", () => {
    expect(reprisePlan([], 12)).toEqual([]);
  });
});

describe("THE REPRISE's clock", () => {
  it("counts a stretch up to its length, then the echo down to its last body", () => {
    const world = createWorld(CFG, 5);
    const queue = at([0, 3, 6, 14]);
    startWave(world, 3, [...queue], [], { kind: "reprise", beat: 12 });
    const seen: string[] = [];
    for (let beat = 0; beat < 24; beat++) {
      for (let t = 0; t < TPB; t++) step(world, []);
      const c = repriseClock(world);
      if (c) seen.push(`${c.echo ? "E" : "R"}${c.done}/${c.beats}:${c.count}`);
    }
    // Recording runs 1..11 of 12 with the bodies counted in as they arrive,
    // then the echo opens on the twelfth beat and runs 0..6 over seven beats
    // (bodies authored 0, 3 and 6), counting down as each is sent.
    expect(seen.slice(0, 11)).toEqual([
      "R1/12:1",
      "R2/12:1",
      "R3/12:1",
      "R4/12:2",
      "R5/12:2",
      "R6/12:2",
      "R7/12:3",
      "R8/12:3",
      "R9/12:3",
      "R10/12:3",
      "R11/12:3",
    ]);
    expect(seen.slice(11, 17)).toEqual([
      "E0/7:2",
      "E1/7:2",
      "E2/7:2",
      "E3/7:1",
      "E4/7:1",
      "E5/7:1",
    ]);
    // The last body goes on the seventh beat of the echo and the stretch that
    // starts then is recorded from nought.
    expect(seen[17]).toBe("R0/12:0");
  });

  it("goes quiet once the whole script has been sent again", () => {
    const world = createWorld(CFG, 5);
    startWave(world, 3, [...at([0, 3])], [], { kind: "reprise", beat: 6 });
    let waiting = 0;
    for (let beat = 0; beat < 80 && world.boss !== null; beat++) {
      for (let t = 0; t < TPB; t++) step(world, []);
      const boss = world.boss;
      if (boss?.kind !== "reprise" || boss.at >= 0 || boss.from < world.queue.length) continue;
      // The last echo has closed and its bodies are still falling: the
      // mechanism is installed, and there is no dark left to count down to.
      waiting += 1;
      expect(repriseClock(world)).toBeNull();
    }
    expect(waiting, "never saw the wait after the last echo").toBeGreaterThan(0);
  });
});
