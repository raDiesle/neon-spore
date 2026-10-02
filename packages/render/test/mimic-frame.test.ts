import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { rgba } from "../src/hex.js";
import { PALETTE } from "../src/palette.js";
import { showsMimicPad, showsMimicSign } from "../src/view-role-clocks-c.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";
import { CORE, count, frame, posed, SPLIT } from "./mimic-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MIMIC, drawn (`render/src/mimic-draw.ts`): the mantle and its mottle on
 * every screen; the sign on the reader's screen and never the drawer's, the
 * pad on the drawer's and never the reader's; a split's two signs one to
 * each screen; a mimicked sign in the hull's red on both; and the core lit
 * only while it is bare to be shot — set rather than played to;
 * `sim/test/mimic*.test.ts` prove the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

/** The pad's faint ink: the sign's cyan, laid as `rgba` and so never the sign's own hex. */
const PAD = rgba(PALETTE.mimicSign, 0).replace(/,0\)$/, "");

describe("THE MIMIC's body", () => {
  it.each(ROLES)("draws the skin, the mottle and the outline, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w));
    expect(count(drawn, PALETTE.mimicSkin)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.mimicMottle)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.mimicSkinDark)).toBeGreaterThan(0);
  });

  it("shows the sign to the reader and the pad to the drawer, never the other way", () => {
    // The pilot reads; the navigator draws.
    const reader = frame("p1", (w) => posed(w));
    const drawer = frame("p2", (w) => posed(w));
    expect(count(reader, PALETTE.mimicSign)).toBeGreaterThan(0);
    expect(count(drawer, PALETTE.mimicSign)).toBe(0);
    expect(count(drawer, PAD)).toBeGreaterThan(0);
    expect(count(reader, PAD)).toBe(0);
    const both = frame("test", (w) => posed(w));
    expect(count(both, PALETTE.mimicSign)).toBeGreaterThan(0);
    expect(count(both, PAD)).toBeGreaterThan(0);
  });

  it("gives each screen one sign of a split, and the test screen both", () => {
    const p1 = count(
      frame("p1", (w) => posed(w, "sign", SPLIT)),
      PALETTE.mimicSign,
    );
    const p2 = count(
      frame("p2", (w) => posed(w, "sign", SPLIT)),
      PALETTE.mimicSign,
    );
    const test = count(
      frame("test", (w) => posed(w, "sign", SPLIT)),
      PALETTE.mimicSign,
    );
    expect(p1).toBeGreaterThan(0);
    expect(p2).toBe(p1);
    expect(test).toBe(p1 + p2);
  });

  it("takes a peeled half's sign off the screen that read it", () => {
    const peeled = frame("p1", (w) =>
      posed(w, "sign", SPLIT, (s) => {
        s.peeled = [true, false];
      }),
    );
    expect(count(peeled, PALETTE.mimicSign)).toBeGreaterThan(0);
    const both = frame("p1", (w) =>
      posed(w, "sign", SPLIT, (s) => {
        s.peeled = [false, true];
      }),
    );
    // The pilot reads the navigator's half: with that half peeled, nothing is left to read.
    expect(count(both, PALETTE.mimicSign)).toBe(0);
  });

  it.each(ROLES)("wears what was drawn wrong in the hull's red, on %s", (role) => {
    const wrong = frame(role, (w) =>
      posed(w, "mimicking", undefined, (s) => {
        s.drawn = [-1, 3];
      }),
    );
    const mottled = frame(role, (w) => posed(w, "mimicking"));
    expect(count(wrong, rgba(PALETTE.red, 0.9))).toBeGreaterThan(0);
    expect(count(mottled, rgba(PALETTE.red, 0.9))).toBe(0);
    expect(count(wrong, PALETTE.mimicSign)).toBe(0);
  });

  it.each(ROLES)("lights the core in its colour only while it is bare, on %s", (role) => {
    const bare = frame(role, (w) => posed(w, "core", CORE));
    const whole = frame(role, (w) => posed(w, "rolling", { ...CORE, ask: "roll", beats: 2 }));
    expect(count(bare, PALETTE.redRim)).toBeGreaterThan(count(whole, PALETTE.redRim));
    expect(count(bare, PALETTE.mimicCore)).toBeGreaterThan(0);
  });
});

describe("THE MIMIC's split, by seat", () => {
  it("shows a seat's sign to the other seat and its pad to itself, and both to test", () => {
    expect(showsMimicSign("p1", 2)).toBe(true);
    expect(showsMimicSign("p2", 2)).toBe(false);
    expect(showsMimicPad("p2", 2)).toBe(true);
    expect(showsMimicPad("p1", 2)).toBe(false);
    expect(showsMimicSign("test", 1)).toBe(true);
    expect(showsMimicPad("test", 1)).toBe(true);
  });
});
