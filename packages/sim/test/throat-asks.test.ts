import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "../src/config.js";
import type { SimEvent } from "../src/events.js";
import { step } from "../src/step.js";
import { type ThroatPhase, type ThroatState, throatBoss } from "../src/throat.js";
import { throatRingAsks, throatTubeAsks } from "../src/throat-hand.js";
import type { Command } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * **Which of THE THROAT's rings asks a seat for a thumb** (`src/throat-hand.ts`
 * `throatRingAsks`, `throatTubeAsks`) — what `render/throat-marks.ts` haloes
 * and `render/throat-grip.ts` offers, read off the simulation rather than
 * re-derived there — and **the refusal a press from the other seat earns**
 * (`throatRefuse`), said once so its ring washes red.
 */

const CFG = DEFAULT_CONFIG;

function open(phase: ThroatPhase, slack: number): { world: World; b: ThroatState } {
  const world = createWorld(CFG, 3);
  startWave(world, 9, [], [], { kind: "throat" });
  const b = throatBoss(world);
  if (b === null) throw new Error("no gullet installed");
  b.slack = slack;
  b.phase = phase;
  b.phaseBeat = world.beat;
  return { world, b };
}

function once(world: World, player: 1 | 2, command: Command): SimEvent[] {
  step(world, [{ tick: world.tick, player, command }]);
  return world.events.filter((e) => e.type === "throatRefuse");
}

const ring = (on: boolean): Command => ({ kind: "drag", target: "throatRing", on, fromMilli: 0 });
const tube = (on: boolean, fromMilli = 0): Command => ({
  kind: "drag",
  target: "throatTube",
  on,
  fromMilli,
});

describe("THE THROAT's ring asks", () => {
  it("once a ring is slack, until her thumb is on it", () => {
    const { world, b } = open("slide", 1);
    expect(throatRingAsks(b)).toBe(true);
    once(world, 2, ring(true));
    expect(throatRingAsks(b)).toBe(false);
  });

  it("not on a whole gullet, nor while the tube everts", () => {
    expect(throatRingAsks(open("still", 0).b)).toBe(false);
    expect(throatRingAsks(open("everts", CFG.throatRings).b)).toBe(false);
  });
});

describe("THE THROAT's tube asks", () => {
  it("only in open, and not while a carry is still to land", () => {
    expect(throatTubeAsks(open("quick", 2).b)).toBe(false);
    const { world, b } = open("open", CFG.throatRings - 1);
    expect(throatTubeAsks(b)).toBe(true);
    once(world, 1, tube(true));
    once(world, 1, tube(false, CFG.throatHaulMilli));
    expect(throatTubeAsks(b)).toBe(false);
  });
});

describe("a press from the other seat", () => {
  it("on the ring is refused once, and cinches nothing", () => {
    const { world, b } = open("open", CFG.throatRings - 1);
    expect(once(world, 1, ring(true))).toMatchObject([{ part: "ring", player: 1 }]);
    expect(throatRingAsks(b)).toBe(true);
    expect(once(world, 1, ring(false))).toHaveLength(0);
  });

  it("on the tube is refused once, and hauls nothing", () => {
    const { world, b } = open("open", CFG.throatRings - 1);
    expect(once(world, 2, tube(true))).toMatchObject([{ part: "tube", player: 2 }]);
    expect(once(world, 2, tube(false, CFG.throatHaulMilli))).toHaveLength(0);
    expect(throatTubeAsks(b)).toBe(true);
  });

  it("is not refused where the ring was not on offer", () => {
    expect(once(open("still", 0).world, 1, ring(true))).toHaveLength(0);
    expect(once(open("quick", 2).world, 2, tube(true))).toHaveLength(0);
  });
});
