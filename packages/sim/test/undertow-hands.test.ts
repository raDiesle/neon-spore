import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type UndertowState,
  undertowBoss,
  undertowLobeAt,
  undertowPinned,
  undertowUnseated,
  type World,
} from "../src/index.js";

/**
 * THE UNDERTOW's **two hands**, and the sentence they are built to make true:
 * the navigator answers the floor on the hull itself, because the hull is the
 * only part of that fight either seat can point at (`undertow-hand.ts`).
 *
 * The pin is a second plate made of a thumb — it stops a breach widening
 * exactly as the shield does, and for the same reason keeps the maw out of
 * that column, so the pair has to say *let go* before he can take it. The free
 * is the one hand in this game that gives a seat back: her thumb held on the
 * unseated pilot's column hauls the plate off him.
 *
 * Its own file because `undertow.test.ts` is already past the 250-line limit,
 * and because what is checked here is a pair of hands rather than the floor's
 * own clock.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "undertow" });
  return world;
}

function floor(world: World): UndertowState {
  const u = undertowBoss(world);
  if (u === null) throw new Error("no floor installed");
  return u;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

/** Her thumb landing on a column, or leaving it. */
function pin(world: World, col: number, on: boolean, player: 1 | 2 = 2): void {
  step(world, [
    cmd(world, player, { kind: "drag", target: "undertowPin", on, fromMilli: 0, id: col }),
  ]);
}

/** Her thumb on the unseated pilot's column, or off it. */
function free(world: World, on: boolean, player: 1 | 2 = 2): void {
  step(world, [cmd(world, player, { kind: "drag", target: "undertowFree", on, fromMilli: 0 })]);
}

/** Run until a lobe stands somewhere, or give up. Returns its column. */
function untilLobe(world: World, cap = 40): number {
  for (let i = 0; i < cap * TPB; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing");
    if (b) return b.col;
    step(world, []);
  }
  throw new Error("no lobe ever stood");
}

/** Run until the floor is bowing somewhere, or give up. */
function untilBow(world: World, cap = 40): void {
  for (let i = 0; i < cap * TPB; i++) {
    if (floor(world).breaches.length > 0) return;
    step(world, []);
  }
  throw new Error("the floor never bowed");
}

/** Player 1 over the column with the maw open: one tick. */
function maw(world: World, col: number): void {
  step(world, [cmd(world, 1, { kind: "cannonCol", col }), cmd(world, 1, { kind: "intake" })]);
}

/** Every lobe taken as it stands, until the phase changes. */
function takeAll(world: World, until: UndertowState["phase"]): void {
  for (let i = 0; i < 400 * TPB && floor(world).phase !== until; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing" && !x.tall);
    if (b) maw(world, b.col);
    else step(world, []);
  }
}

/** Run to the beat the floor unseats a pilot who never slid off. Returns his column. */
function untilUnseated(world: World): number {
  takeAll(world, "seat");
  const col = world.cannonCol;
  for (let i = 0; i < 40 * TPB; i++) {
    if (undertowUnseated(floor(world), world.beat)) return col;
    step(world, []);
  }
  throw new Error("the floor never unseated anyone");
}

