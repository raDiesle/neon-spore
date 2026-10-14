import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { chrysalisReach } from "../src/chrysalis-shape.js";
import { rgba } from "../src/hex.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { showsChrysalisHeart } from "../src/view-role-clocks-c.js";
import { count, frame, hung, posed } from "./chrysalis-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE CHRYSALIS, drawn (`render/src/chrysalis-draw.ts`): every skin in its own
 * tissue on all three screens, the heart on the pilot's alone, a piece off its
 * skin, the cocoon smaller a skin at a time, the peel in green, the regrow in
 * red and the grub dying — set rather than played to;
 * `sim/test/chrysalis.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const L = computeLayout(VIEWPORT, CFG, "test");

describe("THE CHRYSALIS's skins", () => {
  it.each(ROLES)("draws the slime over the hide, its eye spots and its silk, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, "slime"));
    expect(count(drawn, PALETTE.chrysalisSlime)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.chrysalisHideDark)).toBeGreaterThan(0);
    expect(count(drawn, rgba(PALETTE.chrysalisSheen, 0.4))).toBeGreaterThan(0);
  });

  it.each(ROLES)("draws the quills standing out of the hide, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, "quills"));
    expect(count(drawn, PALETTE.chrysalisQuill)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.chrysalisQuillRoot)).toBeGreaterThan(0);
  });

  it.each(ROLES)("draws the sacs, and lights the one swelling, on %s", (role) => {
    const idle = frame(role, (w) => posed(w, "sacs"));
    const swelling = frame(role, (w) =>
      posed(w, "sacs", "skin", (s) => {
        s.sprayBeat = w.beat + 1;
      }),
    );
    expect(count(idle, PALETTE.chrysalisSac)).toBeGreaterThan(0);
    // The swelling sac's spores are lit past the idle ones' glow.
    const still = rgba(PALETTE.chrysalisSpore, 0.45);
    expect(count(swelling, still)).toBeLessThan(count(idle, still));
  });

  it("thins a half of slime turn by turn, and wipes it off", () => {
    const whole = frame("p1", (w) => posed(w, "slime"));
    const rubbed = frame("p1", (w) =>
      posed(w, "slime", "skin", (s) => {
        s.rubbed = [5, 0];
      }),
    );
    const wiped = frame("p1", (w) =>
      posed(w, "slime", "skin", (s) => {
        s.goneMask = 0b01;
      }),
    );
    expect(rubbed).not.toBe(whole);
    expect(count(wiped, PALETTE.chrysalisSlime)).toBeLessThan(count(whole, PALETTE.chrysalisSlime));
  });

  it("takes a quill off for every one ripped, and stands a pulled one out", () => {
    const whole = frame("p1", (w) => posed(w, "quills"));
    const ripped = frame("p1", (w) =>
      posed(w, "quills", "skin", (s) => {
        s.goneMask = 0b0001_0001;
      }),
    );
    const pulled = frame("p1", (w) =>
      posed(w, "quills", "skin", (s) => {
        s.pullMilli = [1200, 0];
      }),
    );
    expect(count(ripped, PALETTE.chrysalisQuill)).toBeLessThan(
      count(whole, PALETTE.chrysalisQuill),
    );
    expect(count(pulled, rgba(PALETTE.chrysalisSpore, 0.7))).toBeGreaterThan(0);
  });

  it("is smaller for every skin peeled, and as big through a skin's second course", () => {
    const s = posed(hung(), "slime");
    for (let cursor = 1; cursor <= s.steps.length; cursor++) {
      s.cursor = cursor - 1;
      const before = chrysalisReach(L, s);
      const was = s.steps[cursor - 1]?.skin;
      s.cursor = cursor;
      const now = chrysalisReach(L, s);
      if (s.steps[cursor]?.skin === was) expect(now).toBe(before);
      else expect(now).toBeLessThan(before);
    }
  });
});

describe("THE CHRYSALIS's heart", () => {
  it("is shown to the pilot, and never to the navigator", () => {
    expect(showsChrysalisHeart("p1")).toBe(true);
    expect(showsChrysalisHeart("p2")).toBe(false);
    expect(showsChrysalisHeart("test")).toBe(true);
    const p1 = frame("p1", (w) => posed(w, "heart"));
    const p2 = frame("p2", (w) => posed(w, "heart"));
    // The heart's veins, lit in the colour it beats in.
    const vein = rgba(PALETTE.red, 0).slice(0, -2);
    expect(count(p1, vein)).toBeGreaterThan(count(p2, vein));
  });

  it("leaves a stitched scar on both screens once shot", () => {
    for (const role of ["p1", "p2"] as const) {
      const open = frame(role, (w) => posed(w, "heart"));
      const shot = frame(role, (w) =>
        posed(w, "heart", "skin", (s) => {
          s.goneMask = 0b001;
        }),
      );
      const scar = rgba(PALETTE.chrysalisRidge, 0.8);
      expect(count(shot, scar)).toBeGreaterThan(count(open, scar));
    }
  });
});

describe("THE CHRYSALIS's skins won and lost", () => {
  it.each(ROLES)("peels a skin off in a green shockwave, on %s", (role) => {
    const lit = frame(role, (w) => posed(w, "quills"));
    const shed = frame(role, (w) => posed(w, "quills", "shed"));
    expect(count(shed, PALETTE.good)).toBeGreaterThan(count(lit, PALETTE.good));
  });

  it.each(ROLES)("grows a skin back ringed in red, on %s", (role) => {
    const lit = frame(role, (w) => posed(w, "quills"));
    const regrow = frame(role, (w) => posed(w, "quills", "regrow"));
    expect(count(regrow, PALETTE.red)).toBeGreaterThan(count(lit, PALETTE.red));
  });

  it("bares the grub once the last skin is off, and lets it die", () => {
    const drawn = frame("p1", (w) => {
      const s = posed(w, "heart", "spent");
      s.cursor = s.steps.length;
    });
    expect(count(drawn, PALETTE.chrysalisSpore)).toBeGreaterThan(0);
  });
});
