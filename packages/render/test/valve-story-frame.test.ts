import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_BEARING,
  NO_SPARK,
  startWave,
  step,
  ticksPerBeat,
  VALVE_PINS,
  type ValvePhase,
  type ValveState,
  valveBoss,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { valveShake } from "../src/valve-story.js";
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
 * THE VALVE's story between the pins, drawn (`render/src/valve-story.ts`):
 * the jet out of the first slot, the drum shuddering for the brace, the film
 * over the face and the seam that strains. Set rather than played to;
 * `sim/test/valve-story.test.ts` proves the rules. What this file asks is
 * that each state is drawn on every screen and unlike the drum without it,
 * and that the answer so far — thumbs down, beats held, rubs landed — shows.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("valve");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The drum in a story `phase`, a beat in, with the pins it follows out. */
function at(world: World, phase: ValvePhase): ValveState {
  const s = valveBoss(world);
  if (s === null) throw new Error("the valve wave hung no drum");
  const out = phase === "jet" ? 1 : phase === "brace" ? 2 : 3;
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.pins = VALVE_PINS - out;
  s.movement = Math.min(3, out) as 1 | 2 | 3;
  s.handMilli = NO_BEARING;
  s.sparkCol = NO_SPARK;
  s.held = [false, false];
  s.chordBeats = 0;
  s.wiped = 0;
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

describe("THE VALVE's jet", () => {
  it.each(ROLES)("blows steam out of the first slot, on %s", (role) => {
    const listing = frame(role, (w) => at(w, "list"));
    const jet = frame(role, (w) => at(w, "jet"));
    expect(tinted(jet, PALETTE.text)).toBeGreaterThan(tinted(listing, PALETTE.text));
    expect(tinted(jet, PALETTE.emberRim)).toBeGreaterThan(0);
  });
});

describe("THE VALVE's brace", () => {
  it("shudders the drum, less as the chord counts, and not at all at rest", () => {
    const world = hung();
    const l = computeLayout(VIEWPORT, CFG, "p1");
    const s = at(world, "brace");
    const loose = Math.abs(valveShake(l, s, CFG, world.beat, 0.05).x);
    s.chordBeats = CFG.valveBraceBeats - 1;
    const held = Math.abs(valveShake(l, s, CFG, world.beat, 0.05).x);
    expect(loose).toBeGreaterThan(held);
    s.phase = "list";
    expect(valveShake(l, s, CFG, world.beat, 0.05)).toEqual({ x: 0, y: 0 });
  });

  it.each(ROLES)("lights a half-ring under each held thumb, on %s", (role) => {
    const none = frame(role, (w) => at(w, "brace"));
    const one = frame(role, (w) => {
      at(w, "brace").held = [true, false];
    });
    const both = frame(role, (w) => {
      const s = at(w, "brace");
      s.held = [true, true];
      s.chordBeats = 1;
    });
    expect(tinted(one, PALETTE.hullRim)).toBeGreaterThan(tinted(none, PALETTE.hullRim));
    expect(tinted(both, PALETTE.hullRim)).toBeGreaterThan(tinted(one, PALETTE.hullRim));
  });
});

describe("THE VALVE's wipe", () => {
  it.each(ROLES)("lays a film over the face that the rubs clear, on %s", (role) => {
    const bare = frame(role, (w) => at(w, "open"));
    const film = frame(role, (w) => at(w, "wipe"));
    const rubbed = frame(role, (w) => {
      at(w, "wipe").wiped = CFG.valveWipeRubs - 1;
    });
    expect(film).not.toBe(bare);
    expect(rubbed).not.toBe(film);
  });
});

describe("THE VALVE's seal", () => {
  it.each(ROLES)("splits a white seam down the face that strains wider, on %s", (role) => {
    const brace = frame(role, (w) => at(w, "brace"));
    const seal = frame(role, (w) => at(w, "seal"));
    const later = frame(role, (w) => {
      at(w, "seal").phaseBeat = w.beat - CFG.valveStrainBeats;
    });
    expect(tinted(seal, PALETTE.hullRim)).toBeGreaterThan(tinted(brace, PALETTE.hullRim));
    expect(later).not.toBe(seal);
  });
});

it("draws the same seal the same way twice", () => {
  const arrange = (w: World) => {
    at(w, "seal").held = [false, true];
  };
  expect(frame("p1", arrange)).toBe(frame("p1", arrange));
});
