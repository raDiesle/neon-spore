import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SlingAim,
  type SlingAsk,
  type SlingPhase,
  type SlingState,
  type SlingStep,
  slingBoss,
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
 * THE SLING's poses — folded before it arrives, standing with both cords
 * slack, a cord glowing while its own seat is asked to draw it and further
 * drawn as the pull holds, the cup dark until a fire step lights it in the
 * step's colour and brighter once the yoke answers, the window closing as
 * the beats run out, and the fork snapping free once it is spent — on all
 * three screens.
 *
 * The states are **set** rather than played to, `vise-frame.test.ts`'s
 * arrangement: `sim/test/sling.test.ts` proves the script and the draws.
 * What this file asks is whether every branch of the picture is one a
 * canvas accepts, and that each says what it has to: the steel tines, the
 * cord-brown slack cord, the asked cord's white glow, the cup in the
 * colour it fires.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the fork stood, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("sling");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): SlingState {
  const s = slingBoss(world);
  if (s === null) throw new Error("the sling wave stood no fork");
  return s;
}

/** The fork in `phase`, a beat in, with both arms slack and `lit` the step under the cursor. */
function posed(world: World, phase: SlingPhase, lit?: SlingStep): SlingState {
  const s = body(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.arms = [0, 0];
  s.hits = 0;
  s.yokeLit = false;
  s.holding = [false, false];
  s.drawnBeats = [0, 0];
  s.loosed = [false, false];
  if (lit !== undefined) s.steps[0] = lit;
  return s;
}

function asking(
  ask: SlingAsk,
  color: SlingStep["color"] = "either",
  aim: SlingAim = "left",
  beats = 4,
): SlingStep {
  return { ask, aim, color, beats };
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

/** Three frames, inside a beat, with the fork set as `arrange` says. */
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

describe("THE SLING's fork", () => {
  it.each(ROLES)("stands steel tines over a dark cup, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    expect(resting.calls).toBeGreaterThan(20);
    expect(tinted(resting.text, PALETTE.slingSteel)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.slingSteelDark)).toBeGreaterThan(0);
  });

  it.each(ROLES)("swings its tines out as it arrives, on %s", (role) => {
    const dropping = frame(role, (w) => {
      posed(w, "still").phaseBeat = w.beat;
    });
    const arrived = frame(role, (w) => posed(w, "rest"));
    expect(dropping.text).not.toBe(arrived.text);
  });

  it.each(ROLES)("hangs both cords slack in cord-brown when nothing is asked, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    expect(tinted(resting.text, PALETTE.slingCord)).toBeGreaterThan(0);
  });

  it.each(ROLES)("glows the cord its own seat is asked to draw, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const asked = frame(role, (w) => posed(w, "lit", asking("left")));
    expect(tinted(asked.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(resting.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("glows the other cord for a both step, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const both = frame(role, (w) => posed(w, "lit", asking("both")));
    expect(tinted(both.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(resting.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("draws the cord further home as the pull holds, on %s", (role) => {
    const asked = frame(role, (w) => posed(w, "lit", asking("left")));
    const holding = frame(role, (w) => {
      const s = posed(w, "lit", asking("left"));
      s.holding[0] = true;
      s.drawnBeats[0] = 2;
    });
    expect(holding.text).not.toBe(asked.text);
  });

  it.each(ROLES)("leaves a loosed cord home rather than asking it again, on %s", (role) => {
    const asked = frame(role, (w) => posed(w, "lit", asking("both")));
    const loosed = frame(role, (w) => {
      const s = posed(w, "lit", asking("both"));
      s.loosed[0] = true;
    });
    expect(loosed.text).not.toBe(asked.text);
  });

  it.each(ROLES)("lights the cup in the step's colour once it fires, on %s", (role) => {
    const unlit = frame(role, (w) => posed(w, "rest"));
    const red = frame(role, (w) => posed(w, "lit", asking("fire", "red")));
    const cyan = frame(role, (w) => posed(w, "lit", asking("fire", "cyan")));
    const either = frame(role, (w) => posed(w, "lit", asking("fire", "either")));
    expect(tinted(red.text, PALETTE.red)).toBeGreaterThan(tinted(unlit.text, PALETTE.red));
    expect(tinted(cyan.text, PALETTE.cyan)).toBeGreaterThan(tinted(unlit.text, PALETTE.cyan));
    expect(tinted(either.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(unlit.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("brightens the cup once the yoke has answered, on %s", (role) => {
    const dim = frame(role, (w) => {
      const s = posed(w, "lit", asking("fire", "red"));
      s.yokeLit = false;
    });
    const bright = frame(role, (w) => {
      const s = posed(w, "lit", asking("fire", "red"));
      s.yokeLit = true;
    });
    expect(bright.text).not.toBe(dim.text);
  });

  it.each(ROLES)("closes the firing window as its beats run out, on %s", (role) => {
    const early = frame(role, (w) => {
      const s = posed(w, "lit", asking("fire", "red"));
      s.yokeLit = true;
      s.phaseBeat = w.beat;
    });
    const late = frame(role, (w) => {
      const s = posed(w, "lit", asking("fire", "red"));
      s.yokeLit = true;
      s.phaseBeat = w.beat - 3;
    });
    expect(late.text).not.toBe(early.text);
  });

  it.each(ROLES)("goes translucent and lifts away once the fork is spent, on %s", (role) => {
    const gone = frame(role, (w) => {
      posed(w, "free").phaseBeat = w.beat;
    });
    expect(gone.text).not.toBe(frame(role, (w) => posed(w, "rest")).text);
  });

  it("draws the same fork the same way twice", () => {
    const a = frame("p1", (w) => posed(w, "lit", asking("fire", "cyan")));
    const b = frame("p1", (w) => posed(w, "lit", asking("fire", "cyan")));
    expect(a.text).toBe(b.text);
  });
});
