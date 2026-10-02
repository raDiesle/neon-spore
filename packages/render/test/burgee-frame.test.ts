import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol } from "@neon-spore/sim";
import { BurgeeFx } from "../src/burgee-fx.js";
import { burgeeAsked, burgeeLay, burgeeSpindleGlow } from "../src/burgee-pose.js";
import { burgeeTip } from "../src/burgee-shape.js";
import { fieldX } from "../src/field-flip.js";
import { mixHex, rgba } from "../src/hex.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { showsBurgeeHand } from "../src/view-role-clocks-c.js";
import { CATCH, count, FIRE, frame, posed, stood } from "./burgee-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";

/** The shot's colour as the lit core is drawn in it: `drawLitCore`'s light and
 * ring are `rgba` of it, whatever the beat, and a gradient's stops are not in
 * the stub's log, so it is counted by its prefix (`lit-core.ts`). */
const CYAN_LIT = rgba(PALETTE.cyan, 0).slice(0, -2);

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE BURGEE, drawn (`render/src/burgee-draw.ts`): the spindle over the
 * middle column, the boom hanging from it with its tip over the flag's
 * column on either screen, the canvas brightening with the catches, the
 * freeze ring and the draw's track split by seat, the spindle's studs lit in
 * a shot's colour, and the flag eased into stillness rather than put there —
 * on all three screens, set rather than played to; `sim/test/burgee.test.ts`
 * proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const L = computeLayout(VIEWPORT, CFG, "test");
const TAN = mixHex(PALETTE.burgeeCanvas, PALETTE.burgeeCanvasCaught, 0);
const CAUGHT = mixHex(PALETTE.burgeeCanvas, PALETTE.burgeeCanvasCaught, 1);

describe("THE BURGEE's body", () => {
  it.each(ROLES)("draws the spindle, the boom and the flag, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, null));
    expect(count(drawn, PALETTE.burgeeSteel)).toBeGreaterThan(0);
    expect(count(drawn, TAN)).toBeGreaterThan(0);
  });

  it("hangs the boom's tip over the flag's column, turned with the field", () => {
    const mid = midCol(CFG);
    for (const role of ROLES) {
      const l = computeLayout(VIEWPORT, CFG, role);
      expect(burgeeTip(l, CFG, 1000).x).toBeCloseTo(fieldX(l, mid + 1), 6);
      expect(burgeeTip(l, CFG, -1000).x).toBeCloseTo(fieldX(l, mid - 1), 6);
      expect(burgeeTip(l, CFG, 0).x).toBeCloseTo(fieldX(l, mid), 6);
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
    expect(burgeeSpindleGlow(s)).toBeLessThan(1);
    s.phase = "rest";
    expect(burgeeSpindleGlow(s)).toBe(1);
  });
});

describe("THE BURGEE's hands, split by the step", () => {
  it("shows each seat's own hand full, and both on test", () => {
    expect(showsBurgeeHand("p1", 1)).toBe(true);
    expect(showsBurgeeHand("p2", 1)).toBe(false);
    expect(showsBurgeeHand("p2", 2)).toBe(true);
    expect(showsBurgeeHand("p1", 2)).toBe(false);
    expect(showsBurgeeHand("test", 1) && showsBurgeeHand("test", 2)).toBe(true);
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

describe("THE BURGEE's flag, eased", () => {
  it("is asked to stay on its place frozen, and spread across the beat while it swings", () => {
    const s = posed(stood(), CATCH, 0);
    expect(burgeeAsked(s, CFG, 0.5)).toBe(0);
    expect(burgeeAsked(s, CFG, 1)).toBeGreaterThan(0);
    expect(burgeeAsked(s, CFG, 0)).toBeLessThan(0);
    s.frozenBeats = 2;
    expect(burgeeAsked(s, CFG, 1)).toBe(0);
  });

  it("turns back off either end of the span rather than running past it", () => {
    const s = posed(stood(), CATCH, CFG.burgeeSpanMilli);
    for (const phase of [0, 0.25, 0.5, 0.75, 1]) {
      expect(Math.abs(burgeeAsked(s, CFG, phase))).toBeLessThanOrEqual(CFG.burgeeSpanMilli);
    }
  });

  it("puts the flag where it is asked on the first frame, and eases it there after", () => {
    const fx = new BurgeeFx();
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
    const fx = new BurgeeFx();
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
    const fx = new BurgeeFx();
    fx.flag.aim(0);
    const still = burgeeLay(fx, 1, 2);
    fx.ingest([{ type: "burgeeFlutter", side: 1, col: 4 }], L, CFG, 0.5, () => {});
    expect(fx.limp).toBe(1);
    expect(burgeeLay(fx, 1, 2).ripple).toBeGreaterThan(still.ripple);
    for (let i = 0; i < 180; i++) fx.update(1 / 60);
    expect(fx.limp).toBe(0);
  });

  it("is left indistinguishable from a fresh one by a clear", () => {
    const fx = new BurgeeFx();
    fx.flag.aim(300);
    fx.flag.aim(-300);
    fx.ingest([{ type: "burgeeFlutter", side: 0, col: 4 }], L, CFG, 0.5, () => {});
    fx.update(1 / 60);
    expect(fx).not.toEqual(new BurgeeFx());
    fx.clear();
    expect(fx).toEqual(new BurgeeFx());
  });
});
