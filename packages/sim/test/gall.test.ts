import { describe, expect, it } from "bun:test";
import { GALL_POINTS, gallLitStep, gallPointCol, gallSeatAt } from "../src/gall.js";
import { gallStruck } from "../src/gall-shot.js";
import { hashWorld, type World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  gall,
  install,
  MID,
  pinch,
  pinchHere,
  runUntil,
  SCRIPT,
  SHUT,
  shot,
  toLit,
  WIDE,
} from "./gall-rig.js";

/**
 * THE GALL: pinch the gall shut where it sits, and when it jumps, find it and
 * pinch it there.
 *
 * What these pin is what a phone cannot show: that a pinch counts only on
 * the point the gall is on and only from the seat nearer it; that a close
 * jumps the gall to a point it was not on, off the seeded `Rng`, and leaves
 * the pinch that closed it on nothing; that widening starts the count again;
 * that a close run out is tried again with the gall where it was; that three
 * closes bare the root; and that a shot run out is the wave.
 */

/** Keep the gall pinched shut where it sits until the lit close lands; the event types seen. */
function close(world: World): Set<string> {
  const seen = new Set<string>();
  for (const t of pinchHere(world)) seen.add(t);
  const cursor = gall(world).cursor;
  for (const t of runUntil(world, (w) => gall(w).cursor > cursor)) seen.add(t);
  return seen;
}

/** A seam with the steps before `n` answered and step `n` lit. */
function toStep(n: number, seed = 0): World {
  const world = install(SCRIPT, seed);
  toLit(world);
  while (gall(world).cursor < n) {
    close(world);
    toLit(world);
  }
  return world;
}

describe("THE GALL comes in", () => {
  it("slack on the seam's first point, unclosed, open, the root covered", () => {
    const world = install();
    const s = gall(world);
    expect(s.phase).toBe("slack");
    expect(s.point).toBe(0);
    expect(s.closes).toBe(0);
    expect(s.gapMilli).toBe(CFG.gallOpenMilli);
    expect(s.bared).toBe(false);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "gallEnter")).toBe(true);
  });

  it("lights the first close after the slack, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("gallLight")).toBe(true);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the root is covered", () => {
    const world = toStep(0);
    gallStruck(world, shot("red"));
    expect(gall(world).hits).toBe(0);
  });
});

describe("the seam's four points", () => {
  it("stand mirrored about the middle column, two to each seat", () => {
    for (let p = 0; p < GALL_POINTS; p++) {
      expect(gallPointCol(CFG, p) + gallPointCol(CFG, GALL_POINTS - 1 - p)).toBe(CFG.cols - 1);
    }
    expect(gallPointCol(CFG, 1)).toBeLessThan(MID);
    expect(gallPointCol(CFG, 2)).toBeGreaterThan(MID);
    expect([0, 1, 2, 3].map(gallSeatAt)).toEqual([1, 1, 2, 2]);
  });
});

describe("the pinch", () => {
  it("shut on the gall's point, from the nearer seat, counts the beats it stays shut", () => {
    const world = toStep(0);
    const heard = pinch(world, 1, 0, SHUT);
    expect(heard).toContain("gallPinch");
    beats(world, 1);
    expect(gall(world).heldBeats).toBe(1);
  });

  it("from the seat that is not nearer does nothing", () => {
    const world = toStep(0);
    pinch(world, 2, 0, SHUT);
    expect(gall(world).gapMilli).toBe(CFG.gallOpenMilli);
    beats(world, 1);
    expect(gall(world).heldBeats).toBe(0);
  });

  it("on another point is on bare seam", () => {
    const world = toStep(0);
    pinch(world, 1, 1, SHUT);
    expect(gall(world).gapMilli).toBe(CFG.gallOpenMilli);
  });

  it("widened back past shut before the count is done slips, and starts it again", () => {
    const world = toStep(0);
    pinch(world, 1, 0, SHUT);
    beats(world, 1);
    const heard = pinch(world, 1, 0, WIDE);
    expect(heard).toContain("gallSlip");
    expect(gall(world).heldBeats).toBe(0);
  });

  it("lifted is the gall open again", () => {
    const world = toStep(0);
    pinch(world, 1, 0, SHUT);
    pinch(world, 1, 0, 0, false);
    expect(gall(world).gapMilli).toBe(CFG.gallOpenMilli);
  });
});

