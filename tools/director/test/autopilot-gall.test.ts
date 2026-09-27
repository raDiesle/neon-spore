import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { gallBoss, gallSeatAt, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE GALL to the end** (`hands/boss-hands-gall.ts`): each close
 * pinched shut by the seat whose half the gall sits on, the gall found and
 * pinched again wherever it jumps, and the bared root shot in its colour —
 * with no window run out, no pinch let slip and the hull never struck.
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

describe("AUTO on THE GALL", () => {
  test("BOTH closes it three times wherever it jumps, and shoots the root out", () => {
    const world: World = bossWorld("gall");
    const auto = rig(world, "both");
    const closes: number[] = [];
    const hits: number[] = [];
    let bare = false;
    let out = false;
    const wrong: string[] = [];
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "gallClose") closes.push(e.closes);
        if (e.type === "gallBare") bare = true;
        if (e.type === "gallHit") hits.push(e.hits);
        if (e.type === "gallOut") out = true;
        if (["gallSwell", "gallSlip", "gallMiss"].includes(e.type)) wrong.push(e.type);
      }
    }
    expect(closes).toEqual([1, 2, 3]);
    expect(bare).toBe(true);
    expect(hits).toEqual([1]);
    expect(out).toBe(true);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(gallBoss(world)).toBeNull();
  });

  test("P1 alone closes the gall on its own half, and never one on the other", () => {
    const world: World = bossWorld("gall");
    const auto = rig(world, "p1");
    const from: number[] = [];
    for (let i = 0; i < 6_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) if (e.type === "gallClose") from.push(e.from);
    }
    expect(from.length).toBeGreaterThan(0);
    expect(from.every((p) => gallSeatAt(p) === 1)).toBe(true);
  });
});
