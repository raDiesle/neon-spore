import { describe, expect, it } from "bun:test";
import { GRINDSTONE_FULL_MILLI, GRINDSTONE_PADS, grindstoneLitStep } from "../src/grindstone.js";
import { grindstoneStruck } from "../src/grindstone-shot.js";
import type { World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  clampAll,
  grindClean,
  grindstone,
  install,
  liftFlat,
  MID,
  pad,
  rightColor,
  rub,
  runUntil,
  SCRIPT,
  shot,
  toLit,
} from "./grindstone-rig.js";

/**
 * THE GRINDSTONE: each seat rubbing its own flat clean, twice, as THE RIME's
 * halves are wiped; both flats clean biting the caliper shut; then the
 * ordinary shot at the axle, with both seats holding every pad of their jaws
 * down together, as THE TRIVET's chords are held, whenever the caliper
 * creeps loose.
 *
 * What these pin is the gate a screen cannot show: that only fresh reversals
 * on the lit flat by its own seat shave grit, that a flat nobody rubbed for a
 * beat regrits, that a pass run out is tried again from that flat's first,
 * that a clamp is counted only while every pad is down and starts again when
 * one lifts, that a clamp run out springs the caliper and is asked again,
 * that a shot outside its step, off the axle, unlocked or in the wrong colour
 * does nothing, and that a shot run out is the wave.
 */

/** The lit step answered: its flat ground clean, its clamp held home, or its axle shot in colour. */
function answer(world: World): void {
  const step = grindstoneLitStep(grindstone(world));
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") {
    grindstoneStruck(world, shot(rightColor(step)));
    return;
  }
  if (step.ask === "clamp") {
    clampAll(world);
    runUntil(world, (w) => grindstone(w).phase !== "lit");
    for (const side of [0, 1] as const)
      for (let p = 0; p < GRINDSTONE_PADS; p++) pad(world, side, p, false);
    return;
  }
  grindClean(world, step.ask === "left" ? 0 : 1);
}