describe("a close", () => {
  it("kept shut its beats jumps the gall to another point and answers the step", () => {
    const world = toStep(0);
    const seen = close(world);
    const s = gall(world);
    expect(seen.has("gallClose")).toBe(true);
    expect(s.closes).toBe(1);
    expect(s.point).not.toBe(0);
    expect(s.gapMilli).toBe(CFG.gallOpenMilli);
    expect(s.phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("leaves the pinch that closed it on nothing: it must be found again", () => {
    const world = toStep(1);
    const s = gall(world);
    const was = s.point === 0 ? 1 : 0;
    pinch(world, gallSeatAt(was), was, SHUT);
    beats(world, 2);
    expect(s.heldBeats).toBe(0);
    pinchHere(world);
    beats(world, 1);
    expect(s.heldBeats).toBe(1);
  });

  it("jumps to a point it was not on, every time, off the seeded Rng", () => {
    const walk = (seed: number): number[] => {
      const world = toStep(0, seed);
      const points = [gall(world).point];
      for (let i = 0; i < 3; i++) {
        close(world);
        points.push(gall(world).point);
        if (i < 2) toLit(world);
      }
      return points;
    };
    for (let seed = 0; seed < 12; seed++) {
      const points = walk(seed);
      for (let i = 1; i < points.length; i++) expect(points[i]).not.toBe(points[i - 1]);
      expect(walk(seed)).toEqual(points);
    }
  });

  it("the third bares the root", () => {
    const world = toStep(2);
    const seen = close(world);
    expect(seen.has("gallBare")).toBe(true);
    expect(gall(world).closes).toBe(3);
    expect(gall(world).bared).toBe(true);
  });
});

describe("a close window run out", () => {
  it("swells, keeps the gall where it was, and lights the same step again", () => {
    const world = toStep(1);
    const at = gall(world).point;
    const seen = runUntil(world, (w) => gall(w).phase === "rest");
    expect(seen.has("gallSwell")).toBe(true);
    expect(gall(world).cursor).toBe(1);
    expect(gall(world).point).toBe(at);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(gall(world).cursor).toBe(1);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the shot", () => {
  it("lights without THE SLOW, the root bare", () => {
    const world = toStep(3);
    expect(gallLitStep(gall(world))?.ask).toBe("fire");
    expect(slowing(world)).toBe(false);
    expect(gall(world).bared).toBe(true);
  });

  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(3);
    gallStruck(world, shot("cyan"));
    expect(gall(world).hits).toBe(0);
    expect(gall(world).phase).toBe("lit");
  });

  it("wants the middle column", () => {
    const world = toStep(3);
    gallStruck(world, shot("red", MID - 1));
    expect(gall(world).hits).toBe(0);
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(3);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("gallMiss")).toBe(true);
  });
});

describe("the end", () => {
  it("shot in its colour, the seam goes flat and the fight ends", () => {
    const world = toStep(3);
    gallStruck(world, shot("red"));
    expect(gall(world).hits).toBe(1);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("gallFlat")).toBe(true);
    expect(seen.has("gallOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("two devices", () => {
  it("agree while their commands do, and part over a single gap", () => {
    const a = toStep(0);
    const b = toStep(0);
    pinch(a, 1, 0, WIDE);
    pinch(b, 1, 0, WIDE);
    expect(hashWorld(a)).toBe(hashWorld(b));
    pinch(a, 1, 0, SHUT);
    pinch(b, 1, 0, SHUT + 1);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
