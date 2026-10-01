import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { lampreyBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE LAMPREY to the end** (`hands/boss-hands-lamprey.ts`): the
 * jaw pinned through both bites wherever it crawls, the lit tooth tapped each
 * time, and the gullet shot three times in its colour. No tooth snaps, the
 * jaw never chews, no gullet runs out into a lunge and the hull is never
 * struck.
 *
 * With both seats on it the teeth are out before the jaw has crawled once, so
 * following the crawl is the P1 case's: the pilot alone on the first bite,
 * nobody tapping, the jaw crawling on under a thumb that moves after it.
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

const WRONG = ["lampreySnap", "lampreyGnaw", "lampreyFull", "lampreyLunge"];

describe("AUTO on THE LAMPREY", () => {
  test("BOTH pins, pulls five teeth over two bites and shoots the gullet out", () => {
    const world: World = bossWorld("lamprey");
    const auto = rig(world, "both");
    const cracks: number[] = [];
    const hits: number[] = [];
    let out = false;
    const wrong: string[] = [];
    for (let i = 0; i < 40_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "lampreyCrack") cracks.push(e.side);
        if (e.type === "lampreyHit") hits.push(e.hits);
        if (e.type === "lampreyOut") out = true;
        if (WRONG.includes(e.type)) wrong.push(e.type);
      }
    }
    // The navigator taps the first bite and the pilot the second.
    expect(cracks).toEqual([1, 1, 1, 0, 0]);
    expect(hits).toEqual([1, 2, 3]);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(out).toBe(true);
    expect(lampreyBoss(world)).toBeNull();
  });

  test("P1 alone keeps the jaw pinned as it crawls, the teeth left to the person", () => {
    const world: World = bossWorld("lamprey");
    const auto = rig(world, "p1");
    const crawls: number[] = [];
    const chews: number[] = [];
    for (let i = 0; i < 6_000 && crawls.length < 3; i++) {
      const sent = auto.commands(world);
      for (const c of sent) expect(c.player).toBe(1);
      step(world, sent);
      for (const e of world.events) {
        if (e.type === "lampreyCrawl") crawls.push(e.col);
        if (e.type === "lampreyGnaw") chews.push(e.col);
      }
    }
    expect(crawls).toHaveLength(3);
    expect(chews).toEqual([]);
    expect(lampreyBoss(world)?.phase).toBe("bite");
  });
});
