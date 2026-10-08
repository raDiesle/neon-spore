import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { GallFx } from "../src/gall-fx.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { count, FIRE, frame, LEAP, posed } from "./gall-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What THE GALL's receipts leave for a moment after (`render/src/gall-fx.ts`,
 * drawn by `gall-draw.ts` and `gall-receipts.ts`): a tap's flare, a refused
 * hand's shudder, a landing's bulge, the ghost a leap leaves on the point it
 * left, and a hit's flash — on all three screens, each against the same pose
 * with no receipt thrown.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const L = computeLayout(VIEWPORT, CFG, "test");

describe("THE GALL's receipts", () => {
  it.each(ROLES)("lights the alien's rim white for a tap, on %s", (role) => {
    const plain = frame(role, (w) => posed(w, LEAP, 0, 1, 1));
    const tapped = frame(role, (w) => posed(w, LEAP, 0, 1, 1), {
      type: "gallTap",
      point: 0,
      taps: 1,
      need: 3,
      col: 0,
    });
    expect(count(tapped, PALETTE.hullRim)).toBeGreaterThan(count(plain, PALETTE.hullRim));
  });

  it.each(ROLES)(
    "shudders the alien for a refused hand and bulges it on landing, on %s",
    (role) => {
      const plain = frame(role, (w) => posed(w, LEAP));
      const whiffed = frame(role, (w) => posed(w, LEAP), {
        type: "gallWhiff",
        point: 0,
        why: "early",
        col: 0,
      });
      const landed = frame(role, (w) => posed(w, LEAP), { type: "gallLand", point: 0, col: 0 });
      expect(whiffed).not.toBe(plain);
      expect(landed).not.toBe(plain);
    },
  );

  it.each(ROLES)("leaves a ghost of the alien on the point a leap left, on %s", (role) => {
    const leap = { type: "gallLeap", from: 0, to: 2, leaps: 1, col: 0 } as const;
    const plain = frame(role, (w) => posed(w, null, 2));
    const left = frame(role, (w) => posed(w, null, 2), leap);
    expect(count(left, PALETTE.gallFlesh)).toBeGreaterThan(count(plain, PALETTE.gallFlesh));
  });

  it.each(ROLES)("flashes the alien white on a hit, on %s", (role) => {
    const plain = frame(role, (w) => posed(w, FIRE, 3));
    const hit = frame(role, (w) => posed(w, FIRE, 3), { type: "gallHit", hits: 1, col: 3 });
    expect(hit).not.toBe(plain);
  });

  it("forgets every receipt on a clear", () => {
    const fx = new GallFx();
    const burst = () => {};
    fx.ingest(
      [
        { type: "gallTap", point: 0, taps: 1, need: 3, col: 0 },
        { type: "gallLeap", from: 0, to: 2, leaps: 1, col: 0 },
        { type: "gallLand", point: 2, col: 2 },
        { type: "gallHit", hits: 1, col: 3 },
      ],
      L,
      CFG,
      0.5,
      burst,
    );
    expect(fx.puff.now).toBe(1);
    fx.clear();
    expect(fx).toEqual(new GallFx());
  });
});
