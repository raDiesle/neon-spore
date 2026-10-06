import { describe, expect, it } from "bun:test";
import { governorAsksSeat, governorOnMark, governorOpenMarks } from "../src/governor-mark.js";
import { slowing } from "../src/slow.js";
import {
  governor,
  install,
  runUntil,
  SCRIPT,
  tap,
  tapMark,
  tick,
  toLit,
  toMark,
  toStep,
} from "./governor-rig.js";

/**
 * THE GOVERNOR, the taps: each of you taps as the needle crosses your own
 * mark, and on an ordered step in the order written.
 *
 * What these pin is what a phone cannot show: that the needle turns on the
 * tick at the step's pace; that a tap step is played at the beat's own rate
 * and not under THE SLOW; that a tap lands only the tapping seat's own mark,
 * only on it, only on the edge, and on an ordered step only in turn; and that
 * a step run out keeps what was landed. The hub, the shots and the retaps:
 * `governor-hub.test.ts`.
 */

describe("THE GOVERNOR comes in", () => {
  it("slack, the needle at the top, nothing landed", () => {
    const world = install();
    const s = governor(world);
    expect(s.phase).toBe("slack");
    expect(s.needleMilli).toBe(0);
    expect(s.taps).toEqual([0, 0]);
    expect(s.hubLit).toBe(false);
    expect(world.events.some((e) => e.type === "governorEnter")).toBe(true);
  });

  it("lights the first marks at the beat's own rate, not under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("governorLight")).toBe(true);
    expect(slowing(world)).toBe(false);
  });

  it("asks both seats at once", () => {
    const s = governor(toStep(0));
    expect(governorAsksSeat(s, 1)).toBe(true);
    expect(governorAsksSeat(s, 2)).toBe(true);
    expect(governorOpenMarks(s)).toEqual([0, 1]);
  });
});

describe("the needle", () => {
  it("turns the lit step's pace a tick", () => {
    const world = toStep(0);
    const at = governor(world).needleMilli;
    tick(world);
    expect((governor(world).needleMilli - at + 1000) % 1000).toBe(SCRIPT[0]?.paceMilli ?? -1);
  });
});

describe("the tap", () => {
  it("off its mark is a skid, and nothing lands", () => {
    const world = toStep(0);
    runUntil(world, (w) => !governorOnMark(w, governor(w), 0));
    expect(tap(world, 1)).toContain("governorSkid");
    expect(governor(world).taps).toEqual([0, 0]);
    expect(governor(world).landed).toBe(0);
  });

  it("on its own mark lands it, and the step waits for the other seat's", () => {
    const world = toStep(0);
    expect(tapMark(world)).toContain("governorTick");
    const s = governor(world);
    expect(s.taps).toEqual([1, 0]);
    expect(s.landed).toBe(1);
    expect(s.phase).toBe("lit");
    expect(tapMark(world)).toContain("governorTick");
    expect(governor(world).cursor).toBe(1);
    expect(governor(world).phase).toBe("rest");
  });

  it("from the other seat on this seat's mark is a skid", () => {
    const world = toStep(0);
    toMark(world, 0);
    const seen = tap(world, 2);
    expect(seen).toContain("governorSkid");
    expect(governor(world).landed).toBe(0);
  });

  it("is an edge: a thumb left down counts once", () => {
    const world = toStep(0);
    toMark(world, 0);
    const down = { kind: "drag", target: "governorTap", on: true, fromMilli: 0 } as const;
    tick(world, [{ tick: world.tick, player: 1, command: down }]);
    expect(governor(world).taps).toEqual([1, 0]);
    runUntil(world, (w) => !governorOnMark(w, governor(w), 0));
    toMark(world, 0);
    tick(world, [{ tick: world.tick, player: 1, command: down }]);
    expect(governor(world).taps).toEqual([1, 0]);
  });

  it("run out sways, the marks lit again after the rest with what was landed kept", () => {
    const world = toStep(0);
    tapMark(world);
    const seen = runUntil(world, (w) => governor(w).phase !== "lit");
    expect(seen.has("governorSway")).toBe(true);
    toLit(world);
    expect(governor(world).cursor).toBe(0);
    expect(governor(world).landed).toBe(1);
    expect(governorOpenMarks(governor(world))).toEqual([1]);
  });
});

describe("an ordered step", () => {
  it("opens only the next mark, and a tap out of turn is a skid", () => {
    const world = toStep(3);
    const s = governor(world);
    expect(governorOpenMarks(s)).toEqual([0]);
    // The second mark is the pilot's; the first is the navigator's.
    toMark(world, 1);
    expect(tap(world, 1)).toContain("governorSkid");
    expect(governor(world).landed).toBe(0);
  });

  it("takes them in the order written", () => {
    const world = toStep(3);
    tapMark(world);
    expect(governorOpenMarks(governor(world))).toEqual([1]);
    tapMark(world);
    expect(governorOpenMarks(governor(world))).toEqual([2]);
    expect(tapMark(world)).toContain("governorRetap");
  });
});
