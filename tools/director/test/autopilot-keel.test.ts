import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { keelBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE KEEL to the end** (`hands/boss-hands-keel.ts`): every
 * joint tapped by its own seat inside its window, the socket shut with one
 * shot of its colour, the tempo run answered, and the rock shot out — with the
 * hull never struck by the socket or the rock, and no joint missed.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe("AUTO on THE KEEL", () => {
  test("BOTH locks every joint, shuts the socket and shoots the rock", () => {
    const world: World = bossWorld("keel");
    const l = computeLayout(VIEWPORT, world.cfg, "test");
    const field = (seat: 1 | 2) =>
      stageField(world, "test", controlSet("default"), world.cfg, seat, null);
    const auto = stageAutopilot({ layout: () => l, field });
    auto.setMode("both");
    let shut = 0;
    let out = false;
    let missed = 0;
    let struck = 0;
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "keelShut") shut++;
        if (e.type === "keelRockOut") out = true;
        if (e.type === "keelMiss" || e.type === "keelSlip") missed++;
        if (e.type === "keelSocketHit" || e.type === "keelRockHit") struck++;
      }
    }
    expect(shut).toBe(1);
    expect(out).toBe(true);
    expect(missed).toBe(0);
    expect(struck).toBe(0);
    expect(keelBoss(world)).toBeNull();
  });
});
