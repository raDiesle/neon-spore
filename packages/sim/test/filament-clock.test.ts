import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  FILAMENT_NAVIGATOR,
  FILAMENT_PILOT,
  type FilamentPath,
  type FilamentState,
  filamentBoss,
  filamentLateBeat,
  filamentTooSoon,
  filamentWaitingOn,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE FILAMENT's clock: the owner's *not infinite, and the ship takes damage*
 * (25 September 2026, `filament-turn.ts`).
 *
 * What these pin is whose move the line is waiting on at each gap — his at
 * one, either's between, hers at the window — that the first tile has
 * `filamentStartBeats` and every one after `filamentStallBeats` from the last
 * move of either thumb, and that a line left standing past its clock strikes
 * the hull under the thumb it waited on, which is the wave. Nothing is late
 * while a filament arms or comes out.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const PATHS: FilamentPath[] = [{ col: 5, row: 9, moves: "UUUUUUU" }];

function install(): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "filament", filaments: PATHS });
  return world;
}

function filament(world: World): FilamentState {
  const s = filamentBoss(world);
  if (s === null) throw new Error("the wave installed no filament");
  return s;
}

const thumb = (tick: number, player: 1 | 2, up: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "filament", on: true, fromMilli: 0, fromYMilli: -up * 1000 },
});

/** Step to a tick and keep every event that went by. */
function runTo(world: World, tick: number, cmds: TimedCommand[] = []): SimEvent[] {
  const seen: SimEvent[] = [];
  while (world.tick < tick) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    seen.push(...world.events);
  }
  return seen;
}

const has = (seen: SimEvent[], type: string) => seen.some((e) => e.type === type);

/** Armed and both thumbs grabbed. */
function tracing(world: World): void {
  runTo(world, world.tick + TPB * CFG.filamentArmBeats + 1);
  const t = world.tick;
  runTo(world, t + 1, [thumb(t, 1, 0), thumb(t, 2, 0)]);
}

/** The pilot lights tile `up`, then a beat passes so the next is not a snap. */
function draw(world: World, up: number): void {
  const t = world.tick;
  runTo(world, t + 1, [thumb(t, 1, up)]);
  runTo(world, world.tick + TPB);
}

describe("whose move the line waits on", () => {
  it("his at the free end and a gap of one, either's between, hers at the window", () => {
    const world = install();
    const s = filament(world);
    expect(filamentWaitingOn(s, world.cfg)).toBe(0);
    tracing(world);
    expect(filamentWaitingOn(s, world.cfg)).toBe(FILAMENT_PILOT);
    draw(world, 1);
    expect(filamentWaitingOn(s, world.cfg)).toBe(FILAMENT_PILOT);
    draw(world, 2);
    expect(filamentWaitingOn(s, world.cfg)).toBe(FILAMENT_PILOT | FILAMENT_NAVIGATOR);
    draw(world, CFG.filamentGapTiles);
    expect(filamentWaitingOn(s, world.cfg)).toBe(FILAMENT_NAVIGATOR);
  });

  it("says a second tile in the same beat would be the snap", () => {
    const world = install();
    const s = filament(world);
    tracing(world);
    const t = world.tick;
    runTo(world, t + 1, [thumb(t, 1, 1)]);
    expect(filamentTooSoon(s, world.beat)).toBe(true);
    runTo(world, world.tick + TPB);
    expect(filamentTooSoon(s, world.beat)).toBe(false);
  });
});

describe("the line's clock", () => {
  it("strikes under the pilot when he has not lit the first tile in time", () => {
    const world = install();
    const s = filament(world);
    tracing(world);
    expect(filamentLateBeat(s, world.cfg)).toBe(s.stillBeat + CFG.filamentStartBeats);
    let seen = runTo(world, world.tick + TPB * (CFG.filamentStartBeats - 2));
    expect(has(seen, "filamentLate")).toBe(false);
    seen = runTo(world, world.tick + TPB * 3);
    const late = seen.find((e) => e.type === "filamentLate");
    expect(late).toMatchObject({ type: "filamentLate", seat: 1, col: 5 });
    expect(has(seen, "waveFailed")).toBe(true);
  });

  it("gives every tile after the first the shorter stall, from the last move", () => {
    const world = install();
    const s = filament(world);
    tracing(world);
    draw(world, 1);
    expect(filamentLateBeat(s, world.cfg)).toBe(s.stillBeat + CFG.filamentStallBeats);
    const seen = runTo(world, world.tick + TPB * CFG.filamentStallBeats);
    expect(seen.find((e) => e.type === "filamentLate")).toMatchObject({ seat: 1 });
  });

  it("strikes under the navigator when she is the one it waits on", () => {
    const world = install();
    tracing(world);
    for (let up = 1; up <= CFG.filamentGapTiles; up++) draw(world, up);
    const seen = runTo(world, world.tick + TPB * CFG.filamentStallBeats);
    expect(seen.find((e) => e.type === "filamentLate")).toMatchObject({ seat: 2, col: 5 });
    expect(has(seen, "waveFailed")).toBe(true);
  });

  it("is restarted by her move as much as by his", () => {
    const world = install();
    const s = filament(world);
    tracing(world);
    draw(world, 1);
    draw(world, 2);
    const before = s.stillBeat;
    const t = world.tick;
    runTo(world, t + 1, [thumb(t, 2, 1)]);
    expect(s.tail).toBe(1);
    expect(s.stillBeat).toBe(world.beat);
    expect(s.stillBeat).toBeGreaterThan(before);
  });

  it("does not run while a filament arms", () => {
    const world = install();
    const seen = runTo(world, TPB * (CFG.filamentArmBeats + 1));
    expect(has(seen, "filamentLate")).toBe(false);
  });
});
