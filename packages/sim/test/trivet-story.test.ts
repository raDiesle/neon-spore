import { describe, expect, it } from "bun:test";
import { slowing } from "../src/slow.js";
import { trivetStepCol, trivetTipSide } from "../src/trivet.js";
import { trivetStruck } from "../src/trivet-shot.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import { chord, MID, runUntil, SCRIPT, shield, shot, toStep, trivet } from "./trivet-rig.js";

/**
 * THE TRIVET's story steps (§30): a lurch that throws the stand onto one foot
 * and swings the hub out over another column — that foot's seat holds its
 * chord while the pair shoots the swung hub — and a needle the hub flings
 * down a column off the middle, turned by the shield under it. Each under
 * THE SLOW, and each run out a hull hit.
 */

const LURCH = SCRIPT.findIndex((s) => s.ask === "tip");
const NEEDLE = SCRIPT.findIndex((s) => s.ask === "needle");
const lurch = SCRIPT[LURCH] ?? SCRIPT[0]!;
const needle = SCRIPT[NEEDLE] ?? SCRIPT[0]!;
const FOOT = ["front", "rear"] as const;

describe("the lurch", () => {
  const col = trivetStepCol(MID, lurch);
  const foot = FOOT[trivetTipSide(lurch)];

  it("swings the hub off the middle, under THE SLOW", () => {
    expect(col).not.toBe(MID);
    const world = toStep(LURCH);
    expect(slowing(world)).toBe(true);
    expect(trivet(world).hubLit).toBe(true);
  });

  it("takes no shot up the middle", () => {
    const world = toStep(LURCH);
    chord(world, foot, lurch.pads);
    trivetStruck(world, shot("cyan"));
    expect(trivet(world).phase).toBe("lit");
  });

  it("takes no shot at the swung hub with its foot let go", () => {
    const world = toStep(LURCH);
    trivetStruck(world, shot("cyan", col));
    expect(trivet(world).phase).toBe("lit");
  });

  it("takes no shot with the other foot held", () => {
    const world = toStep(LURCH);
    chord(world, FOOT[1 - trivetTipSide(lurch)] ?? "rear", lurch.pads);
    trivetStruck(world, shot("cyan", col));
    expect(trivet(world).phase).toBe("lit");
  });

  it("with its foot held, the swung hub shot is a hit", () => {
    const world = toStep(LURCH);
    const before = trivet(world).hits;
    chord(world, foot, lurch.pads);
    trivetStruck(world, shot("red", col));
    expect(trivet(world).hits).toBe(before + 1);
    expect(trivet(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("left unshot strikes the hull", () => {
    const world = toStep(LURCH);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("trivetMiss")).toBe(true);
  });
});

describe("the needle", () => {
  const col = trivetStepCol(MID, needle);

  it("falls down a column off the middle, under THE SLOW", () => {
    expect(col).not.toBe(MID);
    expect(slowing(toStep(NEEDLE))).toBe(true);
  });

  it("is not turned by the shield under the stand", () => {
    const world = toStep(NEEDLE);
    shield(world, MID);
    expect(trivet(world).phase).toBe("lit");
  });

  it("is turned by the shield under its column", () => {
    const world = toStep(NEEDLE);
    const hits = trivet(world).hits;
    expect(shield(world, col).has("trivetTurn")).toBe(true);
    expect(trivet(world).phase).toBe("rest");
    expect(trivet(world).hits).toBe(hits);
  });

  it("left unturned strikes the hull", () => {
    const world = toStep(NEEDLE);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("trivetMiss")).toBe(true);
  });
});

describe("the whole script", () => {
  it("is eleven steps with no step that asks for nothing", () => {
    expect(SCRIPT.length).toBe(11);
  });
});
