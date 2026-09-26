import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { MantleState, World } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { mantleBraceShare, mantleCrack, mantleShudder } from "../src/mantle-brace.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { frame, hung, pulling, tinted } from "./mantle-frame-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MANTLE's brace, drawn (`render/src/mantle-brace.ts`): the seam cracks a
 * share per pair and glows under the brace, the shell shudders less as the
 * hold counts, and each knob's ring says whether that side is held. Set
 * rather than played to; `sim/test/mantle-brace.test.ts` proves the rules.
 */

beforeAll(installCanvasGlobals);

const LAYOUT = computeLayout(VIEWPORT, CFG, "p1");

/** The shear before the last pair: the shell glowing, `held` and `beats` as given. */
function bracing(world: World, held: [boolean, boolean], beats = 0): MantleState {
  const s = pulling(world, 0, 0, 0);
  s.phase = "brace";
  s.cursor = s.thresholds.length - 1;
  s.held = held;
  s.braceBeats = beats;
  return s;
}

describe("THE MANTLE's brace", () => {
  it.each(ROLES)("glows the cracked seam in the core's colour, on %s", (role) => {
    const brace = frame(role, (w) => bracing(w, [false, false]));
    const whole = frame(role, (w) => pulling(w, 0, 0, 0));
    const pull = frame(role, (w) => pulling(w, 0, 0, bracing(w, [false, false]).cursor));
    expect(brace.text).not.toBe(pull.text);
    expect(tinted(brace.text, PALETTE.red)).toBeGreaterThan(tinted(whole.text, PALETTE.red));
  });

  it.each(ROLES)("lights a knob's ring while that side is held, on %s", (role) => {
    const none = frame(role, (w) => bracing(w, [false, false]));
    const one = frame(role, (w) => bracing(w, [true, false]));
    const both = frame(role, (w) => bracing(w, [true, true]));
    expect(tinted(one.text, PALETTE.hullRim)).toBeGreaterThan(tinted(none.text, PALETTE.hullRim));
    expect(tinted(both.text, PALETTE.hullRim)).toBeGreaterThan(tinted(one.text, PALETTE.hullRim));
  });

  it("cracks the seam a share per pair, and never once it splits", () => {
    const world = hung();
    const s = pulling(world, 0, 0, 0);
    const pairs = s.thresholds.length;
    expect(mantleCrack(s, world.beat, 0)).toBe(0);
    s.cursor = 1;
    const first = mantleCrack(s, world.beat, 0);
    s.cursor = pairs - 1;
    expect(first).toBeGreaterThan(0);
    expect(mantleCrack(s, world.beat, 0)).toBeGreaterThan(first);
    s.phase = "heartbeat";
    s.phaseBeat = world.beat - 4;
    s.cursor = pairs;
    expect(mantleCrack(s, world.beat, 0)).toBe(0);
  });

  it("shudders only while bracing, and less as the hold counts", () => {
    const world = hung();
    const at = 0.37;
    const loose = Math.abs(mantleShudder(LAYOUT, world, bracing(world, [false, false]), at));
    const held = Math.abs(mantleShudder(LAYOUT, world, bracing(world, [true, true]), at));
    const late = bracing(world, [true, true], CFG.mantleBraceBeats - 1);
    expect(loose).toBeGreaterThan(0);
    expect(held).toBeLessThan(loose);
    expect(Math.abs(mantleShudder(LAYOUT, world, late, at))).toBeLessThan(held);
    expect(mantleBraceShare(late, CFG.mantleBraceBeats)).toBeGreaterThan(0);
    expect(mantleShudder(LAYOUT, world, pulling(world, 0, 0, 1), at)).toBe(0);
  });

  it("draws the same brace the same way twice", () => {
    const a = frame("p1", (w) => bracing(w, [true, false], 1));
    const b = frame("p1", (w) => bracing(w, [true, false], 1));
    expect(a.text).toBe(b.text);
  });
});