describe("the pin", () => {
  it("stands on a lobe and stops the breach under it widening", () => {
    const world = open();
    const col = untilLobe(world);
    pin(world, col, true);
    expect(undertowPinned(floor(world), col)).toBe(true);
    const before = floor(world).breaches.find((b) => b.col === col)?.widthMilli ?? -1;
    for (let i = 0; i < 2 * TPB; i++) step(world, []);
    expect(floor(world).breaches.find((b) => b.col === col)?.widthMilli).toBe(before);
  });

  it("is a plate, so the maw cannot take the lobe until she lets go", () => {
    const world = open();
    const col = untilLobe(world);
    pin(world, col, true);
    maw(world, col);
    expect(floor(world).breaches).toHaveLength(1);
    expect(floor(world).taken).toBe(0);
    pin(world, col, false);
    expect(undertowPinned(floor(world), col)).toBe(false);
    maw(world, col);
    expect(floor(world).breaches).toHaveLength(0);
    expect(floor(world).taken).toBe(1);
  });

  it("says so both ways, and only the once", () => {
    const world = open();
    const col = untilLobe(world);
    pin(world, col, true);
    expect(world.events.filter((e) => e.type === "undertowPinned")).toEqual([
      { type: "undertowPinned", col, on: true },
    ]);
    pin(world, col, true);
    expect(world.events.some((e) => e.type === "undertowPinned")).toBe(false);
    pin(world, col, false);
    expect(world.events.filter((e) => e.type === "undertowPinned")).toEqual([
      { type: "undertowPinned", col, on: false },
    ]);
  });

  it("refuses a bow: there is no hole to cover until the lobe stands", () => {
    const world = open();
    untilBow(world);
    const col = floor(world).breaches[0]?.col ?? -1;
    expect(undertowLobeAt(floor(world), col)).toBeNull();
    pin(world, col, true);
    expect(undertowPinned(floor(world), col)).toBe(false);
  });

  it("moves when her thumb takes a second lobe: there is one pin", () => {
    const world = open();
    const first = untilLobe(world);
    pin(world, first, true);
    // Let the unpinned neighbour of the pair phase stand, then take it instead.
    takeAll(world, "two");
    const second = untilLobe(world);
    if (second === first) return; // The pair came up under the same column; nothing to move to.
    pin(world, second, true);
    const u = floor(world);
    expect(undertowPinned(u, second)).toBe(true);
    expect(undertowPinned(u, first)).toBe(false);
  });

  it("comes off by itself when the lobe it stood on leaves the world", () => {
    const world = open();
    const col = untilLobe(world);
    pin(world, col, true);
    maw(world, col); // Refused — but the lobe withdraws on its own count.
    for (let i = 0; i < (CFG.undertowStandBeats + 2) * TPB; i++) step(world, []);
    const u = floor(world);
    expect(undertowLobeAt(u, col)).toBeNull();
    expect(u.pinCol).toBe(-1);
  });

  it("is hers: the pilot's thumb on the same handle does nothing", () => {
    const world = open();
    const col = untilLobe(world);
    pin(world, col, true, 1);
    expect(undertowPinned(floor(world), col)).toBe(false);
  });
});

describe("the free", () => {
  it("gives the seat back after her beats, and not before", () => {
    const world = open();
    const col = untilUnseated(world);
    free(world, true);
    for (let i = 0; i < (CFG.undertowFreeBeats - 1) * TPB; i++) step(world, []);
    expect(undertowUnseated(floor(world), world.beat)).toBe(true);
    for (let i = 0; i < TPB + 1; i++) step(world, []);
    expect(undertowUnseated(floor(world), world.beat)).toBe(false);
    expect(world.events.some((e) => e.type === "undertowFreed")).toBe(false);
    expect(floor(world).freed).toBe(0);
    expect(col).toBeGreaterThanOrEqual(0);
  });

  it("keeps the count across a lift, as the maw's hold does", () => {
    const world = open();
    untilUnseated(world);
    free(world, true);
    for (let i = 0; i < TPB; i++) step(world, []);
    free(world, false);
    const banked = floor(world).freed;
    expect(banked).toBeGreaterThan(0);
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(floor(world).freed).toBe(banked);
    expect(undertowUnseated(floor(world), world.beat)).toBe(true);
  });

  it("is refused before the floor has unseated anyone", () => {
    const world = open();
    untilLobe(world);
    free(world, true);
    expect(floor(world).freeHeld).toBe(false);
  });

  it("is hers: the pilot cannot free himself", () => {
    const world = open();
    untilUnseated(world);
    free(world, true, 1);
    expect(floor(world).freeHeld).toBe(false);
  });
});

it("fingerprints the same way twice with both hands on the hull", () => {
  const hashes = [0, 1].map(() => {
    const world = open();
    const col = untilLobe(world);
    pin(world, col, true);
    for (let i = 0; i < 3 * TPB; i++) step(world, []);
    pin(world, col, false);
    for (let i = 0; i < 3 * TPB; i++) step(world, []);
    return hashWorld(world);
  });
  expect(hashes[0]).toBe(hashes[1]);
});
