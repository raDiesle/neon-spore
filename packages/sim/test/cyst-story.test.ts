import { describe, expect, it } from "bun:test";
import { cystLitStep, cystStepCol } from "../src/cyst.js";
import { cystStruck } from "../src/cyst-shot.js";
import type { World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  cyst,
  install,
  MID,
  pinch,
  rightColor,
  runUntil,
  STORY,
  shield,
  shot,
  tapUp,
  toLit,
} from "./cyst-rig.js";

/**
 * THE CYST's story steps (§34): a swell both seats pinch shut together, a
 * spore the sac spits down a column off the middle and the shield turns, and
 * a bud grown out over another column and shot in its colour. Each under THE
 * SLOW, and each run out a hull hit.
 */

const SWELL = STORY.findIndex((s) => s.ask === "swell");
const SPIT = STORY.findIndex((s) => s.ask === "spit");
const BUD = STORY.findIndex((s) => s.ask === "bud");
const spit = STORY[SPIT] ?? STORY[0]!;
const bud = STORY[BUD] ?? STORY[0]!;
const SIDES = ["left", "right"] as const;

/** Both flanks pinched shut, or both lifted. */
function clench(world: World, on: boolean, gap = 0): void {
  for (const side of SIDES) pinch(world, side, on, gap);
}

/** The lit step answered, whatever it asks. */
function answer(world: World): void {
  const step = cystLitStep(cyst(world));
  if (step === null) throw new Error("nothing is lit");
  const col = cystStepCol(MID, step);
  if (step.ask === "fire" || step.ask === "bud") cystStruck(world, shot(rightColor(step), col));
  else if (step.ask === "spit") shield(world, col);
  else if (step.ask === "swell") {
    clench(world, true);
    runUntil(world, (w) => cyst(w).phase === "rest");
    clench(world, false);
  } else {
    tapUp(world, step.ask);
    pinch(world, step.ask, true);
    runUntil(world, (w) => cyst(w).phase === "rest");
    pinch(world, step.ask, false);
  }
}

/** A sac with the steps before `n` answered and step `n` lit. */
function toStep(n: number): World {
  const world = install(STORY);
  toLit(world);
  while (cyst(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}

describe("the swell", () => {
  it("lights under THE SLOW", () => {
    expect(slowing(toStep(SWELL))).toBe(true);
  });

  it("is not held by one flank shut", () => {
    const world = toStep(SWELL);
    pinch(world, "left", true);
    beats(world, 2);
    expect(cyst(world).phase).toBe("lit");
    expect(cyst(world).heldBeats).toBe(0);
  });

  it("held with both shut its beats, sinks back and the sac rests", () => {
    const world = toStep(SWELL);
    clench(world, true);
    const seen = runUntil(world, (w) => cyst(w).phase === "rest");
    expect(seen.has("cystClench")).toBe(true);
    expect(cyst(world).cursor).toBe(SWELL + 1);
    expect(slowing(world)).toBe(false);
  });

  it("let go starts its count again", () => {
    const world = toStep(SWELL);
    clench(world, true);
    beats(world, 1);
    expect(pinch(world, "right", true, CFG.cystOpenMilli)).toContain("cystSlip");
    expect(cyst(world).heldBeats).toBe(0);
  });

  it("left unheld strikes the hull", () => {
    const world = toStep(SWELL);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("cystMiss")).toBe(true);
  });
});

describe("the spit", () => {
  const col = cystStepCol(MID, spit);

  it("falls down a column off the middle, under THE SLOW", () => {
    expect(col).not.toBe(MID);
    expect(slowing(toStep(SPIT))).toBe(true);
  });

  it("is not turned by the shield under the sac", () => {
    const world = toStep(SPIT);
    shield(world, MID);
    expect(cyst(world).phase).toBe("lit");
  });

  it("is turned by the shield under its column", () => {
    const world = toStep(SPIT);
    expect(shield(world, col).has("cystTurn")).toBe(true);
    expect(cyst(world).phase).toBe("rest");
    expect(cyst(world).cursor).toBe(SPIT + 1);
  });

  it("left unturned strikes the hull", () => {
    const world = toStep(SPIT);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("cystMiss")).toBe(true);
  });
});

describe("the bud", () => {
  const col = cystStepCol(MID, bud);

  it("grows over a column off the middle, under THE SLOW", () => {
    expect(col).not.toBe(MID);
    expect(slowing(toStep(BUD))).toBe(true);
  });

  it("takes no shot up the middle", () => {
    const world = toStep(BUD);
    cystStruck(world, shot(rightColor(bud)));
    expect(cyst(world).phase).toBe("lit");
  });

  it("wants its own colour", () => {
    const world = toStep(BUD);
    const misses = world.balance.colorMisses;
    cystStruck(world, shot("red", col));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(cyst(world).phase).toBe("lit");
  });

  it("shot in its colour over its column bursts, and the core's hits are untouched", () => {
    const world = toStep(BUD);
    const hits = cyst(world).hits;
    cystStruck(world, shot(rightColor(bud), col));
    expect(world.events.some((e) => e.type === "cystPop")).toBe(true);
    expect(cyst(world).hits).toBe(hits);
    expect(cyst(world).phase).toBe("rest");
  });

  it("left unshot strikes the hull", () => {
    const world = toStep(BUD);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("cystMiss")).toBe(true);
  });
});

describe("the whole story", () => {
  it("is eleven steps", () => {
    expect(STORY.length).toBe(11);
  });

  it("answered whole, the sac splits and the fight ends", () => {
    const world = toStep(STORY.length - 1);
    answer(world);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("cystSplit")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
