import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol } from "@neon-spore/sim";
import { fieldX } from "../src/field-flip.js";
import { mixHex, rgba } from "../src/hex.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { TrapezeFx } from "../src/trapeze-fx.js";
import { trapezeAsked, trapezeLay, trapezeSpindleGlow } from "../src/trapeze-pose.js";
import { trapezeTip } from "../src/trapeze-shape.js";
import { showsTrapezeHand } from "../src/view-role-clocks-c.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { CATCH, count, FIRE, frame, posed, stood } from "./trapeze-harness.js";

/** The shot's colour as the lit core is drawn in it: `drawLitCore`'s light and
 * ring are `rgba` of it, whatever the beat, and a gradient's stops are not in
 * the stub's log, so it is counted by its prefix (`lit-core.ts`). */
const CYAN_LIT = rgba(PALETTE.cyan, 0).slice(0, -2);

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE TRAPEZE, drawn (`render/src/trapeze-draw.ts`): the spindle over the
 * middle column, the boom hanging from it with its tip over the flag's
 * column on either screen, the canvas brightening with the catches, the
 * freeze ring and the draw's track split by seat, the spindle's studs lit in
 * a shot's colour, and the flag eased into stillness rather than put there —
 * on all three screens, set rather than played to; `sim/test/trapeze.test.ts`
 * proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const L = computeLayout(VIEWPORT, CFG, "test");
const TAN = mixHex(PALETTE.trapezeCanvas, PALETTE.trapezeCanvasCaught, 0);
const CAUGHT = mixHex(PALETTE.trapezeCanvas, PALETTE.trapezeCanvasCaught, 1);

describe("THE TRAPEZE's body", () => {
  it.each(ROLES)("draws the spindle, the boom and the flag, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, null));
    expect(count(drawn, PALETTE.trapezeSteel)).toBeGreaterThan(0);
    expect(count(drawn, TAN)).toBeGreaterThan(0);
  });

  it("hangs the boom's tip over the flag's column, turned with the field", () => {
    const mid = midCol(CFG);
    for (const role of ROLES) {
      const l = computeLayout(VIEWPORT, CFG, role);
      expect(trapezeTip(l, CFG, 1000).x).toBeCloseTo(fieldX(l, mid + 1), 6);
      expect(trapezeTip(l, CFG, -1000).x).toBeCloseTo(fieldX(l, mid - 1), 6);
      expect(trapezeTip(l, CFG, 0).x).toBeCloseTo(fieldX(l, mid), 6);
    }
  });

  it.each(ROLES)("brightens the canvas once both catches are in, on %s", (role) => {
    const loose = frame(role, (w) => posed(w, null));
    const caught = frame(role, (w) => posed(w, null, 0, (s) => (s.catches = 2)));
    expect(count(loose, CAUGHT)).toBe(0);
    expect(count(caught, CAUGHT)).toBeGreaterThan(0);
  });

  it.each(ROLES)(
    "lights the spindle's studs in a shot's colour only while one is owed, on %s",
    (role) => {
      const lit = (s: { spindleLit: boolean }) => (s.spindleLit = true);
      const between = frame(role, (w) => posed(w, null, 0, lit));
      const owed = frame(role, (w) => posed(w, FIRE, 0, lit));
      // The navigator's panel is cyan on every screen; the studs are cyan on top of it.
      expect(count(owed, CYAN_LIT)).toBeGreaterThan(count(between, CYAN_LIT));
    },
  );

  it("dims the spindle while it is guarded, the flag creeping loose", () => {
    const s = posed(stood(), { ...CATCH, ask: "recatch", freezer: "either" }, 0, (x) => {
      x.spindleLit = true;
    });
    expect(trapezeSpindleGlow(s)).toBeLessThan(1);
    s.phase = "rest";
    expect(trapezeSpindleGlow(s)).toBe(1);
  });
});

