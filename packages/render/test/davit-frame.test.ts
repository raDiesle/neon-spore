import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DAVIT_UNREAD,
  type DavitState,
  davitBoss,
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
 * THE DAVIT's boom — standing up out of stowed, swung by a steering lean,
 * asking a halo round itself while a swing or a reland wants steering, its
 * hook dark between steps and glowing the fire step's colour, its ring
 * closing as the window runs out — on all three screens.
 *
 * The states are **set** rather than played to, `rime-frame.test.ts`'s
 * arrangement: `sim/test/davit*.test.ts` proves the script and the swings.
 * What this file asks is whether every branch of the picture is one a canvas
 * accepts, and that each says what it has to: the boom itself, the halo when
 * a lean is asked for, the hook lit in the colour a fire step wants.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the boom stood, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("davit");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): DavitState {
  const s = davitBoss(world);
  if (s === null) throw new Error("the davit wave installed no boom");
  return s;
}

/** The boom in `phase`, a beat in, the cursor at 0, `aimMilli` set as asked. */
function posed(world: World, phase: DavitState["phase"], aimMilli = 0): DavitState {
  const s = body(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.aimMilli = aimMilli;
  s.hits = 0;
  s.pivotLit = false;
  s.swings = [0, 0];
  s.tiltMilli = [DAVIT_UNREAD, DAVIT_UNREAD];
  s.holding = [false, false];
  s.drawnBeats = [0, 0];
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

/** Three frames, inside a beat, with the boom set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = stood();
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

describe("THE DAVIT's boom", () => {
  it.each(ROLES)("stands a steel boom on its mast, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    expect(resting.calls).toBeGreaterThan(30);
    expect(tinted(resting.text, PALETTE.davitSteel)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.davitSteelDark)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.davitChain)).toBeGreaterThan(0);
  });

  it.each(ROLES)("stands up out of stowed, on %s", (role) => {
    const settling = frame(role, (w) => {
      posed(w, "still").phaseBeat = w.beat;
    });
    expect(settling.text).not.toBe(frame(role, (w) => posed(w, "rest")).text);
  });

  it.each(ROLES)("swings toward the lean it is steered onto, on %s", (role) => {
    const left = frame(role, (w) => posed(w, "lit", -45_000));
    const right = frame(role, (w) => posed(w, "lit", 45_000));
    const hanging = frame(role, (w) => posed(w, "lit", 0));
    expect(left.text).not.toBe(right.text);
    expect(left.text).not.toBe(hanging.text);
    expect(right.text).not.toBe(hanging.text);
  });

  it.each(ROLES)("asks a halo round itself while a swing wants steering, on %s", (role) => {
    const asking = frame(role, (w) => {
      const s = posed(w, "lit");
      s.steps[0] = {
        ask: "left",
        leanMilli: -45_000,
        rangeMilli: 15_000,
        color: "either",
        beats: 4,
      };
    });
    const firing = frame(role, (w) => {
      const s = posed(w, "lit");
      s.steps[0] = { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "red", beats: 4 };
      s.pivotLit = true;
    });
    expect(tinted(asking.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(firing.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("lights the hook in the fire step's colour, on %s", (role) => {
    const dark = frame(role, (w) => {
      const s = posed(w, "lit");
      s.steps[0] = {
        ask: "left",
        leanMilli: -45_000,
        rangeMilli: 15_000,
        color: "either",
        beats: 4,
      };
    });
    const red = frame(role, (w) => {
      const s = posed(w, "lit");
      s.steps[0] = { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "red", beats: 4 };
      s.pivotLit = true;
    });
    const cyan = frame(role, (w) => {
      const s = posed(w, "lit");
      s.steps[0] = { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "cyan", beats: 4 };
      s.pivotLit = true;
    });
    expect(tinted(red.text, PALETTE.red)).toBeGreaterThan(tinted(dark.text, PALETTE.red));
    expect(tinted(cyan.text, PALETTE.cyan)).toBeGreaterThan(tinted(dark.text, PALETTE.cyan));
    expect(red.text).not.toBe(cyan.text);
  });

  it.each(ROLES)("stands hard over once spent, on %s", (role) => {
    const spent = frame(role, (w) => posed(w, "spent", 80_000));
    expect(spent.calls).toBeGreaterThan(30);
    expect(spent.text).not.toBe(frame(role, (w) => posed(w, "rest")).text);
  });

  it("draws the same boom the same way twice", () => {
    const a = frame("p1", (w) => posed(w, "lit", -30_000));
    const b = frame("p1", (w) => posed(w, "lit", -30_000));
    expect(a.text).toBe(b.text);
  });
});
