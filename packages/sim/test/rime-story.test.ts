import { describe, expect, it } from "bun:test";
import { rimeIcicleCol } from "../src/rime.js";
import { rimeStruck } from "../src/rime-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  beats,
  CFG,
  MID,
  rime,
  runUntil,
  SCRIPT,
  shield,
  shot,
  thaw,
  toStep,
  wipe,
} from "./rime-rig.js";

/**
 * THE RIME's story steps (§29): a whiteout that fogs both halves over the
 * bare core at once, wiped by both seats together, and an icicle the core
 * flings down another column, turned by the shield under it — each under
 * THE SLOW, and each run out a hull hit.
 */

const WHITEOUT = SCRIPT.findIndex((s) => s.ask === "both");
const ICICLE = SCRIPT.findIndex((s) => s.ask === "icicle");

describe("the whiteout", () => {
  it("fogs both halves to a film over the core, under THE SLOW", () => {
    const world = toStep(WHITEOUT);
    const s = rime(world);
    expect(s.bared).toBe(false);
    expect(s.rimeMilli).toEqual([CFG.rimeFilmMilli, CFG.rimeFilmMilli]);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while fogged", () => {
    const world = toStep(WHITEOUT);
    rimeStruck(world, shot("red"));
    expect(rime(world).phase).toBe("lit");
  });

  it("one half wiped is not enough", () => {
    const world = toStep(WHITEOUT);
    wipe(world, "left");
    expect(rime(world).rimeMilli[0]).toBe(0);
    expect(rime(world).phase).toBe("lit");
  });

  it("a half left alone grows back while the other is wiped", () => {
    const world = toStep(WHITEOUT);
    wipe(world, "left");
    beats(world, 2);
    expect(rime(world).rimeMilli[0]).toBeGreaterThan(0);
  });

  it("wiped by both together, bares the core and rests", () => {
    const world = toStep(WHITEOUT);
    expect(thaw(world).has("rimeBare")).toBe(true);
    expect(rime(world).bared).toBe(true);
    expect(rime(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("left fogged strikes the hull", () => {
    const world = toStep(WHITEOUT);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("rimeMiss")).toBe(true);
  });
});

describe("the icicle", () => {
  const col = rimeIcicleCol(MID, SCRIPT[ICICLE] ?? SCRIPT[0]!);

  it("falls down a column off the middle", () => {
    expect(col).not.toBe(MID);
  });

  it("is not turned by the shield under the lens", () => {
    const world = toStep(ICICLE);
    shield(world, MID);
    expect(rime(world).phase).toBe("lit");
  });

  it("is turned by the shield under its column, and the core stays bare", () => {
    const world = toStep(ICICLE);
    expect(shield(world, col).has("rimeBlock")).toBe(true);
    expect(rime(world).phase).toBe("rest");
    expect(rime(world).bared).toBe(true);
  });

  it("left unshielded strikes the hull", () => {
    const world = toStep(ICICLE);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("rimeMiss")).toBe(true);
  });
});

describe("the whole script", () => {
  it("is eleven steps, answered to the shatter", () => {
    expect(SCRIPT.length).toBe(11);
    const world = toStep(SCRIPT.length - 1);
    answer(world);
    expect(rime(world).hits).toBe(3);
    expect(runUntil(world, (w) => w.boss === null).has("rimeShatter")).toBe(true);
  });
});
