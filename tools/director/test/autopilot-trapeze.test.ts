import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, trapezeBoss, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE TRAPEZE to the end** (`hands/boss-hands-trapeze.ts`): each
 * side swiped by the seat it belongs to as the swing comes back, shots from
 * below while it comes back, and the lock with shots from the side — every
 * gong kicked, with no brake, no swipe that did nothing, no level run out and
 * the hull never struck.
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
  test("BOTH kicks every gong, and the swing goes over the top", () => {
    const world: World = bossWorld("trapeze");
    const auto = rig(world, "both");
    const gongs: number[] = [];
    const pushers = new Set<number>();
    let shots = 0;
    let locks = 0;
    let out = false;
    const wrong: string[] = [];
    for (let i = 0; i < 40_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "trapezeGong") gongs.push(e.gongs);
        if (e.type === "trapezePush") pushers.add(e.seat);
        if (e.type === "trapezeShot" && e.gain) shots += 1;
        if (e.type === "trapezeLock") locks += 1;
        if (e.type === "trapezeOut") out = true;
        if (["trapezeBrake", "trapezeWhiff", "trapezeMiss"].includes(e.type)) wrong.push(e.type);
        if (e.type === "trapezeShot" && !e.gain) wrong.push("slowing shot");
      }
    }
    expect(gongs).toEqual([1, 2, 3, 4]);
    expect([...pushers].sort()).toEqual([0, 1]);
    expect(shots).toBeGreaterThan(0);
    expect(locks).toBeGreaterThan(0);
    expect(out).toBe(true);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(trapezeBoss(world)).toBeNull();
  });

  test("P1 alone swipes only its own side, never the partner's", () => {
    const world: World = bossWorld("trapeze");
    const auto = rig(world, "p1");
    const zones: number[] = [];
    for (let i = 0; i < 2_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "trapezePush") zones.push(e.zone);
      }
    }
    expect(zones.length).toBeGreaterThan(0);
    expect(zones.every((zone) => zone === -1)).toBe(true);
  });
});
