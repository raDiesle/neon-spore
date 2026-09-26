import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type KeelState,
  keelBoss,
  NO_JOINT,
  NO_ROCK,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { keelCues } from "../src/boss-cue-read-zd.js";
import { keelRingCircle } from "../src/keel-marks.js";
import { keelSegs } from "../src/keel-pose.js";
import { keelEndCircle } from "../src/keel-story.js";
import { keelChord, keelFlipRise, keelHeat } from "../src/keel-story-pose.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { type Field, touchDown } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE KEEL's story between, drawn (`render/src/keel-story.ts`,
 * `keel-story-pose.ts`): the flip bowing the wrong way with a ring round each
 * end joint, the marrow's two-coloured lens, and the cooldown banking white to
 * iron. Set rather than played to; `sim/test/keel-story.test.ts` proves the
 * rules. What this file asks is that each state is drawn, on every screen,
 * that the thumb is taken where the picture puts the ring, and that the cue
 * says the one word the state wants.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** Every segment locked, the spine in `phase` since a beat ago. */
function at(world: World, phase: "rigid" | "flip" | "marrow" | "cool"): KeelState {
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.movement = 2;
  s.joint = NO_JOINT;
  s.locked = s.locked.map(() => true);
  s.repriseCursor = s.reprise.length;
  s.rockCol = NO_ROCK;
  s.held = [false, false];
  s.chordBeats = 0;
  s.marrow = [false, false];
  s.flares = 0;
  return s;
}

function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = hung();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  const count = (colour: string) => text.split(colour).length - 1;
  return count(hex) + count(`rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
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

function grips(world: World, role: ViewRole, seat: 1 | 2, x: number, y: number): boolean {
  const touch = touchDown(layout(role), x, y, field(world, seat));
  return touch?.hold?.kind === "drag" && touch.hold.target === "keelJoint";
}

describe("THE KEEL's flip", () => {
  it("swings through flat to a bow the wrong way, which the chord pulls back toward flat", () => {
    const world = hung();
    const s = at(world, "flip");
    s.phaseBeat = world.beat;
    expect(keelFlipRise(s, CFG, world.beat, 0)).toBeGreaterThan(0);
    const bowed = keelFlipRise(s, CFG, world.beat + 2, 0);
    expect(bowed).toBeLessThan(0);
    s.chordBeats = CFG.keelChordBeats - 1;
    expect(keelChord(s, CFG)).toBeGreaterThan(0);
    expect(keelFlipRise(s, CFG, world.beat + 2, 0)).toBeGreaterThan(bowed);
  });

  it.each(ROLES)("bows the spine and lights a pad under each held thumb, on %s", (role) => {
    const rigid = frame(role, (w) => at(w, "rigid"));
    const loose = frame(role, (w) => at(w, "flip"));
    const held = frame(role, (w) => {
      at(w, "flip").held = [true, true];
    });
    expect(loose).not.toBe(rigid);
    expect(tinted(held, PALETTE.hullRim)).toBeGreaterThan(tinted(loose, PALETTE.hullRim));
  });

  it.each(ROLES)(
    "takes each seat's thumb on its own end ring and not the other's, on %s",
    (role) => {
      const world = hung();
      const s = at(world, "flip");
      const segs = keelSegs(layout(role), CFG, s, world.beat, 0);
      for (const seat of [1, 2] as const) {
        const own = keelEndCircle(segs, layout(role), s, seat);
        const other = keelEndCircle(segs, layout(role), s, seat === 1 ? 2 : 1);
        if (own === null || other === null) throw new Error("no end ring in the flip");
        expect(grips(world, role, seat, own.x, own.y)).toBe(true);
        expect(grips(world, role, seat, other.x, other.y)).toBe(false);
      }
    },
  );

  it("asks each seat to HOLD its end until that thumb is down", () => {
    const world = hung();
    const s = at(world, "flip");
    const l = layout("test");
    expect(keelCues(l, world, s, 0).map((c) => [c.seat, c.word])).toEqual([
      [1, "HOLD"],
      [2, "HOLD"],
    ]);
    s.held = [true, false];
    expect(keelCues(l, world, s, 0).map((c) => [c.seat, c.word])).toEqual([[2, "HOLD"]]);
  });
});

describe("THE KEEL's marrow", () => {
  it.each(ROLES)(
    "lights a lens of both colours, each filling as its bolt goes in, on %s",
    (role) => {
      const dark = frame(role, (w) => at(w, "rigid"));
      const lit = frame(role, (w) => at(w, "marrow"));
      const red = frame(role, (w) => {
        at(w, "marrow").marrow = [true, false];
      });
      expect(tinted(lit, PALETTE.red)).toBeGreaterThan(tinted(dark, PALETTE.red));
      expect(tinted(lit, PALETTE.cyan)).toBeGreaterThan(tinted(dark, PALETTE.cyan));
      expect(red).not.toBe(lit);
    },
  );

  it("says FIRE over the middle column to both seats", () => {
    const world = hung();
    const cues = keelCues(layout("p1"), world, at(world, "marrow"), 0);
    expect(cues.map((c) => [c.seat, c.word])).toEqual([[null, "FIRE"]]);
  });
});

describe("THE KEEL's cooldown", () => {
  it("banks the segments left to right, and a flare holds the heat longer", () => {
    const world = hung();
    const s = at(world, "cool");
    s.phaseBeat = world.beat;
    const first = keelHeat(s, CFG, 0, world.beat, 0.3);
    const last = keelHeat(s, CFG, s.locked.length - 1, world.beat, 0.3);
    expect(first).toBeLessThan(last);
    s.flares = CFG.keelCoolFlares;
    expect(keelHeat(s, CFG, 0, world.beat, 0.3)).toBeGreaterThan(first);
    s.phase = "straight";
    expect(keelHeat(s, CFG, 0, world.beat, 0.3)).toBe(0);
  });

  it.each(ROLES)("draws the spine hot where the straight spine is iron, on %s", (role) => {
    const cooling = frame(role, (w) => at(w, "cool"));
    const cold = frame(role, (w) => {
      at(w, "cool").phase = "straight";
    });
    expect(cooling).not.toBe(cold);
  });

  it.each(ROLES)("takes a tap on any segment, and says nothing, on %s", (role) => {
    const world = hung();
    const s = at(world, "cool");
    const l = layout(role);
    for (const g of keelSegs(l, CFG, s, world.beat, 0)) {
      const c = keelRingCircle(l, g.centre);
      expect(grips(world, role, 1, c.x, c.y)).toBe(true);
    }
    expect(keelCues(l, world, s, 0)).toEqual([]);
  });
});

it("draws the same flip the same way twice", () => {
  const arrange = (w: World) => {
    at(w, "flip").held = [true, false];
  };
  expect(frame("p1", arrange)).toBe(frame("p1", arrange));
});
