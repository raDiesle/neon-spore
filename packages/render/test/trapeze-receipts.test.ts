import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { TrapezeState, World } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { TrapezeFx } from "../src/trapeze-fx.js";
import { trapezeLay } from "../src/trapeze-pose.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { CATCH, count, FIRE, frame, posed } from "./trapeze-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What THE TRAPEZE's receipts leave for a moment after
 * (`render/src/trapeze-fx.ts`, drawn by `trapeze-draw.ts`,
 * `trapeze-receipts.ts` and `trapeze-pose.ts`): a freeze's snap, a catch's
 * crack and pull taut, a tap off the mark's shiver, the spindle lighting and
 * its flash on a hit — on all three screens, each against the same pose with
 * no receipt thrown.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const L = computeLayout(VIEWPORT, CFG, "test");
const lit = (s: TrapezeState) => {
  s.spindleLit = true;
  s.catches = 2;
};
const firing = (w: World) => void posed(w, FIRE, 0, lit);

describe("THE TRAPEZE's receipts", () => {
  it.each(ROLES)("throws a ring off the mark for a freeze that landed, on %s", (role) => {
    const plain = frame(role, (w) => posed(w, CATCH));
    const froze = frame(role, (w) => posed(w, CATCH), { type: "trapezeFreeze", side: 0, col: 3 });
    expect(count(froze, PALETTE.hullRim)).toBeGreaterThan(count(plain, PALETTE.hullRim));
  });

  it.each(ROLES)("cracks the flag taut on a catch, and reddens it, on %s", (role) => {
    const plain = frame(role, (w) => posed(w, CATCH));
    const caught = frame(role, (w) => posed(w, CATCH), {
      type: "trapezeCatch",
      side: 1,
      catches: 1,
      col: 3,
    });
    expect(count(caught, PALETTE.hullRim)).toBeGreaterThan(count(plain, PALETTE.hullRim));
    expect(count(caught, PALETTE.redRim)).toBeGreaterThan(count(plain, PALETTE.redRim));
  });

  it.each(ROLES)(
    "shivers the canvas for a tap off the mark and sags it for a sway, on %s",
    (role) => {
      const plain = frame(role, (w) => posed(w, CATCH));
      const flapped = frame(role, (w) => posed(w, CATCH), { type: "trapezeFlap", side: 0, col: 3 });
      const swayed = frame(role, (w) => posed(w, CATCH), { type: "trapezeSway", col: 3 });
      expect(flapped).not.toBe(plain);
      expect(swayed).not.toBe(plain);
    },
  );

  it.each(ROLES)("flares the spindle as both catches are in, on %s", (role) => {
    const plain = frame(role, (w) => posed(w, null, 0, lit));
    const lights = frame(role, (w) => posed(w, null, 0, lit), { type: "trapezeSpindle", col: 4 });
    expect(count(lights, PALETTE.hullRim)).toBeGreaterThan(count(plain, PALETTE.hullRim));
  });

  it.each(ROLES)("flashes the spindle white on a hit, and reddens it, on %s", (role) => {
    const plain = frame(role, firing);
    const hit = frame(role, firing, { type: "trapezeHit", hits: 1, col: 4 });
    expect(count(hit, PALETTE.hullRim)).toBeGreaterThan(count(plain, PALETTE.hullRim));
    expect(count(hit, PALETTE.redRim)).toBeGreaterThan(count(plain, PALETTE.redRim));
  });

  it("pulls the flag open and flat on a catch, and lets it go", () => {
    const fx = new TrapezeFx();
    const still = trapezeLay(fx, 1, 2);
    fx.ingest([{ type: "trapezeCatch", side: 1, catches: 1, col: 3 }], L, CFG, 0.5, () => {});
    const taut = trapezeLay(fx, 1, 2);
    expect(taut.open).toBe(1);
    expect(taut.ripple).toBeLessThan(still.ripple);
    for (let i = 0; i < 120; i++) fx.update(1 / 60);
    expect(fx.taut).toBe(0);
  });

  it("bursts a hit in the colour the drawer told it", () => {
    const fx = new TrapezeFx();
    const colours: string[] = [];
    fx.tell(PALETTE.cyanRim);
    fx.ingest([{ type: "trapezeHit", hits: 1, col: 4 }], L, CFG, 0.5, (_x, _y, _n, c) => {
      colours.push(c);
    });
    expect(colours).toEqual([PALETTE.cyanRim]);
  });

  it("forgets every receipt on a clear", () => {
    const fx = new TrapezeFx();
    fx.flag.aim(300);
    fx.ingest(
      [
        { type: "trapezeFreeze", side: 0, col: 3 },
        { type: "trapezeFlap", side: 0, col: 3 },
        { type: "trapezeCatch", side: 1, catches: 1, col: 3 },
        { type: "trapezeSpindle", col: 4 },
        { type: "trapezeHit", hits: 1, col: 4 },
      ],
      L,
      CFG,
      0.5,
      () => {},
    );
    expect(fx.snap.now).toBe(1);
    fx.clear();
    expect(fx).toEqual(new TrapezeFx());
  });
});
