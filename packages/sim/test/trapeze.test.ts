import { describe, expect, it } from "bun:test";
import { hashWorld } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { trapezeOnMark } from "../src/trapeze.js";
import {
  beats,
  CFG,
  draw,
  install,
  MID,
  runUntil,
  tap,
  tick,
  toLit,
  toMark,
  trapeze,
} from "./trapeze-rig.js";
import { catchLit, toStep } from "./trapeze-rig-steps.js";

/**
 * THE TRAPEZE, the catch: one seat taps the flag still as it swings over the
 * lit column, the other draws and lets go toward it.
 *
 * What these pin is what a phone cannot show: that the flag swings a span
 * and turns back on its own; that a tap lands only over the lit column and
 * only from the step's seat, and only as an edge; that a catch needs all
 * three of a beat drawn, the flag still frozen and the swipe toward the
 * column; that a freeze lets go on its own; and that a catch run out is tried
 * again with the cursor where it was. The spindle: `trapeze-spindle.test.ts`.
 */

describe("THE TRAPEZE comes in", () => {
  it("slack over the middle, swinging right, nothing caught", () => {
    const world = install();
    const s = trapeze(world);
    expect(s.phase).toBe("slack");
    expect(s.swingMilli).toBe(0);
    expect(s.swingDir).toBe(1);
    expect(s.catches).toBe(0);
    expect(s.spindleLit).toBe(false);
    expect(world.events.some((e) => e.type === "trapezeEnter")).toBe(true);
  });

  it("lights the first catch left of the middle, under THE SLOW", () => {
    const world = install();
    const lights: number[] = [];
    runUntil(world, (w) => {
      for (const e of w.events) if (e.type === "trapezeLight") lights.push(e.col);
      return trapeze(w).phase === "lit";
    });
    expect(lights).toEqual([MID - 1]);
    expect(slowing(world)).toBe(true);
  });
});

describe("the flag swings", () => {
  it("across its span and back, never past either end", () => {
    const world = install();
    const seen = new Set<number>();
    for (let n = 0; n < 12; n += 1) {
      beats(world, 1);
      const at = trapeze(world).swingMilli;
      expect(Math.abs(at)).toBeLessThanOrEqual(CFG.trapezeSpanMilli);
      seen.add(at);
    }
    expect(seen.has(CFG.trapezeSpanMilli)).toBe(true);
    expect(seen.has(-CFG.trapezeSpanMilli)).toBe(true);
  });
});

describe("the tap", () => {
  it("off the lit column is a flap, and the flag swings on", () => {
    const world = toStep(0);
    runUntil(world, (w) => !trapezeOnMark(w, trapeze(w)));
    expect(tap(world, 1)).toContain("trapezeFlap");
    expect(trapeze(world).frozenBeats).toBe(0);
  });

  it("from the seat the step did not name does nothing", () => {
    const world = toStep(0);
    toMark(world);
    const types = tap(world, 2);
    expect(types.filter((t) => t.startsWith("trapeze"))).toEqual([]);
    expect(trapeze(world).frozenBeats).toBe(0);
  });

  it("is an edge: a thumb resting on the mark has to come up first", () => {
    const world = toStep(0);
    runUntil(world, (w) => !trapezeOnMark(w, trapeze(w)));
    tap(world, 1);
    toMark(world);
    tap(world, 1);
    expect(trapeze(world).frozenBeats).toBe(0);
    tap(world, 1, false);
    expect(tap(world, 1)).toContain("trapezeFreeze");
    expect(trapeze(world).frozenBy).toBe(0);
  });

  it("lets go on its own after its beats", () => {
    const world = toStep(0);
    toMark(world);
    tap(world, 1);
    const seen = beats(world, CFG.trapezeFreezeBeats);
    expect(seen.has("trapezeLapse")).toBe(true);
    expect(trapeze(world).frozenBy).toBe(null);
  });
});

describe("the catch", () => {
  it("lands with a beat drawn, the flag frozen and the swipe toward the column", () => {
    const world = toStep(0);
    const seen = catchLit(world);
    expect(seen.has("trapezeCatch")).toBe(true);
    expect(trapeze(world).catches).toBe(1);
    expect(trapeze(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("the second catch is the other seat's, on the other side", () => {
    const world = toStep(1);
    expect(trapeze(world).steps[1]?.freezer).toBe(2);
    expect(catchLit(world).has("trapezeCatch")).toBe(true);
    expect(trapeze(world).catches).toBe(2);
  });

  it("swiped the wrong way is a flutter", () => {
    const world = toStep(0);
    draw(world, 2, true);
    toMark(world);
    tap(world, 1);
    beats(world, 1);
    expect(draw(world, 2, false, 400)).toContain("trapezeFlutter");
    expect(trapeze(world).catches).toBe(0);
  });

  it("let go with the flag still swinging is a flutter", () => {
    const world = toStep(0);
    draw(world, 2, true);
    beats(world, 1);
    expect(trapeze(world).frozenBeats).toBe(0);
    expect(draw(world, 2, false, -400)).toContain("trapezeFlutter");
  });

  it("let go before a beat is drawn is a flutter", () => {
    const world = toStep(0);
    toMark(world);
    tap(world, 1);
    draw(world, 2, true);
    expect(draw(world, 2, false, -400)).toContain("trapezeFlutter");
  });

  it("drawn by the freezer does nothing", () => {
    const world = toStep(0);
    draw(world, 1, true);
    toMark(world);
    tap(world, 1);
    beats(world, 1);
    const types = draw(world, 1, false, -400);
    expect(types.filter((t) => t.startsWith("trapeze"))).toEqual([]);
    expect(trapeze(world).catches).toBe(0);
  });

  it("run out is the flag swaying off, tried again at the same step", () => {
    const world = toStep(0);
    const seen = runUntil(world, (w) => trapeze(w).phase === "rest");
    expect(seen.has("trapezeSway")).toBe(true);
    expect(trapeze(world).cursor).toBe(0);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(trapeze(world).cursor).toBe(0);
  });
});

describe("the hash", () => {
  it("is the same for the same thumbs, and the swing moves it", () => {
    const a = install();
    const b = install();
    for (const w of [a, b]) {
      toLit(w);
      catchLit(w);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
    trapeze(b).swingMilli += 1;
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });

  it("hears a tap on the tick it is sent", () => {
    const world = toStep(0);
    toMark(world);
    const before = hashWorld(world);
    tap(world, 1);
    expect(trapeze(world).frozenBeats).toBe(CFG.trapezeFreezeBeats);
    tick(world);
    expect(hashWorld(world)).not.toBe(before);
  });
});
