import { describe, expect, it } from "bun:test";
import { RIME_FULL_MILLI, RIME_WIPES_PER_HALF } from "../src/rime.js";
import { rimeStruck } from "../src/rime-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  install,
  rime,
  rub,
  runUntil,
  SCRIPT,
  shield,
  shot,
  toLit,
  toStep,
  wipe,
} from "./rime-rig.js";

/**
 * THE RIME: each seat rubbing its own half of a frosted lens clear before the
 * frost grows back, then the ordinary shot into the core the four wipes bare,
 * with the shield against a surge between the shots.
 *
 * What these pin is the gate a phone cannot show: that only fresh reversals
 * shave, that a half nobody rubbed through a beat grows back, that the wrong
 * seat's thumb is not heard, that a wipe run out is tried again from its
 * first wipe, that a surge run out frosts the core over until it is turned,
 * that a shot outside its step or in the wrong colour does nothing, and that
 * a shot run out is the wave.
 */

describe("THE RIME comes in", () => {
  it("still, both halves frosted solid, the core covered", () => {
    const world = install();
    const s = rime(world);
    expect(s.phase).toBe("still");
    expect(s.wipes).toEqual([0, 0]);
    expect(s.bared).toBe(false);
    expect(s.rimeMilli).toEqual([RIME_FULL_MILLI, RIME_FULL_MILLI]);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "rimeEnter")).toBe(true);
  });

  it("lights the first wipe after it settles, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("rimeLight")).toBe(true);
    expect(world.beat).toBe(CFG.rimeStillBeats);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the core is covered", () => {
    const world = install();
    toLit(world);
    rimeStruck(world, shot("red"));
    expect(rime(world).hits).toBe(0);
    expect(rime(world).phase).toBe("lit");
  });
});

describe("a wipe", () => {
  it("shaves the lit half by every fresh reversal", () => {
    const world = install();
    toLit(world);
    const types = rub(world, "left", true, 3);
    expect(types).toContain("rimeShave");
    expect(rime(world).rimeMilli[0]).toBe(RIME_FULL_MILLI - 3 * CFG.rimeShaveMilli);
    expect(rime(world).phase).toBe("lit");
  });

  it("grows back through a beat nobody rubbed it, and not through one somebody did", () => {
    const world = install();
    toLit(world);
    rub(world, "left", true, 4);
    const left = RIME_FULL_MILLI - 4 * CFG.rimeShaveMilli;
    beats(world, 1);
    expect(rime(world).rimeMilli[0]).toBe(left);
    beats(world, 1);
    expect(rime(world).rimeMilli[0]).toBe(left + CFG.rimeRegrowMilli);
  });

  it("does not shave twice for a count already heard", () => {
    const world = install();
    toLit(world);
    rub(world, "left", true, 3);
    rub(world, "left", true, 3);
    expect(rime(world).rimeMilli[0]).toBe(RIME_FULL_MILLI - 3 * CFG.rimeShaveMilli);
    rub(world, "left", true, 5);
    expect(rime(world).rimeMilli[0]).toBe(RIME_FULL_MILLI - 5 * CFG.rimeShaveMilli);
  });

  it("counts a thumb put down again from nought", () => {
    const world = install();
    toLit(world);
    rub(world, "left", true, 3);
    rub(world, "left", false);
    rub(world, "left", true, 2);
    expect(rime(world).rimeMilli[0]).toBe(RIME_FULL_MILLI - 5 * CFG.rimeShaveMilli);
  });

  it("does not hear the wrong seat's thumb, nor the half that is not lit", () => {
    const world = install();
    toLit(world);
    rub(world, "left", true, 3, 2);
    rub(world, "right", true, 3);
    expect(rime(world).rimeMilli).toEqual([RIME_FULL_MILLI, RIME_FULL_MILLI]);
  });

  it("clears on the tick the half reaches nought, and the lens rests", () => {
    const world = install();
    toLit(world);
    const types = wipe(world, "left");
    expect(types).toContain("rimeClear");
    expect(rime(world).wipes).toEqual([1, 0]);
    expect(rime(world).phase).toBe("rest");
    expect(rime(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("starts a half's second wipe from the film the first left", () => {
    const world = toStep(1);
    expect(rime(world).rimeMilli[0]).toBe(CFG.rimeFilmMilli);
  });

  it("run out, frosts the half solid and is tried again from its first wipe", () => {
    const world = toStep(1);
    const seen = runUntil(world, (w) => rime(w).phase === "rest");
    expect(seen.has("rimeFrost")).toBe(true);
    expect(rime(world).cursor).toBe(0);
    expect(rime(world).wipes).toEqual([0, 0]);
    expect(rime(world).rimeMilli[0]).toBe(RIME_FULL_MILLI);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(rime(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the bare", () => {
  it("comes with the fourth wipe, two a half", () => {
    const world = toStep(3);
    expect(rime(world).bared).toBe(false);
    const types = wipe(world, "right");
    expect(types).toContain("rimeBare");
    expect(rime(world).wipes).toEqual([RIME_WIPES_PER_HALF, RIME_WIPES_PER_HALF]);
    expect(rime(world).bared).toBe(true);
  });
});

describe("a fire step", () => {
  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(4);
    const misses = world.balance.colorMisses;
    rimeStruck(world, shot("cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(rime(world).phase).toBe("lit");
    expect(rime(world).hits).toBe(0);
  });

  it("wants the middle column", () => {
    const world = toStep(4);
    rimeStruck(world, shot("red", CFG.cols - 1));
    expect(rime(world).phase).toBe("lit");
  });

  it("shot in its colour is a hit, and the lens rests", () => {
    const world = toStep(4);
    rimeStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "rimeHit")).toBe(true);
    expect(rime(world).hits).toBe(1);
    expect(rime(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(4);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("rimeMiss")).toBe(true);
  });
});

describe("a shield step", () => {
  it("wants the shield under the lens", () => {
    const world = toStep(5);
    shield(world, 0);
    expect(rime(world).phase).toBe("lit");
  });

  it("turned, keeps the core bare and the lens rests", () => {
    const world = toStep(5);
    const deflected = world.guard.deflected;
    const seen = shield(world);
    expect(seen.has("rimeBlock")).toBe(true);
    expect(world.guard.deflected).toBe(deflected + 1);
    expect(rime(world).bared).toBe(true);
    expect(rime(world).cursor).toBe(6);
  });

  it("run out, frosts the core over until the shield turns one", () => {
    const world = toStep(5);
    const seen = runUntil(world, (w) => rime(w).phase === "rest");
    expect(seen.has("rimeCloud")).toBe(true);
    expect(rime(world).bared).toBe(false);
    expect(rime(world).rimeMilli).toEqual([RIME_FULL_MILLI, RIME_FULL_MILLI]);
    expect(rime(world).cursor).toBe(5);
    expect(world.failTick).toBe(NOT_FAILED);
    toLit(world);
    shield(world);
    expect(rime(world).bared).toBe(true);
    expect(rime(world).cursor).toBe(6);
  });
});

describe("the end", () => {
  it("answered whole, the lens shatters and the fight ends", () => {
    const world = toStep(SCRIPT.length - 1);
    rimeStruck(world, shot("red"));
    expect(rime(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("rimeShatter")).toBe(true);
    expect(seen.has("rimeOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
