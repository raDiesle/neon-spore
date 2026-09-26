import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import type { MantleState, World } from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { mantleKnobCircle, mantleSide, mantleVentCircle } from "../src/mantle-grip.js";
import { mantleOpen, mantleValvePose } from "../src/mantle-pose.js";
import {
  MANTLE_TURN_TOP,
  mantleBulge,
  mantleCrossCrack,
  mantleVentOpen,
} from "../src/mantle-story.js";
import { PALETTE } from "../src/palette.js";
import { type Field, touchDown } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { frame, hung, pulling, tinted } from "./mantle-frame-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MANTLE's four story beats, drawn (`render/src/mantle-story.ts`,
 * `mantle-vent.ts`): the buckle bulging, the vent gaping on the seam with a
 * tap answered on it, the crosswise crack, and the halves turned part-way
 * and guided open. Set rather than played to; `sim/test/mantle-story.test.ts`
 * proves the rules.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

/** The shell in `phase`, a beat in, on the last pair, both thumbs as given. */
function at(world: World, phase: MantleState["phase"], depth: [number, number] = [0, 0]) {
  const s = pulling(world, 0, 0, 0);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = phase === "turn" ? s.thresholds.length : s.thresholds.length - 1;
  s.depthMilli = depth;
  return s;
}

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

function cues(world: World, role: ViewRole) {
  const l = layout(role);
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE MANTLE's buckle", () => {
  it("bulges past any pull, and lies flatter as the eased hold counts", () => {
    const world = hung();
    const s = at(world, "buckle");
    const loose = mantleBulge(s, CFG, world.beat, 0.5);
    expect(loose).toBeGreaterThan(0);
    const bow = mantleValvePose(s, CFG, -1, world.beat, 0.5).bow;
    s.braceBeats = CFG.mantleBuckleBeats - 1;
    expect(mantleBulge(s, CFG, world.beat, 0.5)).toBeLessThan(loose);
    s.phase = "pull";
    s.depthMilli = [2000, 2000];
    expect(mantleValvePose(s, CFG, -1, world.beat, 0.5).bow).toBeLessThan(bow);
  });

  it.each(ROLES)("lights a knob's ring only while that thumb lies eased, on %s", (role) => {
    const loose = frame(role, (w) => at(w, "buckle"));
    const eased = frame(role, (w) => {
      at(w, "buckle").held = [true, true];
    });
    const pulled = frame(role, (w) => {
      at(w, "buckle", [2000, 2000]).held = [true, true];
    });
    expect(tinted(eased.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(loose.text, PALETTE.hullRim),
    );
    expect(tinted(pulled.text, PALETTE.hullRim)).toBeLessThan(tinted(eased.text, PALETTE.hullRim));
  });

  it("asks each seat to HOLD until its thumb lies eased", () => {
    const world = hung();
    const s = at(world, "buckle");
    expect(cues(world, "p1")?.word).toBe("HOLD");
    s.held = [true, false];
    s.depthMilli = [2000, 0];
    expect(cues(world, "p1")?.word).toBe("HOLD");
    s.depthMilli = [0, 0];
    expect(cues(world, "p1")).toBeNull();
    expect(cues(world, "p2")?.seat).toBe(2);
  });
});

describe("THE MANTLE's vent", () => {
  it.each(ROLES)("gapes red on the seam, and nowhere else, on %s", (role) => {
    const vent = frame(role, (w) => at(w, "vent"));
    const shut = frame(role, (w) => at(w, "cross"));
    expect(vent.text).not.toBe(shut.text);
    expect(tinted(vent.text, PALETTE.red)).toBeGreaterThan(0);
  });

  it.each(ROLES)("takes a tap from either seat on the vent, clear of the knobs, on %s", (role) => {
    const world = hung();
    const s = at(world, "vent");
    const l = layout(role);
    const vent = mantleVentCircle(l, CFG);
    for (const seat of [1, 2] as const) {
      const knob = mantleKnobCircle(l, CFG, s, mantleSide(seat), world.beat, 0);
      expect(Math.hypot(knob.x - vent.x, knob.y - vent.y)).toBeGreaterThan(knob.r + vent.r);
      const touch = touchDown(l, vent.x, vent.y, field(world, seat));
      expect(touch?.hold?.kind === "drag" ? touch.hold.target : null).toBe("mantleCore");
    }
    expect(handleCircle(l, world, "mantleCore", 0)).toEqual(vent);
    s.phase = "cross";
    const miss = touchDown(l, vent.x, vent.y, field(world, 1));
    expect(miss?.hold?.kind === "drag" ? miss.hold.target : null).not.toBe("mantleCore");
  });

  it("says TAP on the vent to both seats, the one word either can act on", () => {
    const world = hung();
    at(world, "vent");
    for (const role of ["p1", "p2"] as const) {
      const c = cues(world, role);
      const vent = mantleVentCircle(layout(role), CFG);
      expect(c?.word).toBe("TAP");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(vent.x, 5);
    }
    expect(mantleVentOpen(at(hung(), "cross"), 0, 0)).toBe(0);
  });
});

