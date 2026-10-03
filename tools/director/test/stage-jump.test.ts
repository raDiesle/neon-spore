import { describe, expect, setDefaultTimeout, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Field } from "@neon-spore/render";
import { bossScript, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { stageJump } from "../src/stage-jump.js";

/**
 * THE JUMP TO A STEP (`stage-jump.ts`), on THE INSTAR's real script with the
 * real AUTO: it lands on the step asked for, a remembered step is replayed to
 * its tick and no further, and ◀ at the first and ▶ at the last do nothing.
 */

setDefaultTimeout(60_000);

function rig() {
  let world: World = bossWorld("instar");
  const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, world.cfg, "test");
  const field = (seat: 1 | 2): Field =>
    stageField(world, "test", controlSet("default"), world.cfg, seat, null);
  const auto = stageAutopilot({ layout: () => l, field });
  let running: boolean | null = null;
  const jump = stageJump({
    world: () => world,
    restage: () => {
      world = bossWorld("instar");
      auto.reset();
    },
    stepOnce: () => step(world, auto.commands(world)),
    autoBoth: auto.playBoth,
    land: (r) => {
      running = r;
    },
  });
  return { jump, auto, world: () => world, running: () => running };
}

const cursor = (w: World): number => bossScript(w)?.at ?? -1;

describe("the jump to a step", () => {
  test("goes to THE INSTAR's last step and back to its second, and plays on from there", () => {
    const r = rig();
    const of = bossScript(r.world())?.of ?? 0;
    expect(of).toBeGreaterThan(2);
    const last = r.jump.to(of - 1);
    expect(last?.reached).toBe(of - 1);
    expect(cursor(r.world())).toBe(of - 1);
    expect(r.running()).toBe(true);
    // AUTO goes back to what it was once the replay is done.
    expect(r.auto.mode()).toBe("off");
    const second = r.jump.to(1);
    expect(cursor(r.world())).toBe(1);
    expect(second?.reached).toBe(1);
  });

  test("replays a remembered step no further than the tick it was first reached on", () => {
    const r = rig();
    const of = bossScript(r.world())?.of ?? 0;
    r.jump.to(of - 1);
    const known = r.jump.remembered().get(3);
    expect(known).toBeDefined();
    const again = r.jump.to(3);
    expect(r.world().tick).toBe(known ?? -1);
    expect(again?.ticks).toBe(known ?? -1);
    expect(cursor(r.world())).toBe(3);
  });

  test("◀ at the first step and ▶ at the last do nothing", () => {
    const r = rig();
    expect(cursor(r.world())).toBe(0);
    expect(r.jump.back()).toBeNull();
    expect(r.world().tick).toBe(0);
    const of = bossScript(r.world())?.of ?? 0;
    r.jump.to(of - 1);
    const tick = r.world().tick;
    expect(r.jump.forward()).toBeNull();
    expect(r.world().tick).toBe(tick);
    expect(r.jump.back()?.reached).toBe(of - 2);
  });

  test("forgets every step on a restart", () => {
    const r = rig();
    r.jump.to(2);
    expect(r.jump.remembered().size).toBeGreaterThan(0);
    r.jump.forget();
    expect(r.jump.remembered().size).toBe(0);
  });
});
