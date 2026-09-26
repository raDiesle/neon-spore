import { describe, expect, it } from "bun:test";
import { halterGripped, halterLitStep, halterSeatIndex } from "../src/halter.js";
import { halterStruck } from "../src/halter-shot.js";
import { hashWorld, type World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beats,
  CFG,
  chord,
  grip,
  halter,
  install,
  rightColor,
  runUntil,
  SCRIPT,
  shot,
  stir,
  toLit,
} from "./halter-rig.js";

/**
 * THE HALTER: one seat touches nothing while the other holds both grips;
 * held together, a segment cracks; both cracked bare the centre, which is
 * shot in its colour.
 *
 * What these pin is the gate a phone cannot show: that *any* command zeroes
 * a seat's rest; that the rest is counted only from the step's light; that a
 * rester holding a grip is not resting; that only the step's pairing counts,
 * and in a guard either; that the pair coming apart clears both counters and
 * says which half went; that a window run out is tried again, and a guard
 * run out shuts the centre; and that a shot run out is the wave.
 */

/** Both of a seat's grips lifted, each one only if it is down. */
function lift(world: World, seat: 1 | 2): void {
  const mask = halter(world).grips[halterSeatIndex(seat)];
  if ((mask & 1) !== 0) grip(world, seat, "left", false);
  if ((mask & 2) !== 0) grip(world, seat, "right", false);
}

/** The lit step answered: the step's rester left alone while the other chords, or shot in its colour. */
function answer(world: World): void {
  const s = halter(world);
  const step = halterLitStep(s);
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") {
    halterStruck(world, shot(rightColor(step)));
    return;
  }
  const rester = step.ask === "right" ? 1 : 2;
  const gripper = rester === 1 ? 2 : 1;
  lift(world, rester);
  if (!halterGripped(s, gripper)) chord(world, gripper);
  runUntil(world, (w) => halter(w).phase === "pause");
}

/** A seam with the steps before `n` answered and step `n` lit. */
function toStep(n: number): World {
  const world = install();
  toLit(world);
  while (halter(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}

describe("THE HALTER comes in", () => {
  it("alarmed, both segments whole, the centre covered, nobody resting", () => {
    const world = install();
    const s = halter(world);
    expect(s.phase).toBe("alarmed");
    expect(s.cracks).toEqual([0, 0]);
    expect(s.bared).toBe(false);
    expect(s.restBeats).toEqual([0, 0]);
    expect(s.grips).toEqual([0, 0]);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "halterEnter")).toBe(true);
  });

  it("lights the first segment after it settles in, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("halterLight")).toBe(true);
    expect(world.beat).toBe(CFG.halterAlarmBeats);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot while the centre is covered", () => {
    const world = install();
    toLit(world);
    halterStruck(world, shot("red"));
    expect(halter(world).hits).toBe(0);
    expect(halter(world).phase).toBe("lit");
  });
});

describe("the rest", () => {
  it("is counted from the light, a beat at a time, and the rester settles at the threshold", () => {
    const world = install();
    beats(world, 1);
    toLit(world);
    expect(halter(world).restBeats).toEqual([0, 0]);
    const early = beats(world, CFG.halterRestThreshold - 1);
    expect(early.has("halterSettle")).toBe(false);
    expect(halter(world).restBeats[1]).toBe(CFG.halterRestThreshold - 1);
    const seen = beats(world, 1);
    expect(seen.has("halterSettle")).toBe(true);
  });

  it("is held at the threshold", () => {
    const world = install();
    toLit(world);
    beats(world, CFG.halterRestThreshold + 2);
    expect(halter(world).restBeats[1]).toBe(CFG.halterRestThreshold);
  });

  it("goes back to nought for any command at all, and a settled rester is startled", () => {
    const world = install();
    toLit(world);
    beats(world, CFG.halterRestThreshold);
    const types = stir(world, 2);
    expect(types).toContain("halterStartle");
    expect(halter(world).restBeats[1]).toBe(0);
    beats(world, 1);
    expect(halter(world).restBeats[1]).toBe(0);
  });

  it("does not settle a rester with a thumb on a grip", () => {
    const world = install();
    toLit(world);
    grip(world, 2, "left");
    chord(world, 1);
    const seen = beats(world, CFG.halterRestThreshold + CFG.halterHoldBeats + 1);
    expect(seen.has("halterSettle")).toBe(false);
    expect(halter(world).heldBeats).toBe(0);
    expect(halter(world).cracks).toEqual([0, 0]);
  });
});