describe("THE MANTLE's crosswise crack", () => {
  it("grows over the cross, stays through the brace and the last pull, and goes at the split", () => {
    const world = hung();
    const s = at(world, "cross");
    s.phaseBeat = world.beat;
    const early = mantleCrossCrack(s, CFG, world.beat, 0.3);
    const late = mantleCrossCrack(s, CFG, world.beat + CFG.mantleCrossBeats - 1, 0.9);
    expect(early).toBeGreaterThan(0);
    expect(late).toBeGreaterThan(early);
    s.phase = "brace";
    expect(mantleCrossCrack(s, CFG, world.beat, 0)).toBe(1);
    s.phase = "pull";
    expect(mantleCrossCrack(s, CFG, world.beat, 0)).toBe(1);
    s.phase = "buckle";
    expect(mantleCrossCrack(s, CFG, world.beat, 0)).toBe(0);
    s.phase = "turn";
    s.cursor = s.thresholds.length;
    expect(mantleCrossCrack(s, CFG, world.beat, 0)).toBe(0);
  });

  it.each(ROLES)("draws the brace with the crack across the seam, on %s", (role) => {
    const crossed = frame(role, (w) => at(w, "brace"));
    const before = frame(role, (w) => {
      const s = at(w, "brace");
      s.cursor -= 1;
    });
    expect(crossed.text).not.toBe(before.text);
  });
});

describe("THE MANTLE's turn", () => {
  it("stands the halves part-way, further as the lesser pull nears the floor", () => {
    const world = hung();
    const s = at(world, "turn");
    const loose = mantleOpen(s, CFG, world.beat, 0);
    s.depthMilli = [CFG.mantleFloorMilli * 3, CFG.mantleFloorMilli / 2];
    const half = mantleOpen(s, CFG, world.beat, 0);
    s.depthMilli = [CFG.mantleFloorMilli, CFG.mantleFloorMilli];
    const guided = mantleOpen(s, CFG, world.beat, 0);
    expect(loose).toBeGreaterThan(0);
    expect(half).toBeGreaterThan(loose);
    expect(guided).toBeGreaterThan(half);
    expect(guided).toBeCloseTo(MANTLE_TURN_TOP, 5);
  });

  it("bares the core from where the guided turn left the halves, not from shut", () => {
    const world = hung();
    const s = at(world, "heartbeat");
    s.phaseBeat = world.beat;
    expect(mantleOpen(s, CFG, world.beat, 0)).toBeCloseTo(MANTLE_TURN_TOP, 5);
    expect(mantleOpen(s, CFG, world.beat + 4, 0)).toBeCloseTo(1, 5);
  });

  it("asks each seat to PULL until its knob is past the floor", () => {
    const world = hung();
    const s = at(world, "turn");
    expect(cues(world, "p1")?.word).toBe("PULL");
    expect(cues(world, "p2")?.seat).toBe(2);
    s.depthMilli = [CFG.mantleFloorMilli, 0];
    expect(cues(world, "p1")).toBeNull();
    expect(cues(world, "p2")?.word).toBe("PULL");
  });

  it.each(ROLES)("draws the halves swung and the handles lit, on %s", (role) => {
    const turned = frame(role, (w) => at(w, "turn"));
    const shut = frame(role, (w) => at(w, "brace"));
    expect(turned.text).not.toBe(shut.text);
  });
});
