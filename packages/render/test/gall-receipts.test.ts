import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { World } from "@neon-spore/sim";
import { GallFx } from "../src/gall-fx.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { CLOSE, count, FIRE, frame, posed } from "./gall-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What THE GALL's receipts leave for a moment after (`render/src/gall-fx.ts`,
 * drawn by `gall-draw.ts` and `gall-receipts.ts`): a press's flare, a slip's
 * shudder, a swell's bulge, the ghost a close leaves on the point it left,
 * the lips tearing as the root is bared, and the root's flash — on all three
 * screens, each against the same pose with no receipt thrown.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const L = computeLayout(VIEWPORT, CFG, "test");

function bared(w: World): void {
  const s = posed(w, FIRE);
  s.bared = true;
  s.closes = 3;
}

describe("THE GALL's receipts", () => {
  it.each(ROLES)("lights the nodule's rim white for a press come shut, on %s", (role) => {
    const plain = frame(role, (w) => posed(w, CLOSE));
    const shut = frame(role, (w) => posed(w, CLOSE), { type: "gallPress", point: 0, col: 0 });
    expect(count(shut, PALETTE.hullRim)).toBeGreaterThan(count(plain, PALETTE.hullRim));
  });

  it.each(ROLES)("shudders and bulges the nodule for a slip and a swell, on %s", (role) => {
    const plain = frame(role, (w) => posed(w, CLOSE));
    const slipped = frame(role, (w) => posed(w, CLOSE), { type: "gallSlip", point: 0, col: 0 });
    const swelled = frame(role, (w) => posed(w, CLOSE), { type: "gallSwell", point: 0, col: 0 });
    expect(slipped).not.toBe(plain);
    expect(swelled).not.toBe(plain);
  });

  it.each(ROLES)("leaves a ghost of the nodule on the point a close left, on %s", (role) => {
    const close = { type: "gallClose", from: 0, to: 2, closes: 1, col: 0 } as const;
    const plain = frame(role, (w) => {
      posed(w, null, 2).closes = 1;
    });
    const closed = frame(
      role,
      (w) => {
        posed(w, null, 2).closes = 1;
      },
      close,
    );
    expect(count(closed, PALETTE.gallFlesh)).toBeGreaterThan(count(plain, PALETTE.gallFlesh));
  });

  it.each(ROLES)("tears fibres across the split as the root is bared, on %s", (role) => {
    const plain = frame(role, bared);
    const torn = frame(role, bared, { type: "gallBare", col: 3 });
    expect(count(torn, PALETTE.gallFleshDark)).toBeGreaterThan(count(plain, PALETTE.gallFleshDark));
  });

  it.each(ROLES)("flashes the root white on a hit, and reddens it, on %s", (role) => {
    const plain = frame(role, bared);
    const hit = frame(role, bared, { type: "gallHit", hits: 1, col: 3 });
    expect(count(hit, PALETTE.hullRim)).toBeGreaterThan(count(plain, PALETTE.hullRim));
    expect(count(hit, PALETTE.redRim)).toBeGreaterThan(count(plain, PALETTE.redRim));
  });

  it("forgets every receipt on a clear", () => {
    const fx = new GallFx();
    const burst = () => {};
    fx.ingest(
      [
        { type: "gallPress", point: 0, col: 0 },
        { type: "gallClose", from: 0, to: 1, closes: 1, col: 0 },
        { type: "gallBare", col: 3 },
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
