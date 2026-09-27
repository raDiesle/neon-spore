import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { flueBoss, flueResters, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE FLUE to the end** (`hands/boss-hands-flue.ts`): each vent
 * spent with the rester's phone silent and three taps on the stopped ember,
 * both dampers held with nothing sent, every bared core shot in its colour —
 * with no tap skidded or lapsed, no rester stirred, no step run out and the
 * hull never struck.
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

const WRONG = ["flueSkid", "flueLapse", "flueStir", "flueChoke", "flueShut", "flueMiss"];

describe("AUTO on THE FLUE", () => {
  test("BOTH spends both vents, holds both dampers and shoots the core out", () => {
    const world: World = bossWorld("flue");
    const auto = rig(world, "both");
    const ticks: number[] = [];
    const vents: number[] = [];
    const hits: number[] = [];
    let bared = false;
    let held = 0;
    let out = false;
    const wrong: string[] = [];
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      const s = flueBoss(world);
      const quiet = s === null ? [] : flueResters(s);
      const sent = auto.commands(world);
      for (const c of sent) expect(quiet).not.toContain(c.player);
      step(world, sent);
      for (const e of world.events) {
        if (e.type === "flueTick") ticks.push(e.taps);
        if (e.type === "flueVent") vents.push(e.vents);
        if (e.type === "flueBare") bared = true;
        if (e.type === "flueHeld") held++;
        if (e.type === "flueHit") hits.push(e.hits);
        if (e.type === "flueOut") out = true;
        if (WRONG.includes(e.type)) wrong.push(e.type);
      }
    }
    expect(ticks).toEqual([1, 2, 3, 1, 2, 3]);
    expect(vents).toEqual([1, 2]);
    expect(bared).toBe(true);
    expect(held).toBe(2);
    expect(hits).toEqual([1, 2, 3]);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(out).toBe(true);
    expect(flueBoss(world)).toBeNull();
  });

  test("P1 alone spends the first vent, the silent navigator's rest stopping the ember", () => {
    const world: World = bossWorld("flue");
    const auto = rig(world, "p1");
    const vents: number[] = [];
    for (let i = 0; i < 4_000 && vents.length === 0; i++) {
      const sent = auto.commands(world);
      for (const c of sent) expect(c.player).toBe(1);
      step(world, sent);
      for (const e of world.events) if (e.type === "flueVent") vents.push(e.vents);
    }
    expect(vents).toEqual([1]);
  });
});
