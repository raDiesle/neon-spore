import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { World } from "@neon-spore/sim";
import {
  gallBearing,
  gallHeld,
  gallLobes,
  gallPart,
  gallPinch,
  gallSpent,
} from "../src/gall-pose.js";
import { gallPointAt } from "../src/gall-shape.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { showsGallReach } from "../src/view-role-clocks-c.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { CLOSE, count, FIRE, frame, posed, stood } from "./gall-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GALL, drawn (`render/src/gall-draw.ts`): the seam and its four scars,
 * the nodule on its point heeled toward its pincher's end, the pinch's
 * chevrons full on that seat's screen and faint on the other's, the nodule
 * squeezed by the gap and pressed down by the beats kept shut, a lobe fewer
 * for every close, the seam peeled open over the root and the root lit in a
 * shot's colour, and the seam smoothed flat — on all three screens, set
 * rather than played to; `sim/test/gall.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

describe("THE GALL's seam", () => {
  it.each(ROLES)("draws the seam and the nodule on it, on %s", (role) => {
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

  it.each(ROLES)("moves the nodule to the point it jumped to, on %s", (role) => {
    const here = frame(role, (w) => posed(w, null, 0));
    const there = frame(role, (w) => posed(w, null, 2));
    expect(there).not.toBe(here);
  });

  it("heels the nodule toward its pincher's end, and turns the heel over with the field", () => {
    const world = stood();
    const s = posed(world, CLOSE, 0);
    expect(gallBearing(s, false)).toBe(Math.PI);
    expect(gallBearing(s, true)).toBe(0);
    s.point = 3;
    expect(gallBearing(s, false)).toBe(0);
    expect(gallBearing(s, true)).toBe(Math.PI);
  });
});

describe("THE GALL's pinch mark, split by seat", () => {
  it("is full on the screen of the seat whose half the gall is on, and on test", () => {
    expect(showsGallReach("p1", 1)).toBe(true);
    expect(showsGallReach("p2", 1)).toBe(false);
    expect(showsGallReach("p2", 2)).toBe(true);
    expect(showsGallReach("p1", 2)).toBe(false);
    expect(showsGallReach("test", 1) && showsGallReach("test", 2)).toBe(true);
  });

  it.each(ROLES)("draws the chevrons on a lit close and not at rest, on %s", (role) => {
    // On p2 the gall on point 0 is the pilot's, so its mark there is the
    // faint plain line with no glow: drawn, but in no hex of its own.
    const resting = frame(role, (w) => posed(w, null));
    const asked = frame(role, (w) => posed(w, CLOSE));
    expect(asked).not.toBe(resting);
  });

  it("glows on the pilot's screen for the left half and not for the right", () => {
    const mine = frame("p1", (w) => posed(w, CLOSE, 1));
    const hers = frame("p1", (w) => posed(w, CLOSE, 2));
    expect(count(mine, PALETTE.hullRim)).toBeGreaterThan(count(hers, PALETTE.hullRim));
  });

  it("glows on the navigator's screen for the right half and not for the left", () => {
    const mine = frame("p2", (w) => posed(w, CLOSE, 2));
    const his = frame("p2", (w) => posed(w, CLOSE, 1));
    expect(count(mine, PALETTE.hullRim)).toBeGreaterThan(count(his, PALETTE.hullRim));
  });

  it("glows for either half on the test screen", () => {
    const left = frame("test", (w) => posed(w, CLOSE, 1));
    const right = frame("test", (w) => posed(w, CLOSE, 2));
    expect(count(left, PALETTE.hullRim)).toBe(count(right, PALETTE.hullRim));
  });
});

describe("THE GALL's body, deformed by the answer", () => {
  it("squeezes by the gap, from nought wide open to one at shut", () => {
    const world = stood();
    const s = posed(world, CLOSE);
    expect(gallPinch(s, world.cfg)).toBe(0);
    s.gapMilli = world.cfg.gallShutMilli;
    expect(gallPinch(s, world.cfg)).toBe(1);
    s.gapMilli = (world.cfg.gallShutMilli + world.cfg.gallOpenMilli) / 2;
    expect(gallPinch(s, world.cfg)).toBeCloseTo(0.5);
    posed(world, null).gapMilli = world.cfg.gallShutMilli;
    expect(gallPinch(s, world.cfg)).toBe(0);
  });

  it.each(ROLES)("draws a pinched gall narrower than an open one, on %s", (role) => {
    const open = frame(role, (w) => posed(w, CLOSE));
    const pinched = frame(role, (w) => {
      posed(w, CLOSE).gapMilli = w.cfg.gallShutMilli;
    });
    expect(pinched).not.toBe(open);
  });

  it("presses the nodule down by the beats kept shut, and not while the gap is open", () => {
    const world = stood();
    const s = posed(world, CLOSE);
    s.gapMilli = world.cfg.gallShutMilli;
    expect(gallHeld(s, world.cfg, 0)).toBe(0);
    s.heldBeats = 1;
    expect(gallHeld(s, world.cfg, 0)).toBeGreaterThan(0);
    s.gapMilli = world.cfg.gallOpenMilli;
    expect(gallHeld(s, world.cfg, 0.5)).toBe(gallHeld(s, world.cfg, 0));
  });

  it.each(ROLES)("takes a lobe and a sixth of the size for every close, on %s", (role) => {
    const world = stood();
    const s = posed(world, null);
    expect(gallLobes(s)).toBe(5);
    s.closes = 2;
    expect(gallLobes(s)).toBe(3);
    expect(gallSpent(s)).toBeLessThan(1);
    const fresh = frame(role, (w) => posed(w, null));
    const spent = frame(role, (w) => {
      posed(w, null).closes = 2;
    });
    expect(spent).not.toBe(fresh);
  });
});

describe("THE GALL's root", () => {
  it("peels the seam through the rest after the third close, and stands it open for the shot", () => {
    const world = stood();
    const s = posed(world, null, 0, 0);
    expect(gallPart(s, world.cfg, world.beat, 0)).toBe(0);
    s.bared = true;
    s.closes = 3;
    expect(gallPart(s, world.cfg, world.beat, 0)).toBe(0);
    expect(gallPart(s, world.cfg, world.beat + world.cfg.gallRestBeats, 0)).toBe(1);
    posed(world, FIRE).bared = true;
    expect(gallPart(s, world.cfg, world.beat, 0)).toBe(1);
  });

  it.each(ROLES)(
    "lights the bared root in the shot's colour, and hits change it, on %s",
    (role) => {
      const covered = frame(role, (w) => posed(w, FIRE));
      const bared = (w: World) => {
        const s = posed(w, FIRE);
        s.bared = true;
        s.closes = 3;
        return s;
      };
      const lit = frame(role, bared);
      expect(count(lit, PALETTE.cyan)).toBeGreaterThan(count(covered, PALETTE.cyan));
      const hit = frame(role, (w) => {
        bared(w).hits = 1;
      });
      expect(hit).not.toBe(lit);
    },
  );

  it.each(ROLES)("shows the root dull once bared and no shot owed yet, on %s", (role) => {
    const bared = frame(role, (w) => {
      const s = posed(w, null, 0, 4);
      s.bared = true;
      s.closes = 3;
    });
    expect(count(bared, PALETTE.gallRoot)).toBeGreaterThan(0);
  });

  it.each(ROLES)("smooths the seam flat once the root is shot, on %s", (role) => {
    const standing = frame(role, (w) => {
      const s = posed(w, null);
      s.bared = true;
    });
    const flat = frame(role, (w) => {
      const s = posed(w, null, 0, 1);
      s.bared = true;
      s.phase = "flat";
    });
    expect(flat).not.toBe(standing);
  });

  it("draws the same pose the same way twice", () => {
    const pose = (w: World) => {
      posed(w, CLOSE).gapMilli = 1500;
    };
    expect(frame("p1", pose)).toBe(frame("p1", pose));
  });
});