describe("the pair", () => {
  it("held its beats cracks the lit segment, and the seam pauses", () => {
    const world = install();
    toLit(world);
    chord(world, 1);
    const seen = runUntil(world, (w) => halter(w).phase === "pause");
    expect(seen.has("halterCrack")).toBe(true);
    expect(halter(world).cracks).toEqual([1, 0]);
    expect(halter(world).cursor).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("the wrong way round counts nothing", () => {
    const world = install();
    toLit(world);
    chord(world, 2);
    beats(world, CFG.halterRestThreshold + CFG.halterHoldBeats + 1);
    expect(halter(world).heldBeats).toBe(0);
    expect(halter(world).cracks).toEqual([0, 0]);
  });

  it("a grip lifted while it held clears both counters and slips", () => {
    const world = install();
    toLit(world);
    chord(world, 1);
    runUntil(world, (w) => halter(w).heldBeats === 1);
    const types = grip(world, 1, "left", false);
    expect(types).toContain("halterSlip");
    expect(halter(world).heldBeats).toBe(0);
    expect(halter(world).restBeats).toEqual([0, 0]);
    expect(halter(world).phase).toBe("lit");
  });

  it("the rester stirring while it held clears both counters and startles", () => {
    const world = install();
    toLit(world);
    chord(world, 1);
    runUntil(world, (w) => halter(w).heldBeats === 1);
    const types = stir(world, 2);
    expect(types).toContain("halterStartle");
    expect(types).not.toContain("halterSlip");
    expect(halter(world).heldBeats).toBe(0);
    expect(halter(world).restBeats).toEqual([0, 0]);
  });

  it("run out, the seam shuts and the same step is lit again", () => {
    const world = install();
    toLit(world);
    const seen = runUntil(world, (w) => halter(w).phase === "pause");
    expect(seen.has("halterShut")).toBe(true);
    expect(halter(world).cursor).toBe(0);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(halter(world).cursor).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the bare", () => {
  it("comes with the second segment's crack", () => {
    const world = toStep(1);
    expect(halter(world).bared).toBe(false);
    const seen = new Set<string>();
    for (const t of [...chordFrom(world, 2)]) seen.add(t);
    lift(world, 1);
    for (const t of runUntil(world, (w) => halter(w).phase === "pause")) seen.add(t);
    expect(seen.has("halterBare")).toBe(true);
    expect(halter(world).cracks).toEqual([1, 1]);
    expect(halter(world).bared).toBe(true);
  });
});

/** Both grips down on a seat, whatever it already held. */
function chordFrom(world: World, seat: 1 | 2): string[] {
  return halterGripped(halter(world), seat) ? [] : chord(world, seat);
}

describe("a fire step", () => {
  it("lights without THE SLOW", () => {
    const world = toStep(2);
    expect(slowing(world)).toBe(false);
  });

  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = toStep(2);
    const misses = world.balance.colorMisses;
    halterStruck(world, shot("cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(halter(world).phase).toBe("lit");
    expect(halter(world).hits).toBe(0);
  });

  it("wants the middle column", () => {
    const world = toStep(2);
    halterStruck(world, shot("red", CFG.cols - 1));
    expect(halter(world).phase).toBe("lit");
  });

  it("shot in its colour is a hit, and the seam pauses", () => {
    const world = toStep(2);
    halterStruck(world, shot("red"));
    expect(world.events.some((e) => e.type === "halterHit")).toBe(true);
    expect(halter(world).hits).toBe(1);
    expect(halter(world).phase).toBe("pause");
  });

  it("run out, is a hull hit, and that is the wave", () => {
    const world = toStep(2);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED);
    expect(seen.has("halterMiss")).toBe(true);
  });
});

describe("a guard", () => {
  it("made with the navigator resting keeps the centre bare", () => {
    const world = toStep(3);
    lift(world, 2);
    chordFrom(world, 1);
    const seen = runUntil(world, (w) => halter(w).phase === "pause");
    expect(seen.has("halterGuard")).toBe(true);
    expect(halter(world).bared).toBe(true);
    expect(halter(world).cursor).toBe(4);
  });

  it("made with the pilot resting counts the same", () => {
    const world = toStep(3);
    lift(world, 1);
    chordFrom(world, 2);
    const seen = runUntil(world, (w) => halter(w).phase === "pause");
    expect(seen.has("halterGuard")).toBe(true);
    expect(halter(world).cursor).toBe(4);
  });

  it("a settled seat taking the chord there is choosing its half, not startled", () => {
    const world = toStep(3);
    lift(world, 1);
    lift(world, 2);
    beats(world, CFG.halterRestThreshold);
    const types = [...grip(world, 1, "left"), ...grip(world, 1, "right")];
    expect(types).not.toContain("halterStartle");
    const seen = runUntil(world, (w) => halter(w).phase === "pause");
    expect(seen.has("halterGuard")).toBe(true);
  });

  it("coming apart shuts the centre", () => {
    const world = toStep(3);
    lift(world, 2);
    chordFrom(world, 1);
    runUntil(world, (w) => halter(w).heldBeats === 1);
    const types = stir(world, 2);
    expect(types).toContain("halterStartle");
    expect(types).toContain("halterSeal");
    expect(halter(world).bared).toBe(false);
    expect(halter(world).heldBeats).toBe(0);
    expect(halter(world).phase).toBe("lit");
  });

  it("run out, shuts the centre until the same guard is made", () => {
    const world = toStep(3);
    lift(world, 1);
    lift(world, 2);
    const seen = new Set<string>();
    while (halter(world).phase === "lit") {
      for (const t of stir(world, 1)) seen.add(t);
      for (const t of stir(world, 2)) seen.add(t);
    }
    expect(seen.has("halterShut")).toBe(true);
    expect(seen.has("halterSeal")).toBe(true);
    expect(halter(world).bared).toBe(false);
    expect(halter(world).cursor).toBe(3);
    toLit(world);
    answer(world);
    expect(halter(world).bared).toBe(true);
    expect(halter(world).cursor).toBe(4);
  });
});

describe("the end", () => {
  it("answered whole, the seam splits and the fight ends", () => {
    const world = toStep(6);
    halterStruck(world, shot("red"));
    expect(halter(world).hits).toBe(3);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("halterSplit")).toBe(true);
    expect(seen.has("halterOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("two devices", () => {
  it("agree while their commands do, and part over a single stray one", () => {
    const a = toStep(1);
    const b = toStep(1);
    expect(hashWorld(a)).toBe(hashWorld(b));
    stir(a, 1);
    stir(b, 2);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
