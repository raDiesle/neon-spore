import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO takes THE CAIRN apart** (`hands/boss-hands-takes.ts`): the pilot's
 * hand carried a column further each time, so every rock comes out at an
 * edge before the pile can shed it, and the shield under each one as it
 * falls. Until 8 October 2026 the hand reported one column's carry for ever
 * and pulled once; nothing answered the rocks; and the empty pile stayed the
 * boss and held its wave open, so it could not be passed at all
 * (`sim/cairn.ts`).
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe.each(CHARGES)("AUTO on THE CAIRN, %s", (_charge, cfg) => {
  test("BOTH pulls all seven rocks and shields every one", () => {
    const world: World = bossWorld("cairn", cfg);
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
    expect(heard.get("cairnPulled")).toBe(7);
    expect(world.boss).toBeNull();
    expect(world.balance.wavesCleared).toBe(1);
    expect(heard.get("breach")).toBeUndefined();
    expect(world.scars).toEqual([]);
  });
});
