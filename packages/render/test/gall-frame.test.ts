import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { World } from "@neon-spore/sim";
import { gallBearing, gallCharge, gallFlight, gallLobes, gallSpent } from "../src/gall-pose.js";
import { gallArcAt, gallMidAt, gallPointAt } from "../src/gall-shape.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { count, FIRE, frame, LEAP, posed, stood } from "./gall-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GALL, drawn (`render/src/gall-draw.ts`): the seam and its four scars,
 * the alien on its point heeled toward its presser's end, wound by its taps
 * and lit at the rim once charged, flying its arc over the middle through a
 * leap, lit from inside in a fire step's colour, a lobe fewer for every shot,
 * and dropping dead — on all three screens, set rather than played to;
 * `sim/test/gall.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

describe("THE GALL's seam", () => {
  it.each(ROLES)("draws the seam and the alien on it, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, null));
    expect(count(drawn, PALETTE.gallSeam)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.gallFlesh)).toBeGreaterThan(0);
  });

  it("sets the four points left to right across the field, the pilot's two on the left", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const xs = [0, 1, 2, 3].map((p) => gallPointAt(l, CFG, p).x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect(xs[1] ?? 0).toBeLessThan(l.gridLeft + (l.cols * l.tile) / 2);
    expect(xs[2] ?? 0).toBeGreaterThan(l.gridLeft + (l.cols * l.tile) / 2);
  });

  it("stands the seam below the middle of the field", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    expect(gallMidAt(l, CFG).y).toBeGreaterThan(l.gridTop + (CFG.rows * l.tile) / 2);
  });

  it.each(ROLES)("moves the alien to the point it landed on, on %s", (role) => {
    const here = frame(role, (w) => posed(w, null, 0));
    const there = frame(role, (w) => posed(w, null, 2));
    expect(there).not.toBe(here);
  });

  it("heels the alien toward its presser's end, and turns the heel over with the field", () => {
    const world = stood();
    const s = posed(world, LEAP, 0);
    expect(gallBearing(s, false)).toBe(Math.PI);
    expect(gallBearing(s, true)).toBe(0);
    s.point = 3;
    expect(gallBearing(s, false)).toBe(0);
    expect(gallBearing(s, true)).toBe(Math.PI);
  });
});

describe("THE GALL's charge", () => {
  it("winds by the taps, from nought untapped to one charged, and not on a fire step", () => {
    const world = stood();
    const s = posed(world, LEAP);
    expect(gallCharge(s)).toBe(0);
    s.taps = 1;
    expect(gallCharge(s)).toBeCloseTo(1 / 3);
    s.taps = 3;
    expect(gallCharge(s)).toBe(1);
    posed(world, FIRE).taps = 3;
    expect(gallCharge(s)).toBe(0);
  });

  it.each(ROLES)("draws a tapped alien wound tighter than an untapped one, on %s", (role) => {
    const loose = frame(role, (w) => posed(w, LEAP));
    const wound = frame(role, (w) => posed(w, LEAP, 0, 1, 2));
    expect(wound).not.toBe(loose);
  });

  it.each(ROLES)("lights the rim once it is charged, on %s", (role) => {
    const wound = frame(role, (w) => posed(w, LEAP, 0, 1, 2));
    const charged = frame(role, (w) => posed(w, LEAP, 0, 1, 3));
    expect(count(charged, PALETTE.hullRim)).toBeGreaterThan(count(wound, PALETTE.hullRim));
  });
});

describe("THE GALL's leap", () => {
  it("flies from nought as it leaves to one as it lands, and only in a leap", () => {
    const world = stood();
    const s = posed(world, null);
    expect(gallFlight(s, world.cfg, world.beat, 0)).toBeNull();
    s.phase = "leap";
    s.phaseBeat = world.beat;
    expect(gallFlight(s, world.cfg, world.beat, 0)).toBe(0);
    expect(gallFlight(s, world.cfg, world.beat + world.cfg.gallLeapBeats, 0)).toBe(1);
  });

  it("arcs over the middle, above the seam, from one half to the other", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const from = gallArcAt(l, CFG, 0, 3, 0);
    const top = gallArcAt(l, CFG, 0, 3, 0.5);
    const to = gallArcAt(l, CFG, 0, 3, 1);
    expect(from.x).toBeCloseTo(gallPointAt(l, CFG, 0).x);
    expect(to.x).toBeCloseTo(gallPointAt(l, CFG, 3).x);
    expect(top.y).toBeLessThan(gallPointAt(l, CFG, 0).y - 2 * l.tile);
  });

  it.each(ROLES)("draws the alien in the air apart from where it sat, on %s", (role) => {
    const sitting = frame(role, (w) => posed(w, null, 0));
    const flying = frame(role, (w) => {
      const s = posed(w, null, 3);
      s.from = 0;
      s.phase = "leap";
    });
    expect(flying).not.toBe(sitting);
  });
});

describe("THE GALL's shot", () => {
  it.each(ROLES)(
    "lights the alien from inside on a fire step, and hits change it, on %s",
    (role) => {
      // The light is a gradient, whose stops are not in the stub's log, and
      // there is no countdown ring round it any more to count its colour by.
      const leap = frame(role, (w) => posed(w, LEAP));
      const lit = frame(role, (w) => posed(w, FIRE));
      expect(lit).not.toBe(leap);
      const hit = frame(role, (w) => {
        posed(w, FIRE).hits = 1;
      });
      expect(hit).not.toBe(lit);
    },
  );

  it.each(ROLES)("takes a lobe and a sixth of the size for every shot, on %s", (role) => {
    const world = stood();
    const s = posed(world, null);
    expect(gallLobes(s)).toBe(5);
    s.hits = 2;
    expect(gallLobes(s)).toBe(3);
    expect(gallSpent(s)).toBeLessThan(1);
    const fresh = frame(role, (w) => posed(w, null));
    const spent = frame(role, (w) => {
      posed(w, null).hits = 2;
    });
    expect(spent).not.toBe(fresh);
  });

  it.each(ROLES)("drops it dead once every step is answered, on %s", (role) => {
    const standing = frame(role, (w) => posed(w, null));
    const flat = frame(role, (w) => {
      posed(w, null, 0, 1).phase = "flat";
    });
    expect(flat).not.toBe(standing);
  });

  it("draws the same pose the same way twice", () => {
    const pose = (w: World) => {
      posed(w, LEAP, 1, 1, 2);
    };
    expect(frame("p1", pose)).toBe(frame("p1", pose));
  });
});
