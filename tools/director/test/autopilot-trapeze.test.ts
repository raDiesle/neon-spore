import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, trapezeBoss, trapezeLitStep, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

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

describe.each(CHARGES)("AUTO on THE TRAPEZE, %s", (_charge, cfg) => {
  test("BOTH kicks every gong, and the swing goes over the top", () => {
    const world: World = bossWorld("trapeze", cfg);
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

  test("most shots from below hit", () => {
    // At the game's half-beat charge a press leaves on the charge's grid and
    // not on its own tick, and a hand that led by the climb alone fired ten
    // times for one hit there (8 October 2026) — while the case above, at
    // nought, never saw it (`charges.ts`).
    const world: World = bossWorld("trapeze", cfg);
    const auto = rig(world, "both");
    let fired = 0;
    let hit = 0;
    let gongs = 0;
    for (let i = 0; i < 40_000 && world.boss !== null; i++) {
      const s = trapezeBoss(world);
      const shooting = s !== null && trapezeLitStep(s)?.ask === "shoot";
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "trapezeGong") gongs += 1;
        if (!shooting) continue;
        if (e.type === "fire") fired += 1;
        if (e.type === "trapezeShot" && e.gain) hit += 1;
      }
    }
    expect(fired).toBeGreaterThan(0);
    expect(hit * 2).toBeGreaterThan(fired);
    expect(gongs).toBe(4);
  });

  test("P1 alone swipes only its own side, never the partner's", () => {
    const world: World = bossWorld("trapeze", cfg);
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
