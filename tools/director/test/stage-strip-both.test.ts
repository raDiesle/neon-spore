import { describe, expect, it } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { cannonGrab, computeLayout, shieldGrab, shipUnder } from "@neon-spore/render";
import { createWorld, DEFAULT_CONFIG, step } from "@neon-spore/sim";
import { stageField } from "../src/stage-field.js";
import { stripBothHands } from "../src/stage-strip-both.js";

/**
 * **The stage's two asks of 25 September 2026**: the hull's lobes answer no
 * mouse, and under TEST one strip carries the cannon and the shield together.
 */

const cfg = DEFAULT_CONFIG;
const panel = controlSet("default");

describe("stripBothHands", () => {
  it("under TEST, a cannon slide is also the navigator's shield slide to the same column", () => {
    expect(stripBothHands("test", 1, { kind: "cannonCol", col: 4 }, panel)).toEqual({
      player: 2,
      command: { kind: "shieldCol", col: 4 },
    });
    expect(stripBothHands("test", 2, { kind: "shieldCol", col: 1 }, panel)).toEqual({
      player: 1,
      command: { kind: "cannonCol", col: 1 },
    });
  });

  it("the phone's own screens are one strip each", () => {
    expect(stripBothHands("p1", 1, { kind: "cannonCol", col: 4 }, panel)).toBeNull();
    expect(stripBothHands("p2", 2, { kind: "shieldCol", col: 4 }, panel)).toBeNull();
  });

  it("a panel without the other control is not handed one", () => {
    const noShield = { ...panel, controls: panel.controls.filter((id) => id !== "shield") };
    expect(stripBothHands("test", 1, { kind: "cannonCol", col: 4 }, noShield)).toBeNull();
  });

  it("leaves every other command alone", () => {
    expect(stripBothHands("test", 1, { kind: "guard" }, panel)).toBeNull();
  });

  it("the pair, stepped, moves both lobes to the column", () => {
    const world = createWorld(cfg, 1, []);
    const to = world.cannonCol === 0 ? 2 : 0;
    const both = stripBothHands("test", 1, { kind: "cannonCol", col: to }, panel);
    if (!both) throw new Error("no second hand");
    step(world, [
      { tick: world.tick, player: 1, command: { kind: "cannonCol", col: to } },
      { tick: world.tick, ...both },
    ]);
    expect(world.cannonCol).toBe(to);
    expect(world.shieldCol).toBe(to);
  });
});

describe("stageField", () => {
  it("the hull's lobes answer no mouse on the stage", () => {
    const world = createWorld(cfg, 1, []);
    const field = stageField(world, "test", panel, cfg, 1, null);
    expect(field.ship).toBe(false);
    const layout = computeLayout({ width: 390, height: 844, dpr: 1 }, cfg, "test");
    const cannon = cannonGrab(layout, world.cannonCol);
    const shield = shieldGrab(layout, world.shieldCol);
    expect(shipUnder(layout, cannon.x, cannon.y, field)).toBeNull();
    expect(shipUnder(layout, shield.x, shield.y, { ...field, seat: 2 })).toBeNull();
  });
});
