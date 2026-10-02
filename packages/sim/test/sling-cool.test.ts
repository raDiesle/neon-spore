import { describe, expect, it } from "bun:test";
import type { World } from "../src/index.js";
import { slingStruck } from "../src/sling-shot.js";
import { slowing } from "../src/slow.js";
import { CFG, hold, lift, runUntil, shot, sling, tick, toStep } from "./sling-rig.js";

/**
 * THE SLING's cool (§32 row 11): the last shot in, the spent yoke ticks as it
 * cools while both draws are left alone, and a draw snaps the catch loose for
 * a beat more.
 *
 * What these pin is the count a picture cannot show: how long it lasts left
 * alone, that it is a beat a draw costs and not a draw, that a lift and the
 * wrong seat's finger cost nothing, and that a finger left down is capped.
 */

/** The last shot in and the yoke starting to cool. */
function toCool(): World {
  const world = toStep(8);
  slingStruck(world, shot("red"));
  runUntil(world, (w) => sling(w).phase === "cool");
  return world;
}

/** Beats from the cool opening to the fork snapping free. */
function coolLength(world: World): number {
  const opened = sling(world).phaseBeat;
  runUntil(world, (w) => sling(w).phase === "free");
  return world.beat - opened;
}

describe("THE SLING's cool", () => {
  it("opens under THE SLOW once the last shot is in, the spent yoke ticking", () => {
    const world = toCool();
    expect(world.events.some((e) => e.type === "slingCool")).toBe(true);
    expect(slowing(world)).toBe(true);
    expect(world.slowAsks).toBe(true);
    expect(world.slowHolds).toBe(true);
    expect(sling(world).snaps).toBe(0);
  });

  it("left alone, cools in its beats and lets THE SLOW go", () => {
    const world = toCool();
    expect(coolLength(world)).toBe(CFG.slingCoolBeats);
    expect(slowing(world)).toBe(false);
  });

  it("snapped loose by a draw on either arm, takes a beat longer", () => {
    for (const side of [0, 1] as const) {
      const world = toCool();
      expect(hold(world, side)).toContain("slingSnap");
      lift(world, side, 0);
      expect(coolLength(world)).toBe(CFG.slingCoolBeats + 1);
    }
  });

  it("costs one beat for both draws in one beat, not one a draw", () => {
    const world = toCool();
    const beat = world.beat;
    let snaps = 0;
    for (const side of [0, 1] as const) {
      snaps += hold(world, side).filter((t) => t === "slingSnap").length;
      lift(world, side, -600);
    }
    snaps += hold(world, 0).filter((t) => t === "slingSnap").length;
    lift(world, 0, 600);
    expect(world.beat).toBe(beat);
    expect(snaps).toBe(1);
    expect(sling(world).snaps).toBe(1);
  });

  it("costs nothing for a lift, or for the wrong seat's finger", () => {
    const world = toCool();
    lift(world, 0, -600);
    hold(world, 1, 1);
    hold(world, 0, 2);
    expect(sling(world).snaps).toBe(0);
    expect(coolLength(world)).toBe(CFG.slingCoolBeats);
  });

  it("costs a beat for every beat a finger is left down, as many as it allows", () => {
    const world = toCool();
    hold(world, 1);
    expect(coolLength(world)).toBe(CFG.slingCoolBeats + CFG.slingCoolSnaps);
    expect(sling(world).snaps).toBe(CFG.slingCoolSnaps);
  });

  it("counts a finger still down from the last shot from its first beat", () => {
    const world = toStep(8);
    slingStruck(world, shot("red"));
    hold(world, 0);
    const seen = runUntil(world, (w) => sling(w).phase === "cool");
    tick(world);
    expect(seen.has("slingSnap")).toBe(true);
    expect(sling(world).snaps).toBe(1);
  });
});
