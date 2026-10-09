import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { lampreyBoss, lampreyTailHeld, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE LAMPREY to the end** (`hands/boss-hands-lamprey.ts`): the
 * tail held every stay, the head pulled off in a pull, both ends pulled at
 * once in an apart, the lit tooth tapped its taps in a teeth, the gullet shot
 * in its colour and both pieces of dung turned on the shield, while the eel
 * eats its meal and the food of both crawls. No tooth snaps, no head slips,
 * no stay runs out and the hull is never struck.
 *
 * The P1 case is the holder's thumb alone: the pilot on the tail in the
 * first stay, nobody on the head.
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

const WRONG = ["lampreySnap", "lampreySlip", "lampreyFull"];

describe.each(CHARGES)("AUTO on THE LAMPREY, %s", (_charge, cfg) => {
  test("BOTH answers every stay, pulls the teeth and shoots the gullet out", () => {
    const world: World = bossWorld("lamprey", cfg);
    const auto = rig(world, "both");
    const cracks: number[] = [];
    const hits: number[] = [];
    let loose = 0;
    let eaten = 0;
    let dung = 0;
    let out = false;
    const wrong: string[] = [];
    for (let i = 0; i < 40_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "lampreyCrack") cracks.push(e.side);
        if (e.type === "lampreyHit") hits.push(e.hits);
        if (e.type === "lampreyLoose") loose += 1;
        if (e.type === "lampreyEat") eaten += 1;
        if (e.type === "lampreyDung") dung += 1;
        if (e.type === "breach") wrong.push(e.type);
        if (e.type === "lampreyOut") out = true;
        if (WRONG.includes(e.type)) wrong.push(e.type);
      }
    }
    // The seats take the teeth in turn: the pilot first, then the navigator.
    expect(cracks).toEqual([0, 1, 0, 1]);
    expect(loose).toBe(9);
    expect(hits).toEqual([1, 2, 3]);
    // The meal of four and the food of both crawls; the dung turned, not eaten.
    expect([eaten, dung]).toEqual([6, 2]);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(out).toBe(true);
    expect(lampreyBoss(world)).toBeNull();
  });

  test("P1 alone holds the tail through the first stay, the head left to the person", () => {
    const world: World = bossWorld("lamprey", cfg);
    const auto = rig(world, "p1");
    let held = 0;
    for (let i = 0; i < 6_000 && held < 60; i++) {
      const sent = auto.commands(world);
      for (const c of sent) expect(c.player).toBe(1);
      step(world, sent);
      const s = lampreyBoss(world);
      if (s?.phase === "bite" && lampreyTailHeld(s)) held += 1;
    }
    expect(held).toBe(60);
    expect(lampreyBoss(world)?.cursor).toBe(0);
  });
});
