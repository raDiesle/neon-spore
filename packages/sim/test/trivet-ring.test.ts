import { describe, expect, it } from "bun:test";
import type { World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { trivetStruck } from "../src/trivet-shot.js";
import {
  CFG,
  chord,
  lift,
  pad,
  runUntil,
  SCRIPT,
  shot,
  tick,
  toStep,
  trivet,
} from "./trivet-rig.js";

/**
 * THE TRIVET's ring (§30 row 11): the last shot in, the planted feet ring
 * under the spent hub while both seats send nothing, and a reflex chord jolts
 * a foot loose for a beat more.
 *
 * What these pin is the count a picture cannot show: how long it lasts left
 * alone, that it is a beat a jolt costs and not a pad, that a lift and the
 * wrong seat's pad cost nothing, and that a pad left down is capped.
 */

/** The last shot in and the feet starting to ring. */
function toRing(): World {
  const world = toStep(SCRIPT.length - 1);
  trivetStruck(world, shot("red"));
  runUntil(world, (w) => trivet(w).phase === "ring");
  return world;
}

/** Beats from the ring opening to the stand collapsing. */
function ringLength(world: World): number {
  const opened = trivet(world).phaseBeat;
  runUntil(world, (w) => trivet(w).phase === "collapse");
  return world.beat - opened;
}

describe("THE TRIVET's ring", () => {
  it("opens under THE SLOW once the last shot is in, the feet ringing", () => {
    const world = toRing();
    expect(world.events.some((e) => e.type === "trivetRing")).toBe(true);
    expect(slowing(world)).toBe(true);
    expect(world.slowAsks).toBe(true);
    expect(trivet(world).jolts).toBe(0);
  });

  it("left alone, dies out in its beats and lets THE SLOW go", () => {
    const world = toRing();
    expect(ringLength(world)).toBe(CFG.trivetRingBeats);
    expect(slowing(world)).toBe(false);
  });

  it("jolted by a pad on either foot, takes a beat longer", () => {
    for (const side of ["front", "rear"] as const) {
      const world = toRing();
      expect(pad(world, side, 0, true)).toContain("trivetJolt");
      pad(world, side, 0, false);
      expect(ringLength(world)).toBe(CFG.trivetRingBeats + 1);
    }
  });

  it("costs one beat for a whole chord on both feet in one beat, not one a pad", () => {
    const world = toRing();
    const beat = world.beat;
    const jolts = [] as string[];
    const watch = (types: string[]) => jolts.push(...types.filter((t) => t === "trivetJolt"));
    for (let id = 0; id < 3; id++) watch(pad(world, "front", id, true));
    watch(pad(world, "rear", 0, true));
    lift(world, "front");
    pad(world, "rear", 0, false);
    expect(world.beat).toBe(beat);
    expect(jolts.length).toBe(1);
    expect(trivet(world).jolts).toBe(1);
  });

  it("costs nothing for a lift or the wrong seat's pad", () => {
    const world = toRing();
    pad(world, "front", 0, false);
    pad(world, "front", 0, true, 2);
    pad(world, "rear", 1, true, 1);
    expect(trivet(world).jolts).toBe(0);
    expect(ringLength(world)).toBe(CFG.trivetRingBeats);
  });

  it("costs a beat for every beat a pad is left down, as many as it allows", () => {
    const world = toRing();
    pad(world, "rear", 0, true);
    expect(ringLength(world)).toBe(CFG.trivetRingBeats + CFG.trivetRingJolts);
    expect(trivet(world).jolts).toBe(CFG.trivetRingJolts);
  });

  it("counts a chord still down from the last shot from its first beat", () => {
    const world = toStep(SCRIPT.length - 1);
    chord(world, "front", 2);
    trivetStruck(world, shot("red"));
    const seen = runUntil(world, (w) => trivet(w).phase === "ring");
    tick(world);
    expect(seen.has("trivetJolt")).toBe(true);
    expect(trivet(world).jolts).toBe(1);
  });
});
