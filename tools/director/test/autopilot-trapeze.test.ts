import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, trapezeBoss, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE TRAPEZE to the end** (`hands/boss-hands-trapeze.ts`): each
 * catch tapped still by the step's freezer and caught by the other seat's
 * swipe, each recatch made, and the lit spindle shot in its colour — with no
 * flap, no flutter, no window run out and the hull never struck.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

function rig(world: World, mode: "both" | "p1" | "p2") {
  const l = computeLayout(VIEWPORT, world.cfg, "test");
  const field = (seat: 1 | 2) =>
    stageField(world, "test", controlSet("default"), world.cfg, seat, null);
  const auto = stageAutopilot({ layout: () => l, field });
  auto.setMode(mode);
  return auto;
}

describe("AUTO on THE TRAPEZE", () => {
  test("BOTH makes both catches and both recatches, and shoots the spindle out", () => {
    const world: World = bossWorld("trapeze");
    const auto = rig(world, "both");
    const catches: number[] = [];
    const catchers: number[] = [];
    const hits: number[] = [];
    let recatches = 0;
    let spindle = false;
    let out = false;
    const wrong: string[] = [];
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "trapezeCatch") {
          catches.push(e.catches);
          catchers.push(e.side);
        }
        if (e.type === "trapezeRecatch") recatches += 1;
        if (e.type === "trapezeSpindle") spindle = true;
        if (e.type === "trapezeHit") hits.push(e.hits);
        if (e.type === "trapezeOut") out = true;
        const off = ["trapezeFlap", "trapezeFlutter", "trapezeSway", "trapezeDim", "trapezeMiss"];
        if (off.includes(e.type)) wrong.push(e.type);
      }
    }
    expect(catches).toEqual([1, 2]);
    expect(catchers).toEqual([1, 0]);
    expect(spindle).toBe(true);
    expect(recatches).toBe(2);
    expect(hits).toEqual([1, 2, 3]);
    expect(out).toBe(true);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(trapezeBoss(world)).toBeNull();
  });

  test("P1 alone freezes its own catch, and no catch lands without the other seat", () => {
    const world: World = bossWorld("trapeze");
    const auto = rig(world, "p1");
    const freezes: number[] = [];
    let caught = 0;
    for (let i = 0; i < 6_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "trapezeFreeze") freezes.push(e.side);
        if (e.type === "trapezeCatch") caught += 1;
      }
    }
    expect(freezes.length).toBeGreaterThan(0);
    expect(freezes.every((side) => side === 0)).toBe(true);
    expect(caught).toBe(0);
  });
});
