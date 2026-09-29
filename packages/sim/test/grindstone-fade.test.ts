import { describe, expect, it } from "bun:test";
import { grindstoneStruck } from "../src/grindstone-shot.js";
import type { World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import {
  CFG,
  grindstone,
  liftFlat,
  pad,
  rub,
  runUntil,
  shot,
  tick,
  toStep,
} from "./grindstone-rig.js";

/**
 * THE GRINDSTONE's fade (§33 row 11): the last shot in, the spent axle grinds
 * faintly on while both hands are left off it, and a grind or a chord jars
 * the caliper loose for a beat more.
 *
 * What these pin is the count a picture cannot show: how long it lasts left
 * alone, that it is a beat a jar costs and not a touch, that a lift, a resting
 * thumb and the wrong seat's hand cost nothing, and that a pad left down is
 * capped.
 */

/** The last shot in and the axle's grind starting to die out. */
function toFade(): World {
  const world = toStep(8);
  grindstoneStruck(world, shot("red"));
  runUntil(world, (w) => grindstone(w).phase === "fade");
  return world;
}

/** Beats from the fade opening to the wheel spinning free. */
function fadeLength(world: World): number {
  const opened = grindstone(world).phaseBeat;
  runUntil(world, (w) => grindstone(w).phase === "free");
  return world.beat - opened;
}

describe("THE GRINDSTONE's fade", () => {
  it("opens under THE SLOW once the last shot is in, the spent axle grinding", () => {
    const world = toFade();
    expect(world.events.some((e) => e.type === "grindstoneFade")).toBe(true);
    expect(slowing(world)).toBe(true);
    expect(world.slowAsks).toBe(true);
    expect(grindstone(world).jars).toBe(0);
  });

  it("left alone, dies out in its beats and lets THE SLOW go", () => {
    const world = toFade();
    expect(fadeLength(world)).toBe(CFG.grindstoneFadeBeats);
    expect(slowing(world)).toBe(false);
  });

  it("jarred by a grind on either flat, takes a beat longer", () => {
    for (const side of [0, 1] as const) {
      const world = toFade();
      expect(rub(world, side, 1)).toContain("grindstoneJar");
      liftFlat(world, side);
      expect(fadeLength(world)).toBe(CFG.grindstoneFadeBeats + 1);
    }
  });

  it("jarred by a pad on either jaw, takes a beat longer", () => {
    for (const side of [0, 1] as const) {
      const world = toFade();
      expect(pad(world, side, 0, true)).toContain("grindstoneJar");
      pad(world, side, 0, false);
      expect(fadeLength(world)).toBe(CFG.grindstoneFadeBeats + 1);
    }
  });

  it("costs one beat for a whole rub and a chord in one beat, not one a touch", () => {
    const world = toFade();
    const beat = world.beat;
    let jars = 0;
    const count = (types: string[]) => types.filter((t) => t === "grindstoneJar").length;
    for (let n = 1; n <= 3; n++) jars += count(rub(world, 0, n));
    jars += count(rub(world, 1, 1));
    jars += count(pad(world, 0, 0, true));
    pad(world, 0, 0, false);
    liftFlat(world, 0);
    liftFlat(world, 1);
    expect(world.beat).toBe(beat);
    expect(jars).toBe(1);
    expect(grindstone(world).jars).toBe(1);
  });

  it("costs nothing for a lift, a thumb resting still, or the wrong seat's hand", () => {
    const world = toFade();
    liftFlat(world, 0);
    rub(world, 0, 0);
    rub(world, 1, 3, 1);
    pad(world, 0, 0, true, 2);
    expect(grindstone(world).jars).toBe(0);
    expect(fadeLength(world)).toBe(CFG.grindstoneFadeBeats);
  });

  it("costs a beat for every beat a pad is left down, as many as it allows", () => {
    const world = toFade();
    pad(world, 1, 0, true);
    expect(fadeLength(world)).toBe(CFG.grindstoneFadeBeats + CFG.grindstoneFadeJars);
    expect(grindstone(world).jars).toBe(CFG.grindstoneFadeJars);
  });

  it("counts a pad still down from the last shot from its first beat", () => {
    const world = toStep(8);
    grindstoneStruck(world, shot("red"));
    pad(world, 0, 0, true);
    const seen = runUntil(world, (w) => grindstone(w).phase === "fade");
    tick(world);
    expect(seen.has("grindstoneJar")).toBe(true);
    expect(grindstone(world).jars).toBe(1);
  });
});
