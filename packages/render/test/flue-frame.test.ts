import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol } from "@neon-spore/sim";
import { fieldX } from "../src/field-flip.js";
import { flueDamperOpen, flueEmberDrawn, flueSmear } from "../src/flue-pose.js";
import { flueDamperAt, flueEmberAt, flueUnitAt } from "../src/flue-shape.js";
import { rgba } from "../src/hex.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { showsFlueHand } from "../src/view-role-clocks-c.js";
import { count, DAMPER, FIRE, frame, posed, rested, stood, VENT } from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FLUE, drawn (`render/src/flue-draw.ts`): the seven units across the
 * middle of the field, the ember in its slot over its column on either
 * screen, gliding with a smear while it drifts and stopped dead without one
 * once it steadies, the tap ring split by seat, the studs and the vents as
 * its health, and the damper dropping clear of a core lit in a shot's
 * colour — on all three screens, set rather than played to;
 * `sim/test/flue.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const MID = midCol(CFG);

describe("THE FLUE's body", () => {
  it.each(ROLES)("draws the units, the slot and the ember, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, null));
    expect(count(drawn, PALETTE.flueSoot)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.flueSlot)).toBeGreaterThan(0);
  });

  it("lays the ember over its column, turned with the field", () => {
    for (const role of ROLES) {
      const l = computeLayout(VIEWPORT, CFG, role);
      expect(flueEmberAt(l, CFG, 1000).x).toBeCloseTo(fieldX(l, MID + 1), 6);
      expect(flueEmberAt(l, CFG, -2000).x).toBeCloseTo(fieldX(l, MID - 2), 6);
      expect(flueEmberAt(l, CFG, 0).x).toBeCloseTo(fieldX(l, MID), 6);
    }
  });

  it.each(ROLES)("lights a stud for each tap landed in the vent, on %s", (role) => {
    const none = frame(role, (w) => posed(w, VENT, 0, rested(2)));
    const two = frame(role, (w) =>
      posed(w, VENT, 0, (s) => {
        s.taps = 2;
        rested(2)(s);
      }),
    );
    expect(count(two, PALETTE.flueSlot)).toBeLessThan(count(none, PALETTE.flueSlot));
  });

  it.each(ROLES)("lights the core in a shot's colour only while one is owed, on %s", (role) => {
    const bare = (s: { bared: boolean; vents: number }) => {
      s.bared = true;
      s.vents = 2;
    };
    const between = frame(role, (w) => posed(w, null, 0, bare));
    const owed = frame(role, (w) => posed(w, FIRE, 0, bare));
    // The navigator's panel is cyan by its hex on every screen; the core's
    // light and its ring are cyan by `rgba`, and only while the shot is owed.
    const cyan = rgba(PALETTE.cyan, 0).slice(0, -2);
    expect(count(owed, cyan)).toBeGreaterThan(count(between, cyan));
    expect(count(between, PALETTE.flueCore)).toBeGreaterThan(0);
    // Lit from inside: the core's own soot and rim are still drawn under the light.
    expect(count(owed, PALETTE.flueCore)).toBeGreaterThan(0);
    expect(count(owed, rgba(PALETTE.flueSootDark, 0.9))).toBeGreaterThan(0);
  });
});

describe("THE FLUE's ember", () => {
  it("glides across the beat with a smear while it drifts", () => {
    const world = stood();
    const s = posed(world, VENT, 0);
    expect(flueEmberDrawn(world, s, 0.5)).toBe(0);
    expect(flueEmberDrawn(world, s, 1)).toBeGreaterThan(0);
    expect(flueEmberDrawn(world, s, 0)).toBeLessThan(0);
    expect(flueSmear(world, s)).toBeGreaterThan(0);
  });

  it("stops dead on its place, and its smear with it, the instant it steadies", () => {
    const world = stood();
    const s = posed(world, VENT, 1000, rested(2));
    for (const phase of [0, 0.3, 0.9]) expect(flueEmberDrawn(world, s, phase)).toBe(1000);
    expect(flueSmear(world, s)).toBe(0);
  });

  it("turns back off either end of the slot rather than running past it", () => {
    const world = stood();
    const s = posed(world, VENT, CFG.flueSpanMilli);
    for (const phase of [0, 0.25, 0.5, 0.75, 1]) {
      expect(Math.abs(flueEmberDrawn(world, s, phase))).toBeLessThanOrEqual(CFG.flueSpanMilli);
    }
  });
});

describe("THE FLUE's hands, split by the step", () => {
  it("shows each seat's own ring full, and both on test", () => {
    expect(showsFlueHand("p1", 1)).toBe(true);
    expect(showsFlueHand("p2", 1)).toBe(false);
    expect(showsFlueHand("p2", 2)).toBe(true);
    expect(showsFlueHand("test", 1) && showsFlueHand("test", 2)).toBe(true);
  });

  it.each(ROLES)("rings the ember once it steadies and not while it drifts, on %s", (role) => {
    const loose = frame(role, (w) => posed(w, VENT));
    const steady = frame(role, (w) => posed(w, VENT, 0, rested(2)));
    expect(steady.length).toBeGreaterThan(loose.length);
  });

  it("draws the ring differently for the tapper and the still seat", () => {
    const p1 = frame("p1", (w) => posed(w, VENT, 0, rested(2)));
    const p2 = frame("p2", (w) => posed(w, VENT, 0, rested(2)));
    expect(p1).not.toBe(p2);
  });
});

describe("THE FLUE's damper", () => {
  it("is shut over a core not bared, clear while it is, and creeps back up on a damper step", () => {
    const s = posed(stood(), DAMPER, 0);
    expect(flueDamperOpen(s, CFG, s.phaseBeat, 0)).toBe(0);
    s.bared = true;
    const early = flueDamperOpen(s, CFG, s.phaseBeat, 0.5);
    const late = flueDamperOpen(s, CFG, s.phaseBeat + 3, 0.5);
    expect(early).toBeGreaterThan(late);
    s.phase = "rest";
    expect(flueDamperOpen(s, CFG, s.phaseBeat, 0)).toBe(1);
    s.phase = "spent";
    expect(flueDamperOpen(s, CFG, s.phaseBeat + CFG.flueSpentBeats, 0)).toBeGreaterThan(1);
  });

  it("drops the damper out of the row as it opens, and further once spent", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const row = flueUnitAt(l, CFG, 3).y;
    expect(flueDamperAt(l, CFG, 0).y).toBe(row);
    expect(flueDamperAt(l, CFG, 1).y).toBeGreaterThan(row);
    expect(flueDamperAt(l, CFG, 2).y).toBeGreaterThan(flueDamperAt(l, CFG, 1).y);
  });
});
