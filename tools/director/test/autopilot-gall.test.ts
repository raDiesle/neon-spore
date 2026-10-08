import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { gallBoss, gallSeatAt, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE GALL to the end** (`hands/boss-hands-gall.ts`): each leap
 * tapped and pulled by the seat whose half the alien sits on, the alien found
 * again wherever it lands, and each fire step shot in its colour — with no
 * window run out, no hand refused and the hull never struck.
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

describe.each(CHARGES)("AUTO on THE GALL, %s", (_charge, cfg) => {
  test("BOTH throws it across every leap and shoots it on every fire step", () => {
    const world: World = bossWorld("gall", cfg);
    const auto = rig(world, "both");
    const leaps: number[] = [];
    const hits: number[] = [];
    let out = false;
    const wrong: string[] = [];
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "gallLeap") leaps.push(e.leaps);
        if (e.type === "gallHit") hits.push(e.hits);
        if (e.type === "gallOut") out = true;
        if (e.type === "gallWhiff" || e.type === "gallMiss") wrong.push(e.type);
      }
    }
    expect(leaps).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(hits).toEqual([1, 2, 3]);
    expect(out).toBe(true);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(gallBoss(world)).toBeNull();
  });

  test("P1 alone throws the alien off its own half, and never off the other", () => {
    const world: World = bossWorld("gall", cfg);
    const auto = rig(world, "p1");
    const from: number[] = [];
    for (let i = 0; i < 6_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) if (e.type === "gallLeap") from.push(e.from);
    }
    expect(from.length).toBeGreaterThan(0);
    expect(from.every((p) => gallSeatAt(p) === 1)).toBe(true);
  });
});
