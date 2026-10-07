import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { PALETTE } from "../src/palette.js";
import { showsLampreyHand } from "../src/view-role-clocks-c.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";
import { BITE, count, frame, GULLET, PULL, posed } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LAMPREY, drawn (`render/src/lamprey-draw.ts`): the eel bitten into a
 * tile, its ring of bone teeth with one lit, a socket for each tooth out, the
 * knobs on its tail and head while a bite asks for them, and the gullet lit
 * in a shot's colour only while it is reared — on all three screens, set
 * rather than played to;
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

  it.each(ROLES)(
    "draws its skin: the gills, the fin and fringe, the eyes, the gums, on %s",
    (role) => {
      const drawn = frame(role, (w) => posed(w));
      expect(count(drawn, PALETTE.lampreyGill)).toBeGreaterThan(0);
      expect(count(drawn, PALETTE.lampreyFin)).toBeGreaterThan(0);
      expect(count(drawn, PALETTE.lampreyEye)).toBeGreaterThan(0);
      expect(count(drawn, PALETTE.lampreyGum)).toBeGreaterThan(0);
    },
  );

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

  it.each(ROLES)("draws the tail's and the head's knobs only while it bites, on %s", (role) => {
    const biting = frame(role, (w) => posed(w, "bite", PULL));
    const leaping = frame(role, (w) => posed(w, "leap", PULL));
    expect(count(biting, PALETTE.hullRim) + count(biting, PALETTE.dim)).toBeGreaterThan(
      count(leaping, PALETTE.hullRim) + count(leaping, PALETTE.dim),
    );
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
  it("gives the tooth's ring to its own seat, and both to test", () => {
    expect(showsLampreyHand("p1", 1)).toBe(true);
    expect(showsLampreyHand("p2", 1)).toBe(false);
    expect(showsLampreyHand("p2", 2)).toBe(true);
    expect(showsLampreyHand("test", 1)).toBe(true);
    expect(showsLampreyHand("test", 2)).toBe(true);
  });
});
