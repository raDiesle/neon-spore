import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { governorBoss, midCol } from "@neon-spore/sim";
import { coreHurt } from "../src/core-hurt.js";
import { fieldX } from "../src/field-flip.js";
import {
  governorArrived,
  governorNeedleShown,
  governorOrbit,
  governorSwing,
  governorTilt,
  TILT_HUB,
  TILT_READ,
} from "../src/governor-pose.js";
import { dialAt, flyweightAt, governorDial } from "../src/governor-shape.js";
import { rgba } from "../src/hex.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { showsGovernorHand } from "../src/view-role-clocks-c.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { count, FIRE, frame, ORDERED, posed, stood, TAP } from "./governor-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GOVERNOR, drawn (`render/src/governor-draw.ts`): the flywheel over the
 * middle column with its needle on the track and drawn ahead by the input
 * delay, the flyweights rising with the step's pace and turning with the
 * needle, each seat's mark full on its own screen, an ordered step's marks
 * numbered, the studs as each seat's taps, and the needle's tip lit in a
 * shot's colour only while one is owed — on all three
 * screens, set rather than played to; `sim/test/governor.test.ts` proves the
 * rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

describe("THE GOVERNOR's body", () => {
  it.each(ROLES)("draws the flywheel, its face and the works, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, null));
    expect(count(drawn, PALETTE.governorBrass)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.governorFace)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.governorHub)).toBeGreaterThan(0);
  });

  it("lays the dial over the middle column, turned with the field", () => {
    for (const role of ROLES) {
      const l = computeLayout(VIEWPORT, CFG, role);
      const d = governorDial(l, CFG, TILT_READ);
      expect(d.cx).toBeCloseTo(fieldX(l, midCol(CFG)), 6);
      expect(dialAt(d, 250, 1).x).toBeGreaterThan(d.cx);
      expect(dialAt(d, 0, 1).y).toBeLessThan(d.cy);
    }
  });

  it.each(ROLES)("lights a stud for each tap a seat has landed, on %s", (role) => {
    const none = frame(role, (w) => posed(w, null));
    const some = frame(role, (w) =>
      posed(w, null, 0, (s) => {
        s.taps = [2, 1];
      }),
    );
    expect(count(some, PALETTE.hullRim)).toBeGreaterThan(count(none, PALETTE.hullRim));
  });

  it.each(ROLES)(
    "lights the needle's tip, not the hub, only while a shot is owed, on %s",
    (role) => {
      const lit = (s: { hubLit: boolean; taps: [number, number] }) => {
        s.hubLit = true;
        s.taps = [3, 3];
      };
      const between = frame(role, (w) => posed(w, null, 0, lit));
      const owed = frame(role, (w) => posed(w, FIRE, 0, lit));
      // Owed, the tip is dark glass lit from inside (a radial light, `lit-core.ts`) and
      // no longer brass; its brass rim stays brass, never outlined in the colour.
      const light = "createRadialGradient";
      expect(count(owed, light)).toBeGreaterThan(count(between, light));
      expect(count(owed, PALETTE.governorHub)).toBeLessThan(count(between, PALETTE.governorHub));
      expect(count(owed, rgba(PALETTE.governorBrassDark, 0.95))).toBeGreaterThan(0);
      // The hub is lit softly once a shot is earned, and is the same whether one is owed or not.
      const hub = rgba(PALETTE.hullRim, 0.25 + 0.3 * coreHurt(0).bright);
      expect(count(owed, hub)).toBeGreaterThan(0);
      expect(count(owed, hub)).toBe(count(between, hub));
      expect(count(between, PALETTE.governorHub)).toBeLessThan(
        count(
          frame(role, (w) => posed(w, null)),
          PALETTE.governorHub,
        ),
      );
    },
  );
});

