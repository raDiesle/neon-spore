import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { bastionGunAngle } from "@neon-spore/sim";
import { bastionCentre, bastionGunAt, bastionReach } from "../src/bastion-shape.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { showsBastionPort } from "../src/view-role-clocks-c.js";
import { count, frame, posed, stood } from "./bastion-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE BASTION, drawn (`render/src/bastion-draw.ts`): every shell in its own
 * metal on all three screens, the ports on the navigator's alone, a piece
 * off its shell, the moon smaller a shell at a time, the shed in green, the
 * regrow in red and the core blowing — set rather than played to;
 * `sim/test/bastion.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const L = computeLayout(VIEWPORT, CFG, "test");

describe("THE BASTION's shells", () => {
  it.each(ROLES)("draws the armour, its tower and its keel, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, "plates"));
    expect(count(drawn, PALETTE.bastionArmour)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.bastionArmourDark)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.bastionLight)).toBeGreaterThan(0);
  });

  it.each(ROLES)("draws the gun ring with its guns in their colours, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, "ring"));
    expect(count(drawn, PALETTE.bastionBand)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.red)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.cyan)).toBeGreaterThan(0);
  });

  it.each(ROLES)("draws the cage and lights the charging node, on %s", (role) => {
    const idle = frame(role, (w) => posed(w, "lattice"));
    const charging = frame(role, (w) =>
      posed(w, "lattice", "layer", (s) => {
        s.dischargeBeat = w.beat + 2;
      }),
    );
    expect(count(idle, PALETTE.bastionStrut)).toBeGreaterThan(0);
    expect(count(charging, PALETTE.bastionNode)).toBeGreaterThan(count(idle, PALETTE.bastionNode));
  });

  it.each(ROLES)("draws the inner hull, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, "port"));
    expect(count(drawn, PALETTE.bastionHull)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.bastionHullDark)).toBeGreaterThan(0);
  });

  it("takes a plate off the armour for every one torn", () => {
    const whole = frame("p1", (w) => posed(w, "plates"));
    const torn = frame("p1", (w) =>
      posed(w, "plates", "layer", (s) => {
        s.goneMask = 0b0001_0001;
      }),
    );
    expect(count(torn, PALETTE.bastionArmour)).toBeLessThan(count(whole, PALETTE.bastionArmour));
  });

  it("is smaller for every shell taken off", () => {
    const s = posed(stood(), "plates");
    const sizes: number[] = [];
    for (let cursor = 0; cursor <= s.steps.length; cursor++) {
      s.cursor = cursor;
      sizes.push(bastionReach(L, s));
    }
    for (let k = 1; k < sizes.length; k++) expect(sizes[k]).toBeLessThan(sizes[k - 1] ?? 0);
  });

  it("brings the gun the rim turned round to the front, over the middle", () => {
    const s = posed(stood(), "ring", "layer", (b) => {
      b.yawMilli = 300_000;
    });
    const c = bastionCentre(L, CFG);
    const front = bastionGunAt(L, c, bastionGunAngle(s, 1, 6));
    expect(Math.abs(front.x - c.x)).toBeLessThan(1);
    expect(front.depth).toBeCloseTo(1);
  });
});

describe("THE BASTION's port", () => {
  it("is shown to the navigator, and never to the pilot", () => {
    expect(showsBastionPort("p1")).toBe(false);
    expect(showsBastionPort("p2")).toBe(true);
    const p1 = frame("p1", (w) => posed(w, "port"));
    const p2 = frame("p2", (w) => posed(w, "port"));
    expect(count(p2, PALETTE.bastionCore)).toBeGreaterThan(count(p1, PALETTE.bastionCore));
  });

  it("leaves a crater on both screens once shot", () => {
    for (const role of ["p1", "p2"] as const) {
      const shut = frame(role, (w) => posed(w, "port"));
      const shot = frame(role, (w) =>
        posed(w, "port", "layer", (s) => {
          s.goneMask = 0b001;
        }),
      );
      expect(count(shot, PALETTE.bastionLight)).toBeGreaterThan(count(shut, PALETTE.bastionLight));
    }
  });
});

describe("THE BASTION's steps won and lost", () => {
  it.each(ROLES)("flings a shell off in a green shockwave, on %s", (role) => {
    const lit = frame(role, (w) => posed(w, "ring"));
    const shed = frame(role, (w) => posed(w, "ring", "shed"));
    expect(count(shed, PALETTE.good)).toBeGreaterThan(count(lit, PALETTE.good));
  });

  it.each(ROLES)("grows a shell back ringed in red, on %s", (role) => {
    const lit = frame(role, (w) => posed(w, "plates"));
    const regrow = frame(role, (w) => posed(w, "plates", "regrow"));
    expect(count(regrow, PALETTE.red)).toBeGreaterThan(count(lit, PALETTE.red));
  });

  it("blows the core once the last shell is off", () => {
    const drawn = frame("p1", (w) => {
      const s = posed(w, "port", "spent");
      s.cursor = s.steps.length;
    });
    expect(count(drawn, PALETTE.bastionCore)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.bastionHull)).toBeGreaterThan(0);
  });
});
