import { describe, expect, it } from "bun:test";
import { GALL_POINTS, gallLitStep, gallPointCol, gallSeatAt } from "../src/gall.js";
import { gallStruck } from "../src/gall-shot.js";
import { hashWorld, MILLI, type World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  gall,
  hand,
  install,
  MID,
  pullHere,
  runUntil,
  SCRIPT,
  shot,
  tapHere,
  tick,
  toLit,
} from "./gall-rig.js";

/**
 * THE GALL: tap it until it is charged, pull it up to throw it to your
 * partner's side, and shoot it when it is lit.
 *
 * What these pin is what a phone cannot show: that a tap counts only on the
 * alien's point and only from the seat whose half it is on, and says why
 * when it does not; that a pull short of its taps is refused; that a charged
 * pull throws it to a point on the other half off the seeded `Rng`, under
 * THE SLOW; that a landing lights the next step with a fresh clock that
 * slows nothing; that a step run out is the wave; and that the fire step
 * wants the alien's own column.
 */

/** Tap the lit leap to its charge and pull it; the event types seen until the next step lights. */
function leap(world: World): Set<string> {
  const seen = new Set<string>();
  const need = gallLitStep(gall(world))?.taps ?? 0;
  for (let i = 0; i < need; i++) for (const t of tapHere(world)) seen.add(t);
  for (const t of pullHere(world)) seen.add(t);
  for (const t of toLit(world)) seen.add(t);
  return seen;
}

/** The alien with the steps before `n` answered and step `n` lit. */
function toStep(n: number, seed = 0): World {
  const world = install(SCRIPT, seed);
  toLit(world);
  while (gall(world).cursor < n) leap(world);
  return world;
}

describe("THE GALL comes in", () => {
  it("dropping onto the first point, untapped, no finger on it", () => {
    const world = install();
    const s = gall(world);
    expect(s.phase).toBe("slack");
    expect(s.point).toBe(0);
    expect(s.taps).toBe(0);
    expect(s.down).toEqual([-1, -1]);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "gallEnter")).toBe(true);
  });

  it("lights the first leap with a clock that slows nothing", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("gallLight")).toBe(true);
    expect(slowing(world)).toBe(true);
    expect(world.slowAsks).toBe(true);
    expect(world.slowPaceMilli).toBe(MILLI);
  });
});

describe("the four points", () => {
  it("stand mirrored about the middle column, two to each seat", () => {
    for (let p = 0; p < GALL_POINTS; p++) {
      expect(gallPointCol(CFG, p) + gallPointCol(CFG, GALL_POINTS - 1 - p)).toBe(CFG.cols - 1);
    }
    expect(gallPointCol(CFG, 1)).toBeLessThan(MID);
    expect(gallPointCol(CFG, 2)).toBeGreaterThan(MID);
    expect([0, 1, 2, 3].map(gallSeatAt)).toEqual([1, 1, 2, 2]);
  });
});

describe("a tap", () => {
  it("on the alien, from the seat whose half it is on, charges it", () => {
    const world = toStep(0);
    expect(tapHere(world)).toContain("gallTap");
    expect(gall(world).taps).toBe(1);
  });

  it("from the other seat is refused aloud, as not theirs", () => {
    const world = toStep(0);
    const heard = hand(world, 2, 0);
    expect(heard).toContain("gallWhiff");
    expect(world.events.find((e) => e.type === "gallWhiff")).toMatchObject({ why: "seat" });
    expect(gall(world).taps).toBe(0);
  });

  it("on the other point of the same half is refused as empty", () => {
    const world = toStep(0);
    hand(world, 1, 1);
    expect(world.events.find((e) => e.type === "gallWhiff")).toMatchObject({ why: "empty" });
  });

  it("held down does nothing until it lifts", () => {
    const world = toStep(0);
    const command = { kind: "drag", target: "gallPress", on: true, fromMilli: 0, id: 0 } as const;
    const heard = tick(world, [{ tick: world.tick, player: 1, command }]);
    beats(world, 2);
    expect(heard.filter((t) => t.startsWith("gall"))).toEqual([]);
    expect(gall(world).taps).toBe(0);
    expect(gall(world).down).toEqual([0, -1]);
  });

  it("dragged sideways is neither a tap nor a pull", () => {
    const world = toStep(0);
    hand(world, 1, 0, CFG.gallPullMilli * 2, 0);
    expect(world.events.find((e) => e.type === "gallWhiff")).toMatchObject({ why: "way" });
    expect(gall(world).taps).toBe(0);
  });
});

