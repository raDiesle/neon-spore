import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { slingBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE SLING to the end** (`hands/boss-hands-sling.ts`): each
 * arm drawn home twice and loosed toward the lit side, the yoke lit, both
 * redraws held together and every shot at the yoke in its colour, then both
 * arms left alone while the spent yoke cools (§32 row 11) — with no arm
 * sprung slack or run out, no yoke let go, no shot run out, no catch snapped
 * loose and the hull never struck.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

const WRONG = ["slingSlack", "slingSpring", "slingDim", "slingMiss", "slingSnap"];

describe.each(CHARGES)("AUTO on THE SLING, %s", (_charge, cfg) => {
  test("BOTH looses all four draws, lights the yoke, redraws it and shoots it out", () => {
    const world: World = bossWorld("sling", cfg);
    const l = computeLayout(VIEWPORT, world.cfg, "test");
    const field = (seat: 1 | 2) =>
      stageField(world, "test", controlSet("default"), world.cfg, seat, null);
    const auto = stageAutopilot({ layout: () => l, field });
    auto.setMode("both");
    const loosed: string[] = [];
    const hits: number[] = [];
    const wrong: string[] = [];
    let yoke = 0;
    let steady = 0;
    let cool = 0;
    let out = false;
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "slingLoose") loosed.push(`${e.side}:${e.draws}`);
        if (e.type === "slingYoke") yoke++;
        if (e.type === "slingSteady") steady++;
        if (e.type === "slingHit") hits.push(e.hits);
        if (e.type === "slingCool") cool++;
        if (e.type === "slingOut") out = true;
        if (WRONG.includes(e.type)) wrong.push(e.type);
      }
    }
    expect(loosed.slice(0, 4)).toEqual(["0:1", "0:2", "1:1", "1:2"]);
    expect(yoke).toBe(1);
    expect(steady).toBe(2);
    expect(hits).toEqual([1, 2, 3]);
    expect(cool).toBe(1);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(out).toBe(true);
    expect(slingBoss(world)).toBeNull();
  });
});
