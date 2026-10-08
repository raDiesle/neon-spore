import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO survives THE UNDERTOW** (`hands/boss-hands-takes.ts`): every lobe
 * answered by its colour and a tall one tapped down, and the wave's own
 * bodies answered all the while. Until 8 October 2026 nothing played the
 * six slimes the wave sends under the lobes, and each reached the hull.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe.each(CHARGES)("AUTO on THE UNDERTOW, %s", (_charge, cfg) => {
  test("BOTH answers every lobe and every body of the wave to the ebb", () => {
    const world: World = bossWorld("undertow", cfg);
    const l = computeLayout(VIEWPORT, world.cfg, "test");
    const field = (seat: 1 | 2) =>
      stageField(world, "test", controlSet("default"), world.cfg, seat, null);
    const auto = stageAutopilot({ layout: () => l, field });
    auto.setMode("both");
    const heard = new Map<string, number>();
    for (let i = 0; i < 30_000 && world.balance.wavesCleared === 0; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) heard.set(e.type, (heard.get(e.type) ?? 0) + 1);
    }
    expect(heard.get("undertowEbb")).toBe(3);
    expect(world.boss).toBeNull();
    expect(world.balance.wavesCleared).toBe(1);
    expect(heard.get("breach")).toBeUndefined();
    expect(world.scars).toEqual([]);
  });
});