describe("a pull", () => {
  it("before the taps are in is refused as early", () => {
    const world = toStep(0);
    tapHere(world);
    pullHere(world);
    expect(world.events.find((e) => e.type === "gallWhiff")).toMatchObject({ why: "early" });
    expect(gall(world).phase).toBe("lit");
  });

  it("charged, throws it to the other half under THE SLOW, with no clock", () => {
    const world = toStep(0);
    for (let i = 0; i < 3; i++) tapHere(world);
    expect(pullHere(world)).toContain("gallLeap");
    const s = gall(world);
    expect(s.phase).toBe("leap");
    expect(s.from).toBe(0);
    expect(gallSeatAt(s.point)).toBe(2);
    expect(slowing(world)).toBe(true);
    expect(world.slowAsks).toBe(false);
    expect(world.slowPaceMilli).toBeLessThan(MILLI);
  });

  it("lands on the other half and lights the next step with a fresh clock", () => {
    const world = toStep(0);
    const seen = leap(world);
    expect(seen.has("gallLand")).toBe(true);
    const s = gall(world);
    expect(s.cursor).toBe(1);
    expect(s.taps).toBe(0);
    expect(world.slowAsks).toBe(true);
    expect(world.slowPaceMilli).toBe(MILLI);
    expect(world.slowToBeat - world.beat).toBe(SCRIPT[1]?.beats ?? -1);
  });

  it("lands on the other half every time, off the seeded Rng", () => {
    const walk = (seed: number): number[] => {
      const world = toStep(0, seed);
      const points = [gall(world).point];
      leap(world);
      points.push(gall(world).point);
      leap(world);
      points.push(gall(world).point);
      return points;
    };
    for (let seed = 0; seed < 12; seed++) {
      const points = walk(seed);
      for (let i = 1; i < points.length; i++) {
        expect(gallSeatAt(points[i] ?? 0)).not.toBe(gallSeatAt(points[i - 1] ?? 0));
      }
      expect(walk(seed)).toEqual(points);
    }
  });
});

describe("a step run out", () => {
  it("is a hull hit, and that is the wave", () => {
    const world = toStep(1);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("gallMiss")).toBe(true);
  });
});

describe("the shot", () => {
  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(2);
    const col = gallPointCol(CFG, gall(world).point);
    gallStruck(world, shot("cyan", col));
    expect(gall(world).hits).toBe(0);
    expect(gall(world).phase).toBe("lit");
  });

  it("wants the alien's own column, not the middle", () => {
    const world = toStep(2);
    gallStruck(world, shot("red", MID));
    expect(gall(world).hits).toBe(0);
  });

  it("between fire steps bursts on it and takes nothing", () => {
    const world = toStep(0);
    const col = gallPointCol(CFG, gall(world).point);
    expect(gallStruck(world, shot("red", col))).toBe(true);
    expect(gall(world).hits).toBe(0);
  });
});

describe("the end", () => {
  it("shot in its colour, it drops dead and the fight ends", () => {
    const world = toStep(2);
    gallStruck(world, shot("red", gallPointCol(CFG, gall(world).point)));
    expect(gall(world).hits).toBe(1);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("gallFlat")).toBe(true);
    expect(seen.has("gallOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("two devices", () => {
  it("agree while their commands do, and part over a single tap", () => {
    const a = toStep(0);
    const b = toStep(0);
    hand(a, 1, 1);
    hand(b, 1, 1);
    expect(hashWorld(a)).toBe(hashWorld(b));
    hand(a, 1, 0);
    hand(b, 1, 1);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
