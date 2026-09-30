import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { rimeBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE RIME to the end** (`hands/boss-hands-rime.ts`): each lit
 * half wiped clear by its own seat, both through each whiteout, every surge
 * and icicle turned, the bared core shot in its colour, and both hands kept
 * off the refreeze — with no wipe run out, no surge let through, nothing
 * missed, the refreeze never scattered, and the hull never struck.
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

describe("AUTO on THE RIME", () => {
  test("BOTH wipes both halves, turns every surge and icicle and shatters the lens", () => {
    const world: World = bossWorld("rime");
    const auto = rig(world, "both");
    let shatter = false;
    let wrong = 0;
    const clears: string[] = [];
    const hits: number[] = [];
    let blocks = 0;
    let refreezes = 0;
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "rimeShatter") shatter = true;
        if (e.type === "rimeClear") clears.push(`${e.side}:${e.wipes}`);
        if (e.type === "rimeHit") hits.push(e.hits);
        if (e.type === "rimeBlock") blocks++;
        if (e.type === "rimeRefreeze") refreezes++;
        if (["rimeFrost", "rimeCloud", "rimeMiss", "rimeScatter"].includes(e.type)) wrong++;
      }
    }
    expect(shatter).toBe(true);
    expect(clears).toEqual(["0:1", "0:2", "1:1", "1:2"]);
    expect(blocks).toBe(3);
    expect(hits).toEqual([1, 2, 3]);
    expect(refreezes).toBe(1);
    expect(wrong).toBe(0);
    expect(world.scars).toEqual([]);
    expect(rimeBoss(world)).toBeNull();
  });

  test("P1 alone wipes the left half and never touches the right", () => {
    const world: World = bossWorld("rime");
    const auto = rig(world, "p1");
    const clears: string[] = [];
    for (let i = 0; i < 4_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) if (e.type === "rimeClear") clears.push(`${e.side}:${e.wipes}`);
      if (world.boss?.kind === "rime") expect(world.boss.rubs[1]).toBe(0);
    }
    expect(clears).toEqual(["0:1", "0:2"]);
  });
});
