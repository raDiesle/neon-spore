import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type UndertowState,
  undertowBoss,
  undertowFreeAsks,
  undertowPinAsks,
  undertowUnseated,
  type World,
} from "../src/index.js";

/**
 * **Which of THE UNDERTOW's rings asks her for a thumb** (`src/undertow-hand.ts`
 * `undertowPinAsks`, `undertowFreeAsks`) — what `render/undertow-marks.ts`
 * haloes, read off the simulation rather than re-derived there — and **the
 * refusal the pilot's press on her free earns** (`undertowRefuse`), said once
 * so the ring washes red. Stepped to each state rather than posed, as
 * `undertow-hands.test.ts` is.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function open(): World {
  const world = createWorld(CFG, 3);
  startWave(world, 6, [], [], { kind: "undertow" });
  return world;
}

function floor(world: World): UndertowState {
  const u = undertowBoss(world);
  if (u === null) throw new Error("no floor installed");
  return u;
}

function said(world: World, player: 1 | 2, command: TimedCommand["command"]): SimEvent[] {
  step(world, [{ tick: world.tick, player, command }]);
  return world.events.filter((e) => e.type === "undertowRefuse");
}

const pin = (col: number, on: boolean) =>
  ({ kind: "drag", target: "undertowPin", on, fromMilli: 0, id: col }) as const;
const free = (on: boolean) => ({ kind: "drag", target: "undertowFree", on, fromMilli: 0 }) as const;

function untilLobe(world: World): number {
  for (let i = 0; i < 40 * TPB; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing");
    if (b) return b.col;
    step(world, []);
  }
  throw new Error("no lobe ever stood");
}

function untilUnseated(world: World): void {
  for (let i = 0; i < 400 * TPB && floor(world).phase !== "seat"; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing" && !x.tall);
    if (b === undefined) step(world, []);
    else {
      step(world, [
        { tick: world.tick, player: 1, command: { kind: "cannonCol", col: b.col } },
        { tick: world.tick, player: 1, command: { kind: "intake" } },
      ]);
    }
  }
  for (let i = 0; i < 40 * TPB; i++) {
    if (undertowUnseated(floor(world), world.beat)) return;
    step(world, []);
  }
  throw new Error("the floor never unseated anyone");
}

describe("THE UNDERTOW's pin asks", () => {
  it("on a standing lobe until her thumb is on it", () => {
    const world = open();
    const col = untilLobe(world);
    expect(undertowPinAsks(floor(world), col)).toBe(true);
    said(world, 2, pin(col, true));
    expect(undertowPinAsks(floor(world), col)).toBe(false);
  });

  it("nowhere without a lobe", () => {
    const world = open();
    const col = untilLobe(world);
    expect(undertowPinAsks(floor(world), (col + 1) % CFG.cols)).toBe(false);
  });
});

describe("THE UNDERTOW's free asks", () => {
  it("only while he is unseated, and not while her thumb is on it", () => {
    const world = open();
    untilLobe(world);
    expect(undertowFreeAsks(floor(world), world.beat)).toBe(false);
    untilUnseated(world);
    expect(undertowFreeAsks(floor(world), world.beat)).toBe(true);
    said(world, 2, free(true));
    expect(undertowFreeAsks(floor(world), world.beat)).toBe(false);
  });
});

describe("the pilot's press on her free", () => {
  it("is refused once, in his column, and banks nothing", () => {
    const world = open();
    untilUnseated(world);
    expect(said(world, 1, free(true))).toEqual([{ type: "undertowRefuse", col: world.cannonCol }]);
    expect(floor(world).freeHeld).toBe(false);
    expect(said(world, 1, free(false))).toHaveLength(0);
  });

  it("is not refused before the floor has him, nor is his press on a lobe", () => {
    const world = open();
    const col = untilLobe(world);
    expect(said(world, 1, free(true))).toHaveLength(0);
    expect(said(world, 1, pin(col, true))).toHaveLength(0);
  });
});
