import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type RimeState,
  rimeBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE RIME's refreeze, drawn (`render/src/rime-film.ts`, §29 row 11): the
 * film over the spent core that the rest pose does not have, cracked wider
 * by a scatter, breaking up through its last beat — on all three screens,
 * set rather than played to (`sim/test/rime-refreeze.test.ts` proves the
 * rules), and each the same picture twice.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("rime");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The lens spent and bare, `phase` for `beats` beats, scattered `jars` times. */
function posed(world: World, phase: "rest" | "refreeze", beats: number, jars: number): RimeState {
  const s = rimeBoss(world);
  if (s === null) throw new Error("the rime wave stood no lens");
  s.phase = phase;
  s.phaseBeat = world.beat - beats;
  s.rimeMilli = [0, 0];
  s.hits = 3;
  s.bared = true;
  s.jars = jars;
  s.stirred = false;
  return s;
}

function drawn(world: World, role: ViewRole, ticks: number): string {
  const log: string[] = [];
  runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

/** One frame's worth of ticks, well inside a beat, so the pose holds still. */
function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = stood();
  arrange(world);
  return drawn(world, role, 3);
}

function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  const rgb = `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`;
  return text.split(hex).length - 1 + text.split(rgb).length - 1;
}

const rest = (w: World) => posed(w, "rest", 1, 0);
const filming = (w: World) => posed(w, "refreeze", 1, 0);
const scattered = (w: World) => posed(w, "refreeze", 1, 2);
const breaking = (w: World) => posed(w, "refreeze", CFG.rimeRefreezeBeats - 1, 0);

describe("THE RIME's refreeze", () => {
  it.each(ROLES)(
    "films the spent core over in frost the rest pose does not have, on %s",
    (role) => {
      const film = frame(role, filming);
      const bare = frame(role, rest);
      expect(film).not.toBe(bare);
      expect(tinted(film, PALETTE.rimeFrost)).toBeGreaterThan(tinted(bare, PALETTE.rimeFrost));
    },
  );

  it.each(ROLES)("cracks wider for a scatter, on %s", (role) => {
    const whole = frame(role, filming);
    const cracked = frame(role, scattered);
    expect(cracked).not.toBe(whole);
    expect(cracked.length).toBeGreaterThan(whole.length);
  });

  it.each(ROLES)("breaks up through its last beat, before the lens does, on %s", (role) => {
    expect(frame(role, breaking)).not.toBe(frame(role, filming));
  });

  it.each(ROLES)("carries neither cannon's colour, on %s", (role) => {
    const film = frame(role, filming);
    const bare = frame(role, rest);
    for (const hex of [PALETTE.redRim, PALETTE.cyanRim])
      expect(tinted(film, hex)).toBe(tinted(bare, hex));
  });

  it.each(ROLES)("is the same picture twice, on %s", (role) => {
    expect(frame(role, scattered)).toBe(frame(role, scattered));
  });
});
