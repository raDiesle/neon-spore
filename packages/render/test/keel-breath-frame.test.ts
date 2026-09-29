import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type KeelState,
  keelBoss,
  midCol,
  NO_JOINT,
  NO_ROCK,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { keelBright, keelSegs } from "../src/keel-pose.js";
import { keelBreathSwell } from "../src/keel-story-pose.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
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
 * THE KEEL's held breath, drawn (§24 row 11, `render/keel-story-pose.ts`
 * `keelBreathSwell`): the whole arch swelling and dimming over the phase's
 * beats, flat the moment a touch stirs it, and every seam flaring once as the
 * breath is held untouched (`keel-fx.ts`). Set rather than played to;
 * `sim/test/keel-story.test.ts` proves the rules.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** Every segment locked, the spine holding its breath since `since` beats ago. */
function breathing(world: World, stirred = false, since = 1): KeelState {
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  s.phase = "breath";
  s.phaseBeat = world.beat - since;
  s.movement = 2;
  s.joint = NO_JOINT;
  s.locked = s.locked.map(() => true);
  s.rockCol = NO_ROCK;
  s.held = [false, false];
  s.stirred = stirred;
  return s;
}

function frame(role: ViewRole, arrange: (world: World) => void, held = false): string {
  const world = hung();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      step(w, []);
      if (held && tick === 0) w.events.push({ type: "keelHeld", col: midCol(w.cfg) });
    },
  });
  return log.join("|");
}

function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  const count = (colour: string) => text.split(colour).length - 1;
  return count(hex) + count(`rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}

describe("THE KEEL's held breath", () => {
  it("swells once over its beats, and not at all once stirred or outside it", () => {
    const world = hung();
    const s = breathing(world);
    const mid = CFG.keelBreathBeats / 2;
    expect(keelBreathSwell(s, CFG, s.phaseBeat, 0)).toBe(0);
    expect(keelBreathSwell(s, CFG, s.phaseBeat + mid, 0)).toBeCloseTo(1, 5);
    expect(keelBreathSwell(s, CFG, s.phaseBeat + CFG.keelBreathBeats, 0)).toBeCloseTo(0, 5);
    s.stirred = true;
    expect(keelBreathSwell(s, CFG, s.phaseBeat + mid, 0)).toBe(0);
    s.stirred = false;
    s.phase = "rigid";
    expect(keelBreathSwell(s, CFG, s.phaseBeat + mid, 0)).toBe(0);
  });

  it("stands the arch higher and dims it at the top of the breath", () => {
    const world = hung();
    const l = computeLayout(VIEWPORT, CFG, "p1");
    const s = breathing(world);
    const top = s.phaseBeat + CFG.keelBreathBeats / 2;
    const middle = CFG.keelSegments / 2;
    const swollen = keelSegs(l, CFG, s, top, 0)[middle]?.centre.y ?? 0;
    const bright = keelBright(s, CFG, middle, top, 0);
    s.stirred = true;
    const flat = keelSegs(l, CFG, s, top, 0)[middle]?.centre.y ?? 0;
    expect(swollen).toBeLessThan(flat - l.tile * 0.1);
    expect(bright).toBeLessThan(keelBright(s, CFG, middle, top, 0) * 0.7);
  });

  it.each(ROLES)("is drawn differently held and stirred, on %s", (role) => {
    const held = frame(role, (w) => breathing(w));
    const stirred = frame(role, (w) => breathing(w, true));
    expect(held).not.toBe(stirred);
  });

  it.each(ROLES)("flares every seam white once it is held, on %s", (role) => {
    const arrange = (w: World) => {
      breathing(w, false, CFG.keelBreathBeats - 1);
    };
    const quiet = frame(role, arrange);
    const flared = frame(role, arrange, true);
    expect(tinted(flared, PALETTE.hullRim)).toBeGreaterThan(tinted(quiet, PALETTE.hullRim));
  });
});
