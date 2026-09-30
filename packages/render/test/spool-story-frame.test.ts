import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_BRAKE,
  SPOOL_RIBS,
  type SpoolPhase,
  type SpoolState,
  spoolBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import { spoolCues } from "../src/boss-cue-read-za.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { spoolKnobCircle } from "../src/spool-grip.js";
import { spoolStoryShake } from "../src/spool-story.js";
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
 * **THE SPOOL's story between the ribs, drawn and said** (§21,
 * `render/src/spool-story.ts`, `boss-cue-read-za.ts`): the snag, the whip and
 * the fray on every screen, and the word each one puts on the pilot's knob.
 *
 * The states are **set** rather than played to — `sim/test/spool-story.test.ts`
 * proves how they come and go — and the world is held still while it is drawn,
 * so the count a frame is asked about is the count it was given.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("spool");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The spool in `phase`, a beat in, with the ribs the story's place in the fight leaves it. */
function at(world: World, phase: SpoolPhase, runBeats = 0): SpoolState {
  const s = spoolBoss(world);
  if (s === null) throw new Error("the spool wave hung no spool");
  const eased = phase === "snag" ? 1 : phase === "whip" ? 2 : phase === "fray" ? 3 : 0;
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.ribs = SPOOL_RIBS - eased;
  s.brakeMilli = NO_BRAKE;
  s.runBeats = runBeats;
  s.paidMilli = 400;
  s.wantMilli = 400;
  s.leg = 0;
  s.legBeat = world.beat - 5;
  s.wantRateMilli = 70;
  return s;
}

/** Three frames of `role`'s screen, the world held where `arrange` left it. */
function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = hung();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onTick: () => {},
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

describe("THE SPOOL's snag", () => {
  it.each(ROLES)("catches the line in ember, on %s", (role) => {
    const paying = frame(role, (w) => at(w, "pay"));
    const snag = frame(role, (w) => at(w, "snag"));
    expect(tinted(snag, PALETTE.emberRim)).toBeGreaterThan(tinted(paying, PALETTE.emberRim));
  });

  it("shudders the casing, and nothing else does", () => {
    const world = hung();
    const l = LAYOUT.p1;
    const s = at(world, "snag");
    const shakes = [0.1, 0.35, 0.6, 0.85].map((p) => spoolStoryShake(l, s, world.beat, p));
    expect(Math.max(...shakes.map((d) => Math.hypot(d.x, d.y)))).toBeGreaterThan(0);
    for (const phase of ["pay", "whip", "fray", "taut"] as const) {
      at(world, phase);
      expect(spoolStoryShake(l, s, world.beat, 0.35)).toEqual({ x: 0, y: 0 });
    }
  });
});

describe("THE SPOOL's whip", () => {
  it.each(ROLES)(
    "throws the line out in a loop, and less as the brake holds deep, on %s",
    (role) => {
      const paying = frame(role, (w) => at(w, "pay"));
      const wild = frame(role, (w) => at(w, "whip"));
      const damped = frame(role, (w) => at(w, "whip", CFG.spoolWhipBeats));
      expect(wild).not.toBe(paying);
      expect(damped).not.toBe(wild);
    },
  );
});

describe("THE SPOOL's fray", () => {
  it.each(ROLES)("furs the line with fibres that lie down as the count runs, on %s", (role) => {
    const taut = frame(role, (w) => at(w, "taut"));
    const fray = frame(role, (w) => at(w, "fray"));
    const laid = frame(role, (w) => at(w, "fray", CFG.spoolFrayBeats));
    expect(tinted(fray, PALETTE.hullRim)).toBeGreaterThan(tinted(taut, PALETTE.hullRim));
    expect(laid).not.toBe(fray);
  });
});

it("draws the same whip the same way twice", () => {
  const arrange = (w: World) => {
    at(w, "whip", 1);
  };
  expect(frame("p1", arrange)).toBe(frame("p1", arrange));
});

describe("the story's words on THE SPOOL's knob", () => {
  const said = (world: World) => spoolCues(LAYOUT.test, world, spoolBoss(world) as SpoolState, 0);

  it("says RELEASE through the snag's count, then HOLD, on the knob", () => {
    const world = hung();
    const s = at(world, "snag");
    const [off] = said(world);
    expect(off).toMatchObject({ word: "RELEASE", seat: 1 });
    const knob = spoolKnobCircle(LAYOUT.test, CFG, s, world.beat, 0);
    expect(off?.x).toBeCloseTo(knob.x, 5);
    expect(off?.y).toBeCloseTo(knob.y, 5);
    s.runBeats = CFG.spoolSnagBeats;
    expect(said(world)).toMatchObject([{ word: "HOLD", kind: "CARRY", seat: 1 }]);
  });

  it("says HOLD DEEP for the whip and HOLD for the fray, how light being hers", () => {
    const world = hung();
    at(world, "whip");
    expect(said(world).map((c) => c.word)).toEqual(["HOLD DEEP"]);
    at(world, "fray");
    expect(said(world).map((c) => c.word)).toEqual(["HOLD"]);
  });

  it("stands on his screen and never on hers", () => {
    for (const phase of ["snag", "whip", "fray"] as const) {
      const world = hung();
      at(world, phase);
      const on = (role: ViewRole) => bossCue(LAYOUT[role], world, 0, () => LAYOUT[role].hullY);
      expect(on("p1")?.seat, phase).toBe(1);
      expect(on("p2"), phase).toBeNull();
    }
  });
});
