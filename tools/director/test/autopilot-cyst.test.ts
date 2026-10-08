import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { cystBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE CYST to the end** (`hands/boss-hands-cyst.ts`): each flank
 * tapped still by the partner and pinched shut by its own seat, both swells
 * clenched, the spore turned, the bud burst, both guards made and every bared
 * core shot in its colour — with no flank left shuddering, no pinch slipped
 * or sprung, no guard sealed, no step run out and the hull never struck.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

const WRONG = ["cystShudder", "cystSlip", "cystSpring", "cystSeal", "cystMiss"];

describe.each(CHARGES)("AUTO on THE CYST, %s", (_charge, cfg) => {
  test("BOTH cracks both flanks, answers the story steps and shoots the core out", () => {
    const world: World = bossWorld("cyst", cfg);
    const l = computeLayout(VIEWPORT, world.cfg, "test");
    const field = (seat: 1 | 2) =>
      stageField(world, "test", controlSet("default"), world.cfg, seat, null);
    const auto = stageAutopilot({ layout: () => l, field });
    auto.setMode("both");
    const cracks: number[] = [];
    const guards: number[] = [];
    const hits: number[] = [];
    const answered: string[] = [];
    const wrong: string[] = [];
    let out = false;
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "cystCrack") cracks.push(e.side);
        if (e.type === "cystGuard") guards.push(e.side);
        if (e.type === "cystHit") hits.push(e.hits);
        if (e.type === "cystClench" || e.type === "cystTurn" || e.type === "cystPop")
          answered.push(e.type);
        if (e.type === "cystOut") out = true;
        if (WRONG.includes(e.type)) wrong.push(e.type);
      }
    }
    expect(cracks).toEqual([0, 1]);
    expect(guards).toEqual([0, 1]);
    expect(hits).toEqual([1, 2, 3]);
    expect(answered).toEqual(["cystClench", "cystTurn", "cystPop", "cystClench"]);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(out).toBe(true);
    expect(cystBoss(world)).toBeNull();
  });
});
