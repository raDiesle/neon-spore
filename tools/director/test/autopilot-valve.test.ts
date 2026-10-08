import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, valveBoss, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE VALVE to the end** (`hands/boss-hands-valve.ts`): the wheel
 * turned onto each mark, the third the long way round, the pin tapped to
 * freeze it and drawn, the jet capped, the spark shot, the shudder braced, the
 * film wiped and the seal held — with no window run out, no slip, and the
 * hull never struck.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

const WRONG = [
  "valveSlip",
  "valveLapse",
  "valveThaw",
  "valveBlow",
  "valveShake",
  "valveSmear",
  "valveRough",
  "valveSparkHit",
];

function rig(world: World, mode: "both" | "p1") {
  const l = computeLayout(VIEWPORT, world.cfg, "test");
  const field = (seat: 1 | 2) =>
    stageField(world, "test", controlSet("default"), world.cfg, seat, null);
  const auto = stageAutopilot({ layout: () => l, field });
  auto.setMode(mode);
  return auto;
}

describe.each(CHARGES)("AUTO on THE VALVE, %s", (_charge, cfg) => {
  test("BOTH draws all three pins and plays the story between them clean", () => {
    const world: World = bossWorld("valve", cfg);
    const auto = rig(world, "both");
    const seen: string[] = [];
    const pins: number[] = [];
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "valvePull") pins.push(e.pins);
        if (e.type.startsWith("valve")) seen.push(e.type);
      }
    }
    expect(pins).toEqual([2, 1, 0]);
    for (const type of ["valveCap", "valveSparkOut", "valveBrace", "valveDry", "valveSeal"]) {
      expect(seen).toContain(type);
    }
    expect(seen.filter((t) => t === "valveHold")).toHaveLength(3);
    expect(seen.filter((t) => t === "valveFreeze")).toHaveLength(3);
    expect(seen.filter((t) => WRONG.includes(t))).toEqual([]);
    expect(seen.at(-1)).toBe("valveOut");
    expect(world.scars).toEqual([]);
    expect(valveBoss(world)).toBeNull();
  });

  test("P1 alone brings the wheel onto its mark and never freezes it", () => {
    const world: World = bossWorld("valve", cfg);
    const auto = rig(world, "p1");
    const seen: string[] = [];
    for (let i = 0; i < 2_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) seen.push(e.type);
      const s = valveBoss(world);
      if (s !== null) expect(s.held[1]).toBe(false);
    }
    expect(seen).toContain("valveHold");
    expect(seen).not.toContain("valveFreeze");
  });
});
