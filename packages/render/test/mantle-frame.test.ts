import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type MantleState, midCol, type World } from "@neon-spore/sim";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";
import { count, drawn, frame, hung, pulling, still, tinted } from "./mantle-frame-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MANTLE's poses — shut and dark, the handles lit, a pull under way, a
 * pair shed, the spark leaking, the shell split round the beating core, and
 * the core gone dark — on all three screens.
 *
 * The states are **set** rather than played to, `gimbal-frame.test.ts`'s
 * arrangement: `sim/test/mantle*.test.ts` proves the sum, the floor, the
 * shears and the finish. What this file asks is whether every branch of the
 * picture is one a canvas accepts, plus the one thing nothing else could
 * catch: that **both screens are shown both handles** — the pilot's screen
 * moves with the navigator's pull and the navigator's with the pilot's,
 * which is the opposite of every other pair boss and the point of this one.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

/** The spark leaking half way down its fuse, the second pair just shed. */
function leaking(world: World): MantleState {
  const s = pulling(world, 0, 0, 2);
  s.phase = "spark";
  s.sparkCol = midCol(CFG);
  s.sparkBeat = world.beat - Math.floor(CFG.mantleSparkBeats / 2);
  return s;
}

/** Every pair gone and the core bared, two beats into the finish. */
function beating(world: World, next: 0 | 1 = 0, done = 0): MantleState {
  const s = still(world);
  s.phase = "heartbeat";
  s.phaseBeat = world.beat - 2;
  s.cursor = s.thresholds.length;
  s.heartbeatNext = next;
  s.heartbeatDone = done;
  return s;
}

/** The finish over and the core going out. */
function dark(world: World): MantleState {
  const s = beating(world, 0, CFG.mantleHeartbeatTaps);
  s.phase = "dark";
  s.phaseBeat = world.beat;
  return s;
}

describe("THE MANTLE's shell", () => {
  it.each(ROLES)("hangs the shell shut, on %s", (role) => {
    const shut = frame(role, still);
    expect(shut.calls).toBeGreaterThan(50);
    expect(count(shut.text, PALETTE.rock)).toBeGreaterThan(0);
  });

  it.each(ROLES)("lights the handles once a pull begins, on %s", (role) => {
    const lit = frame(role, (w) => pulling(w, 0, 0));
    const shut = frame(role, still);
    expect(lit.text).not.toBe(shut.text);
    // The chevron under each knob nobody is holding: pull this down.
    expect(tinted(lit.text, PALETTE.hullRim)).toBeGreaterThan(tinted(shut.text, PALETTE.hullRim));
  });

  it("shows both seats both handles", () => {
    // The pilot's screen answers the navigator's thumb and hers his: the sum
    // is the one number the fight is about, so neither half of it is hidden.
    expect(frame("p1", (w) => pulling(w, 0, 200)).text).not.toBe(
      frame("p1", (w) => pulling(w, 0, 600)).text,
    );
    expect(frame("p2", (w) => pulling(w, 200, 0)).text).not.toBe(
      frame("p2", (w) => pulling(w, 600, 0)).text,
    );
  });

  it.each(ROLES)(
    "lights a handle's end of the cord only once it clears the floor, on %s",
    (role) => {
      const below = frame(role, (w) => pulling(w, CFG.mantleFloorMilli - 100, 0));
      const above = frame(role, (w) => pulling(w, CFG.mantleFloorMilli + 100, 0));
      expect(count(above.text, PALETTE.hullRim)).toBeGreaterThan(
        count(below.text, PALETTE.hullRim),
      );
    },
  );

  it.each(ROLES)("draws a pair fewer plates for every pair shed, on %s", (role) => {
    // The health is the shell: no count is written anywhere, and a plate is
    // one outline in rock — so two pairs gone is four outlines fewer.
    const fresh = frame(role, (w) => pulling(w, 0, 0, 0));
    const worn = frame(role, (w) => pulling(w, 0, 0, 2));
    expect(worn.text).not.toBe(fresh.text);
    expect(count(worn.text, PALETTE.rock)).toBeLessThan(count(fresh.text, PALETTE.rock));
  });

  it.each(ROLES)("runs the spark down the middle column toward the hull, on %s", (role) => {
    const leak = frame(role, leaking);
    const dry = frame(role, (w) => pulling(w, 0, 0, 2));
    expect(leak.text).not.toBe(dry.text);
    expect(tinted(leak.text, PALETTE.red)).toBeGreaterThan(tinted(dry.text, PALETTE.red));
  });

  it.each(ROLES)("splits the shell round the beating core, on %s", (role) => {
    const open = frame(role, beating);
    const shut = frame(role, (w) => pulling(w, 0, 0, 3));
    expect(open.text).not.toBe(shut.text);
    // The last pair is gone: no plate outline anywhere, only the two rims.
    expect(count(open.text, PALETTE.rock)).toBeLessThan(count(shut.text, PALETTE.rock));
  });

  it.each(ROLES)("beats the half of the ring whose tap is next, on %s", (role) => {
    expect(frame(role, (w) => beating(w, 0)).text).not.toBe(frame(role, (w) => beating(w, 1)).text);
  });

  it.each(ROLES)("dims the core with every tap and puts it out at the end, on %s", (role) => {
    const whole = frame(role, (w) => beating(w, 0, 0));
    const spent = frame(role, (w) => beating(w, 0, 4));
    const out = frame(role, dark);
    expect(spent.text).not.toBe(whole.text);
    expect(out.text).not.toBe(spent.text);
  });

  it("draws the same shell the same way twice", () => {
    const a = frame("p1", (w) => pulling(w, 700, 300, 1));
    const b = frame("p1", (w) => pulling(w, 700, 300, 1));
    expect(a.text).toBe(b.text);
  });
});
