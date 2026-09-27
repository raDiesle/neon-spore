import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { capstanBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE CAPSTAN to the end** (`hands/boss-hands-capstan.ts`): each
 * band rubbed bright under the other seat's lean, both holds made, every
 * bared core shot in its colour — with no window stalled, no core covered and
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

describe("AUTO on THE CAPSTAN", () => {
  test("BOTH brightens both bands, makes both holds and shoots the core out", () => {
    const world: World = bossWorld("capstan");
    const auto = rig(world, "both");
    const bright: number[] = [];
    const hits: number[] = [];
    let bare = false;
    let kept = 0;
    const wrong: string[] = [];
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "capstanBright") bright.push(e.side);
        if (e.type === "capstanBare") bare = true;
        if (e.type === "capstanHit") hits.push(e.hits);
        if (e.type === "capstanKept") kept++;
        if (["capstanStall", "capstanCover", "capstanMiss"].includes(e.type)) wrong.push(e.type);
      }
    }
    expect(bright).toEqual([0, 1]);
    expect(bare).toBe(true);
    expect(kept).toBe(2);
    expect(hits).toEqual([1, 2, 3]);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(capstanBoss(world)).toBeNull();
  });

  test("P1 alone leans the left band over, and wears nothing of it", () => {
    const world: World = bossWorld("capstan");
    const auto = rig(world, "p1");
    let rocked = false;
    for (let i = 0; i < 4_000; i++) {
      step(world, auto.commands(world));
      if (world.events.some((e) => e.type === "capstanRock" && e.side === 0)) rocked = true;
    }
    expect(rocked).toBe(true);
    expect(capstanBoss(world)?.wear).toEqual([0, 0]);
  });
});
