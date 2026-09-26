import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
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
 * THE KEEL's poses — hung loose, a joint lit, segments locked, the midpoint
 * split round its socket, the tempo run dimmed, the rigid hold, the rock in
 * the air and the spine snapped straight — on all three screens.
 *
 * The states are **set** rather than played to, `mantle-frame.test.ts`'s
 * arrangement: `sim/test/keel*.test.ts` proves the joints, the socket, the
 * tempo run and the rock. What this file asks is whether every branch of the
 * picture is one a canvas accepts, and that each says what it has to: a
 * locked segment is a white seam, a lit joint a white ring, the socket the
 * wave's colour and nothing else on the body a colour at all.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the spine hung, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): KeelState {
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  return s;
}

/** Resting between joints in movement `movement`, the segments in `locked` locked and no other. */
function resting(world: World, locked: number[] = [], movement: 1 | 2 | 3 = 1): KeelState {
  const s = body(world);
  s.phase = "rest";
  s.phaseBeat = world.beat - 3;
  s.movement = movement;
  s.joint = NO_JOINT;
  s.locked = s.locked.map((_, k) => locked.includes(k));
  s.repriseCursor = 0;
  s.rockCol = NO_ROCK;
  return s;
}

/** A joint lit on segment `seg`, a beat into its window. */
function lit(world: World, seg: number, locked: number[] = []): KeelState {
  const s = resting(world, locked);
  s.phase = "joint";
  s.phaseBeat = world.beat - 1;
  s.joint = seg;
  return s;
}

const OUTER = [0, 1, 4, 5];
const ALL = [0, 1, 2, 3, 4, 5];

/** The midpoint split and the socket waiting for its shot. */
function socket(world: World): KeelState {
  const s = resting(world, OUTER, 2);
  s.phase = "socket";
  s.phaseBeat = world.beat - 1;
  return s;
}

/** The tempo run, `answered` of the wave's order answered and the rest dim. */
function tempo(world: World, answered: number): KeelState {
  const s = resting(world, ALL, 3);
  s.repriseCursor = answered;
  return s;
}

/** Every segment locked and the spine in `phase`, the rock in the air if it is `rock`. */
function whole(world: World, phase: "rigid" | "rock" | "straight"): KeelState {
  const s = resting(world, ALL, 3);
  s.repriseCursor = s.reprise.length;
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  if (phase === "rock") {
    s.rockCol = CFG.cols - 1;
    s.rockBeat = world.beat - 1;
  }
  return s;
}

function drawn(world: World, role: ViewRole, ticks: number): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

/** Three frames, inside a beat, with the spine set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9);
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** A colour as a glow lays it (the palette's hex) and as a fill or a faint stroke does (`rgba`). */
function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  return count(text, hex) + count(text, `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}

describe("THE KEEL's spine", () => {
  it.each(ROLES)("hangs the spine loose, on %s", (role) => {
    const loose = frame(role, (w) => resting(w));
    expect(loose.calls).toBeGreaterThan(50);
    expect(tinted(loose.text, PALETTE.rock)).toBeGreaterThan(0);
  });

  it.each(ROLES)("puts a white seam on every segment it locks, on %s", (role) => {
    const loose = frame(role, (w) => resting(w));
    const half = frame(role, (w) => resting(w, OUTER));
    expect(tinted(half.text, PALETTE.hullRim)).toBeGreaterThan(tinted(loose.text, PALETTE.hullRim));
  });

  it.each(ROLES)("rings the lit joint in white, on %s", (role) => {
    const waiting = frame(role, (w) => lit(w, 0));
    const idle = frame(role, (w) => resting(w));
    expect(tinted(waiting.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(idle.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("rings the joint where it sits, on %s", (role) => {
    expect(frame(role, (w) => lit(w, 0)).text).not.toBe(frame(role, (w) => lit(w, 5)).text);
  });

  it.each(ROLES)("splits the midpoint round a socket of the wave's colour, on %s", (role) => {
    const split = frame(role, socket);
    const shut = frame(role, (w) => resting(w, OUTER, 2));
    const colour = PALETTE[body(hung()).socket];
    expect(tinted(split.text, colour)).toBeGreaterThan(tinted(shut.text, colour));
  });

  it.each(ROLES)("dims the tempo run and brings answered joints back up, on %s", (role) => {
    const dimmed = frame(role, (w) => tempo(w, 0));
    const answered = frame(role, (w) => tempo(w, 2));
    expect(answered.text).not.toBe(dimmed.text);
  });

  it.each(ROLES)("holds rigid, throws the rock and snaps straight, on %s", (role) => {
    const rigid = frame(role, (w) => whole(w, "rigid"));
    const rock = frame(role, (w) => whole(w, "rock"));
    const straight = frame(role, (w) => whole(w, "straight"));
    expect(rock.text).not.toBe(rigid.text);
    expect(straight.text).not.toBe(rigid.text);
  });

  it("draws the same spine the same way twice", () => {
    const a = frame("p1", (w) => lit(w, 3, OUTER));
    const b = frame("p1", (w) => lit(w, 3, OUTER));
    expect(a.text).toBe(b.text);
  });
});
