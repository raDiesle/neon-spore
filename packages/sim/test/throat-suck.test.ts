import { describe, expect, it } from "bun:test";
import { ticksPerBeat } from "../src/config.js";
import { slowing } from "../src/slow.js";
import { step } from "../src/step.js";
import { throatRingsLeft } from "../src/throat.js";
import { stepThroatSuck } from "../src/throat-suck.js";
import type { World } from "../src/world.js";
import { CFG, open, pod, pump, put, tube } from "./throat-fixture.js";

/**
 * THE THROAT's suck, and the sentence it makes true: **the mouth swallows
 * what its colour answers and leaves the rest where it is** (`throat-suck.ts`).
 * Every swallow slackens a ring; the fifth turns the gullet inside out.
 */

/** The mouth's own tile, as a column and a row a body can stand on. */
function mouth(world: World): [number, number] {
  const b = tube(world);
  return [Math.round(b.aimXMilli / 1000), Math.round(b.aimYMilli / 1000)];
}

/** A pump at full, which holds over a few ticks of decay. */
function full(world: World): void {
  pump(world, 10);
}

describe("a still pump", () => {
  it("sucks nothing, even a body standing in the mouth", () => {
    const world = open();
    const [col, row] = mouth(world);
    put(world, "slick", col, row, "red");
    stepThroatSuck(world);
    expect(world.creatures).toHaveLength(1);
    expect(tube(world).slack).toBe(0);
  });

  it("closes again on its own a little every tick", () => {
    const world = open();
    full(world);
    const before = tube(world).pumpMilli;
    stepThroatSuck(world);
    expect(tube(world).pumpMilli).toBe(before - CFG.throatPumpDecayMilli);
  });
});

describe("the right colour", () => {
  it("red swallows a red slick and slackens a ring", () => {
    const world = open();
    const [col, row] = mouth(world);
    put(world, "slick", col, row - 1, "red");
    full(world);
    stepThroatSuck(world);
    expect(world.creatures).toHaveLength(0);
    expect(throatRingsLeft(CFG, tube(world))).toBe(CFG.throatRings - 1);
    expect(world.events.some((e) => e.type === "throatSwallow")).toBe(true);
  });

  it("cyan swallows a cyan bulb", () => {
    const world = open();
    const [col, row] = mouth(world);
    put(world, "bulb", col, row, "cyan");
    tube(world).mode = "cyan";
    full(world);
    stepThroatSuck(world);
    expect(world.creatures).toHaveLength(0);
  });

  it("SHIELD swallows a rock", () => {
    const world = open();
    const [col, row] = mouth(world);
    put(world, "meteor", col, row);
    tube(world).mode = "shield";
    full(world);
    stepThroatSuck(world);
    expect(world.creatures).toHaveLength(0);
  });

  it("SUCK swallows a pod and gives its cargo as the maw would", () => {
    const world = open();
    const b = tube(world);
    const p = pod(world, b.aimXMilli, b.aimYMilli);
    b.mode = "suck";
    full(world);
    const taken = world.balance.podsTaken;
    stepThroatSuck(world);
    expect(world.pods.some((q) => q.id === p.id)).toBe(false);
    expect(world.balance.podsTaken).toBe(taken + 1);
    expect(b.slack).toBe(1);
  });

  it("SUCK never takes a husk", () => {
    const world = open();
    const b = tube(world);
    const p = pod(world, b.aimXMilli, b.aimYMilli);
    p.husk = true;
    b.mode = "suck";
    full(world);
    stepThroatSuck(world);
    expect(world.pods).toContain(p);
    expect(b.slack).toBe(0);
  });

  it("takes nothing outside the circle", () => {
    const world = open();
    const [col, row] = mouth(world);
    pump(world, 1);
    const far = Math.ceil(CFG.throatMaxRadiusMilli / 1000) + 1;
    put(world, "slick", col, row - far, "red");
    stepThroatSuck(world);
    expect(world.creatures).toHaveLength(1);
  });
});

describe("the wrong colour", () => {
  it("leaves the body where it is, unhurt, and costs the pair nothing", () => {
    const world = open();
    const [col, row] = mouth(world);
    const c = put(world, "bulb", col, row, "cyan");
    const scars = world.scars.length;
    full(world);
    stepThroatSuck(world);
    expect(world.creatures).toEqual([c]);
    expect([c.col, c.row]).toEqual([col, row]);
    expect(world.scars).toHaveLength(scars);
    expect(tube(world).slack).toBe(0);
    expect(tube(world).refusedId).toBe(c.id);
  });

  it("refuses a body once per throttle, not once a tick", () => {
    const world = open();
    const [col, row] = mouth(world);
    put(world, "meteor", col, row);
    full(world);
    let refusals = 0;
    for (let t = 0; t < CFG.throatRefuseTicks; t++) {
      stepThroatSuck(world);
      refusals += world.events.filter((e) => e.type === "throatRefuse").length;
      world.events.length = 0;
      world.tick += 1;
    }
    expect(refusals).toBe(1);
  });

  it("refuses a pod in any colour but SUCK", () => {
    const world = open();
    const b = tube(world);
    const p = pod(world, b.aimXMilli, b.aimYMilli);
    full(world);
    stepThroatSuck(world);
    expect(world.pods).toContain(p);
    expect(b.refusedId).toBe(p.id);
  });
});

describe("the end", () => {
  it("turns inside out on the last ring, and is gone once the eversion has run", () => {
    const world = open();
    const b = tube(world);
    const [col, row] = mouth(world);
    for (let i = 0; i < CFG.throatRings; i++) {
      put(world, "slick", col, row, "red");
      full(world);
      stepThroatSuck(world);
    }
    expect(b.phase).toBe("everts");
    expect(b.pumpMilli).toBe(0);
    expect(slowing(world)).toBe(true);
    expect(world.events.some((e) => e.type === "throatEvert")).toBe(true);
    const ticks = (CFG.throatEvertBeats + 2) * ticksPerBeat(CFG) * 4;
    for (let t = 0; t < ticks && world.boss !== null; t++) step(world, []);
    expect(world.boss).toBeNull();
  });
});