describe("THE GOVERNOR's pace, drawn as the flyweights", () => {
  it("swings them out for a quicker step, and flat out once spent", () => {
    const world = stood();
    const s = posed(world, TAP);
    const slow = governorSwing(s, CFG, world.beat, 0);
    const quick = governorSwing(posed(world, { ...TAP, paceMilli: 10 }), CFG, world.beat, 0);
    expect(quick).toBeGreaterThan(slow);
    s.phase = "spent";
    s.phaseBeat = world.beat - CFG.governorSpentBeats;
    expect(governorSwing(s, CFG, world.beat, 0)).toBeGreaterThan(quick);
  });

  it("lifts a flyweight up the spindle as it swings out", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const d = governorDial(l, CFG, TILT_READ);
    expect(flyweightAt(l, d, 1.05, 0).y).toBeLessThan(flyweightAt(l, d, 0.42, 0).y);
  });

  it("turns them with the needle", () => {
    expect(governorOrbit(0)).toBe(0);
    expect(governorOrbit(500)).toBeCloseTo(3 * Math.PI, 6);
  });
});

describe("THE GOVERNOR's needle, drawn ahead", () => {
  it("by the input delay at the step's pace, and not once spent", () => {
    const world = stood();
    const s = posed(world, TAP, 990);
    expect(governorNeedleShown(world, s, 0)).toBe(990);
    expect(governorNeedleShown(world, s, 12)).toBe((990 + 12 * TAP.paceMilli) % 1000);
    s.phase = "spent";
    expect(governorNeedleShown(world, s, 12)).toBe(990);
  });
});

describe("THE GOVERNOR's poses", () => {
  it("is lowered in over the slack and stands in place after it", () => {
    const world = stood();
    const s = posed(world, null);
    s.phase = "slack";
    s.phaseBeat = world.beat;
    expect(governorArrived(s, CFG, world.beat, 0)).toBe(0);
    expect(governorArrived(s, CFG, world.beat + CFG.governorSlackBeats, 0)).toBe(1);
  });

  it("tips the dial up to the hub while a shot is owed, and back after", () => {
    const world = stood();
    const tap = posed(world, TAP);
    expect(governorTilt(tap, world.beat, 0)).toBe(TILT_READ);
    const fire = posed(world, FIRE);
    expect(governorTilt(fire, world.beat, 0)).toBeCloseTo(TILT_HUB, 6);
    fire.phase = "rest";
    fire.cursor = 1;
    fire.phaseBeat = world.beat;
    expect(governorTilt(fire, world.beat, 0)).toBeCloseTo(TILT_HUB, 6);
    expect(governorTilt(fire, world.beat + 1, 0)).toBeCloseTo(TILT_READ, 6);
  });
});

describe("THE GOVERNOR's hands, split by the step", () => {
  it("shows each seat's own ask full, and both on test", () => {
    expect(showsGovernorHand("p1", 1)).toBe(true);
    expect(showsGovernorHand("p2", 1)).toBe(false);
    expect(showsGovernorHand("p2", 2)).toBe(true);
    expect(showsGovernorHand("test", 1) && showsGovernorHand("test", 2)).toBe(true);
  });

  it("draws each seat's own mark full, so the two screens differ", () => {
    const p1 = frame("p1", (w) => posed(w, TAP));
    const p2 = frame("p2", (w) => posed(w, TAP));
    expect(p1).not.toBe(p2);
  });

  it.each(ROLES)("numbers an ordered step's marks, on %s", (role) => {
    const plain = frame(role, (w) => posed(w, { ...ORDERED, ordered: false }));
    const ordered = frame(role, (w) => posed(w, ORDERED));
    expect(ordered).not.toBe(plain);
  });

  it.each(ROLES)("holds a landed mark lit, on %s", (role) => {
    const open = frame(role, (w) => posed(w, TAP));
    const landed = frame(role, (w) =>
      posed(w, TAP, 0, (s) => {
        s.landed = 1;
      }),
    );
    expect(landed).not.toBe(open);
    expect(governorBoss(stood())).not.toBeNull();
  });
});
