import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol } from "@neon-spore/sim";
import { fieldX } from "../src/field-flip.js";
import {
  governorArrived,
  governorJaws,
  governorOrbit,
  governorSwing,
  governorTilt,
  TILT_HUB,
  TILT_READ,
} from "../src/governor-pose.js";
import { dialAt, flyweightAt, governorDial } from "../src/governor-shape.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { showsGovernorHand } from "../src/view-role-clocks-c.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { count, FIRE, frame, posed, stood, TAP } from "./governor-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GOVERNOR, drawn (`render/src/governor-draw.ts`): the flywheel over the
 * middle column with its needle on the track, the flyweights rising with the
 * needle's speed and turning with it, the yoke's jaws on the drum as the
 * braking seat's chord, the lit mark split by seat, the studs as the runs,
 * and the hub lit in a shot's colour only while one is owed — on all three
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

  it.each(ROLES)("lights the hub in a shot's colour only while one is owed, on %s", (role) => {
    const lit = (s: { hubLit: boolean; taps: [number, number] }) => {
      s.hubLit = true;
      s.taps = [3, 3];
    };
    const between = frame(role, (w) => posed(w, null, 0, lit));
    const owed = frame(role, (w) => posed(w, FIRE, 0, lit));
    expect(count(owed, PALETTE.cyanRim)).toBeGreaterThan(count(between, PALETTE.cyanRim));
    expect(count(between, PALETTE.governorHub)).toBeLessThan(
      count(
        frame(role, (w) => posed(w, null)),
        PALETTE.governorHub,
      ),
    );
  });
});

describe("THE GOVERNOR's speed, drawn as the flyweights", () => {
  it("swings them out as the needle runs hot, and flat out once spent", () => {
    const world = stood();
    const s = posed(world, TAP);
    const slow = governorSwing(s, CFG, world.beat, 0);
    s.speedMilli = CFG.governorHotMilli;
    const hot = governorSwing(s, CFG, world.beat, 0);
    expect(hot).toBeGreaterThan(slow);
    s.phase = "spent";
    s.phaseBeat = world.beat - CFG.governorSpentBeats;
    expect(governorSwing(s, CFG, world.beat, 0)).toBeGreaterThan(hot);
  });

  it("lifts a flyweight up the spindle as it swings out", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const d = governorDial(l, CFG, TILT_READ);
    expect(flyweightAt(l, d, 1.05, 0).y).toBeLessThan(flyweightAt(l, d, 0.42, 0).y);
  });

  it("turns them with the needle, and stops them when it stalls", () => {
    const s = posed(stood(), TAP, 0);
    expect(governorOrbit(s)).toBe(0);
    s.needleMilli = 500;
    const half = governorOrbit(s);
    expect(half).toBeCloseTo(3 * Math.PI, 6);
    expect(governorOrbit(s)).toBe(half);
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

  it("draws the mark and the yoke differently for the tapper and the braking seat", () => {
    const p1 = frame("p1", (w) => posed(w, TAP));
    const p2 = frame("p2", (w) => posed(w, TAP));
    expect(p1).not.toBe(p2);
  });

  it("reads the yoke's jaws off the braking seat's pads, and none between steps", () => {
    const s = posed(stood(), TAP, 0, (g) => {
      g.padsDown = [0, 2];
    });
    expect(governorJaws(s)).toBe(2);
    s.phase = "rest";
    expect(governorJaws(s)).toBeNull();
  });

  it.each(ROLES)("draws the jaws shut on the drum differently from open, on %s", (role) => {
    const open = frame(role, (w) => posed(w, TAP));
    const shut = frame(role, (w) =>
      posed(w, TAP, 0, (s) => {
        s.padsDown = [0, 3];
      }),
    );
    expect(shut).not.toBe(open);
  });
});
