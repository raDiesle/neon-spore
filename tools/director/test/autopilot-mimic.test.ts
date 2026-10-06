import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { mimicBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE MIMIC to the end** (`hands/boss-hands-mimic.ts`): every
 * sign drawn by the seat that owes it, the changing ones only once they have
 * changed, both halves of each split, and the core shot twice in its colour.
 * Nothing is mimicked, no window runs out, no arm reaches and the hull is
 * never struck.
 *
 * With one seat on AUTO only that seat's half is drawn: the pilot draws
 * nothing while the pilot reads, so the first sign runs out and an arm reaches
 * — the other half is the person's.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

function rig(world: World, mode: "both" | "p1") {
  const l = computeLayout(VIEWPORT, world.cfg, "test");
  const field = (seat: 1 | 2) =>
    stageField(world, "test", controlSet("default"), world.cfg, seat, null);
  const auto = stageAutopilot({ layout: () => l, field });
  auto.setMode(mode);
  return auto;
}

const WRONG = ["mimicWrong", "mimicLapse", "mimicReach", "mimicClose", "breach"];

describe("AUTO on THE MIMIC", () => {
  test("BOTH draws every sign, splits and all, and shoots the core out", () => {
    const world: World = bossWorld("mimic");
    const auto = rig(world, "both");
    const peels: (0 | 1)[] = [];
    const hits: number[] = [];
    let changes = 0;
    let out = false;
    const wrong: string[] = [];
    for (let i = 0; i < 40_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "mimicPeel") peels.push(e.side);
        if (e.type === "mimicHit") hits.push(e.hits);
        if (e.type === "mimicChange") changes += 1;
        if (e.type === "mimicOut") out = true;
        if (WRONG.includes(e.type)) wrong.push(e.type);
      }
    }
    // The navigator draws the first three, the pilot the next three, one
    // each, then both twice.
    expect(peels.slice(0, 8)).toEqual([1, 1, 1, 0, 0, 0, 1, 0]);
    expect(peels).toHaveLength(12);
    expect(changes).toBe(2);
    expect(hits).toEqual([1, 2]);
    expect(wrong).toEqual([]);
    expect(out).toBe(true);
  });

  test("P1 alone draws nothing while it reads, so the first sign runs out", () => {
    const world: World = bossWorld("mimic");
    const auto = rig(world, "p1");
    const seen: string[] = [];
    for (let i = 0; i < 6_000 && !seen.includes("mimicReach"); i++) {
      const sent = auto.commands(world);
      for (const c of sent) expect(c.player).toBe(1);
      step(world, sent);
      for (const e of world.events) seen.push(e.type);
    }
    expect(seen).toContain("mimicLapse");
    expect(seen).toContain("mimicReach");
    expect(seen).not.toContain("mimicPeel");
    expect(mimicBoss(world)?.reaches).toBe(1);
  });
});
