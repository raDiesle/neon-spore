import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { PALETTE } from "../src/palette.js";
import { showsLampreyHand } from "../src/view-role-clocks-c.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";
import { BITE, count, frame, GULLET, posed } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LAMPREY, drawn (`render/src/lamprey-draw.ts`): the eel bitten onto the
 * hull, its ring of bone teeth with one lit, a socket for each tooth out, the
 * hull's red scar under a bite, and the gullet lit in a shot's colour only
 * while it is reared — on all three screens, set rather than played to;
 * `sim/test/lamprey.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

describe("THE LAMPREY's body", () => {
  it.each(ROLES)("draws the hide, the teeth and the mouth, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w));
    expect(count(drawn, PALETTE.lampreyHide)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.lampreyTooth)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.lampreyMouth)).toBeGreaterThan(0);
  });

  it.each(ROLES)("leaves a socket for each tooth knocked out, on %s", (role) => {
    const all = frame(role, (w) => posed(w));
    const gapped = frame(role, (w) =>
      posed(w, "bite", BITE, (s) => {
        s.teethOut = 0b0110110;
        s.pulled = [];
      }),
    );
    expect(count(gapped, PALETTE.lampreyMouth)).toBeGreaterThan(count(all, PALETTE.lampreyMouth));
  });

  it.each(ROLES)("scars the hull in its own red only while it bites, on %s", (role) => {
    const deep = (s: { biteMilli: number }) => {
      s.biteMilli = 600;
    };
    const biting = frame(role, (w) => posed(w, "bite", BITE, deep));
    const loose = frame(role, (w) => posed(w, "loose", BITE, deep));
    expect(count(biting, PALETTE.red)).toBeGreaterThan(count(loose, PALETTE.red));
  });

  it.each(ROLES)("lights the gullet in the shot's colour only while reared, on %s", (role) => {
    const reared = frame(role, (w) => posed(w, "rearing", GULLET));
    const recoiling = frame(role, (w) => posed(w, "recoil", GULLET));
    expect(count(reared, PALETTE.redRim)).toBeGreaterThan(count(recoiling, PALETTE.redRim));
    expect(count(recoiling, PALETTE.lampreyGullet)).toBeGreaterThan(0);
    expect(
      count(
        frame(role, (w) => posed(w)),
        PALETTE.lampreyGullet,
      ),
    ).toBe(0);
  });
});

describe("THE LAMPREY's hands, split by seat", () => {
  it("gives the jaw to the pinner and the tooth to the other, and both to test", () => {
    expect(showsLampreyHand("p1", 1)).toBe(true);
    expect(showsLampreyHand("p2", 1)).toBe(false);
    expect(showsLampreyHand("p2", 2)).toBe(true);
    expect(showsLampreyHand("test", 1)).toBe(true);
    expect(showsLampreyHand("test", 2)).toBe(true);
  });
});
