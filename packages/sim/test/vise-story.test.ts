import { describe, expect, it } from "bun:test";
import { slowing } from "../src/slow.js";
import type { ViseStep } from "../src/vise.js";
import { viseStruck } from "../src/vise-shot.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  install,
  MID,
  runUntil,
  SCRIPT,
  shieldUnder,
  shot,
  toLit,
  toStep,
  vise,
} from "./vise-rig.js";

/**
 * THE VISE's story steps (§28): the case biting down at the hull, met by the
 * shield under it, and the kernel spitting a seed over another column, burst
 * by a shot up that column — each under THE SLOW, and each run out a hull
 * hit.
 */

/** The kernel bared by the first four pinches, the first red shot and the hold. */
const BARE = 6;
const BITE: ViseStep = { ask: "bite", color: "either", beats: 3 };
const SPIT: ViseStep = { ask: "spit", color: "red", beats: 3, offset: 2 };

/** The shipped script up to the kernel held bare, and `step` lit after it. */
function lit(step: ViseStep) {
  return toStep(BARE, [...SCRIPT.slice(0, BARE), step]);
}

describe("the bite", () => {
  it("lights under THE SLOW", () => {
    const world = lit(BITE);
    expect(vise(world).steps[vise(world).cursor]?.ask).toBe("bite");
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot, only the shield under the case", () => {
    const world = lit(BITE);
    viseStruck(world, shot("red"));
    expect(vise(world).phase).toBe("lit");
    expect(vise(world).hits).toBe(1);
    expect(shieldUnder(world)).toContain("viseBlock");
    expect(vise(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("left unshielded strikes the hull", () => {
    const world = lit(BITE);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, BITE.beats + 2);
    expect(seen.has("viseMiss")).toBe(true);
  });
});

describe("the spat seed", () => {
  it("wants the column it hangs over, not the middle", () => {
    const world = lit(SPIT);
    viseStruck(world, shot("red", MID));
    expect(vise(world).phase).toBe("lit");
    viseStruck(world, shot("red", MID + 2));
    expect(vise(world).phase).toBe("rest");
  });

  it("wants its colour, and is not a hit on the kernel", () => {
    const world = lit(SPIT);
    viseStruck(world, shot("cyan", MID + 2));
    expect(vise(world).phase).toBe("lit");
    viseStruck(world, shot("red", MID + 2));
    expect(world.events.some((e) => e.type === "viseSeedBurst" && e.col === MID + 2)).toBe(true);
    expect(vise(world).hits).toBe(1);
  });

  it("left hanging strikes the hull", () => {
    const world = lit(SPIT);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, SPIT.beats + 2);
    expect(seen.has("viseMiss")).toBe(true);
  });
});

describe("the shipped script", () => {
  it("is eleven steps with both story steps, and answered through it splits", () => {
    expect(SCRIPT.length).toBe(11);
    expect(SCRIPT.some((s) => s.ask === "bite")).toBe(true);
    expect(SCRIPT.some((s) => s.ask === "spit")).toBe(true);
    const world = install();
    toLit(world);
    while (vise(world).phase === "lit") {
      answer(world);
      runUntil(world, (w) => vise(w).phase === "lit" || vise(w).phase === "split");
    }
    expect(vise(world).hits).toBe(3);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
