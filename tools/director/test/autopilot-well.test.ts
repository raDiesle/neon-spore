import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE WELL's wave to the end** (`hands/boss-hands-well.ts`):
 * the seam held while the face slips and turned home once it stops, and the
 * wave's own bodies answered all the while — the face turns the field without
 * taking anything off it. THE WELL never leaves on its own; the wave ends
 * when its script is spent and its field is empty (`sim/well.ts`), so that is
 * what is waited for. Until 8 October 2026 the hand held the seam and nothing
 * else, and every body of the wave reached the hull.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe.each(CHARGES)("AUTO on THE WELL, %s", (_charge, cfg) => {
  test("BOTH holds the face, winds it home and clears the wave under it", () => {
    const world: World = bossWorld("well", cfg);
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
    expect(heard.get("wellHome")).toBe(2);
    expect(world.balance.wavesCleared).toBe(1);
    expect(heard.get("breach")).toBeUndefined();
    expect(world.scars).toEqual([]);
  });
});
