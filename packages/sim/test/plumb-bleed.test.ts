import { describe, expect, it } from "bun:test";
import type { World } from "../src/index.js";
import { plumbStruck } from "../src/plumb-shot.js";
import { slowing } from "../src/slow.js";
import { CFG, plumb, pull, runUntil, shot, tick, toStep } from "./plumb-rig.js";

/**
 * THE PLUMB's bleed (§31 row 11): the last shot in, the spent core's light
 * runs down the chains while both stones are left alone, and a pull draws it
 * back up for a beat more.
 *
 * What these pin is the count a picture cannot show: how long it lasts left
 * alone, that it is a beat a pull costs and not a pull, that a lift and the
 * wrong seat's pull cost nothing, and that a thumb left on is capped.
 */

/** The last shot in and the light starting down the chains. */
function toBleed(): World {
  const world = toStep(8);
  plumbStruck(world, shot("red"));
  runUntil(world, (w) => plumb(w).phase === "bleed");
  return world;
}

/** Beats from the bleed opening to the bob swinging free. */
function bleedLength(world: World): number {
  const opened = plumb(world).phaseBeat;
  runUntil(world, (w) => plumb(w).phase === "free");
  return world.beat - opened;
}

describe("THE PLUMB's bleed", () => {
  it("opens under THE SLOW once the last shot is in, the light starting down the chains", () => {
    const world = toBleed();
    expect(world.events.some((e) => e.type === "plumbBleed")).toBe(true);
    expect(slowing(world)).toBe(true);
    expect(world.slowAsks).toBe(true);
    expect(world.slowHolds).toBe(true);
    expect(plumb(world).flares).toBe(0);
  });

  it("left alone, bleeds off in its beats and lets THE SLOW go", () => {
    const world = toBleed();
    expect(bleedLength(world)).toBe(CFG.plumbBleedBeats);
    expect(slowing(world)).toBe(false);
  });

  it("drawn back up by a pull on either stone, takes a beat longer", () => {
    for (const side of ["left", "right"] as const) {
      const world = toBleed();
      const types = pull(world, side, 700);
      expect(types).toContain("plumbFlare");
      pull(world, side, 0, false);
      expect(bleedLength(world)).toBe(CFG.plumbBleedBeats + 1);
    }
  });

  it("costs one beat for a whole beat of dragging, not one a pull", () => {
    const world = toBleed();
    const beat = world.beat;
    let flares = 0;
    for (const at of [300, 600, 900, 1200, 1500]) {
      flares += pull(world, "left", at).filter((t) => t === "plumbFlare").length;
    }
    pull(world, "left", 0, false);
    expect(world.beat).toBe(beat);
    expect(flares).toBe(1);
    expect(plumb(world).flares).toBe(1);
  });

  it("costs nothing for a lift, or for the wrong seat's pull", () => {
    const world = toBleed();
    pull(world, "left", 0, false);
    pull(world, "right", 900, true, 1);
    pull(world, "left", 900, true, 2);
    expect(plumb(world).flares).toBe(0);
    expect(bleedLength(world)).toBe(CFG.plumbBleedBeats);
  });

  it("costs a beat for every beat a stone is left pulled, as many as it allows", () => {
    const world = toBleed();
    pull(world, "right", -800);
    expect(bleedLength(world)).toBe(CFG.plumbBleedBeats + CFG.plumbBleedFlares);
    expect(plumb(world).flares).toBe(CFG.plumbBleedFlares);
  });

  it("counts a stone still pulled from the last shot from its first beat", () => {
    const world = toStep(8);
    plumbStruck(world, shot("red"));
    pull(world, "left", 500);
    const seen = runUntil(world, (w) => plumb(w).phase === "bleed");
    tick(world);
    expect(seen.has("plumbFlare")).toBe(true);
    expect(plumb(world).flares).toBe(1);
  });
});
