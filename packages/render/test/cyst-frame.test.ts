import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CystAsk,
  type CystPhase,
  type CystState,
  type CystStep,
  createWorld,
  cystBoss,
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
 * THE CYST's poses — dropping in, resting whole, a flank lit and shuddering,
 * stilled and pinched, each flank cracked, a guard, the swell, the spore and
 * the bud, the core bared and lit in each colour, smaller per hit, and the sac
 * split — on all three screens.
 *
 * The states are **set** rather than played to, `vise-frame.test.ts`'s
 * arrangement: `sim/test/cyst*.test.ts` proves the script. What this file asks
 * is whether every branch of the picture is one a canvas accepts, and that each
 * says what it has to: the sac mauve, the lit flank white, the core in the
 * colour it asks for — and the same on both phones.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("cyst");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): CystState {
  const s = cystBoss(world);
  if (s === null) throw new Error("the cyst wave stood no sac");
  return s;
}

/** The sac in `phase`, a beat in, `cracks` on each flank and `lit` the step under the cursor. */
function posed(
  world: World,
  phase: CystPhase,
  cracks: [number, number] = [0, 0],
  lit?: CystStep,
): CystState {
  const s = body(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cracks = cracks;
  s.hits = 0;
  s.bared = false;
  s.gapMilli = [CFG.cystOpenMilli, CFG.cystOpenMilli];
  s.tapDown = [false, false];
  s.heldBeats = 0;
  s.cursor = 0;
  if (lit !== undefined) s.steps[0] = lit;
  return s;
}

function asking(ask: CystAsk, color: CystStep["color"] = "either", offset?: number): CystStep {
  return { ask, color, beats: 4, ...(offset === undefined ? {} : { offset }) };
}

function firing(world: World, color: CystStep["color"], hits = 0): CystState {
  const s = posed(world, "lit", [1, 1], asking("fire", color));
  s.bared = true;
  s.hits = hits;
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

function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = stood();
  arrange(world);
  return drawn(world, role, 9);
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  return count(text, hex) + count(text, `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}

describe("THE CYST's sac", () => {
  it.each(ROLES)("stands a mauve sac with a dark outline, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    expect(resting.calls).toBeGreaterThan(30);
    expect(tinted(resting.text, PALETTE.cystSac)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.cystSacDark)).toBeGreaterThan(0);
  });

  it.each(ROLES)("drops into frame, on %s", (role) => {
    const dropping = frame(role, (w) => {
      posed(w, "still").phaseBeat = w.beat;
    });
    expect(dropping.text).not.toBe(frame(role, (w) => posed(w, "rest")).text);
  });

  it.each(ROLES)("lights the flank a step asks for in white, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const lit = frame(role, (w) => posed(w, "lit", [0, 0], asking("left")));
    expect(tinted(lit.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(resting.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("stills a tapped flank and cracks it as the pinch holds, on %s", (role) => {
    const lit = frame(role, (w) => posed(w, "lit", [0, 0], asking("right")));
    const stilled = frame(role, (w) => posed(w, "frozen", [0, 0], asking("right")));
    const pinched = frame(role, (w) => {
      const s = posed(w, "frozen", [0, 0], asking("right"));
      s.gapMilli[1] = CFG.cystShutMilli;
      s.heldBeats = 2;
    });
    expect(stilled.text).not.toBe(lit.text);
    expect(pinched.text).not.toBe(stilled.text);
  });

  it.each(ROLES)("scars each flank it has cracked, on %s", (role) => {
    const none = frame(role, (w) => posed(w, "rest", [0, 0]));
    const one = frame(role, (w) => posed(w, "rest", [1, 0]));
    const both = frame(role, (w) => posed(w, "rest", [1, 1]));
    expect(one.text).not.toBe(none.text);
    expect(both.text).not.toBe(one.text);
  });

  it.each(ROLES)("glows the scar a guard holds shut, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest", [1, 1]));
    const guard = frame(role, (w) => posed(w, "lit", [1, 1], asking("left")));
    expect(guard.text).not.toBe(resting.text);
  });

  it.each(ROLES)("swells taut on a swell, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const swell = frame(role, (w) => posed(w, "lit", [0, 0], asking("swell")));
    expect(swell.text).not.toBe(resting.text);
  });

  it.each(ROLES)("spits a spore and grows a bud off the middle, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const spore = frame(role, (w) => posed(w, "lit", [0, 0], asking("spit", "either", 2)));
    const bud = frame(role, (w) => posed(w, "lit", [0, 0], asking("bud", "red", -2)));
    expect(spore.text).not.toBe(resting.text);
    expect(tinted(bud.text, PALETTE.red)).toBeGreaterThan(tinted(resting.text, PALETTE.red));
  });

  it.each(ROLES)("lights the bared core in the colour it asks for, on %s", (role) => {
    const resting = frame(role, (w) => {
      posed(w, "rest", [1, 1]).bared = true;
    });
    const red = frame(role, (w) => firing(w, "red"));
    const cyan = frame(role, (w) => firing(w, "cyan"));
    expect(tinted(red.text, PALETTE.red)).toBeGreaterThan(tinted(resting.text, PALETTE.red));
    expect(tinted(cyan.text, PALETTE.cyan)).toBeGreaterThan(tinted(resting.text, PALETTE.cyan));
  });

  it.each(ROLES)("changes the core for every hit, on %s", (role) => {
    const whole = frame(role, (w) => firing(w, "red", 0));
    const hit = frame(role, (w) => firing(w, "red", 1));
    const twice = frame(role, (w) => firing(w, "red", 2));
    expect(hit.text).not.toBe(whole.text);
    expect(twice.text).not.toBe(hit.text);
  });

  it.each(ROLES)("splits once the core is spent, on %s", (role) => {
    const split = frame(role, (w) => {
      posed(w, "split", [1, 1]).bared = true;
    });
    expect(split.calls).toBeGreaterThan(30);
    expect(split.text).not.toBe(frame(role, (w) => posed(w, "rest", [1, 1])).text);
  });

  it("draws the same sac on both phones", () => {
    const tint = (role: ViewRole) =>
      tinted(frame(role, (w) => firing(w, "cyan", 1)).text, PALETTE.cystSac);
    expect(tint("p1")).toBe(tint("p2"));
  });

  it("draws the same sac the same way twice", () => {
    const a = frame("p1", (w) => firing(w, "cyan", 1));
    const b = frame("p1", (w) => firing(w, "cyan", 1));
    expect(a.text).toBe(b.text);
  });
});