/** A wheel with the steps before `n` answered and step `n` lit. */
function toStep(n: number): World {
  const world = install();
  toLit(world);
  while (grindstone(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}

describe("the wheel arriving", () => {
  it("comes in gritted and dark, then lights the left flat under THE SLOW", () => {
    const world = install();
    expect(world.events.some((e) => e.type === "grindstoneEnter")).toBe(true);
    const s = grindstone(world);
    expect(s.phase).toBe("still");
    expect(s.gritMilli).toEqual([GRINDSTONE_FULL_MILLI, GRINDSTONE_FULL_MILLI]);
    expect(s.locked).toBe(false);
    const seen = toLit(world);
    expect(seen.has("grindstoneLight")).toBe(true);
    expect(grindstoneLitStep(grindstone(world))?.ask).toBe("left");
    expect(slowing(world)).toBe(true);
  });
});

describe("a pass", () => {
  it("is shaved by each fresh reversal on the lit flat, and answered at nought", () => {
    const world = toStep(0);
    expect(rub(world, 0, 1)).toContain("grindstoneShave");
    expect(grindstone(world).gritMilli[0]).toBe(GRINDSTONE_FULL_MILLI - CFG.grindstoneShaveMilli);
    const seen = grindClean(world, 0);
    expect(seen.has("grindstoneClear")).toBe(true);
    expect(grindstone(world).passes).toEqual([1, 0]);
    expect(grindstone(world).cursor).toBe(1);
    expect(grindstone(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("counts a reversal once, and counts again from nought after a lift", () => {
    const world = toStep(0);
    rub(world, 0, 3);
    const after = grindstone(world).gritMilli[0];
    expect(rub(world, 0, 3)).not.toContain("grindstoneShave");
    expect(grindstone(world).gritMilli[0]).toBe(after);
    liftFlat(world, 0);
    expect(grindstone(world).rubs[0]).toBe(0);
    rub(world, 0, 1);
    expect(grindstone(world).gritMilli[0]).toBe(after - CFG.grindstoneShaveMilli);
  });

  it("is not heard from the other seat, nor on the flat that is not lit", () => {
    const world = toStep(0);
    rub(world, 0, 4, 2);
    rub(world, 1, 4, 2);
    rub(world, 1, 4, 1);
    expect(grindstone(world).gritMilli).toEqual([GRINDSTONE_FULL_MILLI, GRINDSTONE_FULL_MILLI]);
  });

  it("regrits a beat nobody rubbed, and not a beat somebody did", () => {
    const world = toStep(0);
    rub(world, 0, 4);
    const ground = grindstone(world).gritMilli[0];
    beats(world, 1);
    expect(grindstone(world).gritMilli[0]).toBe(ground);
    beats(world, 1);
    expect(grindstone(world).gritMilli[0]).toBe(ground + CFG.grindstoneRegrowMilli);
  });

  it("second on a flat, starts from a film rather than solid", () => {
    const world = toStep(1);
    expect(grindstone(world).gritMilli[0]).toBe(CFG.grindstoneFilmMilli);
  });

  it("run out, regrits the flat solid and asks that flat's first pass again, and is no hull hit", () => {
    const world = toStep(1);
    const seen = runUntil(world, (w) => grindstone(w).phase === "rest");
    expect(seen.has("grindstoneRegrit")).toBe(true);
    expect(grindstone(world).cursor).toBe(0);
    expect(grindstone(world).passes).toEqual([0, 0]);
    expect(grindstone(world).gritMilli[0]).toBe(GRINDSTONE_FULL_MILLI);
    expect(world.failTick).toBe(NOT_FAILED);
    toLit(world);
    expect(grindstone(world).gritMilli[0]).toBe(GRINDSTONE_FULL_MILLI);
  });
});

describe("the bite", () => {
  it("both flats clean, shuts the caliper and lights the axle", () => {
    const world = toStep(3);
    expect(grindstone(world).locked).toBe(false);
    const seen = grindClean(world, 1);
    expect(seen.has("grindstoneBite")).toBe(true);
    expect(grindstone(world).locked).toBe(true);
    expect(grindstone(world).passes).toEqual([2, 2]);
  });
});

describe("a shot", () => {
  it("in the wrong colour, off the axle or outside its step does nothing", () => {
    const early = toStep(0);
    grindstoneStruck(early, shot("red"));
    expect(grindstone(early).hits).toBe(0);
    const world = toStep(4);
    grindstoneStruck(world, shot("cyan"));
    grindstoneStruck(world, shot("red", MID + 1));
    expect(grindstone(world).hits).toBe(0);
    expect(grindstone(world).phase).toBe("lit");
  });

  it("in its colour is a hit, and the wheel rests", () => {
    const world = toStep(4);
    grindstoneStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "grindstoneHit")).toBe(true);
    expect(grindstone(world).hits).toBe(1);
    expect(grindstone(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(4);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("grindstoneMiss")).toBe(true);
  });
});

describe("a clamp", () => {
  it("held with every pad of both jaws for its beats, locks the caliper and moves on", () => {
    const world = toStep(5);
    clampAll(world);
    const seen = runUntil(world, (w) => grindstone(w).phase === "rest");
    expect(seen.has("grindstoneClamp")).toBe(true);
    expect(grindstone(world).locked).toBe(true);
    expect(grindstone(world).cursor).toBe(6);
  });

  it("is not counted with a pad missing, nor from the other seat's thumb", () => {
    const world = toStep(5);
    for (let p = 0; p < GRINDSTONE_PADS; p++) pad(world, 0, p, true);
    for (let p = 1; p < GRINDSTONE_PADS; p++) pad(world, 1, p, true);
    pad(world, 1, 0, true, 1);
    beats(world, 2);
    expect(grindstone(world).heldBeats).toBe(0);
  });

  it("with a pad lifting, slips and counts again", () => {
    const world = toStep(5);
    clampAll(world);
    beats(world, 2);
    expect(grindstone(world).heldBeats).toBeGreaterThan(0);
    expect(pad(world, 1, 0, false)).toContain("grindstoneSlip");
    expect(grindstone(world).heldBeats).toBe(0);
  });

  it("already down when it lights, counts from its first beat", () => {
    const world = toStep(4);
    clampAll(world);
    grindstoneStruck(world, shot("red"));
    toLit(world);
    const seen = runUntil(world, (w) => grindstone(w).phase === "rest");
    expect(seen.has("grindstoneClamp")).toBe(true);
  });

  it("run out, springs the caliper loose, darkens the axle and is asked again", () => {
    const world = toStep(5);
    const seen = runUntil(world, (w) => grindstone(w).phase === "rest");
    expect(seen.has("grindstoneLoose")).toBe(true);
    expect(grindstone(world).locked).toBe(false);
    expect(grindstone(world).cursor).toBe(5);
    expect(world.failTick).toBe(NOT_FAILED);
    toLit(world);
    answer(world);
    expect(grindstone(world).locked).toBe(true);
    expect(grindstone(world).cursor).toBe(6);
  });

  it("gets its grace on top of its count", () => {
    const world = toStep(5);
    const lit = world.beat;
    runUntil(world, (w) => grindstone(w).phase === "rest");
    expect(world.beat - lit).toBe((SCRIPT[5]?.beats ?? 0) + CFG.grindstoneGraceBeats);
  });
});

describe("the end", () => {
  it("answered whole, the wheel spins free and the fight ends", () => {
    const world = toStep(8);
    grindstoneStruck(world, shot("red"));
    expect(grindstone(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("grindstoneFree")).toBe(true);
    expect(seen.has("grindstoneOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