describe("THE TRAPEZE's hands, split by the step", () => {
  it("shows each seat's own hand full, and both on test", () => {
    expect(showsTrapezeHand("p1", 1)).toBe(true);
    expect(showsTrapezeHand("p2", 1)).toBe(false);
    expect(showsTrapezeHand("p2", 2)).toBe(true);
    expect(showsTrapezeHand("p1", 2)).toBe(false);
    expect(showsTrapezeHand("test", 1) && showsTrapezeHand("test", 2)).toBe(true);
  });

  it.each(ROLES)("draws the ring and the track on a lit catch and not at rest, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, null));
    const asked = frame(role, (w) => posed(w, CATCH));
    expect(asked.length).toBeGreaterThan(resting.length);
  });

  it("draws the first catch's marks differently for the freezer and the drawer", () => {
    const p1 = frame("p1", (w) => posed(w, CATCH));
    const p2 = frame("p2", (w) => posed(w, CATCH));
    expect(p1).not.toBe(p2);
  });
});

describe("THE TRAPEZE's flag, eased", () => {
  it("is asked to stay on its place frozen, and spread across the beat while it swings", () => {
    const s = posed(stood(), CATCH, 0);
    expect(trapezeAsked(s, CFG, 0.5)).toBe(0);
    expect(trapezeAsked(s, CFG, 1)).toBeGreaterThan(0);
    expect(trapezeAsked(s, CFG, 0)).toBeLessThan(0);
    s.frozenBeats = 2;
    expect(trapezeAsked(s, CFG, 1)).toBe(0);
  });

  it("turns back off either end of the span rather than running past it", () => {
    const s = posed(stood(), CATCH, CFG.trapezeSpanMilli);
    for (const phase of [0, 0.25, 0.5, 0.75, 1]) {
      expect(Math.abs(trapezeAsked(s, CFG, phase))).toBeLessThanOrEqual(CFG.trapezeSpanMilli);
    }
  });

  it("puts the flag where it is asked on the first frame, and eases it there after", () => {
    const fx = new TrapezeFx();
    fx.flag.aim(400);
    expect(fx.flag.swing).toBe(400);
    fx.flag.aim(-600);
    fx.update(1 / 60);
    expect(fx.flag.swing).toBeLessThan(400);
    expect(fx.flag.swing).toBeGreaterThan(-600);
    for (let i = 0; i < 120; i++) fx.update(1 / 60);
    expect(fx.flag.swing).toBeCloseTo(-600, 0);
  });

  it("streams the flag behind the way it goes, and lets it fall limp as it stops", () => {
    const fx = new TrapezeFx();
    fx.flag.aim(-1000);
    for (let i = 0; i < 30; i++) {
      fx.flag.aim(-1000 + i * 60);
      fx.update(1 / 60);
    }
    // Going toward the higher columns, it trails toward the lower.
    expect(fx.flag.lean).toBeLessThan(-0.3);
    for (let i = 0; i < 120; i++) fx.update(1 / 60);
    expect(Math.abs(fx.flag.lean)).toBeLessThan(0.05);
  });

  it("flutters long and slow for a swipe that caught nothing, and it dies away", () => {
    const fx = new TrapezeFx();
    fx.flag.aim(0);
    const still = trapezeLay(fx, 1, 2);
    fx.ingest([{ type: "trapezeFlutter", side: 1, col: 4 }], L, CFG, 0.5, () => {});
    expect(fx.limp).toBe(1);
    expect(trapezeLay(fx, 1, 2).ripple).toBeGreaterThan(still.ripple);
    for (let i = 0; i < 180; i++) fx.update(1 / 60);
    expect(fx.limp).toBe(0);
  });

  it("is left indistinguishable from a fresh one by a clear", () => {
    const fx = new TrapezeFx();
    fx.flag.aim(300);
    fx.flag.aim(-300);
    fx.ingest([{ type: "trapezeFlutter", side: 0, col: 4 }], L, CFG, 0.5, () => {});
    fx.update(1 / 60);
    expect(fx).not.toEqual(new TrapezeFx());
    fx.clear();
    expect(fx).toEqual(new TrapezeFx());
  });
});
