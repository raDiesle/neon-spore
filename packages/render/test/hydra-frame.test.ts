import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { rgba } from "../src/hex.js";
import { hydraReach, hydraWound } from "../src/hydra-shape.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { showsHydraFire, showsHydraMaw } from "../src/view-role-clocks-c.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { count, frame, hung, posed } from "./hydra-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE HYDRA, drawn (`render/src/hydra-draw.ts`): every kind of head in its
 * own picture on all three screens, the maws crossed between the two seats,
 * a head stopped on the body, the body smaller a level at a time and its
 * crown a stump more, and the body beaten — set rather than played to;
 * `sim/test/hydra.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const L = computeLayout(VIEWPORT, CFG, "test");

describe("THE HYDRA's heads", () => {
  it.each(ROLES)("draws the biting necks, their fangs and their gullets, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, "bite"));
    expect(count(drawn, PALETTE.hydraHide)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.hydraFang)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.hydraGullet)).toBeGreaterThan(0);
  });

  it("cuts into a neck as the swipe goes across, and leaves a stump once cut", () => {
    const whole = frame("p1", (w) => posed(w, "bite"));
    const going = frame("p1", (w) =>
      posed(w, "bite", "heads", (s) => {
        s.down = [true, false];
        s.cutMilli = [CFG.hydraCutMilli / 2, 0];
      }),
    );
    const cut = frame("p1", (w) =>
      posed(w, "bite", "heads", (s) => {
        s.goneMask = 0b0001;
      }),
    );
    expect(count(going, PALETTE.hydraIchor)).toBeGreaterThan(count(whole, PALETTE.hydraIchor));
    expect(count(cut, PALETTE.hydraStump)).toBeGreaterThan(count(whole, PALETTE.hydraStump));
    expect(count(cut, PALETTE.hydraFang)).toBeLessThan(count(whole, PALETTE.hydraFang));
  });

  it.each(ROLES)(
    "winds a coil on each side, a ring fewer for every lap turned off, on %s",
    (role) => {
      const s = posed(hung(), "coil");
      const laps = s.steps[s.cursor]?.laps ?? 1;
      const full = hydraWound(CFG, s, 0, laps);
      s.unwoundMilli = [2000, 0];
      expect(hydraWound(CFG, s, 0, laps)).toBeLessThan(full);
      const whole = frame(role, (w) => posed(w, "coil"));
      const turned = frame(role, (w) =>
        posed(w, "coil", "heads", (st) => {
          st.unwoundMilli = [3000, 3000];
        }),
      );
      expect(count(whole, PALETTE.hydraHide)).toBeGreaterThan(0);
      expect(turned).not.toBe(whole);
    },
  );

  it.each(ROLES)("opens one eye a side at a time, and puts a tapped one out, on %s", (role) => {
    const asleep = frame(role, (w) => posed(w, "eye"));
    const awake = frame(role, (w) =>
      posed(w, "eye", "heads", (s) => {
        s.lidOpen = [true, true];
        s.blinkBeat = [w.beat + CFG.hydraStareBeats - 1, w.beat + CFG.hydraStareBeats - 1];
      }),
    );
    const out = frame(role, (w) =>
      posed(w, "eye", "heads", (s) => {
        s.goneMask = 0b0011;
      }),
    );
    // A shut eye's lash line, one fewer on each side with its eye open.
    const lash = rgba(PALETTE.hydraIris, 0.35);
    expect(count(awake, lash)).toBeLessThan(count(asleep, lash));
    expect(count(out, PALETTE.hydraStump)).toBeGreaterThan(count(asleep, PALETTE.hydraStump));
  });
});

describe("THE HYDRA's maws, crossed", () => {
  it("shows the navigator which maw is open, and the pilot the fire's colour", () => {
    expect(showsHydraMaw("p1")).toBe(false);
    expect(showsHydraMaw("p2")).toBe(true);
    expect(showsHydraMaw("test")).toBe(true);
    expect(showsHydraFire("p1")).toBe(true);
    expect(showsHydraFire("p2")).toBe(false);
    expect(showsHydraFire("test")).toBe(true);
    // The script's first maw burns red.
    const p1 = frame("p1", (w) => posed(w, "maw"));
    const p2 = frame("p2", (w) => posed(w, "maw"));
    const red = rgba(PALETTE.red, 0).slice(0, -2);
    expect(count(p1, red)).toBeGreaterThan(count(p2, red));
    expect(count(p2, PALETTE.hydraFire)).toBeGreaterThan(count(p1, PALETTE.hydraFire));
  });

  it("leaves a smoking stump on both screens once quenched", () => {
    for (const role of ["p1", "p2"] as const) {
      const open = frame(role, (w) => posed(w, "maw"));
      const quenched = frame(role, (w) =>
        posed(w, "maw", "heads", (s) => {
          s.goneMask = 0b001;
        }),
      );
      expect(count(quenched, PALETTE.hydraStump)).toBeGreaterThan(count(open, PALETTE.hydraStump));
    }
  });
});

describe("THE HYDRA's levels won and lost", () => {
  it("is smaller for every level stopped, its crown a stump more", () => {
    const s = posed(hung(), "bite");
    for (let cursor = 1; cursor < s.steps.length; cursor++) {
      s.cursor = cursor - 1;
      const before = hydraReach(L, s);
      s.cursor = cursor;
      expect(hydraReach(L, s)).toBeLessThan(before);
    }
    const first = frame("p1", (w) => posed(w, "bite"));
    const later = frame("p1", (w) => posed(w, "maw"));
    expect(count(later, PALETTE.hydraStump)).toBeGreaterThan(count(first, PALETTE.hydraStump));
  });

  it.each(ROLES)("rears back between two levels and grows the next heads, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, "coil", "rear"));
    expect(count(drawn, PALETTE.hydraHide)).toBeGreaterThan(0);
  });

  it("draws no heads once beaten, and sinks the body away", () => {
    const lit = frame("p1", (w) => posed(w, "maw"));
    const spent = frame("p1", (w) => {
      const s = posed(w, "maw", "spent", () => {}, 1);
      s.cursor = s.steps.length;
    });
    expect(count(spent, PALETTE.hydraFang)).toBe(0);
    expect(count(spent, PALETTE.hydraHide)).toBeLessThan(count(lit, PALETTE.hydraHide));
  });
});
