import { describe, expect, it } from "bun:test";
import { flueEmberCol, flueSteady } from "../src/flue.js";
import { slowing } from "../src/slow.js";
import {
  beats,
  CFG,
  flue,
  install,
  MID,
  stir,
  tap,
  tapEmber,
  tick,
  toLit,
  toSteady,
  toStep,
} from "./flue-rig.js";

/**
 * THE FLUE, the vent: one seat keeps still until the ember stops dead, the
 * other taps it three times as it hops from notch to notch.
 *
 * What these pin is what a phone cannot show: that the ember drifts a span
 * and turns back on its own; that it steadies only on the beat the rester's
 * stillness reaches the threshold; that a tap lands only from the tapper,
 * only on a steady ember and only on its column; that a landed tap moves the
 * ember to the step's next notch; and that one command from the rester costs
 * every tap landed. The core and the damper: `flue-core.test.ts`.
 */

describe("THE FLUE comes in", () => {
  it("slack over the middle, drifting right, nothing spent", () => {
    const world = install();
    const s = flue(world);
    expect(s.phase).toBe("slack");
    expect(s.emberMilli).toBe(0);
    expect(s.emberDir).toBe(1);
    expect(s.vents).toBe(0);
    expect(s.bared).toBe(false);
    expect(world.events.some((e) => e.type === "flueEnter")).toBe(true);
  });

  it("lights the first vent under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("flueLight")).toBe(true);
    expect(slowing(world)).toBe(true);
  });
});

describe("the ember drifts", () => {
  it("across its span and back while nobody keeps still, never past either end", () => {
    const world = toStep(0);
    const seen = new Set<number>();
    for (let n = 0; n < 16; n += 1) {
      stir(world, 2);
      beats(world, 1);
      const at = flue(world).emberMilli;
      expect(Math.abs(at)).toBeLessThanOrEqual(CFG.flueSpanMilli);
      seen.add(at);
    }
    expect(seen.has(CFG.flueSpanMilli)).toBe(true);
    expect(seen.has(-CFG.flueSpanMilli)).toBe(true);
  });

  it("stops dead on a whole column the beat the rester reaches the threshold", () => {
    const world = toStep(0);
    const lit = world.beat;
    const seen = toSteady(world);
    expect(seen.has("flueSteady")).toBe(true);
    expect(world.beat - lit).toBe(CFG.flueRestThreshold);
    const at = flue(world).emberMilli;
    expect(at % 1000).toBe(0);
    beats(world, 2);
    expect(flue(world).emberMilli).toBe(at);
  });

  it("is not kept loose by the tapper's own commands", () => {
    const world = toStep(0);
    for (let n = 0; n < CFG.flueRestThreshold + 1; n += 1) {
      stir(world, 1);
      beats(world, 1);
    }
    expect(flueSteady(world, flue(world))).toBe(true);
  });
});

describe("the tap", () => {
  it("lands on the steady ember and moves it to the step's notches in turn", () => {
    const world = toStep(0);
    toSteady(world);
    expect(tapEmber(world)).toContain("flueTick");
    expect(flue(world).taps).toBe(1);
    expect(flueEmberCol(world.cfg, flue(world))).toBe(MID - 2);
    expect(tapEmber(world)).toContain("flueTick");
    expect(flueEmberCol(world.cfg, flue(world))).toBe(MID + 1);
  });

  it("the third spends the vent and lets THE SLOW go", () => {
    const world = toStep(0);
    toSteady(world);
    tapEmber(world);
    tapEmber(world);
    const last = tapEmber(world);
    expect(last).toContain("flueVent");
    expect(last).not.toContain("flueBare");
    expect(flue(world).vents).toBe(1);
    expect(flue(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("on another column skids, and counts nothing", () => {
    const world = toStep(0);
    toSteady(world);
    const col = flueEmberCol(world.cfg, flue(world));
    expect(tap(world, 1, col + 1)).toContain("flueSkid");
    expect(flue(world).taps).toBe(0);
  });

  it("on a drifting ember skids", () => {
    const world = toStep(0);
    expect(flueSteady(world, flue(world))).toBe(false);
    expect(tap(world, 1, flueEmberCol(world.cfg, flue(world)))).toContain("flueSkid");
  });

  it("from the rester lands nothing and loosens the ember", () => {
    const world = toStep(0);
    toSteady(world);
    const types = tap(world, 2, flueEmberCol(world.cfg, flue(world)));
    expect(types).not.toContain("flueTick");
    expect(types).toContain("flueStir");
    expect(flueSteady(world, flue(world))).toBe(false);
  });

  it("held down is one tap: a second down without a lift lands nothing", () => {
    const world = toStep(0);
    toSteady(world);
    const down = (col: number) => ({
      tick: world.tick,
      player: 1 as const,
      command: { kind: "drag", target: "flueTap", on: true, fromMilli: 0, id: col } as const,
    });
    tick(world, [down(flueEmberCol(world.cfg, flue(world)))]);
    expect(flue(world).taps).toBe(1);
    tick(world, [down(flueEmberCol(world.cfg, flue(world)))]);
    expect(flue(world).taps).toBe(1);
  });
});

describe("the lapse", () => {
  it("costs every tap landed the moment the rester moves", () => {
    const world = toStep(0);
    toSteady(world);
    tapEmber(world);
    tapEmber(world);
    const types = stir(world, 2);
    expect(types).toContain("flueLapse");
    expect(flue(world).taps).toBe(0);
    expect(flueSteady(world, flue(world))).toBe(false);
  });

  it("with nothing landed is only a stir", () => {
    const world = toStep(0);
    toSteady(world);
    const types = stir(world, 2);
    expect(types).toContain("flueStir");
    expect(types).not.toContain("flueLapse");
  });
});

describe("a vent run out", () => {
  it("chokes, and the same vent lights again from nought", () => {
    const world = toStep(0);
    toSteady(world);
    tapEmber(world);
    const seen = new Set<string>();
    while (flue(world).phase === "lit") for (const e of stir(world, 2)) seen.add(e);
    expect(seen.has("flueChoke")).toBe(true);
    toLit(world);
    expect(flue(world).cursor).toBe(0);
    expect(flue(world).taps).toBe(0);
  });
});
