import { describe, expect, it } from "bun:test";
import { governorOnMark } from "../src/governor.js";
import { slowing } from "../src/slow.js";
import {
  beats,
  CFG,
  chord,
  governor,
  install,
  pad,
  runUntil,
  tap,
  tapMark,
  tick,
  toLit,
  toMark,
  toStep,
} from "./governor-rig.js";

/**
 * THE GOVERNOR, the taps: one seat holds both brake pads down to keep the
 * needle slow, the other taps as it crosses the lit mark.
 *
 * What these pin is what a phone cannot show: that the needle turns on the
 * tick at the step's pace times its speed; that the speed eases back to 1×
 * only under the governing seat's whole chord and climbs toward
 * `governorHotMilli` off it; that a pad answers only its own seat; that a tap
 * lands only from the tapper, only on the mark, only on the edge — and still
 * lands however fast the needle is running. The hub, the shots and the
 * retaps: `governor-hub.test.ts`.
 */

describe("THE GOVERNOR comes in", () => {
  it("slack, the needle at the top and slow, nothing landed", () => {
    const world = install();
    const s = governor(world);
    expect(s.phase).toBe("slack");
    expect(s.needleMilli).toBe(0);
    expect(s.speedMilli).toBe(1000);
    expect(s.taps).toEqual([0, 0]);
    expect(s.hubLit).toBe(false);
    expect(world.events.some((e) => e.type === "governorEnter")).toBe(true);
  });

  it("lights the first mark under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("governorLight")).toBe(true);
    expect(slowing(world)).toBe(true);
  });
});

describe("the needle turns", () => {
  it("at the step's pace a tick while the governing seat brakes", () => {
    const world = toStep(0);
    chord(world, 2, true);
    const at = governor(world).needleMilli;
    tick(world);
    const s = governor(world);
    expect(s.speedMilli).toBe(1000);
    expect((s.needleMilli - at + 1000) % 1000).toBe(3);
  });

  it("climbs toward twice as fast with the brake off, and no further", () => {
    const world = toStep(0);
    beats(world, 2);
    expect(governor(world).speedMilli).toBe(CFG.governorHotMilli);
    const at = governor(world).needleMilli;
    tick(world);
    expect((governor(world).needleMilli - at + 1000) % 1000).toBe(6);
  });

  it("eases back to 1× once the chord is whole again", () => {
    const world = toStep(0);
    beats(world, 2);
    chord(world, 2, true);
    runUntil(world, (w) => governor(w).speedMilli === 1000, 4);
    beats(world, 1);
    expect(governor(world).speedMilli).toBe(1000);
  });

  it("is not braked by the tapper's own chord", () => {
    const world = toStep(0);
    chord(world, 1, true);
    beats(world, 2);
    expect(governor(world).speedMilli).toBe(CFG.governorHotMilli);
  });
});

describe("the chord", () => {
  it("says a whole chord and a broken one, and nothing for one pad", () => {
    const world = toStep(0);
    expect(pad(world, 2, 0, true)).not.toContain("governorPlant");
    expect(pad(world, 2, 1, true)).toContain("governorPlant");
    expect(pad(world, 2, 0, false)).toContain("governorSlip");
  });

  it("answers only its own seat, and only its two pads", () => {
    const world = toStep(0);
    pad(world, 1, 0, true, "governorChordRight");
    pad(world, 2, 0, true, "governorChordLeft");
    pad(world, 2, 2, true);
    expect(governor(world).padsDown).toEqual([0, 0]);
  });
});

describe("the tap", () => {
  it("off the mark is a skid, and nothing lands", () => {
    const world = toStep(0);
    runUntil(world, (w) => !governorOnMark(w, governor(w)));
    expect(tap(world, 1)).toContain("governorSkid");
    expect(governor(world).taps).toEqual([0, 0]);
    expect(governor(world).cursor).toBe(0);
  });

  it("on the mark lands, counts on the tapper's run and moves the cursor on", () => {
    const world = toStep(0);
    expect(tapMark(world)).toContain("governorTick");
    const s = governor(world);
    expect(s.taps).toEqual([1, 0]);
    expect(s.cursor).toBe(1);
    expect(s.phase).toBe("rest");
  });

  it("from the other seat does nothing, on the mark or off it", () => {
    const world = toStep(0);
    toMark(world);
    const seen = tap(world, 2);
    expect(seen).not.toContain("governorTick");
    expect(seen).not.toContain("governorSkid");
    expect(governor(world).taps).toEqual([0, 0]);
  });

  it("is an edge: a thumb left down counts once", () => {
    const world = toStep(0);
    toMark(world);
    const down = { kind: "drag", target: "governorTap", on: true, fromMilli: 0 } as const;
    tick(world, [{ tick: world.tick, player: 1, command: down }]);
    expect(governor(world).taps).toEqual([1, 0]);
    toLit(world);
    toMark(world);
    tick(world, [{ tick: world.tick, player: 1, command: down }]);
    expect(governor(world).taps).toEqual([1, 0]);
  });

  it("lands at twice the speed too, however fast the needle runs", () => {
    const world = toStep(0);
    beats(world, 2);
    expect(governor(world).speedMilli).toBe(CFG.governorHotMilli);
    toMark(world);
    expect(tap(world, 1)).toContain("governorTick");
  });

  it("run out sways, and the same mark is lit again after the rest", () => {
    const world = toStep(0);
    const seen = runUntil(world, (w) => governor(w).phase !== "lit");
    expect(seen.has("governorSway")).toBe(true);
    toLit(world);
    expect(governor(world).cursor).toBe(0);
  });
});
